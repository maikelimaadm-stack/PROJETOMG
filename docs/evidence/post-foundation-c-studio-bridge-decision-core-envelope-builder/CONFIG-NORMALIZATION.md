# Config Normalization (corrected — hostile containment)

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0`.

**A factory NUNCA lança.** Toda leitura do config CRU acontece dentro de um único boundary try/catch: o primeiro
toque no objeto é o safe clone (que inspeciona descriptors, nunca `config[k]`), então traps hostis são contidas.

Casos cobertos (factory retorna `{ build }` deep-frozen; `build()` retorna rejeição sanitizada determinística):
`Proxy ownKeys throw`, `Proxy getPrototypeOf throw`, `Proxy getOwnPropertyDescriptor throw`, `Proxy get throw`,
getter, setter, cycle, custom prototype, sparse array, `__proto__` / `constructor` / `prototype`.

Overrides críticos proibidos: source allowlist, digest preimage fields, digest helper, core/envelope versions,
identity lifecycle, security invariants, pipeline order, issue codes, resource limits.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
