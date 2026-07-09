# Foundation C.10 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M15 — Validation Engine

```mermaid
flowchart TB
  CRB[CrbPayload.registries.validation] --> HYD[hydrateRegistries — M06]
  HYD --> REG[IRegistry type=validation, frozen post RT-3]
  REG --> VE[ValidationEngine.validateRecord / validateField]
  RULES[explicit ValidationRule array] --> VS[ValidationEngine.validateSync / validateAsync]
  CTX[Runtime Context / Data] --> VE
  CTX --> VS

  VE -->|resource/field not found| ERR002[throw ValidationError MAK-L3-VALIDATION-002]
  VE -->|malformed/unknown rule| ERR003[throw ValidationError MAK-L3-VALIDATION-003]
  VE -->|too many rules/fields| ERR004[throw ValidationError MAK-L3-VALIDATION-004]

  VE --> EVAL[evaluateRule per declared rule, in order]
  EVAL -->|rule = custom| XE[M13 ExpressionEngine.validate + evaluate]
  XE -->|syntax invalid| ERR003
  XE -->|evaluates to false / throws at runtime| FAIL[ValidationErrorEntry — data-level, returned]
  EVAL -->|required/type/min/max/minLength/maxLength/pattern/enum| DATA[data-level check]
  DATA -->|mismatch| FAIL
  DATA -->|ok| PASS[no entry]

  FAIL --> RESULT[ValidationResult: valid, errors, warnings — deterministic order]
  PASS --> RESULT
```

**Depends on:** M04 Registry (hydrated `validation` bucket), M13 Expression Engine (composed for `custom` rules, never duplicated)
**Consumed by:** future M16 Execution Engine (UP-09 stage 1 — Validate); not wired into that pipeline in this slice (M16 doesn't exist yet)

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> FORM2[formulaEngine registered]
  FORM2 --> VAL2[validationEngine registered — shares the same expressionEngine instance as M14]
  SL[ServiceLocator] --> VAL2
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds the `ValidationEngine` from the frozen, hydrated registry and the **same** `ExpressionEngine` instance already built for M14 (single shared instance, not a second parser) immediately after M14 wiring; `bootstrap.js` registers it into the Service Locator alongside every other RT-3 service.

---

## C.10 Pipeline Position

```mermaid
flowchart TD
  B[Bootstrap M01 / RT-0] --> SL0[ServiceLocator init — M20]
  SL0 --> C[Context M02]
  C --> S[Session M03]
  S --> R[Registry M04]
  R --> L[Loader M05]
  L --> CRB[CRB Loader M06]
  CRB --> DEP[Dependency Resolver M07]
  DEP --> PERM[Permission Engine M09]
  PERM --> ACT[Action Engine M10]
  ACT --> WF[Workflow Engine M11]
  WF --> REND[Render Engine M12]
  REND --> XE3[Expression Engine M13]
  XE3 --> FORM3[Formula Engine M14]
  FORM3 --> VAL3[Validation Engine M15 — C.10]
  VAL3 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M15, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.10:** RT-8 step 8.4 (M15 validation, UP-09 stage 1) now has a real, sandboxed, deterministic implementation — but it is not yet invoked from a full 5-stage execution pipeline (Validate → Authorize → Execute → Audit → Respond), since M16 Execution Engine doesn't exist yet. No Execution Engine, State Engine, Studio, or Marketplace code exists in `src/runtime/core/validation/`.
