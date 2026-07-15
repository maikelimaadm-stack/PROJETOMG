# Feature Flag Implementation Plan — `createFeatureFlagImplementationPlan`

Metadata for a future dev-only flag. It implements **no** flag and connects **nothing** to the App:
`featureFlagImplemented: false`, `featureFlagConnectedToApp: false`, `defaultEnabled: false`,
`devOnly: true`, `productionAllowed: false`, `stagingAllowed: false`. The verifier flags
`unsafe_feature_flag_connected_to_app` on any inversion.
