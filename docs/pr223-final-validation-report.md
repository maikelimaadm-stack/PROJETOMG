# PR #223 — Relatório final de validação (template)

Branch: `cursor/user-preferences-isolation-7d24`  
SHA: _(preencher após deploy staging)_  
Runbook: [pr223-railway-staging-runbook.md](./pr223-railway-staging-runbook.md)

---

## Bloqueio de merge — checklist

| Item | Status |
| ---- | ------ |
| Migration aplicada no banco staging | ☐ Pendente |
| Schema validado no banco staging | ☐ Pendente |
| Backend da branch no Railway staging | ☐ Pendente |
| PUT rejeita `usuario_id` (HTTP 400) | ☐ Pendente |
| Usuários A/B/C seed | ☐ Pendente |
| E2E real A/B/C | ☐ Pendente |
| Reload / logout / nova aba em staging | ☐ Pendente |

**Produção não conta como evidência** — ainda aceita `usuario_id` no PUT (código anterior).

---

## Escopo desta PR

```text
Preferências da tela Empresas:
cliente_id + usuario_id + modulo + tela
```

**Fora de escopo (PRs futuras):** CadCPS, exportação, tema ERP.

---

## Parte 7 — Tabela de cenários

| Cenário | A | B | C | Backend correto | Persistiu reload | Persistiu logout/login | Persistiu nova aba | Status |
| ------- | - | - | - | --------------- | ---------------- | ---------------------- | ------------------ | ------ |
| Colunas | | | | | | | | |
| Ordem/largura | | | | | | | | |
| Frozen esquerdo | | | | | | | | |
| Cards | | | | | | | | |
| Filtros | | | | | | | | |
| Formulário | | | | | | | | |

---

## Evidências automatizadas

| Script | Resultado | Arquivo |
| ------ | --------- | ------- |
| `npm run test:preferences:frontend` | PASS (local) | — |
| `backend npm run test:preferences:backend` | PASS (local) | — |
| `npm run test:preferences:isolation-mock` | PASS 5/5 (local) | — |
| `npm run test:preferences:schema-evidence` | _(staging)_ | `scripts/validate-preferences-schema.results.json` |
| `npm run test:preferences:put-security` | _(staging)_ | `scripts/validate-preferences-put-security.results.json` |
| `npm run test:preferences:isolation-api` | _(staging)_ | `scripts/validate-preferences-isolation-api.results.json` |

---

## Registros DB (IDs mascarados)

### Usuário A — tenant1 / usera

_(preencher após query staging)_

### Usuário B — tenant1 / userb

_(preencher)_

### Usuário C — tenant2 / userc

_(preencher)_

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

### PUT malicioso (deve retornar 400)

```json
{
  "preferencias": { "version": 1 },
  "usuario_id": "userb"
}
```

---

## Pendências fora desta PR

| Item | PR futura |
| ---- | --------- |
| CadCPS `cps_col_*` | Separada |
| Config exportação | Separada |
| Tema ERP | Separada |

---

## Frase de aprovação

**Não emitida** — aguardando validação staging completa.
