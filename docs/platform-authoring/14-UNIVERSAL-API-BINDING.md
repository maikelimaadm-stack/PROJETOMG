# 14 — Universal API Binding

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-12

---

## Supported protocols

| Protocol | Connector type | Use |
|----------|----------------|-----|
| REST | `rest` | HTTP JSON APIs |
| GraphQL | `graphql` | Query/mutation |
| Webhook | `webhook` | Inbound HTTP |
| MQTT | `mqtt` | IoT events |
| OPC-UA | `opcua` | Industrial |
| Database | `jdbc` | Read-only queries (parameterized) |
| File | `file` | CSV, Excel, SFTP |
| SOAP | `soap` | Legacy ERP |

---

## Binding schema

```yaml
integration:
  connectorRef: code://connectors/stripe
  operation: charge
  method: POST
  path: /v1/charges
  requestMapping:
    amount: "{record.valor}"
  responseMapping:
    paymentId: "{response.id}"
  errorMapping:
    default: MAK-L7-MARKETPLACE-001
  auth:
    type: bearer | apiKey | oauth2
    secretRef: vault://tenant/stripe_key
```

---

## Inbound webhook

```yaml
webhook:
  path: /hooks/{tenantId}/pedido
  verify: hmac
  secretRef: vault://tenant/webhook_secret
  mapping:
    event: record.created
    boRef: code://module/pedido
```

---

## Rules

| Rule | Detail |
|------|--------|
| API-01 | No inline secrets (D-UA-29) |
| API-02 | Mappings use UFL field refs |
| API-03 | Outbound via UEP connector ([platform-protocol/17](../platform-protocol/17-UNIVERSAL-CONNECTORS.md)) |

---

*End of document.*
