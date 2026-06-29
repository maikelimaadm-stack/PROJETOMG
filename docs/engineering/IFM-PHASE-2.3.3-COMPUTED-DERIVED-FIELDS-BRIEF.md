# IFM Phase 2.3.3 — Computed & Derived Fields Brief

**Mission ID:** IFM Phase 2.3.3 (Program 2.3.3)  
**Program:** MAK Studio — Computed & Derived Fields  
**Priority:** P1  
**Status:** Prepared — **ready after Program 2.3.2 Expression Engine ✅**  
**Prerequisites:** Studio Expression Engine 2.3.2 ✅ (D-048) · Field Smart Authoring 2.3.1 ✅ · Field Studio 2.3 ✅ · Formula Engine V17 ✅

---

## Objective

Implement **Computed Fields** and **Derived Fields** in Field Studio consuming exclusively the **Studio Expression Engine** — no local parsers, AST, or evaluators.

**Pilot module:** empresas

---

## Inherit from 2.3.2 (mandatory)

| Capability | Source |
|------------|--------|
| Expression parse/validate/compile | `createExpressionEngine()` |
| Function Catalog | `catalog/functionCatalog.js` |
| Dependency Graph | `expressionDependencyGraph.js` |
| Field consumer bridge | `fieldExpressionSetup.js` |

---

## Scope

### In scope

1. **Computed fields** — MDP `source: computed`, read-only derived values
2. **Derived fields** — expression-based field values
3. **Expression binding on Field Document** — `expressionSource` property via Property Grid
4. **Visual expression preview** — structural result preview (not full Formula Editor)
5. **Dependency visualization** — field → variable refs via Expression Dependency Graph
6. **MDP sync** — computed/derived payloads via public API
7. **Gate G299** — Computed & Derived Fields validation

### Out of scope

- Full Visual Formula Builder UI
- Workflow/Dashboard expressions
- IA expression generation
- Marketplace formula packs

---

## Acceptance criteria

- [ ] User creates computed field with expression (no JSON)
- [ ] Derived field updates via Expression Engine only
- [ ] G299 passes; G298 remains green
- [ ] build · lint · verify:governance · 5 cycles green

---

*Prepared automatically by Program 2.3.2 certification — D-048.*
