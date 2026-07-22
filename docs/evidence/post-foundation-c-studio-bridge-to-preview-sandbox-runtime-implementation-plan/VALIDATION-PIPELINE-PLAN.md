# 17-Stage Validation Pipeline Plan

Stages (reflect the real envelope contract order):
1. source_decision_shape_validation (blocking: true, issues: RUNTIME_ENVELOPE_REQUIRED/RUNTIME_ENVELOPE_INVENTED_FIELD)
2. source_decision_status_validation (blocking: true, issues: RUNTIME_SOURCE_DECISION_WRONG_STATUS)
3. source_decision_digest_validation (blocking: true, issues: RUNTIME_BRIDGE_DECISION_DIGEST_REQUIRED/RUNTIME_DECISION_DIGEST_MISMATCH)
4. target_descriptor_presence_validation (blocking: true, issues: RUNTIME_TARGET_DESCRIPTOR_REQUIRED)
5. target_descriptor_shape_validation (blocking: true, issues: RUNTIME_SANDBOX_DESCRIPTOR_SHAPE_INVALID)
6. decision_descriptor_pair_validation (blocking: true, issues: RUNTIME_DECISION_DESCRIPTOR_MISMATCH/RUNTIME_CROSS_DECISION_MIX_FORBIDDEN)
7. source_version_validation (blocking: true, issues: RUNTIME_SOURCE_VERSION_MISMATCH/RUNTIME_VERSION_UNKNOWN)
8. target_version_validation (blocking: true, issues: RUNTIME_SOURCE_VERSION_MISMATCH)
9. synthetic_boundary_validation (blocking: true, issues: RUNTIME_NOT_SYNTHETIC)
10. security_boundary_validation (blocking: true, issues: RUNTIME_SECURITY_FLAG_FORBIDDEN)
11. ssot_boundary_validation (blocking: true, issues: RUNTIME_SSOT_INVERSION_FORBIDDEN)
12. preview_mount_boundary_validation (blocking: true, issues: RUNTIME_PREVIEW_MOUNT_FORBIDDEN)
13. real_data_boundary_validation (blocking: true, issues: RUNTIME_REAL_DATA_FORBIDDEN)
14. module_generation_boundary_validation (blocking: true, issues: RUNTIME_MODULE_GENERATION_FORBIDDEN)
15. certification_boundary_validation (blocking: true, issues: RUNTIME_CERTIFICATION_FORBIDDEN)
16. product_exposure_boundary_validation (blocking: true, issues: RUNTIME_PRODUCT_EXPOSURE_FORBIDDEN)
17. prototype_reference_validation (blocking: true, issues: RUNTIME_PROTOTYPE_REFERENCE_FORBIDDEN)

Sandbox descriptor is created only after ALL blockers pass.
