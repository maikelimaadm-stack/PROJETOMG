# MAK Studio UX Framework

**Status:** Official — Permanent interaction reference for all MAK Studios  
**Version:** 1.0.0  
**Effective date:** 2026-06-29  
**Decision:** D-036 (Program 2.0.9)  
**Layer:** L5 (Experience Authoring)  
**Hierarchy:** Constitution → Master Architecture → [MAK-STUDIO-ARCHITECTURE.md](./MAK-STUDIO-ARCHITECTURE.md) → **This document** → Implementation

---

## 1. Purpose

This document defines the **single official interaction language** for MAK Studio. Every present and future Studio (Layout, Field, Workflow, Dashboard, Automation, Process, Integration, AI, …) **must** implement these UX contracts — never invent parallel interaction patterns.

| In scope | Out of scope |
|----------|--------------|
| Interaction behavior, states, shortcuts, nomenclature | React component implementation |
| Surface contracts (Workspace, Dock, Explorer, …) | Layout Studio canvas logic |
| Feedback, accessibility, responsiveness rules | Backend APIs |
| Layout persistence, future multi-monitor/collaboration prep | Marketplace UI |

**Binding rule:** No Studio may ship custom Explorer, Property Grid, Command Palette, or History behavior. All surfaces reuse Shell + SDK contracts defined here and in [MAK-STUDIO-ARCHITECTURE.md](./MAK-STUDIO-ARCHITECTURE.md).

