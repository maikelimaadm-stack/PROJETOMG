# IFM Phase 2.3 — Field Studio Brief

**Mission ID:** IFM Phase 2.3 (Program 2.3)  
**Program:** MAK Studio — Field Studio  
**Priority:** P1  
**Status:** Prepared — **ready after 2.2.6 Studio Object Model ✅**  
**Prerequisites:** Studio Object Model 2.2.6 ✅ (D-044) · Studio Core Engine 2.2.5 ✅ (D-043) · Layout Studio Engine 2.2 ✅ (D-042) · Field Config Engine V14 ✅ · MDP-2 Data Dictionary ✅

---

## Objective

Implement the **Field Studio** designer plugin — second MAK Studio designer — consuming **Studio Object Model** (2.2.6), **Studio Core Engine** (2.2.5), and Layout patterns from Program 2.2.

**Pilot module:** empresas

---

## Inherit from 2.2.6 + 2.2.5 + 2.2 (do not rebuild)

| Pattern | Source | Reuse |
|---------|--------|-------|
| Studio Object Model | 2.2.6 | `createStudioObjectModel` + Field object schemas |
| Property Engine | 2.2.6 | `createPropertyEngine` + Field property schemas |
| Binding Engine | 2.2.6 | `createBindingEngine` + Field binding kinds |
| Behavior Engine | 2.2.6 | `createBehaviorEngine` + Field behavior policies |
| Object Identity System | 2.2.6 | Semantic stable field IDs |
| Studio Package Model | 2.2.6 | Package hierarchy for field artifacts |
| Document Engine | 2.2.5 | `createDocumentEngine` + Field Document schema |
| AST Engine | 2.2.5 | `createAstEngine` + Field transformers/compilers |
| Validation Engine | 2.2.5 | `createValidationEngine` + Field rules |
| Command Engine | 2.2.5 | `createCommandEngine` + Field command handlers |
| Studio Project Model | 2.2.5 | Project unit with Field artifact |
| Dependency Graph | 2.2.5 | Cross-artifact refs (field ↔ layout) |
| Refactoring Engine | 2.2.5 | Safe field renames |
| Layout Document model | 2.2 | Reference for Field Document structure |
| Canvas (if needed) | 2.2 | Field palette / grid canvas |
| Preview | 2.2 | Compile → CRB (no parallel render) |
| Contribution registration | 2.1A.7 | registerFieldDesigner via Contribution Manager |
| MDP registry client | 2.2 | Extend for `field`, `field_config` entry types |

---

## Scope

### In scope

1. **Field Document** — official editing representation (no raw JSON)
2. **Field AST** — intermediate representation → MDP `field` / `field_config` entries
3. **Field Canvas** — field palette, ordering, grouping (extends canvas engine)
4. **Commands** — add/remove/reorder/configure field, validation binding
5. **Property Grid** — field properties, bindings, validation rules via Field Document
6. **Validation Engine** — field-specific rules (required, type, formula refs)
7. **Preview** — Field Document → Compile → CRB
8. **Gate G292** — Field Studio Engine validation
9. Route `/studio/empresas/field` (or extend designer registry)

### Out of scope

- Formula Studio (V17) full editor
- Workflow Studio
- AI field suggestions
- Marketplace field packs

---

## APIs

| API | Use |
|-----|-----|
| `GET /api/mdp/registry?entryType=field_config` | Explorer |
| `POST/PUT/DELETE /api/mdp/registry` | Field CRUD |
| `POST /api/mdp/compile/empresas` | Preview |
| MDP Data Dictionary export | Field schema SSOT |

---

## File structure (target)

```
src/studio/designers/field/
├── document/          — Field Document contracts
├── ast/               — Field AST + MDP payloads
├── commands/          — Field command bus
├── canvas/            — Field palette canvas
├── validation/        — Field validation engine
├── preview/           — Compile bridge
├── FieldDesignerPlugin.jsx
└── registerFieldDesigner.js
```

---

## Acceptance criteria

- [ ] Field Studio loads at `/studio/empresas/field`
- [ ] Field Document is sole editing representation
- [ ] All edits via commands (undo/redo)
- [ ] Preview via compile path only
- [ ] G292 passes
- [ ] build · lint · verify:governance · 5 cycles green

---

*Prepared automatically by Program 2.2 certification — D-042.*
