# CADCPS — Backup lógico e mapa de dependências (pré-reestruturação)

Data do snapshot: 2026-06-03

## Modelo legado (PostgreSQL / Prisma)

- **Tabela:** `CampoPersonalizado`
- **Valores por registro:** `Empresa.campos_personalizados` (JSONB) e `CadastroRegistro.campos_personalizados` (template)
- **Escopo:** `cliente_id` + `empresa_id` opcional (null = todas) + `entity_name` (default `EmpresaCadastro`)

## Arquivos que dependiam de `CampoPersonalizado`

### Backend
- `backend/prisma/schema.prisma` — model `CampoPersonalizado`
- `backend/src/modules/campos/campoPersonalizadoRepository.js`
- `backend/src/modules/campos/campoPersonalizadoValidators.js`
- `backend/src/modules/empresas/repositories/empresaRepository.js` — factory acoplada
- `backend/src/modules/empresas/routes.js` — `/api/empresas/campos`
- `backend/src/modules/empresas/services/empresaService.js`
- `backend/scripts/smokeCamposPersonalizados.js`, `smokeCamposTipos.js`, `ensureCampoPersonalizadoIndexes.js`

### Frontend
- `src/framework/cadastro/configurators/EmpConfiguracaoCamposDialog.jsx`
- `src/modules/campos/pages/PAGCampos.jsx` — proxy Empresas
- `src/modules/empresas/repositories/empRepository.jsx` — CRUD campos
- `src/apis/empresa/EmpresaApi.js` — `/api/empresas/campos`
- `src/modules/empresas/components/FORMEMP.jsx`, `formEmp.customFields.jsx`, `TBLEMP.jsx`
- `src/framework/cadastro/fields/campoEngine.jsx`
- Template scaffold (`scaffold-backend`, `scaffold`)

## Acoplamento ao módulo Empresas (removido na nova arquitetura)

- Repositório de campos instanciado com `EMPRESAS_ENTITY_NAME` fixo
- Página `PAGCampos` usava `empRepository`
- API exclusiva em `/api/empresas/campos`
- Menu “Campos Personalizados” sem módulo próprio de domínio

## Nova arquitetura (CADCPS)

- Módulo: `backend/src/modules/cadcps/`, `src/modules/cadcps/`
- API: `/api/cadcps/*`
- Tabelas: `CadCpsTela`, `CadCpsCampo`, `CadCpsCampoTela`, `CadCpsCampoEmpresa`, `CadCpsCampoOpcao`, `CadCpsHistorico`
- Empresas consome campos via **adaptador legado** (`campoLegacyAdapter.js`), sem definir campos no módulo Empresas

## Migração de dados

Script: `backend/scripts/migrateCampoPersonalizadoToCadcps.js`
