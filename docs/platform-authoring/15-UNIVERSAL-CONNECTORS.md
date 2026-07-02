# 15 — Universal Connectors (Authoring)

**Status:** Official SSOT · **Version:** 1.0.0

---

## Connector definition

MMM `connector` + `integration` objects authored via **Connector Designer** and **API Designer**.

```yaml
connector:
  code: stripe_payments
  protocol: rest
  baseUrl: https://api.stripe.com
  auth:
    type: bearer
    secretRef: vault://tenant/stripe
  operations:
    - code: charge
      method: POST
      path: /v1/charges
    - code: refund
      method: POST
      path: /v1/refunds
  healthCheck:
    path: /v1/balance
    intervalSec: 300
```

---

## Architecture

```mermaid
flowchart LR
  AUTH[Author Connector Designer] --> MMM[connector object]
  MMM --> PUB[Publish]
  PUB --> CRB[integration registry]
  CRB --> RT[Runtime connector host]
  RT --> EXT[External system]
```

---

## Marketplace connectors

Install `.makpkg` with connector templates → tenant customizes secretRef → publish.

---

## Testing

Authoring **test connection** sends UEP query `connector.health` — dry-run, no mutation.

---

*End of document.*
