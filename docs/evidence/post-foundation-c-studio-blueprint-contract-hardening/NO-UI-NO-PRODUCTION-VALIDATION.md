# NO-UI / NO-PRODUCTION VALIDATION

Este slice é **headless e sem produção**. Evidências:

## Sem UI

- Subtree `hardening/` é **React-free** (nenhum import de `react`).
- Nenhuma matriz gera componente React; screen matrix bloqueia geração de UI.
- `src/App.jsx` não alterado; nenhum menu/rota registrado.

## Sem produção / sem staging

- Todas as flags de capacidade são `false` exceto `headless`.
- Flags de ambiente falham fechado em produção (sem escape).
- Compatibility matrix classifica qualquer liberação de produção como **breaking**.

## Sem backend / Prisma / migration / fetch / mutação

- Nenhum import de `apiClient`/`EmpresaApi`/`/apis/`/`/backend/`/`prisma`.
- Sem `fetch(`, `XMLHttpRequest`, `WebSocket`, `localStorage`/`sessionStorage`/`indexedDB`.
- Sem `DATABASE_URL`, `VITE_API_URL`, `railway`.
- Persistence matrix bloqueia migration/prisma/backend/mutation automáticos e write direto.

## Escopo

O subtree `src/studio/foundation-contracts/hardening/` já é coberto pela exceção
existente do `productionUiGuard` (prefixo `src/studio/foundation-contracts/`). **Nenhuma
ampliação** do guard foi necessária.

## Reversibilidade

Nada é auto-consumido pelo app — reversível por **não-consumo**.
