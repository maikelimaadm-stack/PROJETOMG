# EMPRESAS PERSISTENCE & RUNTIME BINDING MIRROR

## Persistence boundary mirror

Documenta a realidade de persistência de Empresas como **reference-only**:

- existingProductionBackend / existingPrismaSchema / existingRestApi / existingJwt /
  existingMultiTenantScope → true (documentado)
- mirrorAccessMode: referenceOnly · mutation/migration/schemaChange/backendChange: false
- backendAccessed/prismaAccessed/productionAccessed: false

Estados futuros possíveis: localReadMirror → localAlignment →
controlledEmpresasModification → stagingReadOnly → stagingWriteControlled →
productionWriteControlled. **Este slice não altera persistence, não cria migration, não
executa Prisma, não chama backend.** O default canônico do Studio é `noPersistence`;
o alinhamento é uma decisão controlada futura.

## Runtime binding mirror

cadastro → ModeloBase1 · Empresas certified read contract = seed model (não reescrito) ·
runtimeReadModel/fallback documentados · cadcps = field reference · generic-model = kernel.

Regras: não ativa produção · não registra módulo · não reescreve Empresas · não acessa
Prisma direto · não contorna tenant/permission · ModeloBase2/Fuel não entram como produção.
