# Feature Flag — Default Off

The integration is gated by `shouldMountStudioDevPreviewRoute(env)` and the
`createStudioDevPreviewFeatureGate` model. Both are **default-off** and use **strict equality**:

- flag `MAK_STUDIO_DEV_PREVIEW` must equal exactly `'true'`;
- checkpoint `MAK_STUDIO_DEV_PREVIEW_CHECKPOINT` must equal exactly
  `approved_for_app_integration_slice`;
- the environment must be development.

Returns/opens **false** when: production, staging (even if `DEV` is also set), `PROD` set, flag
absent/false/invalid, checkpoint absent/invalid, or non-development. No permissive/truthy fallback —
`flag === true` (boolean) is rejected; only the string `'true'` enables. Capability flags:
`devOnly:true`, `defaultEnabled/defaultOff:false-open`, `productionAllowed:false`,
`stagingAllowed:false`, `failClosed:true`, `runtimeVerified:true`.