**Related:** [Design System](./MAK-STUDIO-ARCHITECTURE.md#32-design-system-foundation-program-206) · [Event Architecture](./MAK-STUDIO-ARCHITECTURE.md#33-studio-event-architecture-program-207) · [Governance](./MAK-STUDIO-ARCHITECTURE.md#34-studio-architecture-governance-program-208)

---

## 2. UX Principles

| # | Principle | Application |
|---|-----------|-------------|
| U1 | **One Studio, one experience** | Same dock, selection, history, preview flow in every designer |
| U2 | **Metadata first** | All edits target MDP registry entries — UI reflects metadata, never hardcoded structure |
| U3 | **Event-driven panels** | Cross-surface communication via Event Hub — no direct panel-to-panel calls |
| U4 | **Progressive disclosure** | Inspector shows context; Property Grid shows editable fields; Explorer shows hierarchy |
| U5 | **Recoverable actions** | Every structural edit is undoable via History; destructive actions require confirmation |
| U6 | **Preview = production** | Preview always uses compile path; visual parity with runtime is the goal |
| U7 | **Accessible by default** | WCAG 2.1 AA minimum; keyboard-complete workflows |
| U8 | **Platform parity** | Contracts support Web, Desktop, Mobile, PWA — platform-specific rendering only |

---

## 3. Global Layout Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Top Bar — Navigation · Breadcrumbs · Tabs · Search · Status · Notifications  │
├────────┬──────────────────────────────────────────────────────┬─────────────┤
│ Dock   │                    Workspace                          │ Dock        │
│ Left   │              (Active Designer Canvas)                 │ Right       │
│        │                                                      │             │
│Explorer│                                                      │ Inspector   │
│Outline │                                                      │ Property    │
│Assets  │                                                      │ Grid        │
├────────┴──────────────────────────────────────────────────────┴─────────────┤
│ Dock Bottom — Preview · Runtime Console · Validation · Status Bar (extended) │
└─────────────────────────────────────────────────────────────────────────────┘
```

**SDK mapping:** `createStudioSdk()` — Workspace, Dock, Explorer, Inspector, History, Preview, Command, Selection, DragDrop, Clipboard.

**Event mapping:** `selection.changed`, `workspace.changed`, `dock.changed`, `preview.updated`, `history.undo`, `history.redo`.

---

## 4. Surface Specifications

### 4.1 Workspace

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Central region where the active Designer Plugin mounts |
| **Owner** | Shell provides container; Designer owns canvas content |
| **Selection** | Publishes `selection.changed` on focus change |
| **Empty state** | Designer picker when no designer active; module context always visible |
| **Loading** | Skeleton overlay during MDP fetch; never blank white screen |
| **Error** | Inline error banner + link to Runtime Console; retry action |
| **Resize** | Fills space between docks; min width 320px |
| **Keyboard** | `Esc` clears transient modes; designer-specific shortcuts scoped when focused |

**Designer contract:** One active designer at a time. Switching designers preserves Shell dock layout; clears designer-local selection.

---

### 4.2 Dock System

| Attribute | Contract |
|-----------|----------|
| **Zones** | `left` · `right` · `bottom` — no floating panels in v1 |
| **Resize** | Drag handle 4px; min panel width 200px; max 50% viewport |
| **Collapse** | Icon rail when collapsed; tooltip shows panel name |
| **Persistence** | Key: `mak.studio.dock.{userId}.{moduleId}` — localStorage or user prefs API |
| **Default layout** | Left: Explorer + Outline · Right: Inspector + Property Grid · Bottom: Preview + Console |
| **Events** | `dock.changed` on visibility/zone/resize |
| **Accessibility** | Focus trap within open panel; `F6` cycles dock zones |

**Rule:** Designers register additional panels via `sdk.dock.registerPanel()` — never create standalone sidebars.

---

### 4.3 Explorer

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Hierarchical tree of MDP registry entries for active module + designer |
| **Data** | `GET /api/mdp/registry` filtered by designer `supportedEntryTypes` |
| **Selection** | Single-select default; `Ctrl/Cmd+click` multi-select where designer supports bulk ops |
| **Actions** | Create · Rename · Delete · Duplicate (via context menu + keyboard) |
| **Icons** | From Design System token `icons.explorer.{entryType}` — never inline SVG per designer |
| **Search** | Filters tree in-place; does not replace global Search |
| **Events** | Publishes `selection.changed`, `component.created/deleted/updated` |
| **Keyboard** | `↑↓` navigate · `Enter` select · `Delete` delete (with confirm) · `F2` rename |

---

### 4.4 Inspector

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Read-only contextual summary of selected entry |
| **Content** | entryId, entryType, status, bindings summary, validation state |
| **Updates** | Subscribes to `selection.changed` — never polls independently |
| **Empty state** | "Select an entry in Explorer or Workspace" |
| **Actions** | Links to Property Grid field; "Open in Preview" when applicable |

---

### 4.5 Property Grid

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Editable schema-driven properties for selected entry |
| **Schema** | Property Registry + MDP JSON Schema — never hardcoded field lists |
| **Edit flow** | Change → validate → `property.changed` → History push → Preview refresh |
| **Grouping** | Accordion sections: General · Layout · Behavior · Advanced |
| **Validation** | Inline field errors; summary badge on section header |
| **Events** | Publishes `property.changed` |
| **Keyboard** | `Tab` / `Shift+Tab` between fields · `Ctrl/Cmd+Z` undo via History |

**Naming:** Official term is **Property Grid** (not "Properties panel" in user-facing docs).

---

### 4.6 Outline

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Flat or shallow list view of current designer scope (e.g. layout hierarchy) |
| **Sync** | Bidirectional selection with Explorer and Workspace |
| **Reorder** | Drag handle when designer supports reorder; publishes `layout.changed` |
| **Filter** | By entry type, visibility, lock state |

---

### 4.7 Asset Manager

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Browse reusable assets (components, tokens, templates, marketplace packages) |
| **Location** | Dock Left tab (with Explorer, Outline) — v1 stub in Shell |
| **Insert** | Drag to Workspace → `component.created` via DragDrop API |
| **Sources** | Component Registry · Design System tokens · Marketplace (future) |

---

### 4.8 Search

| Attribute | Contract |
|-----------|----------|
| **Global search** | Top bar `Ctrl/Cmd+K` opens Command Palette in search mode |
| **Scope** | Registry entries · commands · designers · documentation (future) |
| **Results** | Grouped: Entries · Commands · Navigation |
| **Action** | Enter navigates/selects; never mutates without explicit second action |

---

### 4.9 Command Palette

| Attribute | Contract |
|-----------|----------|
| **Trigger** | `Ctrl/Cmd+Shift+P` (commands) · `Ctrl/Cmd+K` (search) |
| **API** | `sdk.command.register()` / `sdk.command.execute()` |
| **Categories** | Navigation · Edit · View · Publish · Designer |
| **Recents** | Last 5 commands per user session |
| **Events** | Executes via History when mutating; read-only commands skip History |

---

### 4.10 History (Undo / Redo)

| Attribute | Contract |
|-----------|----------|
| **Scope** | Session-level command stack via `sdk.history` |
| **Undo** | `Ctrl/Cmd+Z` · publishes `history.undo` |
| **Redo** | `Ctrl/Cmd+Shift+Z` · publishes `history.redo` |
| **Labels** | Top bar shows undo/redo tooltip with command label |
| **Rule** | History never calls Layout/Designer directly — responds to events only |
| **Limit** | Default 50 commands (`STUDIO_HISTORY_DEFAULT_LIMIT`) |

---

### 4.11 Preview

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Live compiled preview of draft metadata |
| **Compile** | `sdk.preview.refresh()` → MDP compile → CRB hydration |
| **Trigger** | Auto on `layout.changed`, `property.changed`, manual refresh button |
| **Location** | Bottom dock tab or split workspace (designer preference) |
| **States** | Loading spinner · Error with compile log · Success iframe/surface |
| **Events** | Subscribes to change events; publishes `preview.updated` |
| **Rule** | Preview never imports Designer modules directly |

---

### 4.12 Publish Center

| Attribute | Contract |
|-----------|----------|
| **Purpose** | Validate → publish → pin draft to environment |
| **Route** | `/studio/:moduleId/publish` |
| **Flow** | Validate → diff summary → confirm → `publish.started` → MDP publish → `publish.completed` |
| **Badge** | Top bar shows environment pin version |
| **Errors** | Blocking validation list; link to offending entry in Explorer |

---

### 4.13 Navigation

| Surface | Behavior |
|---------|----------|
| **Module picker** | `/studio` — cards per module with studio permission |
| **Designer picker** | `/studio/:moduleId` — enabled designers only |
| **Deep link** | `?entryId=` selects entry on load |
| **Back** | Browser back preserves Shell; clears designer canvas |

---

### 4.14 Tabs

| Context | Contract |
|---------|----------|
| **Dock tabs** | One active panel per dock zone group; overflow → dropdown |
| **Document tabs** | Not in v1 — single module context per Shell session |
| **Designer tabs** | Top bar segmented control; `designer.active.changed` on switch |

---

### 4.15 Breadcrumbs

| Segment | Example |
|---------|---------|
| Module | `empresas` |
| Designer | `Layout` |
| Entry | `section.main` |
| **Separator** | ` › ` (single chevron) |
| **Click** | Navigates/selects segment target |
| **Truncation** | Middle ellipsis when > 4 segments |

---

### 4.16 Status Bar

| Zone | Content |
|------|---------|
| Left | Connection status · moduleId · draft/published indicator |
| Center | Designer-specific status (optional) |
| Right | Compile time · validation count · cursor/selection hint |
| **Height** | 24px · tokens: `spacing.statusBar` |

---

### 4.17 Notifications

| Type | Pattern |
|------|---------|
| **Toast** | Bottom-right · 5s auto-dismiss · action button optional |
| **Banner** | Top of Workspace · persistent until dismissed · errors/warnings |
| **Inline** | Field-level in Property Grid |
| **Severity** | info · success · warning · error — Design System semantic colors only |

---

### 4.18 Dialogs

| Type | Usage |
|------|-------|
| **Confirm** | Delete · Publish · Discard changes |
| **Form** | Create entry · Import · Settings |
| **Modal** | Blocks workspace; `Esc` cancels non-destructive |
| **Focus** | Trap focus; return focus to trigger on close |

---

### 4.19 Loading States

| Context | Pattern |
|---------|----------|
| **Initial Shell** | Full-page skeleton |
| **Panel** | Shimmer within panel bounds |
| **Action** | Button spinner + disabled state |
| **Preview** | Progress bar + "Compiling…" label |
| **Never** | Indeterminate forever — timeout → error state at 30s |

---

### 4.20 Error States

| Context | Pattern |
|---------|----------|
| **API failure** | Toast + Status Bar indicator + Retry |
| **Validation** | Property Grid inline + Outline badge |
| **Compile** | Preview panel log + Runtime Console link |
| **Auth** | Redirect to login — StudioAuthGate |
| **Copy** | Plain language · error code in details expander |

---

### 4.21 Selection Engine

| Rule | Contract |
|------|------------|
| **SSOT** | `sdk.selection` — single selection store |
| **Propagation** | Explorer ↔ Outline ↔ Workspace ↔ Inspector ↔ Property Grid |
| **Event** | All changes publish `selection.changed` |
| **Multi-select** | Opt-in per designer; `selectionIds[]` in payload |
| **Clear** | `Esc` or click empty workspace area |

---

### 4.22 Drag & Drop

| Rule | Contract |
|------|------------|
| **API** | `sdk.dragDrop` — designers register drop zones |
| **Feedback** | Ghost preview · drop highlight · invalid cursor |
| **Sources** | Asset Manager · Explorer reorder · Workspace canvas |
| **Events** | Drop success → `component.created` or `layout.changed` |

---

## 5. Standardization Contracts

### 5.1 Behavior contract

Every interactive surface implements:

```typescript
interface StudioUxSurface {
  surfaceId: string;           // e.g. "explorer", "property-grid"
  mount(context: StudioUxContext): void;
  onSelectionChanged?(payload: SelectionPayload): void;
  dispose(): void;
}
```

### 5.2 Interaction contract

| Interaction | Standard |
|-------------|----------|
| Primary action | Click / `Enter` |
| Secondary action | Context menu / `Shift+F10` |
| Destructive | Confirm dialog always |
| Bulk | Multi-select + single confirm listing count |

### 5.3 Keyboard shortcuts (global)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+K` | Open Search / Command Palette |
| `Ctrl/Cmd+Shift+P` | Command Palette (commands only) |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Shift+Z` | Redo |
| `Ctrl/Cmd+S` | Save draft (MDP persist — no local-only save) |
| `Ctrl/Cmd+P` | Open Publish Center |
| `Ctrl/Cmd+\`` | Toggle bottom dock |
| `Ctrl/Cmd+B` | Toggle left dock |
| `Ctrl/Cmd+J` | Toggle right dock |
| `F6` | Cycle dock focus |
| `Esc` | Cancel / clear selection |

Designers add shortcuts via `sdk.command.register()` — **never** override global bindings.

### 5.4 State contract

| State | Visual token |
|-------|--------------|
| default | `color.surface.default` |
| hover | `color.surface.hover` |
| active/selected | `color.surface.selected` |
| disabled | `opacity.disabled` |
| focus ring | `accessibility.focus.visible` |
| error | `color.semantic.error` |

### 5.5 Icon contract

| Rule | Detail |
|------|--------|
| Source | Design System `icons.*` tokens only |
| Size | 16px inline · 20px toolbar · 24px empty states |
| Semantic | Same icon for same action across all Studios |

### 5.6 Feedback contract

| Action type | Feedback |
|-------------|----------|
| Save | Toast success · Status Bar sync indicator |
| Error | Toast error · inline field highlight |
| Long operation | Progress · cancel when API supports |
| Silent sync | Status Bar only — no toast spam |

### 5.7 Nomenclature (official terms)

| Use this | Not this |
|----------|----------|
| Property Grid | Properties panel, Props, Inspector fields |
| Explorer | Tree, Sidebar, File tree |
| Workspace | Canvas, Editor area |
| Publish Center | Deploy dialog, Release |
| Designer | Plugin, Mode, Editor type |
| Entry | Node, Item (in UX copy) |
| Module | Project, App |

---

## 6. Accessibility

| Requirement | Standard |
|-------------|----------|
| WCAG level | 2.1 AA minimum |
| Keyboard | All flows completable without mouse |
| Focus | Visible focus ring on all interactive elements |
| Screen reader | ARIA labels on tree, grid, tabs, dialogs |
| Touch targets | Minimum 44×44px on touch platforms |
| Contrast | Design System `contrast.wcag-aa` profile |
| Motion | Respect `prefers-reduced-motion` — Motion Registry `fade` only |

---

## 7. Responsiveness

| Breakpoint | Behavior |
|------------|----------|
| ≥ 1280px | Full dock layout |
| 1024–1279px | Right dock collapsed by default |
| 768–1023px | Left dock icon rail; bottom dock drawer |
| < 768px | **Mobile Studio** (future) — single panel stack; not Shell v1 target |

Shell v1 targets **desktop web** ≥ 1024px. Contracts remain valid for Desktop shell (Tauri/Electron) and future Mobile.

---

## 8. Layout Persistence

| Key | Scope | Storage |
|-----|-------|---------|
| `mak.studio.dock.*` | Panel sizes, visibility, zone | localStorage → user prefs API |
| `mak.studio.lastModule` | Last opened moduleId | sessionStorage |
| `mak.studio.lastDesigner` | Per module | sessionStorage |
| **Not persisted** | Selection, undo stack, preview cache |

---

## 9. Future — Multi-Monitor

| Capability | Contract (planned) |
|------------|-------------------|
| Detach panel | Drag dock tab to OS window — Event Hub syncs via `workspace.changed` |
| Preview screen | Second monitor hosts Preview surface only |
| Status | Not implemented — contracts reserved in Event Architecture collaboration section |

---

## 10. Future — Collaboration

| Capability | Contract (planned) |
|------------|-------------------|
| Presence | Avatar strip in Status Bar · `collaboration.presence.*` events |
| Live cursors | Workspace overlay — never in Property Grid |
| Lock | Entry-level edit lock · optimistic UI |
| Status | Not implemented — see Event Architecture § collaboration contracts |

---

## 11. Designer Compliance Checklist

Every new Designer **must** verify before shipping:

- [ ] Uses Shell Workspace mount — no custom shell
- [ ] Selection via `sdk.selection` + `selection.changed`
- [ ] Properties via Property Grid schema — no custom form chrome
- [ ] History via `sdk.history.pushCommand`
- [ ] Preview via `sdk.preview` event wiring
- [ ] Commands registered via `sdk.command`
- [ ] Icons/tokens from Design System only
- [ ] Passes G279–G284 governance gates
- [ ] UX copy uses official nomenclature (§5.7)

---

## 12. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-29 | Initial UX Framework — Program 2.0.9 (D-036) |

---

*This document is the permanent interaction reference for MAK Studio. No Studio may contradict it without a D-register amendment.*
