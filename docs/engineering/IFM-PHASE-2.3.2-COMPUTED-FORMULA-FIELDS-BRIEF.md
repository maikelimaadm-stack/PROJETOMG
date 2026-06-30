# IFM Phase 2.3.2 — Computed & Formula Fields Brief

**Mission ID:** IFM Phase 2.3.2 (Program 2.3.2)  
**Program:** MAK Studio — Computed & Formula Fields  
**Priority:** P1  
**Status:** Prepared — **ready after Program 2.3.1 Smart Authoring ✅**  
**Prerequisites:** Field Studio 2.3.1 ✅ (D-047) · Field Studio 2.3 ✅ · Formula Engine V17 ✅ · Validation Engine V16 ✅ · Studio Core/SOM/Editor ✅

---

## Objective

Extend Field Studio with **Computed** and **Formula** field capabilities — consuming V17 Formula Engine and V16 Validation Engine through MDP public APIs. No new Studio infrastructure.

**Pilot module:** empresas

---

## Inherit from 2.3.1 (do not rebuild)

| Pattern | Source | Reuse |
|---------|--------|-------|
| Smart Templates | 2.3.1 | Extend — do not duplicate |
| Business Types | 2.3.1 | Wire to formula/relationship refs |
| Field Document | 2.3 | Extend schema |
| Presentation adapter | 2.3.1 | Extend payloads |
| Command bus | 2.3 | New command types only |

---

## Scope

### In scope

1. **Computed fields** — read-only derived values (MDP `source: computed`)
2. **Formula references** — V17 formula binding via visual editor (no raw JSON)
3. **Derived fields** — expression-based derivation
4. **Formula preview** — compile path validates formula resolution
5. **Cross-field dependency hints** — Dependency Graph Engine integration
6. **Gate G298** — Computed & Formula validation

### Out of scope

- Full Relationship Studio
- Workflow triggers
- IA formula generation
- Marketplace formula packs

---

## APIs

| API | Use |
|-----|-----|
| `POST/PUT /api/mdp/fields` | computed/derived payloads |
| Formula V17 registry | Expression SSOT |
| Validation V16 registry | Cross-field rules |
| `POST /api/mdp/compile/empresas` | Preview with formula resolution |

---

## Acceptance criteria

- [ ] Computed fields creatable via visual UI
- [ ] Formula binding attachable per field (V17 ref)
- [ ] Derived fields with expression builder
- [ ] Preview reflects formula resolution via Compile
- [ ] G298 passes; G297 and G296 remain green
- [ ] build · lint · verify:governance · 5 cycles green

---

*Prepared automatically by Program 2.3.1 certification — D-047.*
