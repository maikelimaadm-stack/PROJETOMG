## Template oficial de modulo ERP

Use este template para criar novos modulos de cadastro sem acoplar ao dominio Empresas.

Estrutura base:

- `pages/` - pagina principal do cadastro
- `components/` - formulario, tabela e componentes visuais do modulo
- `repositories/` - acesso ao contrato de API do modulo
- `config/` - configuracoes de colunas, exportacao e layout
- `storage/` - estado local complementar do modulo (nao persistencia principal)
- `services/` - regras de orquestracao do modulo
- `hooks/` - hooks de composicao para pagina/componentes
- `utils/` - mapeamentos e utilitarios do dominio

Fluxo padrao:

`UI -> repository -> API -> backend -> Prisma -> PostgreSQL`

