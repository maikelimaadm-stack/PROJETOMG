# 04 — Universal Designers

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-UA-06, D-UA-21, D-UA-22

---

## Designer catalog (28 — closed)

| # | Designer | MMM types | Primary purpose |
|---|----------|-----------|-----------------|
| 1 | **Application Designer** | `application`, `application_version` | Product boundary, plan features |
| 2 | **Module Designer** | `module`, `module_dependency` | Functional domains |
| 3 | **Business Object Designer** | `business_object` | Entity definitions |
| 4 | **Entity Designer** | `business_object` | Alias — same as #3 (D-UA-22) |
| 5 | **Field Designer** | `field`, `field_config` | Attributes, types, masks |
| 6 | **Relationship Designer** | `relationship` | BO links, cardinality |
| 7 | **Layout Designer** | `layout`, `section`, `panel`, `tab`, `group` | Screen structure |
| 8 | **Screen Designer** | `layout` + `route` + default `view` | Complete screen unit |
| 9 | **View Designer** | `view`, `form` | table, kanban, wizard, etc. |
| 10 | **Navigation Designer** | `menu`, `route` | BOS menus, URLs |
| 11 | **Workflow Designer** | `workflow`, `workflow_step` | Process definitions |
| 12 | **Automation Designer** | `automation`, `trigger` | Event-driven rules |
| 13 | **Dashboard Designer** | `dashboard`, `widget` | KPI boards |
| 14 | **Report Designer** | `report`, `query` | Reports, exports |
| 15 | **Permission Designer** | `role`, `permission` | RBAC |
| 16 | **API Designer** | `integration` (REST/GraphQL) | External API defs |
| 17 | **Connector Designer** | `connector`, `integration` | Protocol + auth |
| 18 | **Marketplace Designer** | `package`, `package_version` | .makpkg authoring |
| 19 | **Theme Designer** | `theme`, `style_token` | Visual tokens |
| 20 | **Localization Designer** | label profiles on objects | i18n |
| 21 | **Formula Designer** | computed field configs | UFL expressions |
| 22 | **Validation Designer** | validation rules V16 | UVL rules |
| 23 | **Rule Designer** | automation + business rules | Cross-field logic |
| 24 | **Intent Designer** | `derivation_plan`, `intent_binding` | Intent templates |
| 25 | **Action Designer** | `action` | Buttons, operations |
| 26 | **Event Designer** | trigger bindings | Event wiring |
| 27 | **AI Assistant** | `ai_candidate` (output only) | Suggestions — no direct write |
| 28 | **Publish Console** | publish scope UI | Triggers publish — not a mutator |

**Architecture cross-ref:** Core 17 in [03-STUDIO.md](../platform-architecture/03-STUDIO.md); UAS extends with 11 expert designers.

---

## Designer shell (future Studio)

| Region | Function |
|--------|----------|
| Navigator | Object tree |
| Canvas | Visual editor |
| Inspector | UAL properties |
| Binding panel | data/action/event |
| Lifecycle bar | USM status |
| Dependency graph | Ref visualization |

---

## Designer contracts

| ID | Rule |
|----|------|
| C-DS-01 | Writes MMM draft/review only |
| C-DS-02 | Reads PlatformSchema for type |
| C-DS-03 | Preview via draft compile |
| C-DS-04 | AI Assistant → AICandidate only |

---

*End of document.*
