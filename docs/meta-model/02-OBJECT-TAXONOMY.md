# 02 — Object Taxonomy

**Status:** Official · **Version:** 1.0.0 · **Mission:** 4.01.1 · **Decision:** D-MMM-02

---

## Objetivo

Registrar os **222 objectTypes** canônicos do MMM v1.

## Escopo

Taxonomia completa; atributos por tipo em docs especializados.

## Responsabilidades

**Único owner** da lista objectType. Outros docs referenciam por nome, não duplicam lista completa.

## Conceitos

Todo objeto persistido declara exatamente um `objectType`. Agrupados em A–K.

## Modelo

### Grupo A — Platform & Tenant (21)

`platform`, `platform_version`, `platform_capability`, `platform_policy`, `platform_locale`, `platform_schema`, `tenant`, `tenant_plan`, `tenant_settings`, `tenant_branding`, `tenant_locale`, `organization_unit`, `company`, `user`, `user_group`, `role`, `permission`, `role_permission`, `user_role`, `resource_scope`, `access_policy`

### Grupo B — Application Topology (13)

`application`, `application_version`, `module`, `module_version`, `module_dependency`, `feature`, `navigation`, `menu`, `menu_item`, `route`, `home_surface`, `capability`, `capability_group`

### Grupo C — Data Model (16)

`business_object`, `business_object_version`, `entity`, `field`, `field_option`, `field_group`, `relationship`, `relationship_binding`, `index`, `constraint`, `persistence_mapping`, `sequence`, `data_category`, `retention_policy`, `record`, `entity_kind`

> `record` is L0 reference only — not stored as MMM SSOT.

### Grupo D — Presentation (35)

`base_template`, `screen`, `page`, `layout`, `section`, `panel`, `tab`, `group`, `view`, `form`, `grid`, `list`, `card`, `detail`, `filter`, `filter_field`, `sort`, `pagination`, `toolbar`, `action_bar`, `button`, `action`, `command`, `dialog`, `drawer`, `notification`, `theme`, `design_token`, `icon`, `label`, `help_text`, `placeholder`, `formatter`, `renderer`, `mask`, `conditional_visibility`, `responsive_rule`, `client_target`

### Grupo E — Analytics (18)

`dashboard`, `dashboard_page`, `widget`, `kpi`, `chart`, `indicator`, `pivot_table`, `report`, `report_section`, `report_parameter`, `query`, `query_field`, `aggregation`, `rollup`, `lookup`, `calculated_column`, `data_source`, `drill_down`, `refresh_policy`

### Grupo F — Behavior (28)

`formula`, `validation`, `validation_rule`, `validation_group`, `event`, `event_handler`, `rule`, `condition`, `expression`, `computation`, `workflow`, `workflow_step`, `workflow_transition`, `workflow_trigger`, `approval_step`, `automation`, `process`, `process_node`, `process_edge`, `schedule`, `trigger`, `action_chain`, `parallel_block`, `branch_block`, `loop_block`, `script`, `function`, `timeout_policy`

### Grupo G — Integration (22)

`api`, `api_endpoint`, `api_method`, `api_parameter`, `api_response`, `connector`, `connector_type`, `connector_config`, `webhook`, `webhook_event`, `integration`, `integration_mapping`, `integration_flow`, `message_queue`, `event_bus_subscription`, `external_data_source`, `iot_device`, `iot_stream`, `iot_trigger`, `sync_profile`, `sync_rule`, `conflict_resolution`

### Grupo H — Specialized Views (22)

`kanban`, `kanban_column`, `kanban_card`, `kanban_swimlane`, `calendar`, `calendar_event`, `timeline`, `timeline_item`, `tree`, `tree_node`, `map`, `map_marker`, `map_layer`, `gallery`, `document`, `document_template`, `attachment`, `signature`, `inbox`, `chat`, `comment`, `audit_trail_view`

### Grupo I — Authoring (17)

`business_language`, `business_term`, `business_synonym`, `business_intent`, `business_intent_document`, `intent_template`, `intent_catalog`, `derivation`, `derivation_plan`, `business_asset`, `business_asset_version`, `business_object_definition`, `business_rule`, `business_process`, `business_objective`, `confirmation`, `explainability`

### Grupo J — Package & Versioning (15)

`definition_version`, `compiled_bundle`, `snapshot`, `environment_pin`, `publish_log`, `package`, `package_manifest`, `package_dependency`, `package_version`, `package_license`, `package_review`, `template`, `industry_pack`, `extension_point`, `extension`

### Grupo K — Intelligence & AI (16)

`memory_record`, `knowledge_node`, `knowledge_edge`, `observation`, `recommendation`, `decision`, `insight`, `health_signal`, `maturity_score`, `segment_profile`, `governance_policy`, `compliance_rule`, `lifecycle_action`, `ai_candidate`, `ai_prompt`, `ai_context`

**Total: 222**

## Regras

R-19: additive only. Deprecated types remain in schema.

## Fluxos

```mermaid
flowchart LR
  PS[PlatformSchema] --> OT[objectType registry]
  OT --> VAL[Validate payload]
  VAL --> STORE[MMM Store]
```

## Exemplos

`field` objectType → full spec in [06-FIELDS.md](./06-FIELDS.md).

## Restrições

Legacy `MdpRegistryEntryType` (26 values) maps to subset of Grupo D/F/G — migration in 4.03.

## Integrações

[26-PLATFORM-SCHEMA.md](./26-PLATFORM-SCHEMA.md) · [GLOSSARY.md](./GLOSSARY.md)

## Versionamento

1.0.0 · 2026-06-30

## Próximos passos

Program 4.02: JSON Schema per objectType
