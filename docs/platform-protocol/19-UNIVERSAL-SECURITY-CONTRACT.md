# 19 — Universal Security Contract

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UP-19

---

## Authentication

| Mechanism | UEP binding |
|-----------|-------------|
| JWT access token | UEC.user, UEC.session |
| Refresh token | Separate endpoint — command `security.token.refresh` |
| API key (partner) | UEC.client.channel = api, scoped tenant |

Token **never** in event payloads or logs.

---

## Authorization

All mutations: pipeline stage 2 — [12-UNIVERSAL-PERMISSIONS.md](./12-UNIVERSAL-PERMISSIONS.md).

---

## Signatures

| Artifact | Algorithm | Key |
|----------|-----------|-----|
| CRB bundle | HMAC-SHA256 | MMM_SIGNING_KEY |
| .makpkg | HMAC-SHA256 | Publisher key |
| Plugin manifest | HMAC-SHA256 | MMM_SIGNING_KEY |
| Webhook inbound | HMAC optional | Tenant secret |

Verify at RT-2 before hydrate.

---

## Secrets

| Rule | Detail |
|------|--------|
| SEC-01 | Secrets never in CRB or UEC |
| SEC-02 | Connector credentials in vault/env |
| SEC-03 | Rotate via runbook — no protocol change |

---

## Token lifecycle commands

| kind | Operation |
|------|-----------|
| security.token.refresh | Issue new access |
| security.token.revoke | Invalidate session |
| security.session.list | Admin query |

Behavior: [platform-behavior/14-SECURITY-LIFECYCLE.md](../platform-behavior/14-SECURITY-LIFECYCLE.md).

---

*End of document.*
