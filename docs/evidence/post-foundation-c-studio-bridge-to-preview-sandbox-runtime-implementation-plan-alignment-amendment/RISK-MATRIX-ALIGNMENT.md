# Risk Matrix Alignment

B-RECOMPUTE-INPUT: resolved_at_plan_level (blockingForRuntime: true)

- **R-CORE-SCHEMA-DRIFT** [high] core shape drifts from real preimage
- **R-V1-ACCIDENTAL-ACCEPTANCE** [high] runtime accidentally accepts v1 envelope
- **R-IMPLICIT-UPGRADE** [high] implicit v1->v2 upgrade
- **R-CORE-DUPLICATION** [medium] core duplicated across envelope
- **R-TARGET-DUPLICATION** [medium] targetDescriptor duplicated at envelope top
- **R-DIGEST-DUPLICATION** [high] digest duplicated inside core
- **B-CORE-ENVELOPE-BUILDER** [blocker] no builder contract yet to produce the v2 envelope
