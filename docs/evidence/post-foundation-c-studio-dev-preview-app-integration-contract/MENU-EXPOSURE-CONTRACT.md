# Menu Exposure Contract — `createMenuExposureContract`

Metadata only; asserts no menu/sidebar/navigation is exposed to the product:

- `menuExposedToProduct: false`, `sidebarExposedToProduct: false`,
  `navigationExposedToProduct: false`, `menuItemCreated: false`;
- `futureExposure: dev_only_contract`; `requiresManualGate: true`.

No product menu item is created — the dev-preview menu stays isolated.
