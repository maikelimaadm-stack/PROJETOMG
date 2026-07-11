# Fuel Sandbox Freeze

## Classificação oficial

O combustível (Fuel) atual é:

- **sandbox**
- **laboratório** técnico
- **exemplo** técnico / referência
- **dev preview**
- **não produção**
- **não módulo real**

## Congelamento (proibido por enquanto)

- não criar `src/modules/combustivel`
- não criar `src/modules/fuel`
- não criar menu combustível
- não criar rota produtiva combustível
- não criar backend combustível
- não criar Prisma/schema combustível
- não criar persistência real combustível
- não criar sincronização combustível

## Permitido no futuro

- manter o dev preview (`/__dev/modelobase2/fuel`)
- usar como referência
- usar para testes de UX
- usar para validar ModeloBase2 experimental
- remover / renomear se atrapalhar
- **migrar para módulo real somente quando o Studio/Blueprint estiverem prontos e o mantenedor
  decidir explicitamente**

## Componentes congelados (não alterados neste slice)

- `src/ModeloBase2/fuel-headless/`
- `src/ModeloBase2/fuel-ui-sandbox/`
- `src/ModeloBase2/fuel-ui-sandbox/dev-preview/`
- `src/ModeloBase2/fuel-module-shell/`
- `src/ModeloBase2/operational-runtime/`

O congelamento é uma decisão de **política**, não uma alteração de código: o Fuel permanece
exatamente como está na main, e nenhuma progressão para módulo real acontece sem prompt explícito
e sem Studio/Blueprint prontos.
