# Field & Screen Builder Requirements

**Sem UI implementada** — apenas requisitos.

## Field Builder

Tipos mínimos (allowlist): text · number · decimal · date · datetime · boolean · select ·
multiSelect · relation · computed · money · percentage · file (placeholder futuro) · status.

Cada campo: name · label · type · required · defaultValue · validation · visibleInTable ·
visibleInForm · searchable · filterable · sortable · permission · helpText · group · order.

## Screen Builder

Deve controlar: layout · tabela · formulário · filtros · toolbar · actions · summary cards ·
diagnostics · empty state · loading state · error state.

## Restrições

- nenhum tipo fora da allowlist;
- campos derivam tabela/form/validação;
- nenhuma tela é montada em produção sem blueprint + gate;
- consistente com o contrato certificado de Empresas (referência de cadastro real).
