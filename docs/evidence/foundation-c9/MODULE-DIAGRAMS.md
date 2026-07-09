# Foundation C.9 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M13 — Expression Engine

```mermaid
flowchart TB
  EXPR[expr: string] --> TOK[tokenize — regex-based, no eval]
  TOK --> PARSE[Parser — recursive descent, depth-guarded]
  PARSE -->|syntax error| ERR002[throw ExpressionError MAK-L3-EXPRESSION-002]
  PARSE -->|too deep / too long| ERR005[throw ExpressionError MAK-L3-EXPRESSION-005]
  PARSE -->|blocked identifier segment| ERR003a[throw ExpressionError MAK-L3-EXPRESSION-003]
  PARSE --> AST[AST: Literal / Identifier / Unary / Binary / Call]
  CTX[Runtime Context / Data bindings] --> EVAL[evaluateNode — pure AST walk]
  AST --> EVAL
  EVAL -->|identifier not in bindings| ERR003b[throw ExpressionError MAK-L3-EXPRESSION-003]
  EVAL -->|function not in allowlist| ERR004[throw ExpressionError MAK-L3-EXPRESSION-004]
  EVAL --> RESULT[Evaluation Result — plain value, deterministic]
```

**Depends on:** nothing beyond its own input (`expr`, `bindings`) — no registry, no context object required by the interface itself.
**Consumed by:** M14 Formula Engine (composition, never duplicated); future M12 Render / M15 Validation bindings evaluation (not wired in this slice).

---

## M14 — Formula Engine

```mermaid
flowchart TB
  CRB[CrbPayload.registries.formula] --> HYD[hydrateRegistries — M06]
  HYD -->|CRB_REGISTRY_MAP: bucket formula maps to type handler| REG["IRegistry type=handler (pre-existing mapping, no new type)"]
  REG --> FE[FormulaEngine.compute code]
  FE --> LOAD[_loadDefinition — validates expr + dependsOn]
  LOAD -->|unknown formula/dependency| ERR003[throw FormulaError MAK-L3-FORMULA-003]
  LOAD -->|missing/invalid expr| ERR002[throw FormulaError MAK-L3-FORMULA-002]
  LOAD -->|too many dependencies| ERR005[throw FormulaError MAK-L3-FORMULA-005]
  LOAD --> RESOLVE[resolve dependsOn depth-first]
  RESOLVE -->|revisits a formula already in progress| ERR004[throw FormulaError MAK-L3-FORMULA-004 — cycle]
  RESOLVE --> BIND[merge dependency results into bindings]
  BIND --> XE[M13 ExpressionEngine.evaluate expr, bindings]
  XE --> RESULT[Formula Result — cached, deterministic]
```

**Depends on:** M04 Registry (hydrated `handler` bucket, sourced from CRB `formula`), M13 Expression Engine (composed, not duplicated)
**Consumed by:** future M12 Render (field value binding) / M15 Validation (not wired in this slice)

---

## Service Locator (M20) wiring

```mermaid
flowchart TB
  RT3[RT-3 hydrateWithBundle] --> REND[renderEngine registered]
  REND --> XE2[expressionEngine registered]
  XE2 --> FORM[formulaEngine registered — wired to expressionEngine + registry]
  SL[ServiceLocator] --> XE2
  SL --> FORM
  SL -.resolvable post RT-3.-> HOST[Host / future modules]
```

`loadRuntimeBundle.js` builds the `ExpressionEngine` (stateless, no dependencies) and then the `FormulaEngine` (wired to that same `ExpressionEngine` instance + the frozen, hydrated registry) immediately after M12 wiring; `bootstrap.js` registers both into the Service Locator alongside every other RT-3 service.

---

## C.9 Pipeline Position

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
  REND --> XE3[Expression Engine M13 — C.9]
  XE3 --> FORM3[Formula Engine M14 — C.9]
  FORM3 --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M14, M20]
  SL3 --> READY[Runtime Ready]
```

**Foundation C status after C.9:** RT-7 step 7.2 (M13/M14 evaluate bindings/formulas) now has a real, sandboxed implementation — but it is not yet wired into M12 Render's field-value binding (that integration, plus M15 Validation consuming these engines, remains future work). No Validation Engine, Execution Engine, Studio, or Marketplace code exists in `src/runtime/core/expression/` or `src/runtime/core/formula/`.
