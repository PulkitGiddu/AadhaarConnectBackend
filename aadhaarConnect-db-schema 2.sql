-- =====================================================================================
-- AadhaarConnect PostgreSQL Schema
-- =====================================================================================
-- This script defines the schemas, roles, and relations for the AadhaarConnect Platform.

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- 1. RP (Relying Party) REGISTRY
-- Role: Stores registered applications (clients) that will consume the OIDC identity.
-- Relation: Referenced by consents, audit_logs, and tokens tables.
-- =====================================================================================
CREATE TABLE rp_clients (
    client_id VARCHAR(100) PRIMARY KEY,
    client_secret VARCHAR(255) NOT NULL, -- Hashed secret
    client_name VARCHAR(255) NOT NULL,
    redirect_uris TEXT[] NOT NULL,
    allowed_scopes TEXT[] NOT NULL,
    sector_identifier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================================
-- 2. CONSENT TABLE
-- Role: Persists user consent configurations per client (Relying Party).
-- Relation: Linked to rp_clients via client_id. user_hash represents the blinded user identity.
-- =====================================================================================
CREATE TABLE consents (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_hash VARCHAR(255) NOT NULL, -- Blinded user identifier
    client_id VARCHAR(100) REFERENCES rp_clients(client_id) ON DELETE CASCADE,
    consented_claims TEXT[] NOT NULL,
    denied_claims TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_hash, client_id) -- A user should have one active consent profile per client
);

-- =====================================================================================
-- 3. AUDIT LOGS
-- Role: Immutable append-only log of authenticity, consent, and token operations.
-- Relation: Weakly references rp_clients (via client_id) to prevent deletion anomalies.
-- =====================================================================================
CREATE TABLE audit_logs (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- e.g., 'AUTH_SUCCESS', 'CONSENT_GIVEN', 'TOKEN_ISSUED'
    session_id VARCHAR(255),
    user_hash VARCHAR(255),
    client_id VARCHAR(100), -- No strong FK to allow preserving logs even if client is deleted
    claims TEXT[],
    ip_hash VARCHAR(255),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    outcome VARCHAR(50) NOT NULL -- 'SUCCESS', 'FAILED', 'DENIED'
);

-- =====================================================================================
-- 4. TOKEN STORE
-- Role: Maintains records of issued tokens for tracing and revocation.
-- Relation: Linked to rp_clients via client_id.
-- =====================================================================================
CREATE TABLE tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(255) NOT NULL, -- Hashed JTI (JWT ID) or token signature
    client_id VARCHAR(100) REFERENCES rp_clients(client_id) ON DELETE CASCADE,
    user_hash VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE
);

-- =====================================================================================
-- 5. REVOKED TOKENS (REVOCATION LIST)
-- Role: Optimized lookup table for revoked tokens, accessed by Gateway or Token service.
-- Relation: Typically queried independently using token_hash.
-- =====================================================================================
CREATE TABLE revoked_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================================
-- 6. USER SESSION (NO PII)
-- Role: Tracks transient multi-step authentication sessions (e.g. VID entry to OTP to Consent).
-- Relation: Independent, uses session_id and user_hash. Usually stored in Redis, but if persisted:
-- =====================================================================================
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Indexing for performance
CREATE INDEX idx_consents_user_client ON consents(user_hash, client_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_hash);
CREATE INDEX idx_tokens_hash ON tokens(token_hash);
CREATE INDEX idx_revoked_tokens_hash ON revoked_tokens(token_hash);
