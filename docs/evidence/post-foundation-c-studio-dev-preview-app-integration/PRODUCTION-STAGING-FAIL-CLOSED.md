# Production / Staging — Fail Closed

Production and staging are denied by construction. `isProductionOrStaging(env)` inspects
`PROD`, `MAK_ENV_LABEL`, `VITE_ENV_LABEL`, `MODE`, `NODE_ENV` **independently of the `DEV`
shortcut**, so even an env that also sets `DEV` is treated as production/staging and the route never
mounts. `shouldMountStudioDevPreviewRoute` and the feature gate both check this first and fail
closed. Verified across the full matrix (production/staging via every label source, plus `PROD`
boolean/string).
