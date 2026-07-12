# Runtime Integration Map

Como o Studio deve se integrar futuramente. **Nada é acoplado agora.**

## Studio + Generic Model Runtime

O Studio deve produzir blueprints que consomem o generic-model kernel (contratos read/write/runtime,
safety, diagnostics, conformance) já existente em `src/runtime/generic-model/`.

## Studio + ModeloBase1

Uso esperado: cadastros · tabelas · formulários · campos configuráveis · preferências ·
runtimeReadModel. ModeloBase1 informa os **primeiros blueprints de cadastro** (é o mais próximo de produção).

## Studio + ModeloBase2 (experimental)

Uso futuro: lançamentos operacionais · event log · draft · snapshot · timeline · offline-first.
**Não** deve gerar módulo real agora; Fuel permanece sandbox.

## Studio + Empresas (referência certificada)

Uso como referência: contrato real de cadastro · payload canônico · tenant rules · permission rules ·
read-only certification (`empresas-local-read-contract@1.0.0`) · futuras validações de blueprint.
O Studio **não** altera Empresas.

## Studio + cadcps

Campos personalizados informam o Field Builder (tipos, opções, escopo por empresa).

## Transversais

diagnostics · fallback · gates: todo módulo gerado deve carregar diagnostics passivos, fallback
fail-closed e um GatePlan obrigatório antes de qualquer registro/geração.
