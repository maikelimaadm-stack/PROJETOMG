# 24 — Low-Code Philosophy

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-02

---

## Permanent principles

| # | Principle |
|---|-----------|
| LC-P01 | **User configures — does not program** |
| LC-P02 | **95% of enterprise scenarios without code** |
| LC-P03 | **All definitions are MMM objects** |
| LC-P04 | **Publish produces CRB; Runtime executes** |
| LC-P05 | **Records hold data — not definitions** |
| LC-P06 | **AI optional — manual always available** |
| LC-P07 | **Extensions via signed plugins only** |
| LC-P08 | **Business Language is default; Studio is expert** |
| LC-P09 | **No parallel generator paths** (D-PA-08) |
| LC-P10 | **Authoring ≠ execution** — separate layers |

---

## When code is allowed

| Case | Form |
|------|------|
| Platform core | Frozen L1 — not tenant |
| Signed plugin | integration manifest in CRB |
| Connector adapter | Platform-provided protocol impl |

**Never** tenant JavaScript in certified modules.

---

## Anti-patterns (forbidden)

| Anti-pattern | Why |
|--------------|-----|
| Custom React module | Bypasses CRB |
| Hardcoded Zod in module | Bypasses UVL |
| generatedModules.json SSOT | Legacy — sunset E |
| AI direct publish | Audit bypass |
| Inline SQL in config | Injection |

---

## Success metric

Tenant builds ERP/CRM/WMS/RH using wizards + designers + publish — zero repository commits.

---

*End of document.*
