# NO-REWRITE / NO-PRODUCTION VALIDATION

Este slice é **headless, audit/mirror-only e reference-only**. Evidências:

## Empresas não reescrita

- `rewriteEmpresas: false` em todo o mirror, manifest, diagnostics e fallback.
- `src/modules/empresas/` **não alterado** (o mirror apenas **lê/importa** o contrato
  certificado). PAGEMP e ModeloBase1CadastroPage não alterados.

## Sem UI / rota / menu / módulo

- Subtree `src/studio/blueprint-mirrors/empresas/` é **React-free**.
- uiCreated/routeCreated/menuCreated/moduleRegistered: false. Screen mirror não gera
  componente React nem registra rota.

## Sem produção / backend / Prisma / migration / staging / fetch / mutation

- backendAccessed/prismaAccessed/productionAccessed/stagingAccessed/fetchUsed: false.
- Persistence boundary é `referenceOnly`; documenta a produção real de Empresas mas
  **não a acessa**.
- Nenhum import de EmpresaApi/apiClient/apis/backend/prisma; sem `fetch(`, sem
  DATABASE_URL/API_URL produtiva/Railway/staging; sem POST/PUT/PATCH/DELETE; sem mutation.

## Escopo

O subtree isolado foi adicionado à exceção do `productionUiGuard`
(`ISOLATED_READONLY_TEST_SUBTREES`), estritamente limitado a
`src/studio/blueprint-mirrors/empresas/` — sem ampliar para UI/rota/menu/modules/
backend/Prisma.

## Reversibilidade

Nada é auto-consumido pelo app — reversível por **não-consumo**.
