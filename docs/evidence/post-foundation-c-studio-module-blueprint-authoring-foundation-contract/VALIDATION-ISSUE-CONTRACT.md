# Validation Issue Contract

`createValidationIssueDescriptor(...)` — deterministic, sanitized diagnostic. No secrets, stack, or
personal data.

Fields: `issueCode`, `severity` (`info|warning|error|blocker`), `path`, `message`,
`deterministic:true`, `blocksPreview`, `blocksCertificationCandidate`, `safe:true`,
`withoutSecrets:true`, `noStackLeak:true`, `canonical:false`, `affectsCertifiedContract:false`.

`error` and `blocker` block preview and certification-candidate handoff. An issue NEVER implies a
failure of the certified contract.
