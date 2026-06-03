# Relatório — Reestruturação CADCPS (Campos Personalizados)

## Resumo

O módulo de Campos Personalizados foi reestruturado como **CADCPS**, independente do cadastro de Empresas, com modelagem relacional, API `/api/cadcps`, UI dedicada (PAGCPS / FRMCPS / TABCPS) e adaptadores para consumo legado (FORMEMP, Template).

**Status:** implementação concluída; testes `lint`, `build`, `prisma validate`, `prisma generate`, `validate:connections`, `smoke:cadcps`, `smoke:campos`, `smoke:campos-tipos` executados com sucesso neste ambiente.

---

## Arquivos criados

### Documentação
- `docs/cadcps/BACKUP_AND_DEPENDENCIES.md`
- `docs/cadcps/RESTRUCTURE_REPORT.md`

### Banco / Prisma
- `backend/prisma/migrations/20260603010000_cadcps_module/migration.sql`
- Modelos: `CadCpsTela`, `CadCpsCampo`, `CadCpsCampoTela`, `CadCpsCampoEmpresa`, `CadCpsCampoOpcao`, `CadCpsHistorico`, `CadCpsCodigoSequencia`

### Backend (SRVCPS, REPCPS, APICPS, VALCPS)
- `backend/src/modules/cadcps/cadcpsConstants.js`
- `backend/src/modules/cadcps/valCps.js`
- `backend/src/modules/cadcps/repCps.js`
- `backend/src/modules/cadcps/svcCps.js`
- `backend/src/modules/cadcps/routes.js`
- `backend/src/modules/cadcps/campoLegacyAdapter.js`
- `backend/src/modules/cadcps/cadcpsFieldUsage.js`
- `backend/src/modules/cadcps/legacyPayloadMapper.js`
- `backend/scripts/migrateCampoPersonalizadoToCadcps.js`
- `backend/scripts/smokeCadcps.js`

### Frontend (PAGCPS, FRMCPS, TABCPS, REPCPS, APICPS)
- `src/apis/cadcps/apiCps.js`
- `src/modules/cadcps/repositories/repCps.js`
- `src/modules/cadcps/config/cadcpsConstants.js`
- `src/modules/cadcps/adapters/legacyDialogAdapter.js`
- `src/modules/cadcps/components/TABCPS.jsx`
- `src/modules/cadcps/components/FRMCPS.jsx`
- `src/modules/cadcps/pages/PAGCPS.jsx`

---

## Arquivos alterados

- `backend/prisma/schema.prisma`
- `backend/src/routes/index.js`
- `backend/src/modules/empresas/repositories/empresaRepository.js` — leitura via CADCPS + adaptador legado
- `backend/src/modules/empresas/routes.js` — removidos POST/PUT/DELETE `/campos`
- `backend/src/modules/empresas/services/empresaService.js`
- `backend/package.json` — `smoke:cadcps`, `migrate:cadcps`, `check:prod` inclui smoke CADCPS
- `backend/scripts/smokeCamposPersonalizados.js` — API CADCPS
- `backend/scripts/smokeCamposTipos.js` — API CADCPS
- `src/modules/generatedModules.json` — módulo `cadcps`
- `src/shared/navigation/erpMenuConfig.js`
- `src/modules/empresas/repositories/empRepository.jsx` — removido CRUD de campos
- `src/modules/template/repositories/templateRepository.js` — CRUD via CADCPS
- `src/apis/empresa/EmpresaApi.js` — removidos métodos CRUD de campos
- `src/modules/campos/pages/PAGCampos.jsx` — reexport PAGCPS
- `package.json` — `lint` restrito a `src/`

## Arquivos removidos

Nenhum arquivo removido (tabela legada `CampoPersonalizado` preservada).

---

## Estruturas novas

| Entidade | Função |
|----------|--------|
| `CadCpsTela` | Catálogo de telas/módulos |
| `CadCpsCampo` | Definição do campo (por cliente) |
| `CadCpsCampoTela` | N:N campo ↔ telas |
| `CadCpsCampoEmpresa` | N:N campo ↔ empresas |
| `CadCpsCampoOpcao` | Opções de listas |
| `CadCpsHistorico` | Auditoria por campo |

---

## API

- `GET /api/cadcps/telas`
- `GET/POST /api/cadcps/campos`
- `GET/PUT/DELETE /api/cadcps/campos/:id`
- `GET /api/cadcps/campos/:id/historico`
- `GET /api/cadcps/aplicavel/:entityName`

Empresas: `GET /api/empresas/campos?mode=aplicavel|config` — somente leitura via adaptador.

POST/PUT aceitam payload legado (`label`, `tipo: text`, `opcoes` com `value`/`label`) via `legacyPayloadMapper`.

---

## Migrações

1. SQL: `npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20260603010000_cadcps_module/migration.sql`
2. Dados legados: `npm run migrate:cadcps` (no diretório `backend`)

---

## Problemas encontrados e corrigidos

| Problema | Correção |
|----------|----------|
| SyntaxError em `repCps.js` (chave extra em `CAMPO_INCLUDE`) | Corrigido |
| `field_name` derivado de `nome` com espaços (400) | `resolveFieldName` com slugify |
| DELETE retornava 500 (histórico após exclusão) | Histórico registrado antes do `delete` |
| `smokeCamposTipos` usava `/api/empresas/campos` | Migrado para `/api/cadcps/campos` |
| `templateRepository` chamava API inexistente | Adaptador `legacyDialogAdapter` + `repCps` |
| ESLint na raiz parseava `backend/` | `lint` limitado a `src/` |
| Bloqueio 409 ao excluir/editar com registros | `cadcpsFieldUsage.js` |

---

## Testes executados

| Comando | Resultado |
|---------|-----------|
| `npm run lint` (raiz) | OK |
| `npm run build` (raiz) | OK |
| `npm run prisma:validate` | OK |
| `npm run prisma:generate` | OK |
| `npm run validate:connections` | OK |
| `npm run smoke:cadcps` | OK |
| `npm run smoke:campos` | OK |
| `npm run smoke:campos-tipos` | OK |

---

## Pendências / riscos

1. **Valores em runtime** continuam em `Empresa.campos_personalizados` (JSON) — evolução futura: tabela de valores por entidade.
2. **UI CADCPS** — filtros avançados completos (fórmula, máscara, cliente), painel de auditoria na tela e reordenação drag-and-drop de opções: parcial.
3. **Presets de máscara** por tipo (CPF/CNPJ automático): parcial no FRMCPS.
4. **Baseline Prisma Migrate** — banco existente pode exigir `migrate resolve` / baseline antes de `migrate deploy`.
5. **`EmpConfiguracaoCamposDialog`** — mantido para Template; opera via adaptador CADCPS (não via Empresas).

---

## Independência do módulo Empresas

- CRUD de definição de campos: **somente** `/api/cadcps/campos`
- Empresas: apenas leitura de campos aplicáveis e persistência de **valores** no registro
- Menu próprio: **Campos Personalizados** → `/CadastroCamposPersonalizados`
