# AadhaarConnect Architecture & Behavior

This document outlines the **Optimized 3-Service Architecture** for the AadhaarConnect enterprise backend.

---

## ?? 1. Infrastructure Server (`infra-server`)
**Ports**: `8080` (HTTP Gateway), Eureka Dashboard.

**Role**: The edge router and foundational infrastructure.
1. **API Gateway**: Acts as the single public entry point for Relying Parties (RPs) and the frontend UI.
2. **Service Discovery (Eureka)**: Maintains a dynamic registry of all live microservices.
3. **Config Server**: Supplies external configuration safely and centrally.

**Behavior**: 
- **Rate Limiting**: Uses Redis at the gateway level to restrict abusive requests (e.g., locking down the OTP generation endpoint to 5 requests per minute).
- **Routing Rules**: 
  - Routes `/api/v1/identity/**` to the `identity-service`.
  - Routes `/.well-known/**`, `/authorize`, `/token`, and `/api/v1/consent/**` to the `oidc-service`.

---

## ? 2. Identity Service (`identity-service`)
**Ports**: `8081`

**Role**: Handles all logic pertaining to the user's secure interactions with UIDAI, including mock verification and Data Minimization (e-KYC derivation).

**Behavior**:
1. Securely passes the Aadhaar Virtual ID (VID) into the mock UIDAI pipeline to trigger an OTP.
2. Creates an ephemeral `session_id` to correlate the user journey.
3. **E-KYC Derivation**: Once the OTP is validated, this service parses the heavy Aadhaar e-KYC payload, extracts only derived standard claims (like `age_over_18 = true`, or `state = "MH"`), and briefly stores this proven context in Redis or the `sessions` PostgreSQL table.
4. Drops the raw VID entirely from persistence.

**Database Interaction**:
- `sessions` Table
- `audit_logs` Table (for logging Auth Attempts)

---

## ? 3. OIDC Service (`oidc-service`)
**Ports**: `8085`

**Role**: The heavyweight OAuth2/OIDC Authority. Manages Relying Parties, records user consent, issues tokens, and enforces Anti-Tracking.

**Behavior**:
1. **RP Registry**: Maintains verified Client origins and allowed scopes. 
2. **Consent Orchestration**: Retrieves the user's derived claims (via Session ID context from Redis/Identity-Service) and asks the user to consent via the UI.
3. Stores the user's `consented_claims` actively to PostgreSQL.
4. **Token Generation**: Signs OIDC JWTs. It guarantees Anti-Tracking by mixing the Client's `sector_identifier` with the core identity hash, resulting in `Pairwise Subject Identifiers` (`sub`).
5. Evaluates standard PKCE validation before remitting an Access Token.

**Database Interaction**:
- `rp_clients`, `consents`, `tokens`, `revoked_tokens` Tables.
- `audit_logs` Table (for logging Consent/Token issuance)

---

### Data Flow Summary (Step-by-Step)
1. **App ? Infra Server ? OIDC Service**: `GET /authorize`. App requests login.
2. **UI ? Infra Server ? Identity Service**: User enters VID and OTP. `Identity Service` issues Session ID and extracts derived claims into temp cache.
3. **UI ? Infra Server ? OIDC Service**: User consents to claims. Consents are stored in Postgres; Auth Code is minted.
4. **App ? Infra Server ? OIDC Service**: App trades Auth Code for Tokens. `OIDC Service` issues Pairwise JWTs.
