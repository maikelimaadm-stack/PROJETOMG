# Contract Session — `createAppIntegrationContractSession`

Establishes the deterministic session from the upstream route/menu runtime. Exposes identity,
version chain and a stable fnv1a `sessionDigest`.

- Pure: derived entirely from inputs; no storage, no fetch, no persistence, no side-effects.
- Deterministic: equal inputs yield an equal `sessionDigest`.
- The session opens nothing — it only records provenance for the contract.
