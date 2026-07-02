# Platform Architecture Contracts

**Status:** Official SSOT · **Version:** 1.0.0

---

## Inter-layer contracts (summary)

| ID | Producer | Consumer | Payload |
|----|----------|----------|---------|
| C-PA-01 | Publish Engine L2 | Runtime L3 | `mmm-crb-v1` signed bundle |
| C-PA-02 | MMM API L2 | Studio L4 | `mmm-envelope-v1` |
| C-PA-03 | MMM API L2 | Intent L5 | Batch envelopes |
| C-PA-04 | AI Gateway L6 | Intent L5 | AICandidate |
| C-PA-05 | Runtime L3 | BOS L9 | Screen state + events |
| C-PA-06 | Event Bus L1 | L10 | Domain events |
| C-PA-07 | Marketplace L7 | MMM L2 | `.makpkg` install drafts |
| C-PA-08 | Generic Repository | Runtime L3 | Record CRUD |
| C-PA-09 | Platform Core L1 | All | AccessScope JWT |
| C-PA-10 | EnvironmentPin L2 | Runtime L3 | bundleId + definitionVersionId |

Full MMM contracts: [meta-model/CONTRACTS.md](../meta-model/CONTRACTS.md) — **not duplicated**; extended here for platform layers only.

---

## Contract rules

| Rule | Detail |
|------|--------|
| Versioned payloads | CRB, envelope, API paths carry version constants |
| Fail-closed auth | Missing AccessScope → 401/403 |
| Tenant in every payload | tenantId mandatory |
| No bypass | Studio cannot skip C-PA-02 |

---

*End of document.*
