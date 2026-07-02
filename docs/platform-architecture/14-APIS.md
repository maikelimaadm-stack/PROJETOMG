# 14 — API Architecture

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PA-13

---

## API classes (closed)

| Class | Prefix | Audience | Auth |
|-------|--------|----------|------|
| **Public** | `/api/public/v1` | Unauthenticated marketing/health | API key optional |
| **Internal** | `/api/*` | Platform web app | JWT bearer |
| **Partner** | `/api/partner/v1` | ISV integrations | OAuth2 client credentials |
| **Runtime** | `/api/gr/v1`, record APIs | Runtime GR adapters | JWT + scope |
| **Mobile** | `/api/mobile/v1` | Mobile sync | JWT + device token |
| **AI Gateway** | `/api/ai/v1` | Studio/BOS AI | JWT + plan gate |
| **Marketplace** | `/api/marketplace/v1` | Catalog/install | JWT + entitlement |
| **MMM** | `/api/mmm/v1` | Studio, Intent, Publish | JWT Internal |

---

## MMM API (Foundation B — frozen contract)

SSOT: [mmm-api-v1.openapi.yaml](../meta-model/spec/mmm-api-v1.openapi.yaml)

Extensions (4.03–4.04): `/publish/*`, object versions — documented in platform-architecture; OpenAPI update in Foundation B maintenance only.

---

## Deprecated APIs

| Path | Successor | Sunset |
|------|-----------|--------|
| `/api/mdp/*` | `/api/mmm/v1` | Foundation E |
| Module-specific legacy | GR unified | Foundation E |

---

## Versioning rules

| API | Version strategy |
|-----|------------------|
| Public/Partner | URL path v1, v2 additive |
| Internal | Backward compatible within major |
| MMM | `mmm-api-v1` envelopeVersion const |

Breaking changes require new path + D-PA amendment.

---

## Rate limiting

L1 rate limit: per IP (public), per tenant (internal), per client (partner).

---

*End of document.*
