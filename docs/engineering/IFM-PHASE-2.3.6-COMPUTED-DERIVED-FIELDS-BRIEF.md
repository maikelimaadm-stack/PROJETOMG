# IFM Phase 2.3.6 — Computed & Derived Fields Brief

**Mission ID:** IFM Phase 2.3.6 (Program 2.3.6)  
**Program:** MAK Studio — Computed & Derived Fields  
**Priority:** P1  
**Status:** Prepared — **ready after Program 2.3.5 Evaluation Engine ✅**  
**Prerequisites:** Studio Evaluation Engine 2.3.5 ✅ · Studio Type System 2.3.4 ✅ · Studio Dependency Engine 2.3.3 ✅ · Studio Expression Engine 2.3.2 ✅

---

## Objective

Implement **Computed Fields** and **Derived Fields** in Field Studio consuming exclusively:

- **Studio Expression Engine** — parse, validate, compile
- **Studio Type System** — inference, compatibility, coercion, validation
- **Studio Dependency Engine** — dependency graph, impact analysis
- **Studio Evaluation Engine** — expression evaluation, batch/incremental execution

**Pilot module:** empresas

---

## Inherit from 2.3.2–2.3.5 (mandatory)

| Capability | Source |
|------------|--------|
| Expression parse/validate/compile | `createExpressionEngine()` |
| Official evaluation pipeline | `createEvaluationEngine()` |
| Type inference / compatibility | `createTypeSystem()` |
| Dependency graph / order | `createDependencyEngine()` |
| Field bridges | `fieldExpressionSetup.js` · `fieldTypeSetup.js` · `fieldDependencySetup.js` · `fieldEvaluationSetup.js` |

---

## Scope

### In scope

1. **Computed fields** — MDP `source: computed`, read-only derived values
2. **Derived fields** — expression-based field values
3. **Expression binding** — `expressionSource` via Property Grid
4. **Evaluation on save/preview** — via Evaluation Engine only
5. **Dependency-ordered batch evaluation**
6. **MDP sync** — computed/derived payloads
7. **Gate G302** — Computed & Derived Fields validation

### Out of scope

- Full Visual Formula Builder
- Workflow/Dashboard runtime
- IA expression generation
- Automation scheduler

---

## Acceptance criteria

- [ ] User creates computed field with expression (no JSON)
- [ ] Evaluation exclusively via Studio Evaluation Engine
- [ ] G302 passes; G301, G300, G299, G298 remain green
- [ ] build · lint · verify:governance · 5 cycles green

---

*Prepared automatically by Program 2.3.5 certification — D-051.*
