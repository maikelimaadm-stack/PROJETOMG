# IFM Phase 2.1 — Studio Shell Brief (Definitive)

**Mission ID:** IFM Phase 2.1 (Program 2.1)  
**Program:** MAK Studio — Studio Shell  
**Priority:** P1  
**Status:** **Ready to implement — official start**  
**Architecture:** [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) v1.5.0  
**UX Framework:** [MAK-STUDIO-UX-FRAMEWORK.md](../architecture/MAK-STUDIO-UX-FRAMEWORK.md) v1.0.0 (**mandatory**)  
**Foundation:** SDK 2.0.5 ✅ · Design System 2.0.6 ✅ · Events 2.0.7 ✅ · Governance 2.0.8 ✅ · UX 2.0.9 ✅  
**Prerequisites:** Runtime Bridge 1E-1 ✅ · MDP-5 ✅ · **All pre-Shell documentation complete**

---

## Objective

Implement the **MAK Studio Shell** — the first **visual** implementation — using permanent foundation pillars + **UX Framework** as the interaction specification.

**Every panel must conform to [MAK-STUDIO-UX-FRAMEWORK.md](../architecture/MAK-STUDIO-UX-FRAMEWORK.md).**

**No Layout Studio in this mission.**

---

## Architecture + UX alignment

| Reference | Phase 2.1 deliverable |
|-----------|----------------------|
| Architecture §4 Shell | `StudioShell.jsx`, auth gate, top bar, session provider |
| Architecture §5 Navigation | Routes `/studio`, `/studio/:moduleId` |
| Architecture §7 Dock | Left/right/bottom panels per UX §4.2 |
| **UX §4.3 Explorer** | Tree + `selection.changed` + keyboard §4.3 |
| **UX §4.5 Property Grid** | Schema-driven properties — official term |
| **UX §4.9 Command Palette** | `Ctrl/Cmd+K` · `sdk.command` |
| **UX §4.10 History** | Undo/redo · event-driven |
| **UX §4.11 Preview** | Bottom dock stub · compile path |
| **UX §4.15 Breadcrumbs** | Top bar `Module › Designer › Entry` |
| **UX §4.16 Status Bar** | Connection · validation count |
| Architecture §31 SDK | `createStudioSdk({ deps })` |
| Architecture §32 Design System | Tokens only — no hardcoded colors |
| Architecture §33 Events | `getStudioEventHub()` — no direct panel calls |
| Architecture §34 Governance | G279–G284 on every commit |
| Architecture §35 UX | G285 · Designer Compliance prep |

---

## Implementation scope

### In scope

1. `src/studio/shell/` — per UX §3 layout model
2. `src/studio/navigation/` — UX §4.13
3. `src/studio/dock/` — Explorer, Outline, Inspector, Property Grid, Runtime Console (UX §4.2–4.6)
4. `src/studio/services/` — MDP API clients only
5. SDK + Event Hub + History/Preview wiring
6. Global shortcuts per UX §5.3
7. Loading/error/empty states per UX §4.19–4.20
8. Dock persistence per UX §8
9. Gate **G144** — MDP writes via official APIs only

### Out of scope

- Layout Studio · Field/Workflow studios · Full Preview iframe · Publish Center full UI · AI panel · Collaboration

---

## UX compliance checklist (mandatory)

- [ ] Property Grid (not "Properties panel") per UX §4.5
- [ ] Global shortcuts §5.3 — no designer overrides
- [ ] Official nomenclature §5.7 in all UI copy
- [ ] WCAG 2.1 AA §6 — focus rings, keyboard navigation
- [ ] Toast/banner/dialog patterns §4.17–4.18
- [ ] Selection via `sdk.selection` §4.21
- [ ] `npm run gate:studio-ux` passes

---

## Acceptance criteria

- [ ] `/studio` loads with auth gate
- [ ] All dock panels render per UX empty states
- [ ] Selection propagates via `selection.changed`
- [ ] SDK + Event Hub + Governance gates green
- [ ] UX Framework surfaces match §4 specifications (structure, not final polish)
- [ ] No designer canvas · No Foundation/MDP backend changes

---

## File structure

```
src/studio/
├── shell/          ← UX §3 Top Bar + Status Bar
├── navigation/     ← UX §4.13
├── dock/           ← UX §4.2–4.6 panels
├── services/       ← MDP clients
└── pages/          ← Module + designer pickers
```

---

## Next mission

**Program 2.2 — Layout Studio** — first designer; must pass UX §11 Designer Compliance Checklist.

---

*Definitive brief — Program 2.0.9 certification (D-036). Begin Studio Shell implementation.*
