# Safe Normalization Plan

Principles (reused from bridge hardening):
- cycle guard (WeakSet)
- deterministic depth cap
- plain JSON-safe values only
- sparse array rejection
- accessor (getter/setter) rejection
- prototype pollution protection (drop __proto__/constructor/prototype)
- public try/catch boundary
- sanitized emergency rejection

maxStructureDepth: 64

Issue codes:
- RUNTIME_INPUT_CYCLE
- RUNTIME_INPUT_TOO_DEEP
- RUNTIME_INPUT_NON_JSON_SAFE
- RUNTIME_INPUT_SPARSE_ARRAY
- RUNTIME_INPUT_ACCESSOR
- RUNTIME_INPUT_PROTOTYPE_POLLUTION
- RUNTIME_INPUT_NON_PLAIN_OBJECT
