# Menu Visibility — `createMenuVisibilityDecision`

Decides whether the isolated dev-preview menu is visible. Bound to the dev-only
feature gate:

- gate open → `visible: true`;
- gate closed (production, staging, disabled, missing checkpoint) → `visible: false`.

Because visibility depends entirely on the gate, the preview menu can never appear in
production or when the flag is off. The decision is pure and side-effect free and
renders nothing itself — it only informs the host what to display.
