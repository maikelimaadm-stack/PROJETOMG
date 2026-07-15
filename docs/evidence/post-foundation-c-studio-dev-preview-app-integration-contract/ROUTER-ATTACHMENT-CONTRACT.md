# Router Attachment Contract — `createRouterAttachmentContract`

Metadata only; asserts no router is touched and no router primitive/API is used:

- `routerTouched: false`, `routerAttachmentCreated: false`, `routeRegistered: false`;
- `browserRouterUsed: false`, `createBrowserRouterUsed: false`, `useNavigateUsed: false`;
- `futureAttachment: dev_only_contract`; `requiresManualGate: true`.

No `react-router` primitive is created — the contract only describes the future attachment shape.
