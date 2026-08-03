# Plan Lifecycle Correction (surgical, authorized)

> Correção cirúrgica autorizada em DOIS artifacts upstream mergeados (somente teste e gate; os módulos fonte do plano
> **não** foram alterados):
> - `src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js`
> - `scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs`

**Defeito:** o plano assevera a **ausência física** do subtree futuro (`!fs.existsSync(FUTURE_DIR)` e
`!fs.existsSync(FUTURE_DIR/<futureFile>)`). Essas asserções eram válidas durante o slice plan-only, mas são
**temporais** e incompatíveis com o slice seguinte autorizado, que cria o builder.

**Correção:** substituídas por provas **permanentes** e declarativas, válidas antes E depois da existência física:

```
P.FUTURE_RUNTIME_SUBTREE.subtreeCreated === false
PLAN.futureRuntimeSubtreeCreated === false
PLAN.builderFactoryImplemented === false
PLAN.buildImplemented === false
PLAN.coreExtractionImplemented === false
PLAN.digestRecomputeImplemented === false
PLAN.envelopeConstructionImplemented === false
PLAN.consumerRuntimeImplemented === false
```

Para cada future file, apenas **metadata**: `.js`, responsibility válida, path relativo seguro (sem `..`, sem `/`,
não-absoluto), sem duplicidade, e pertencente ao future subtree planejado (`plannedDir`).

Também corrigido o check de escopo do gate do plano, que proibia o subtree futuro no **diff** (temporal) — agora
verifica a invariante permanente de que o **subtree fonte do próprio plano** permanece inalterado.

Resultado: plan test **969/969** e plan gate **353/353** — verdes com o Builder fisicamente presente.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
