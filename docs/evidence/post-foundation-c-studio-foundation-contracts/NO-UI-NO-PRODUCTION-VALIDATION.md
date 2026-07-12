# NO-UI / NO-PRODUCTION VALIDATION

Este slice é **headless e sem produção**. Evidências:

## Sem UI

- Subtree é **React-free** (nenhum import de `react`).
- Nenhuma tela gera componente React (`generatesReactComponent: false`,
  `generatesUi: false`).
- `src/App.jsx` não foi alterado; nenhum menu/rota registrado.

## Sem produção / sem staging

- Todas as flags de capacidade são `false` exceto `headless`.
- Flags de ambiente falham fechado em produção (sem escape).
- **Não** há acesso a produção nem staging (`noProduction`, `noStaging`).

## Sem backend / Prisma / migration / fetch / mutação

- Nenhum import de `apiClient`/`EmpresaApi`/`/apis/`/`/backend/`/`prisma`.
- Sem `fetch(`, `XMLHttpRequest`, `WebSocket`.
- Sem `localStorage`/`sessionStorage`/`indexedDB`.
- Sem `DATABASE_URL`, `VITE_API_URL`, `railway`.
- `mutationAllowed: false`; fallback sempre `blocked` sem efeitos colaterais.

## Escopo

O guard compartilhado `productionUiGuard.mjs` reconhece
`src/studio/foundation-contracts/` como subtree headless isolado (mesma tolerância
do piloto Empresas e das rotas dev runtime-v2/fuel). O gate confirma que nenhum
arquivo de produção/outro Studio/backend/Prisma/migration/SSOT foi tocado.

## Reversibilidade

Nada é auto-consumido pelo app — reversível por **não-consumo**.
