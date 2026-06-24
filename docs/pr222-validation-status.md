# PR #222 — Classificação de testes e status de validação

**Branch:** `cursor/stabilize-empresas-preferences-railway`  
**Commit:** `0a2aa151` (ou posterior na mesma branch)  
**Status:** BLOQUEADA para merge

---

## Etapa 3 — Reclassificação dos testes existentes

| Teste | Frontend usado | Backend usado | Banco usado | Código da PR #222? | É E2E completo? | Classificação correta |
| ----- | -------------- | ------------- | ----------- | ------------------ | --------------- | --------------------- |
| `e2e/empresas-preferences-real.spec.js` — ocultar Telefone + reload | Dev local / preview Vercel PR | **API produção** (`projetomg-production.up.railway.app`) | **Produção** | Frontend ✅ / Backend ❌ | ❌ | **Validação parcial** (UI branch + API legada) |
| `e2e/empresas-preferences-real.spec.js` — healthcheck Railway | N/A (request direto) | **Produção** | **Produção** | ❌ | ❌ | **Integração parcial** (health produção) |
| `e2e/empresas-preferences-real.spec.js` — bootstrap API direta | N/A | **Produção** | **Produção** | ❌ | ❌ | **Integração parcial** (API produção) |
| `scripts/validate-preferences-real-api.mjs` | N/A | **Produção** | **Produção** | ❌ | ❌ | **Integração parcial** (PUT/GET produção) |
| `e2e/empresas-preferences-architecture-mock.spec.js` | Dev local | Mock in-process | Mock | Frontend ✅ | ❌ | **E2E mock** (unitário/integrado mock) |
| `e2e/empresas-preferences-bootstrap-mock.spec.js` | Dev local | Mock | Mock | Frontend ✅ | ❌ | **E2E mock** |
| `scripts/tests/preferences-storage.unit.mjs` | N/A | N/A | N/A | ✅ | ❌ | **Unitário frontend** |
| `scripts/tests/emp-column-layout.unit.mjs` | N/A | N/A | N/A | ✅ | ❌ | **Unitário frontend** |
| `backend/scripts/testPreferencesValidators.js` | N/A | N/A | N/A | ✅ | ❌ | **Unitário backend** |
| `e2e/empresas-render-stress.spec.js` (Etapa 1) | Dev local branch PR | Proxy → **produção** (default `.env.local`) | **Produção** | Frontend ✅ / Backend ❌ | ❌ | **Stress UI parcial** — comprova loop de render no frontend da PR; **não** aprova backend da PR |

### Regra aplicada

```text
frontend preview + API produção     = validação parcial
script direto na API produção       = integração parcial
mock                                = unitário/integrado mock
frontend PR + backend PR + staging  = E2E real (único critério de aprovação)
```

**Não usar “E2E real aprovado”** até existir ambiente completo da branch.

---

## Etapa 1 — Stress render TBLEMP/FORMEMP

Executar:

```bash
cp .env.local.example .env.local   # se necessário
npx playwright test --config=playwright.stress.config.js
```

Resultados: `e2e/empresas-render-stress.results.json`  
Última execução: `2026-06-24T20:04:39Z` (commit `0a2aa151`+)

### Correções aplicadas nesta branch

| Commit | Correção |
| ------ | -------- |
| `c0b7ca84` | Loop TBLEMP hidratação colunas |
| `ee54761b` | Loop server-sort/filters TBLEMP + guards PAGEMP |
| `805b3619` | Loop auto-repair FORMEMP (layoutDiffers) |
| `0a2aa151` | Loop useCadastroForm layoutPersistedRef + auto-repair once/mount |
| posterior | Loop useCadastroPageHeader + toolbarBridge signature guard |

### Tabela Etapa 1 (evidência frontend PR — proxy produção)

| Cenário | Console sem erro | Sem loop render | Sem loop GET/PUT | Tela utilizável | Status |
| ------- | ---------------- | --------------- | ---------------- | --------------- | ------ |
| 1. Primeira abertura Empresas | ✅ | ✅ | ✅ | ✅ | **PASS** |
| 2. Reload ×10 | ✅ | ✅ | ✅ | ✅ | **PASS** |
| 3. Tabela↔Cards ×10 | ✅ | ✅ | ✅ | ✅ | **PASS** |
| 4. Abrir/fechar formulário ×10 | ✅ | ✅ | ✅ | ✅ | **PASS** |
| 5. Alterar preferência coluna + reload | ✅ | ✅ | ✅ | ✅ | **PASS** |
| 6. Alterar preferência cards + reload | — | — | — | — | **PENDENTE** (flaky seletor Ok no menu cards — corrigido no spec, reexecutar) |
| 7. Alterar preferência filtros + reload | — | — | — | — | **PENDENTE** (não alcançado na última run) |
| 8. Preferência vazia `[]` | ✅ | ✅ | ✅ | ✅ | **PASS** |
| 9. Preferência corrompida localStorage | ✅ | ✅ | ✅ | ✅ | **PASS** |
| 10. Mobile (abertura + reload + toggle) | ✅ | ✅ | ✅ | ✅ | **PASS** |

**Critério crash `Maximum update depth exceeded`:** eliminado nos cenários 1–5, 8–10 comprovados. Nenhum erro React nos asserts; nenhum crash UI.

---

## Etapa 2 — Railway staging

Roteiro: [`docs/railway-pr222-staging-validation.md`](./railway-pr222-staging-validation.md)

Script pós-deploy:

```bash
VALIDATE_BASE_URL=https://SEU-STAGING.up.railway.app node backend/scripts/validateRailwayPreferencesDeployment.js
```

**Status:** procedimento documentado; deploy manual pendente (sem `RAILWAY_TOKEN` no ambiente cloud).

---

## Etapas 4–7 — Pendências

| Etapa | Status |
| ----- | ------ |
| 4 — Persistência tabela (11 cenários) | Bloqueada — requer backend staging da branch |
| 5 — Cards, filtros, formulário | Bloqueada — requer backend staging |
| 6 — Faixa filtros (10 capturas) | Pendente evidência visual |
| 7 — Medição GET/PUT final | Parcial no stress UI; E2E real pendente |

---

## Build / lint

| Comando | Resultado |
| ------- | --------- |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 |

---

## Declaração de aprovação

**Não emitida.** PR #222 permanece bloqueada.

Motivos:

- Backend staging da branch não deployado/validado
- Etapas 6–7 do stress desktop pendentes de reexecução
- Etapas 4–7 (persistência real, faixa filtros, GET/PUT E2E) pendentes

Frase só após todos os critérios:

```text
PR #222 aprovada para merge: a branch foi validada ponta a ponta com frontend e backend próprios em staging, preferências persistem após reload/logout/nova aba, não há loop de renderização, não há PUT durante hidratação, a faixa de filtros está íntegra e o Railway iniciou com sucesso.
```
