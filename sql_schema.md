#  AadhaarConnect PostgreSQL Schema

---

##  Overview

This document defines the **database schema, roles, and relationships** for the AadhaarConnect platform.

The system is designed with:
- Privacy-first architecture (no raw Aadhaar storage)
- Consent-driven data sharing
- Auditability and traceability
- Token lifecycle management

---

## Setup

### Enable UUID Extension

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 1. RP (Relying Party) Registry

**Purpose:**  
Stores registered client applications that consume OIDC identity.

**Relations:**  
Referenced by:
- consents
- audit_logs
- tokens

```sql
CREATE TABLE rp_clients (
  client_id VARCHAR(100) PRIMARY KEY,
  client_secret VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  allowed_scopes TEXT[] NOT NULL,
  sector_identifier VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Consent Table

**Purpose:**  
Stores user consent configurations per client.

**Relations:**  
- Linked to `rp_clients`
- Uses `user_hash` (blinded identity)

```sql
CREATE TABLE consents (
  consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_hash VARCHAR(255) NOT NULL,
  client_id VARCHAR(100) REFERENCES rp_clients(client_id) ON DELETE CASCADE,
  consented_claims TEXT[] NOT NULL,
  denied_claims TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(user_hash, client_id)
);
```

---

## 3. Audit Logs

**Purpose:**  
Immutable log of all authentication, consent, and token events.

**Key Feature:**  
- No strict FK → logs remain even if client deleted

```sql
CREATE TABLE audit_logs (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  session_id VARCHAR(255),
  user_hash VARCHAR(255),
  client_id VARCHAR(100),
  claims TEXT[],
  ip_hash VARCHAR(255),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  outcome VARCHAR(50) NOT NULL
);
```

---
## 4. Token Store

**Purpose:**  
Tracks issued tokens for:
- tracing
- revocation

```sql
CREATE TABLE tokens (
  token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash VARCHAR(255) NOT NULL,
  client_id VARCHAR(100) REFERENCES rp_clients(client_id) ON DELETE CASCADE,
  user_hash VARCHAR(255) NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE
);
```

---

## 5. Revoked Tokens

**Purpose:**  
Fast lookup for revoked tokens (used by gateway/token service)

```sql
CREATE TABLE revoked_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. User Sessions (No PII)

**Purpose:**  
Tracks temporary authentication sessions:
- VID → OTP → Consent flow

**Note:**  
Usually stored in Redis, but can be persisted.

```sql
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
```

---

##  Indexing (Performance Optimization)

```sql
CREATE INDEX idx_consents_user_client ON consents(user_hash, client_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_hash);
CREATE INDEX idx_tokens_hash ON tokens(token_hash);
CREATE INDEX idx_revoked_tokens_hash ON revoked_tokens(token_hash);
```

---