# PR #222 — Classificação de testes e status de validação

**Branch:** `cursor/stabilize-empresas-preferences-railway`  
**Commit:** `c0b7ca84` (ou posterior na mesma branch)  
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

## Etapa 1 — Stress render TBLEMP

Executar:

```bash
cp .env.local.example .env.local   # se necessário
npx playwright test --config=playwright.stress.config.js
```

Resultados: `e2e/empresas-render-stress.results.json`

| Cenário | Console sem erro | Sem loop render | Sem loop GET/PUT | Tela utilizável | Status |
| ------- | ---------------- | --------------- | ---------------- | --------------- | ------ |
| *(preencher após execução)* | | | | | |

---

## Etapa 2 — Railway staging

Roteiro: [`docs/railway-pr222-staging-validation.md`](./railway-pr222-staging-validation.md)

Script pós-deploy:

```bash
VALIDATE_BASE_URL=https://SEU-STAGING.up.railway.app node backend/scripts/validateRailwayPreferencesDeployment.js
```

---

## Pendências para desbloquear merge

- [ ] Backend staging da branch no Railway com logs de boot
- [ ] Frontend preview → backend staging (não produção)
- [ ] Etapas 4–7 (tabela, cards, filtros, formulário, faixa filtros, GET/PUT)
- [ ] Evidência visual 10 cenários faixa filtros
- [ ] E2E real completo (reload, logout/login, nova aba, tenant diferente)

---

## Declaração de aprovação

**Não emitida.** PR #222 permanece bloqueada.

Frase só após todos os critérios:

```text
PR #222 aprovada para merge: a branch foi validada ponta a ponta com frontend e backend próprios em staging, preferências persistem após reload/logout/nova aba, não há loop de renderização, não há PUT durante hidratação, a faixa de filtros está íntegra e o Railway iniciou com sucesso.
```
