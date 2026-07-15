# Governance Registry Plan — `createAppIntegrationGovernanceRegistryPlan`

Describes how a **future** slice would register only its own specific paths as known-later in the
central scope governance registry, never a broad wildcard. It registers **nothing** and touches the
guard **not at all**: `registryTouched: false`, `guardTouched: false`, `broadWildcardAllowed: false`,
`specificPathsOnly: true`, plus a `plannedKnownLaterPaths` list. The verifier flags
`unsafe_governance_registry` on inversion.
