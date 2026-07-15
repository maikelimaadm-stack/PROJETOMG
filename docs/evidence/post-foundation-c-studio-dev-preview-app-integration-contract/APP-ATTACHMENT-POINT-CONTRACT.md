# App Attachment Point Contract — `createAppAttachmentPointContract`

Describes, as pure metadata, **where** and **how** a future controlled integration would attach the
isolated dev-preview host to the real App.

- `futureAppLocation`: `dev_only_isolated_host_outside_main_app`
- `futureIntegrationKind`: `explicit_dependency_injected_dev_preview_host`
- `futureOwner`: `studio_dev_preview`
- `appTouched: false`, `attachmentCreated: false`, `integrationPerformed: false`
- `requiresExplicitFutureSlice: true`, `requiresManualGate: true`

It **creates no attachment** and **touches no App** — it only names the future attachment point.
