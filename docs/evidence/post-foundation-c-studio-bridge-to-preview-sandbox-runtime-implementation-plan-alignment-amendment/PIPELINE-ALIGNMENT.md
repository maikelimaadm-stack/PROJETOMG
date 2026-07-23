# Pipeline Alignment

order: core_envelope_v2_preflight_then_17_stage_consumer_pipeline
preflight stages (5):
- core_envelope_shape_validation
- core_field_completeness_validation
- core_extra_field_validation
- core_digest_recompute_validation
- core_same_decision_atomicity_validation
then 17-stage consumer pipeline.
