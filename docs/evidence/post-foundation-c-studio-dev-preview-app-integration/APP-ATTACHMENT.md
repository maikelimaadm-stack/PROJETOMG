# App Attachment

`createAppAttachmentDescriptor` models the single additive attachment: `path:/__dev/studio/preview`,
`devOnly:true`, `additiveOnly:true`, `devRouteAttached:true`,
`followsSanctionedDevRoutePattern:true`. It asserts the route is **not** exposed to the product
(`routeExposedToProduct:false`, `menuExposedToProduct:false`, `sidebarExposedToProduct:false`,
`publicRoute:false`, `inMainMenu:false`), no new router is created and the existing router is not
refactored, and providers/auth/layout are untouched. The App itself opts in with one dev-guarded
`<Route>` line — no registration API is called.
