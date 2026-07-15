# Blocked Navigation — `createBlockedNavigationModel`

Enumerates the navigation kinds the isolated runtime **refuses** to perform, making
the isolation explicit and testable:

- `navigateProduct`
- `registerProductRoute`
- `registerProductMenu`
- `registerSidebarItem`
- `openPublicDeepLink`
- `registerModule`
- `readRealData`
- `writeRealData`

For any of these the model returns `allowed: false` with a reason. The runtime only
ever performs **local** navigation inside the isolated host; every product/App/data
navigation kind is denied by construction. Pure and deterministic.
