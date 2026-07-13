# FIELD & SCREEN BLUEPRINT CONTRACT

## Field Blueprint

Tipos permitidos (14): `text`, `number`, `decimal`, `date`, `datetime`,
`boolean`, `select`, `multiSelect`, `relation`, `computed`, `money`,
`percentage`, `filePlaceholder`, `status`.

Regras de segurança:

- Nome do campo deve ser um identificador seguro.
- Tipo deve estar no allowlist; tipo desconhecido é bloqueado.
- Campo `computed` não executa código arbitrário.
- `relation` não fura o tenant.
- Campo `protected` não é editável por padrão.
- `searchable`/`filterable`/`sortable` derivam do tipo.

## Screen Blueprint

Tipos: `table`, `form`, `detail` + placeholders planejados
(`dashboardPlaceholder`, `kanbanPlaceholder`, `calendarPlaceholder`).

Invariantes:

- **Não é um componente React** (`generatesReactComponent: false`).
- **Não gera UI** (`generatesUi: false`).
- Ações de mutação bloqueadas por padrão.
- Estados `emptyState`/`loadingState`/`errorState` obrigatórios.
- Diagnóstico não expõe segredos.
