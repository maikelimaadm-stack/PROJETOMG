# 17 — Publish Pipeline

> **Status:** Official SSOT · Program 4.01.1  
> **Owner topic:** Compile pipeline phases C-1 through C-16  
> **Related:** [18-COMPILED-RUNTIME-BUNDLE.md](./18-COMPILED-RUNTIME-BUNDLE.md) · [03-OBJECT-LIFECYCLE.md](./03-OBJECT-LIFECYCLE.md) · [RULES.md](./RULES.md) R-08

---

## Objetivo

Especificar o **Publish Engine** — pipeline de 16 fases desde coleta do grafo MMM até invalidação de cache.

---

## Escopo

| In scope | Out of scope |
|----------|--------------|
| Phases C-1 → C-16 | CI/CD container build |
| Validation layers | Git tagging |
| Signing | CDN vendor API |

---

## Responsabilidades

| Component | Responsibility |
|-----------|----------------|
| Publish Engine | Orchestrate C-1→C-16 |
| PlatformSchema | C-3 schema validation |
| Signer | C-14 platform key |
| Environment Pin | Post-publish activation |

---

## Conceitos

- **Scope** — `{ tenantId, applicationId?, moduleId?, objectIds?, environment }`.
- **DefinitionVersion** — immutable publish record.
- **Snapshot** — optional point-in-time copy.

---

## Modelo

### Input

```
Scope: { tenantId, applicationId?, moduleId?, objectIds[]?, environment }
Source: MMM objects with status ∈ {published, active} in scope
```

### Phases

| Phase | Name | Validations |
|-------|------|-------------|
| C-1 | Collect | Tenant isolation |
| C-2 | Resolve | Broken ref detection |
| C-3 | Validate Schema | PlatformSchema JSON Schema |
| C-4 | Validate Semantic | BO ≥1 field, workflow initial step, etc. |
| C-5 | Validate Dependency | Acyclic module graph, ModuleDependency |
| C-6 | Validate Security | Permission orphans, cross-tenant |
| C-7 | Normalize | Stable key ordering |
| C-8 | Hash | SHA-256 contentHash + integrityHash |
| C-9 | Compile Registries | V13–V20 maps |
| C-10 | Compile Routes | No duplicate paths |
| C-11 | Compile Permissions | Permission registry |
| C-12 | Compile Templates | BaseTemplate compatibility |
| C-13 | Assemble CRB | CompiledBundle payload |
| C-14 | Sign | signatureRef |
| C-15 | Persist | DB + optional Snapshot |
| C-16 | Invalidate Cache | CDN/Redis/sessionStorage |

```mermaid
flowchart LR
    C1[Collect] --> C2[Resolve]
    C2 --> C3[Schema]
    C3 --> C4[Semantic]
    C4 --> C5[Dependency]
    C5 --> C6[Security]
    C6 --> C7[Normalize]
    C7 --> C8[Hash]
    C8 --> C9[Registries]
    C9 --> C10[Routes]
    C10 --> C11[Permissions]
    C11 --> C12[Templates]
    C12 --> C13[Assemble CRB]
    C13 --> C14[Sign]
    C14 --> C15[Persist]
    C15 --> C16[Invalidate]
```

---

## Regras

- R-08: Publish blocked on any validation failure.
- R-09: Production activation requires EnvironmentPin after C-15.
- R-17: Studio triggers publish via API, not direct registry write.

---

## Fluxos

Ver pipeline diagram acima e [03-OBJECT-LIFECYCLE.md](./03-OBJECT-LIFECYCLE.md) activation sequence.

---

## Diagramas

Ver flowchart acima.

---

## Exemplos

Module-scoped publish of `empresas` after BO field change → new CRB hash → staging pin → prod pin.

---

## Restrições

- Partial publish must include all transitive `depend` refs.
- Rollback = pin previous DefinitionVersion, not mutate CRB.

---

## Integrações

MMM API, PlatformSchema registry, Audit Log, Event Bus (`mmm.publish.completed`).

---

## Versionamento

Pipeline version tracked in Publish Engine; phases additive only.

---

## Próximos passos

- Program 4.04: Publish Engine v2 full implementation
- Gate **G422**: C-1→C-16 integration tests

---

*End of document.*
