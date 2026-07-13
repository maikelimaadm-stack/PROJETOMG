# No Production · No Generation — Validation

Este slice é headless e contract-only. Comprovações:

- **Não produção:** nenhum endpoint real chamado, sem DATABASE_URL, sem VITE_API_URL
  produtiva, sem Railway, sem staging, sem JWT real, sem fetch/XHR/WebSocket, sem
  localStorage/sessionStorage/indexedDB, sem método POST/PUT/PATCH/DELETE.
- **Não geração:** o engine **não gera um módulo** (`generatedModuleAllowed: false`,
  `emitsGeneratedModule: false`, `generationAllowedNow: false`). Ele emite apenas um
  blueprint headless verificável.
- **Não persistência:** `persistenceEnabled: false`; persistence sempre `referenceOnly`
  com `migrationRequired: false`.
- **Não Empresas rewrite:** `rewriteEmpresas: false`; Empresas consumido reference-only.
- **Não registro:** sem rota, menu, módulo registrado, UI, componente React.

O verifier recusa (`valid: false`) qualquer manifest cuja flag de efeito colateral tenha
sido invertida para `true`. O fallback é fail-closed (`safeToEmit: false`).
