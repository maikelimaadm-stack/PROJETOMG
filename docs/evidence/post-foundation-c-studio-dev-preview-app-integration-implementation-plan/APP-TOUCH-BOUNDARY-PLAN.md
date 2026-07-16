# App Touch Boundary Plan — `createAppTouchBoundaryPlan`

Asserts `App.jsx` stays untouched and no App wiring is implemented: `appTouched: false`,
`appWiringImplemented: false`, `appJsxAllowed: false`, `requiresExplicitFutureSlice: true`,
`requiresManualGate: true`. The verifier flags `unsafe_app_touched` / `unsafe_app_wiring_implemented`
on any inversion.
