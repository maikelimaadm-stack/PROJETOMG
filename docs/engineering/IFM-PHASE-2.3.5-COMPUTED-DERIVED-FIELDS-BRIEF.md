# IFM Phase 2.3.5 — Computed & Derived Fields Brief

**Mission ID:** IFM Phase 2.3.5 (Program 2.3.5)  
**Program:** MAK Studio — Computed & Derived Fields  
**Priority:** P1  
**Status:** Prepared — **ready after Program 2.3.4 Type System ✅**  
**Prerequisites:** Studio Type System 2.3.4 ✅ · Studio Dependency Engine 2.3.3 ✅ · Studio Expression Engine 2.3.2 ✅ · Field Studio 2.3 ✅

---

## Objective

Implement **Computed Fields** and **Derived Fields** in Field Studio consuming exclusively:

- **Studio Expression Engine** — parse, validate, compile
- **Studio Type System** — type inference, compatibility, coercion, semantic validation
- **Studio Dependency Engine** — cross-field dependency graph, impact analysis

**Pilot module:** empresas

---

## Inherit from 2.3.2 + 2.3.3 + 2.3.4 (mandatory)

| Capability | Source |
|------------|--------|
| Expression parse/validate/compile | `createExpressionEngine()` |
| Official Type Registry | `createTypeSystem()` |
| Type inference / compatibility | `typeSystem.inference` · `typeSystem.compatibility` |
| Official Dependency Graph | `createDependencyEngine()` |
| Field bridges | `fieldExpressionSetup.js` · `fieldTypeSetup.js` · `fieldDependencySetup.js` |

---

## Scope

### In scope

1. **Computed fields** — MDP `source: computed`, read-only derived values
2. **Derived fields** — expression-based field values
3. **Expression binding on Field Document** — `expressionSource` via Property Grid
4. **Type-aware validation** — Expression + Type System on save
5. **Dependency visualization** — field → expression → field refs
6. **MDP sync** — computed/derived payloads via public API
7. **Gate G301** — Computed & Derived Fields validation

### Out of scope

- Full Visual Formula Builder UI
- Runtime evaluation scheduler
- IA expression generation
- Workflow/Dashboard expressions

---

## Acceptance criteria

- [ ] User creates computed field with expression (no JSON)
- [ ] Type compatibility enforced via Studio Type System only
- [ ] Cross-field dependencies on Studio Dependency Engine only
- [ ] G301 passes; G300, G299, G298 remain green
- [ ] build · lint · verify:governance · 5 cycles green

---

*Prepared automatically by Program 2.3.4 certification — D-050.*
