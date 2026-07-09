# Foundation C.5 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M20 — Service Locator

```mermaid
flowchart TB
  RT0[RT-0 runRt0Shell] --> SL[ServiceLocator created]
  SL --> REG1[register: context M02]
  SL --> REG2[register: registry M04]
  RT3[RT-3 hydrateWithBundle] --> REG3[register: registry override]
  RT3 --> REG4[register: loader M05]
  RT3 --> REG5[register: crbLoader M06]
  RT3 --> REG6[register: dependencyResolver M07]
  RT3 --> REG7[register: router M08]
  RT3 --> REG8[register: permissionEngine M09 C.5]
  SL --> SCOPE[createScope: child inherits parent registrations + shared singletons]
  SCOPE --> SCOPED[scoped instances isolated per scope node]
```

**Depends on:** none (pure infrastructure — M20 is the DI root)
**Consumed by:** RT-0 bootstrap (`rt0-shell.js`), RT-3 hydrate (`bootstrap.js`), any future module resolving core services (M10+)

**Lifetimes:**
- `singleton` — one instance shared across the whole locator tree (root-owned cache), regardless of which scope resolves it.
- `scoped` — one instance per locator node; a child scope never sees or pollutes a parent's (or sibling's) scoped instances.

---

## M09 — Permission Engine

```mermaid
flowchart TB
  CRB[CrbPayload.registries.permission] --> HYD[hydrateRegistries — M06]
  HYD --> REG[IRegistry type=permission, frozen post RT-3]
  REG --> PM[PermissionMatrix.evaluate]
  AS[AccessScope.permissions — user grants] --> PM
  PM -->|deny found| DENY[blocked: reason=deny]
  PM -->|allow found + granted| ALLOW[allowed: reason=allow]
  PM -->|allow found + not granted| NOTGRANTED[blocked: reason=not-granted]
  PM -->|no rule found| DEFAULT[blocked: reason=default-deny]
  PE[PermissionEngine.can] --> PM
  PE --> FV[PermissionEngine.filterVisible]
  FV --> UI[UI elements filtered — denied items removed]
```

**Depends on:** M04 Registry (hydrated `permission` bucket), M02 Context / AccessScope
**Consumed by:** M08 Router (`canActivate`, RT-5), future M12 Render Engine (`filterVisible`, C.8+)

**Decision rule (deny > allow > default deny):**
1. Any applicable `deny` entry (exact `${resource}.${action}` or wildcard `${resource}.*`) → blocked, unconditionally.
2. Else, an applicable `allow` entry → allowed **only if** its code is present in `AccessScope.permissions` (user must actually be granted it); otherwise blocked (`not-granted`).
3. No applicable entry at all → blocked (`default-deny`).
4. Invalid action/resource, invalid context/accessScope, or invalid/missing registry → blocked before matrix evaluation ever runs.

---

## RT-5 Authorize — Router integration

```mermaid
sequenceDiagram
  participant Host as Client / Host UI
  participant RT as M08 RuntimeRouter
  participant PE as M09 PermissionEngine
  participant PM as PermissionMatrix
  participant REG as M04 Registry (permission)

  Host->>RT: canActivate(route, ctx)
  alt no PermissionEngine wired
    RT-->>Host: false (fail-closed)
  else engine wired
    RT->>RT: derive code (route.permission / requiredPermission / `${moduleId}.access`)
    alt no derivable code
      RT-->>Host: false (fail-closed)
    else code derived
      RT->>PE: can(action, resource, ctx)
      PE->>PM: evaluate({action, resource, registry, grantedPermissions})
      PM->>REG: has/resolve('permission', code)
      REG-->>PM: entry or none
      PM-->>PE: {allowed, reason}
      alt engine throws
        PE-->>RT: (error)
        RT-->>Host: false (fail-closed)
      else normal
        PE-->>RT: boolean
        RT-->>Host: boolean
      end
    end
  end
```

**Wiring point:** `loadRuntimeBundle.js` builds the `PermissionEngine` from the frozen, hydrated registry immediately after `registry.freeze()` (RT-3), then calls `router.setPermissionEngine(...)` before the router registers CRB routes. By the time any `canActivate()` call can occur, the engine is always present for the standard pipeline (`bootstrap()` → `hydrateWithBundle()`).

---

## C.5 Pipeline Position

```mermaid
flowchart TD
  B[Bootstrap M01 / RT-0] --> SL0[ServiceLocator init — M20]
  SL0 --> C[Context M02]
  C --> S[Session M03]
  S --> R[Registry M04]
  R --> L[Loader M05]
  L --> CRB[CRB Loader M06]
  CRB --> DEP[Dependency Resolver M07]
  DEP --> PERM[Permission Engine M09 — C.5]
  PERM --> RT[Runtime Router M08 — canActivate wired]
  RT --> SL3[ServiceLocator wired — M01-M08 + M09 resolvable]
  SL3 --> READY[Runtime Ready — RT-5 enforced]
```

**Foundation C status after C.5:** RT-0 → RT-6 have a real, non-stub implementation for authorization (RT-5). RT-7 (Render) and RT-8 (Execute) remain unimplemented — scheduled for C.8+ and C.11+ respectively, per `10-DELIVERY-PLANNING.md`. No Action Engine (M10), Workflow (M11), or Render (M12) code was introduced in this slice.
