# Implementation Phases

16 phases, all `status: planned`, `implemented: false`, `completed: false`:

`phase_0_preflight`, `phase_1_foundation_contract_validation`, `phase_2_scope_registry_preparation`,
`phase_3_draft_runtime_model`, `phase_4_lifecycle_runtime`, `phase_5_operation_executor`,
`phase_6_revision_engine`, `phase_7_validation_pipeline`, `phase_8_invariant_enforcement`,
`phase_9_synthetic_preview_handoff`, `phase_10_certification_candidate_preparation`,
`phase_11_ssot_protection`, `phase_12_permission_tenancy_boundary`, `phase_13_test_harness`,
`phase_14_manual_enablement_gate`, `phase_15_rollout_blocked`.

Each phase declares: `goal`, `entryCriteria`, `allowedEffects` (`emit_plan_metadata` only),
`blockedEffects` (`implement_runtime`, `persist`, `generate_module`, `expose_product`, `touch_app`),
`exitCriteria`, `rollbackPlan` (`discard_plan_by_non_consumption`). No phase may be implemented or
completed.
