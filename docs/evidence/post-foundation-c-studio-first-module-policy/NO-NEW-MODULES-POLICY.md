# No New Modules Policy

Até nova decisão explícita do mantenedor:

## Proibido

- criar novos módulos reais em `src/modules`
- registrar módulos novos no menu
- registrar rotas produtivas novas
- transformar Fuel em módulo real
- criar módulos de combustível / pesagem / apontamento agora
- criar backend / schema para módulos novos
- **criar módulos manualmente antes do Studio**

## Permitido

- organizar arquitetura
- criar blueprint genérico futuramente
- melhorar ModeloBase1
- melhorar Empresas
- melhorar gates
- melhorar docs
- criar Studio foundation futura
- criar prototypes / sandboxes claramente marcados como experimentais

## Condição para liberar módulos futuros

Todos os itens abaixo, mais decisão explícita do mantenedor:

- **Studio Foundation** pronto
- **Module Blueprint** pronto
- **Studio cria/configura modelos**
- política de **persistência** definida
- política de **permissões** definida
- **gates de registro de módulo** prontos
- **decisão explícita do mantenedor**

## Enforcement

O gate `g423-studio-first-module-policy` protege esta política verificando que
`src/modules/combustivel` e `src/modules/fuel` não existem, que nenhuma Fuel Controlled Module
Registration foi criada, e que `src/modules` / `src/pages` / `src/App.jsx` / menu não foram
alterados neste slice.
