# STUDIO & MARKETPLACE COMPATIBILITY

Como o Generic Model Runtime prepara Studio e Marketplace. **Nada é implementado neste slice** — só documentação de compatibilidade futura.

## Studio (usuário cria modelo)

Fluxo alvo: o usuário define, o generic runtime executa.

| Etapa no Studio | Contrato genérico usado |
|---|---|
| Define campos | `GenericModelReadModel.form.fields` + `validations` |
| Define validações | `GenericModelReadModel.validations` |
| Define visualização (colunas/cards) | `GenericModelReadModel.table.columns/visibleColumns` |
| Define ações | `GenericModelReadModel.actions` (metadados) + `SafetyPolicy` (execução gated) |
| Define persistência/offline | `GenericModelPersistenceContract.storageMode` + policy |
| Publica | `Published Module Contract` (abaixo) |

**Invariante:** o Studio nunca gera um modelo que ligue backend/Prisma/side effects por default — só via capability gate declarado e auditável.

## Marketplace (template publicado)

Um template publicado precisa **declarar contratos** para ser instalável com segurança.

### Template Contract (declarado pelo autor)
- `templateId`, `version`, `modelType`
- `fields`, `columns`, `validations`, `actions` (declarativos)
- `persistencePolicy` (`none`\|`local`\|`remote-gated`)
- `capabilities` solicitadas (backend/prisma/workflow) — cada uma exige aprovação
- `compatibility` (versão do kernel / schemaVersion)

### Published Module Contract (validado na instalação)
- `moduleId`, `templateId`, `version`
- `capabilityGates` concedidos (default: nenhum perigoso)
- `safetyPolicy` efetiva
- `schemaVersion` compatível com o kernel

### Permission Contract
- por field/action; herdado do `GenericModelReadModel.permissions`.

### Validation Contract
- regras por field; do `GenericModelReadModel.validations`.

### Persistence Policy
- `storageMode` + versioning + checksum; `persistenceReal` só com gate.

### Versioning / Compatibility
- `schemaVersion` do snapshot + `version` do template; o kernel rejeita snapshot de schemaVersion incompatível (o `validateSnapshot` já checa schemaVersion).

## Limites e riscos

- **Risco de capacidade:** um template malicioso poderia pedir backend/side-effects → mitigado por `SafetyPolicy` default-blocked + capability gates explícitos + gates de CI.
- **Risco de compatibilidade:** snapshots de versões antigas → mitigado por `schemaVersion` + migração futura documentada.
- **Risco de dados sensíveis:** templates de terceiros → o masking na serialização + `hasUnmaskedSensitive` já protegem.
- **Não implementar agora:** Studio/Marketplace ficam como alvo; o kernel só precisa **não fechar portas** (contratos declarativos + capability gates + versioning).

## Conclusão

O generic runtime, se extraído com **SafetyPolicy default-blocked + contratos declarativos + versioning/checksum**, já é compatível com um Studio/Marketplace futuros sem retrabalho do core. A prioridade é extrair o kernel com esses invariantes; Studio/Marketplace consomem depois.
