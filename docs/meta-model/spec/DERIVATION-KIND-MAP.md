# Derivation Kind ↔ ObjectType Map

**Status:** Normative · **Version:** 1.0.0 · **Mission:** 4.02 · **Decision:** D-MMM-08, D-MMM-17

> **Architecture SSOT:** [21-INTENT-ENGINE.md](../21-INTENT-ENGINE.md)  
> **Runtime strings (legacy):** [INTENT-DERIVATION-KIND-SSOT.md](../../engineering/INTENT-DERIVATION-KIND-SSOT.md)

---

## MMM derivation kinds (19)

| # | derivationKind | Primary objectTypes produced | Secondary / contained |
|---|----------------|------------------------------|------------------------|
| 1 | `create_business_object` | `business_object`, `entity` | `field` (optional inline) |
| 2 | `add_field` | `field` | `field_option` |
| 3 | `add_relationship` | `relationship` | `relationship_binding` |
| 4 | `create_screen` | `screen`, `layout`, `view` | `section`, `panel`, `form`/`grid` |
| 5 | `create_workflow` | `workflow` | `workflow_step`, `workflow_transition`, `workflow_trigger` |
| 6 | `create_automation` | `automation` | `trigger`, `action_chain`, `schedule` |
| 7 | `create_dashboard` | `dashboard` | `dashboard_page`, `widget`, `query` |
| 8 | `create_report` | `report` | `report_section`, `report_parameter`, `query` |
| 9 | `create_api` | `api` | `api_endpoint`, `api_method`, `api_parameter` |
| 10 | `add_validation` | `validation`, `validation_rule` | `validation_group` |
| 11 | `add_formula` | `formula` | `field` (computed), `computation` |
| 12 | `add_permission` | `permission` | `role` (binding update) |
| 13 | `create_module` | `module` | `module_version`, `navigation` |
| 14 | `create_application` | `application` | `application_version`, `home_surface` |
| 15 | `add_integration` | `connector`, `integration` | `integration_mapping`, `connector_config` |
| 16 | `extend_template` | any (inherit) | lineage on target types |
| 17 | `create_menu_route` | `route`, `menu_item` | `menu` |
| 18 | `add_notification` | `notification` | `action`, `event` |
| 19 | `package_export` | `package`, `package_manifest` | `snapshot` prep |

---

## Runtime mapping (Program 3.7–3.8 legacy strings)

| Runtime constant | String | MMM derivationKind | Notes |
|------------------|--------|-------------------|-------|
| `DERIVATION_KIND_FORMULA` | `compute.formula` | `add_formula` | Maps to formula + field |
| `DERIVATION_KIND_COMPUTED_FIELD` | `compute.computed_field` | `add_formula` | Subset of add_formula |

New runtime kinds **must** register here before implementation (4.10+).

---

## Batch create contract

Derivation Engine POST `/objects/batch` (see OpenAPI) sends ordered objects; dependencies resolved in same transaction (C-03).

---

*End of document.*
