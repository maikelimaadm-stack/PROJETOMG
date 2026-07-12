# Empresas — Data & Persistence Map

Auditoria da fonte de dados e persistência atual (nenhum arquivo alterado).

## Descoberta central

**Empresas NÃO é um laboratório vazio — já é produção real** com backend + Prisma + persistência
real. O "laboratório real controlado" significa validar mudanças **sobre um sistema vivo**, com todo
o cuidado que isso exige — não introduzir backend/persistência do zero.

## Fonte atual de dados

- **Backend REST real**: `EmpresaApi` → `apiClient` → `/api/empresas` (+ `/api/empresas/campos`).
- **Base URL** (produção): `https://projetomg-production.up.railway.app` (ou `VITE_API_URL`); em dev,
  proxy relativo (`""`).
- **Auth**: JWT via `tokenStore` (Authorization header); `clearAuthSession` limpa token + `erp_empresa_id`.
- **Escopo multiempresa**: `erp_empresa_id` em `localStorage` (seletor global); operações por registro
  usam `empresaHeader: id`.

## Leitura atual

- `empRepository.listPage/list/get` → `EmpresaApi.listEmpresas/getEmpresa` → backend.
- Paginação/scroll: `useEmpresasInfiniteData`; cache de lista: `empresasListCache`.
- Selectors/distinct/opções: `listEmpresasSelector`, `listDistinctColumnValues`, `listOptionsSources`.

## Escrita atual

- `empRepository.create/update/delete` → `EmpresaApi.createEmpresa/updateEmpresa/deleteEmpresa` → backend.
- Payload saneado por `stripEmpresaPersistPayload`; resposta normalizada por `normalizeEmpresaRecord`.
- Cache otimista via `patchEmpresasCache`.

## Storage local (auxiliar, não é a fonte de verdade)

- `localStorage`: `erp_empresa_id` (escopo selecionado) e chaves de layout/preferências de tabela
  (colunas, filtros, ordenação, larguras, favoritos, batch de carga).
- Preferências do usuário: subsistema `preferences/` com **cache local + adapter remoto**
  (sincronizado ao backend `UsuarioPreferencia`) + eventos cross-tab + flush.
- **Não** há IndexedDB. **Não** há Base44 client neste fluxo. **Não** há electron.

## Prisma / schema atual (backend, já existente)

- `model Empresa` com: `id (cuid)`, `cliente_id`, `id_global`, `codempresa`, `razao_social`,
  `nome_fantasia`, `tipo_pessoa`, `cpf_cnpj`, endereço, contatos, `status`, `campos_personalizados
  (Json)`, `createdAt`, `updatedAt`; relações `cliente`, `anexos`, `permissoes`, `cadcpsEmpresas`.
- Modelos relacionados: `CadCpsCampo*`, `PermissaoEmpresa`, `RegistroAnexo`, `UsuarioPreferencia`,
  registro MDP.

## Pontos de acoplamento

- Frontend ↔ backend via `apiClient` (JWT + escopo multiempresa).
- ModeloBase1 ↔ repository/API via `moduleDefinition`.
- Preferências ↔ backend `UsuarioPreferencia` via adapter + query keys.
- runtime-v2 direct-beta ↔ ModeloBase1 via `runtimeReadModel` (flag, read-only).

## Pontos de risco

- É **produção viva com dados reais** — qualquer piloto opera sobre dados de clientes.
- Escopo multiempresa e permissões (`PermissaoEmpresa`) precisam ser respeitados em qualquer mudança.
- Preferências têm hidratação complexa e sensível a regressão.

## O que precisa antes de "persistência real" adicional

Como a persistência real **já existe**, o próximo passo NÃO é criar backend — é **planejar
mudanças controladas** sobre o backend existente (ex.: promover read-model runtime-v2 para produção,
ou novos campos/endpoints), com test plan, gate próprio, fallback e aprovação — ver NEXT-SLICE-SPEC.
