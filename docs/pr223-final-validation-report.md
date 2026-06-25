# PR #223 — Relatório final de validação

Branch: `cursor/user-preferences-isolation-7d24`  
SHA: `1c6926df5657408ac035f9648e2e1bbd740cf01a`  
Data execução: 2026-06-25T12:17Z (Cloud Agent)  
Runbook: [pr223-railway-staging-runbook.md](./pr223-railway-staging-runbook.md)

---

## Resultado geral

**BLOQUEADO — merge não aprovado.**

O deploy staging foi declarado concluído pelo operador, porém **este ambiente Cloud Agent não recebeu** as variáveis necessárias para conectar ao backend/banco staging. Sem `DATABASE_URL`, `VALIDATE_BASE_URL` e `PREF_ISOLATION_SEED_PASSWORD`, os passos 1–4, 5–6 (E2E real) e 8 (cleanup) não puderam ser executados contra staging.

---

## Bloqueio de merge — checklist

| Item | Status | Evidência |
| ---- | ------ | --------- |
| Migration aplicada no banco staging | ☐ Pendente | `DATABASE_URL` ausente — schema evidence SKIP |
| Schema validado no banco staging | ☐ Pendente | `scripts/validate-preferences-schema.results.json` → `approved: false`, skipped |
| Backend da branch no Railway staging | ☐ Não verificado | `VALIDATE_BASE_URL` ausente; URLs probadas retornam HTTP 404 |
| PUT rejeita `usuario_id` (HTTP 400) | ☐ Pendente | Script abortou: `VALIDATE_BASE_URL` obrigatório |
| Usuários A/B/C seed | ☐ Pendente | Seed abortou: `DATABASE_URL` ausente |
| E2E real A/B/C | ☐ Pendente | Requer frontend + API staging com credenciais seed |
| Reload / logout / nova aba em staging | ☐ Pendente | Depende do E2E real em staging |
| Cleanup usuários de teste | ☐ Pendente | `DATABASE_URL` ausente |

**Produção não conta como evidência** — confirmado em runtime:

```bash
curl -X PUT https://projetomg-production.up.railway.app/api/user/preferences/empresas/listagem \
  -H "Authorization: Bearer <token maike>" \
  -d '{"preferencias":{"version":1},"usuario_id":"userb"}'
# → HTTP 200 (código anterior, PR #223 não deployada em produção)
```

---

## Execução desta rodada (ordem solicitada)

| # | Passo | Comando | Resultado |
| - | ----- | ------- | --------- |
| 1 | Schema evidence | `npm run test:preferences:schema-evidence` | **SKIP** — `DATABASE_URL` ausente |
| 2 | Seed usera/userb/userc | `NODE_ENV=staging node backend/scripts/seedPreferenceIsolationUsers.js --allow-staging-seed` | **FAIL** — `DATABASE_URL` ausente |
| 3 | PUT security | `npm run test:preferences:put-security` | **FAIL** — `VALIDATE_BASE_URL` ausente |
| 4 | API isolamento A/B/C | `npm run test:preferences:isolation-api` | **FAIL** — `VALIDATE_BASE_URL` ausente |
| 5 | E2E real A/B/C | — | **Não executado** — sem URL staging + senha seed |
| 6 | Reload / logout / nova aba | — | **Não executado** — depende do passo 5 |
| 7 | Relatório final | este arquivo | Preenchido com evidências disponíveis |
| 8 | Cleanup | `cleanupPreferenceIsolationUsers.js --allow-staging-cleanup` | **Não executado** — `DATABASE_URL` ausente |

### URLs Railway probadas (todas HTTP 404 "Application not found")

- `projetomg-pr223-staging.up.railway.app`
- `projetomg-pr223.up.railway.app`
- `projetomg-staging.up.railway.app`
- `cursor-user-preferences-isolation-7d24.up.railway.app`
- (+ 10 variantes adicionais)

Health produção (referência negativa): `https://projetomg-production.up.railway.app/api/health` → `ok: true` (não é staging PR #223).

---

## Escopo desta PR

```text
Preferências da tela Empresas:
cliente_id + usuario_id + modulo + tela
```

**Fora de escopo (PRs futuras):** CadCPS, exportação, tema ERP.

---

## Parte 7 — Tabela de cenários (staging)

| Cenário | A | B | C | Backend correto | Persistiu reload | Persistiu logout/login | Persistiu nova aba | Status |
| ------- | - | - | - | --------------- | ---------------- | ---------------------- | ------------------ | ------ |
| Colunas | — | — | — | — | — | — | — | **Não testado (staging)** |
| Ordem/largura | — | — | — | — | — | — | — | **Não testado (staging)** |
| Frozen esquerdo | — | — | — | — | — | — | — | **Não testado (staging)** |
| Cards | — | — | — | — | — | — | — | **Não testado (staging)** |
| Filtros | — | — | — | — | — | — | — | **Não testado (staging)** |
| Formulário | — | — | — | — | — | — | — | **Não testado (staging)** |

---

## Evidências automatizadas

| Script | Ambiente | Resultado | Arquivo |
| ------ | -------- | --------- | ------- |
| `npm run test:preferences:frontend` | local | PASS (iteração anterior) | — |
| `backend npm run test:preferences:backend` | local | PASS (iteração anterior) | — |
| `npm run test:preferences:isolation-mock` | local mock | **PASS 5/5** (2026-06-25T12:17Z) | — |
| `npm run test:preferences:schema-evidence` | staging | **SKIP** | `scripts/validate-preferences-schema.results.json` |
| `npm run test:preferences:put-security` | staging | **FAIL** (sem URL) | `scripts/validate-preferences-put-security.results.json` |
| `npm run test:preferences:isolation-api` | staging | **FAIL** (sem URL) | `scripts/validate-preferences-isolation-api.results.json` |

---

## Registros DB (IDs mascarados)

Não consultados — conexão staging indisponível neste runner.

### Usuário A — tenant1 / usera

_(pendente seed + query staging)_

### Usuário B — tenant1 / userb

_(pendente)_

### Usuário C — tenant2 / userc

_(pendente)_

---

## Payloads reais (sem tokens)

### PUT esperado (válido)

```json
{
  "versao_schema": 1,
  "preferencias": { "version": 1, "table": { "visibleColumns": ["codempresa"] } },
  "expectedUpdatedAt": "..."
}
```

### PUT malicioso (deve retornar 400 em staging PR #223)

```json
{
  "preferencias": { "version": 1 },
  "usuario_id": "userb"
}
```

Em produção (referência negativa): retorna **HTTP 200** — confirma que produção não tem o fix da PR #223.

---

## Pendências fora desta PR

| Item | PR futura |
| ---- | --------- |
| CadCPS `cps_col_*` | Separada |
| Config exportação | Separada |
| Tema ERP | Separada |

---

## Desbloqueio — variáveis necessárias no Cloud Agent

Configure no painel do Cloud Agent (ou exporte no terminal antes de reexecutar):

```bash
export NODE_ENV=staging
export DATABASE_URL='postgresql://...'          # Postgres staging isolado
export DIRECT_URL='postgresql://...'            # opcional
export VALIDATE_BASE_URL='https://....up.railway.app'
export PREF_ISOLATION_SEED_PASSWORD='...'
```

Reexecutar na ordem do runbook §6 + E2E real §7.

---

## Frase de aprovação

**Não emitida** — validação staging incompleta neste runner (credenciais ausentes). Mock E2E 5/5 passou localmente; evidência runtime em staging A/B/C permanece pendente.
