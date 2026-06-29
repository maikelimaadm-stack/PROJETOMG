# IFM Phase 2.3.4 — Computed & Derived Fields Brief

**Mission ID:** IFM Phase 2.3.4 (Program 2.3.4)  
**Program:** MAK Studio — Computed & Derived Fields  
**Priority:** P1  
**Status:** Prepared — **ready after Program 2.3.3 Dependency Engine ✅**  
**Prerequisites:** Studio Dependency Engine 2.3.3 ✅ · Studio Expression Engine 2.3.2 ✅ · Field Smart Authoring 2.3.1 ✅ · Field Studio 2.3 ✅

---

## Objective

Implement **Computed Fields** and **Derived Fields** in Field Studio consuming exclusively:

- **Studio Expression Engine** — parse, validate, compile (no local parsers)
- **Studio Dependency Engine** — cross-field dependency graph, impact analysis, cycle detection (no local graphs)

**Pilot module:** empresas

---

## Inherit from 2.3.2 + 2.3.3 (mandatory)

| Capability | Source |
|------------|--------|
| Expression parse/validate/compile | `createExpressionEngine()` |
| Function Catalog | `catalog/functionCatalog.js` |
| Official Dependency Graph | `createDependencyEngine()` |
| Field expression bridge | `fieldExpressionSetup.js` |
| Field dependency bridge | `fieldDependencySetup.js` |
| Impact / cycle / safe delete | `impactAnalyzer`, `cycleDetection`, `safeDelete` |

---

## Scope

### In scope

1. **Computed fields** — MDP `source: computed`, read-only derived values
2. **Derived fields** — expression-based field values
3. **Expression binding on Field Document** — `expressionSource` property via Property Grid
4. **Visual expression preview** — structural result preview (not full Formula Editor)
5. **Dependency visualization** — field → expression → field refs via Studio Dependency Engine
6. **MDP sync** — computed/derived payloads via public API
7. **Gate G300** — Computed & Derived Fields validation

### Out of scope

- Full Visual Formula Builder UI
- Workflow/Dashboard expressions
- IA expression generation
- Marketplace formula packs
- Workflow Engine · Dashboard Engine · Runtime Scheduler

---

## Acceptance criteria

- [ ] User creates computed field with expression (no JSON)
- [ ] Derived field updates via Expression Engine only
- [ ] Cross-field dependencies registered on Studio Dependency Engine only
- [ ] G300 passes; G299 and G298 remain green
- [ ] build · lint · verify:governance · 5 cycles green

---

*Prepared automatically by Program 2.3.3 certification — D-049.*
