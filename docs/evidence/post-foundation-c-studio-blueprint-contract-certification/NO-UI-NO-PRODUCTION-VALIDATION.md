# NO-UI / NO-PRODUCTION VALIDATION

Este slice é **headless e sem produção**. Evidências:

## Sem UI

- Subtree `certification/` é **React-free**.
- Nenhum contrato canônico gera UI; screen contract certifica `generatesReactComponent:
  false` e `registersRoute: false`.
- `src/App.jsx` não alterado; nenhum menu/rota registrado.

## Sem produção / sem staging

- Todas as flags de capacidade são `false` exceto `headless`.
- Flags de ambiente falham fechado em produção (sem escape).
- Compatibility rules classificam qualquer liberação de produção/staging como breaking.

## Sem backend / Prisma / migration / fetch / mutação

- Nenhum import de `apiClient`/`EmpresaApi`/`/apis/`/`/backend/`/`prisma`.
- Sem `fetch(`, `XMLHttpRequest`, `WebSocket`, `localStorage`/`sessionStorage`/`indexedDB`.
- Sem `DATABASE_URL`, `VITE_API_URL`, `railway`, staging URL.
- Persistence boundary certifica migration/prisma/backend/mutation off.

## Empresas

Empresas **não é alterada** neste slice; é referenciada como seed model certificado e
laboratório real/controlado. Alterações reais em Empresas só em slice futuro específico.

## Escopo

O subtree `src/studio/foundation-contracts/certification/` já é coberto pela exceção
existente do `productionUiGuard` (prefixo `src/studio/foundation-contracts/`). **Nenhuma
ampliação** do guard foi necessária.

## Reversibilidade

Nada é auto-consumido pelo app — reversível por **não-consumo**.
