# Build / Bundle Absence

The plan subtree is dev-only and never imported by App/production. After `npm run build`, `dist` must contain zero references to `bridge-to-preview-sandbox-runtime-implementation-plan`, `bridge_to_preview_sandbox_runtime_implementation_plan_ready_for_enterprise_audit`, or `B-RECOMPUTE-INPUT`. Verified by the gate and §37 static scan.
