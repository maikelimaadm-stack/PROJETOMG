## Template oficial de modulo ERP

Use este template para criar novos modulos de cadastro sem acoplar ao dominio Empresas.
O gerador oficial agora cria estrutura **full-stack**.

Estrutura base:

- `pages/` - pagina principal do cadastro
- `components/` - formulario, tabela e componentes visuais do modulo
- `repositories/` - acesso ao contrato de API do modulo
- `config/` - configuracoes de colunas, exportacao e layout
- `storage/` - estado local complementar do modulo (nao persistencia principal)
- `services/` - regras de orquestracao do modulo
- `hooks/` - hooks de composicao para pagina/componentes
- `utils/` - mapeamentos e utilitarios do dominio
- `scaffold-backend/` - templates backend (routes/controller/service/repository/validators, smoke e prisma scaffold)

Fluxo padrao:

`UI -> repository -> API -> backend -> Prisma -> PostgreSQL`

## Gerador de modulo

Use o gerador com os parametros obrigatorios:

```bash
npm run generate:module -- \
  --moduleId fazendas \
  --entityName FazendaCadastro \
  --singularLabel Fazenda \
  --pluralLabel Fazendas \
  --repository fazendaRepository \
  --api FazendaApi \
  --schema fazendaSchema
```

Por padrao, o gerador cria frontend e backend.

Opcoes:

- `--frontend-only`: gera apenas frontend
- `--backend-only`: gera apenas backend
- `--dry-run`: simula sem gravar arquivos
- `--force`: sobrescreve quando o modulo ja existe

Para validar sem gravar arquivos:

```bash
npm run generate:module -- \
  --moduleId fazendas \
  --entityName FazendaCadastro \
  --singularLabel Fazenda \
  --pluralLabel Fazendas \
  --repository fazendaRepository \
  --api FazendaApi \
  --schema fazendaSchema \
  --dry-run
```

