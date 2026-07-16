# Governance Registry Authorization

`scripts/gates/lib/studioScopeGovernanceRegistry.mjs` was updated additively:

1. The four slice-specific paths (subtree, test, gate, evidence) were registered as **known-later**
   artifacts.
2. A new export `STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN` declares the two forbidden
   paths this slice — and ONLY this slice's gate — explicitly authorizes: `src/App.jsx` and
   `scripts/gates/lib/productionUiGuard.mjs`.

## Why not known-later for App.jsx / productionUiGuard

Forbidden always wins over known-later, and the leak-probe invariant requires that no forbidden path
appears in the known-later list. So App.jsx and productionUiGuard are **not** added to known-later;
instead the slice gate passes them as `explicitlyAuthorizedForbidden` to
`classifyStudioScopePath`, which is the only sanctioned release path — and it applies **only** to
this slice's gate. Prior gates (which pass no such option) still classify both as `forbidden_scope`.

`scripts/gates/lib/studioScopeGovernanceGuard.mjs` was **not** altered. `forbidden_scope` keeps
priority; `unknown_scope` still fails closed.

## Known prior-gate scope limitation

Because prior studio gates hardcode `src/App.jsx` (and some `productionUiGuard`) as forbidden in
their branch-relative scope checks and cannot be altered by this slice, those checks flag App.jsx/
productionUiGuard on this branch. This is a transient **KNOWN_PRIOR_GATE_SCOPE_LIMITATION** that
resolves on merge (once the change is on `origin/main`, later branches no longer see it in their
diff). The master production-UI gate (`productionUiOffendingFiles`) tolerates the sanctioned
additive dev-route mount and passes.
