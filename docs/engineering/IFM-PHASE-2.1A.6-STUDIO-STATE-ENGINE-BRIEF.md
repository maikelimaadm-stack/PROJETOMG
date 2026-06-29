# IFM Phase 2.1A.6 — Studio State Engine Brief

**Mission ID:** IFM Phase 2.1A.6 (Program 2.1A.6)  
**Program:** MAK Studio — Studio State Engine  
**Priority:** P1  
**Status:** **Ready after 2.1A.5 universal components**  
**Prerequisites:** Universal Components ✅ (D-038) · Shell Prototype ✅ (D-037) · Event Architecture ✅ (D-034)

---

## Objective

Extract session, selection, dock, and workspace state from `StudioShellProvider` into a dedicated **Studio State Engine** — a framework-agnostic state layer that feeds Universal Component Providers via adapters.

No MDP, no persistence API, no Layout Studio.

---

## Scope

### In scope

1. `src/studio/state/` — state engine core
2. **State slices:** session (module/designer), selection, dock layout, workspace context, notifications
3. **Event Hub sync** — state changes publish official events (`selection.changed`, `workspace.changed`, etc.)
4. **Provider adapters** — thin mappers from state engine → Universal Providers
5. **Reducer/actions contract** — public API for designers to subscribe without importing shell
6. Gate **G289** — State Engine isolation (no designer imports, no mock in core)

### Out of scope

- MDP integration (2.1B)
- localStorage persistence (2.1B)
- Layout Studio (2.2)

---

## Architecture

```
Studio State Engine (state/)
    ↓ adapters
Universal Providers (components/providers/)
    ↓
Universal Components (components/Universal*.jsx)
    ↓
Studio Shell (shell/)
```

---

## Migration from 2.1A.5

| Current (StudioShellProvider) | Target (State Engine) |
|------------------------------|------------------------|
| useState for dock/selection | `createStudioState()` |
| publishSelection inline | `state.selection.select()` → Event Hub |
| propertyFields state | `state.properties.update()` |
| Provider value builders | `studioStateToProviders(state)` adapter |

---

## Acceptance criteria

- [ ] `StudioShellProvider` reduced to wiring only (< 150 LOC)
- [ ] State engine testable without React
- [ ] All Universal Providers fed via adapters
- [ ] Event Hub events emitted on every state transition
- [ ] G288 + G289 green; build · lint · verify:ci · 5 cycles

---

*Definitive brief — Program 2.1A.5 certification (D-038).*
