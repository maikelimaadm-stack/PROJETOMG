# IFM Phase 2.3.1 — Advanced Field Capabilities Brief

**Mission ID:** IFM Phase 2.3.1 (Program 2.3.1)  
**Program:** MAK Studio — Field Studio Advanced Capabilities  
**Priority:** P1  
**Status:** Prepared — **ready after Program 2.3 Field Studio Phase 1 ✅**  
**Prerequisites:** Field Studio 2.3 ✅ (D-046) · Studio Editor 2.2.7 ✅ · SOM 2.2.6 ✅ · Core 2.2.5 ✅ · Field Config Engine V14 ✅ · Formula Engine V17 ✅ · Validation Engine V16 ✅

---

## Objective

Extend **Field Studio** beyond Phase 1 CRUD with advanced field capabilities — still consuming exclusively **Studio Editor Engine**, **Studio Core**, **SOM**, **SDK**, **Design System**, and **Event Hub**. No new Studio infrastructure.

**Pilot module:** empresas · **Entity:** EmpresaCadastro

---

## Inherit from 2.3 (do not rebuild)

| Pattern | Source | Reuse |
|---------|--------|-------|
| Field Document | 2.3 | Extend schema — do not replace |
| Field AST | 2.3 | Add nodes for advanced capabilities |
| Command bus | 2.3 | New command types only |
| MDP Field client | 2.3 | Extend payloads — same public API surface |
| Editor registration | 2.3 | Add panels/tools — no local editor |
| Preview bridge | 2.3 | Same Compile path |

---

## Scope

### In scope

1. **Computed fields** — read-only derived values (V14 computed metadata)
2. **Derived fields** — expression-based field derivation
3. **Field relationships** — lookup / reference bindings via SOM Binding Engine
4. **Validation rules** — V16 validation bindings per field (required, min/max, pattern)
5. **Input masks** — basic mask configuration (Phase 1 excluded advanced masks)
6. **Formula references** — V17 formula binding on field (display/compute only)
7. **Field grouping** — multiple groups beyond `group.main`
8. **Native field visibility** — read-only view of system fields in Explorer
9. **Refactoring** — safe field rename via Core Refactoring Engine
10. **Gate G297** — Advanced Field Capabilities validation

### Out of scope

- IA field suggestions
- Marketplace field packs
- Workflow triggers on field change
- Full automation studio integration
- Offline field editing

---

## APIs

| API | Use |
|-----|-----|
| `GET/POST/PUT/DELETE /api/mdp/fields` | Field Dictionary CRUD (extended payloads) |
| `GET /api/mdp/registry?entryType=field_config` | field_config summary |
| `POST /api/mdp/compile/empresas` | Preview with validation + formula resolution |
| Field Config V14 registry | Type metadata, computed/derived schemas |
| Validation V16 registry | Per-field validation rules |
| Formula V17 registry | Expression references |

---

## File structure (target extensions)

```
src/studio/designers/field/
├── document/          — extend Field Document schema (computed, derived, validation)
├── ast/               — advanced AST nodes + MDP payloads
├── commands/          — BIND_VALIDATION, SET_FORMULA, SET_MASK, ADD_GROUP, …
├── som/               — extended binding kinds + behavior policies
├── panels/            — ValidationPanel, FormulaPanel (register via Editor)
└── validation/        — cross-field rules, formula ref integrity
```

---

## Acceptance criteria

- [ ] Computed and derived fields editable via Property Grid (no JSON)
- [ ] Validation rules attachable per field via visual UI
- [ ] Basic masks configurable for string/date fields
- [ ] Field rename propagates via Refactoring Engine + MDP sync
- [ ] Preview reflects validation + formula resolution via Compile
- [ ] G297 passes
- [ ] G296 (Phase 1) and G291 (Layout) remain green
- [ ] build · lint · verify:governance · 5 cycles green

---

*Prepared automatically by Program 2.3 certification — D-046.*
