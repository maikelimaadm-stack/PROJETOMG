# Railway staging — validação PR #223 (isolamento preferências Empresas)

Este runbook provisiona um **backend temporário** da branch da PR #223 no Railway, com **banco staging isolado**, para validação antes do merge.

**Branch obrigatória:**

```text
cursor/user-preferences-isolation-7d24
```

**Escopo aprovado desta PR:**

```text
Preferências da tela Empresas isoladas por:
cliente_id + usuario_id + modulo + tela
```

**Fora de escopo (PRs futuras):** CadCPS (`cps_col_*`), exportação, tema ERP.

---

## 1. Serviço Railway a criar

| Item | Valor |
| ---- | ----- |
| Projeto Railway | Novo projeto ou ambiente `staging` dedicado |
| Nome do serviço | `projetomg-pr223-staging` |
| Branch GitHub | `cursor/user-preferences-isolation-7d24` |
| Banco | PostgreSQL plugin **novo** (nunca produção) |

Passos:

1. [Railway Dashboard](https://railway.app/dashboard) → **New Project** → **Deploy from GitHub repo** → `PROJETOMG`.
2. Crie serviço backend separado de produção.
3. **Settings → Source** → branch `cursor/user-preferences-isolation-7d24`.
4. **Add Plugin → PostgreSQL** (instância staging dedicada).

---

## 2. Variáveis de ambiente (sem valores reais no repo)

Configure no serviço backend staging:

| Variável | Descrição |
| -------- | --------- |
| `NODE_ENV` | `production` (runtime Railway) — seeds usam `NODE_ENV=staging` **localmente** |
| `BACKEND_HOST` | `0.0.0.0` |
| `BACKEND_PORT` | `3001` |
| `DATABASE_URL` | URL pooler do Postgres **staging** |
| `DIRECT_URL` | URL direct (5432) do Postgres **staging** |
| `JWT_SECRET` | Segredo forte, **diferente de produção** |
| `SUPABASE_URL` | Projeto Supabase staging ou dev |
| `SUPABASE_ANON_KEY` | Chave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role |
| `SUPABASE_STORAGE_BUCKET` | `erp-anexos` |
| `FRONTEND_ORIGINS` | URL preview Vercel da PR #223 + `http://127.0.0.1:5173` |
| `SEED_SKIP` | `true` (boot Docker não roda seed automático) |

**Nunca** commitar tokens, senhas ou `DATABASE_URL` reais.

---

## 3. Build e start

Railway usa `railway.json` + `Dockerfile.railway`:

| Etapa | Comando |
| ----- | ------- |
| Build | `npm ci` → `npm run prisma:generate` |
| Start | `node src/server.js` |
| Boot bloqueante | `runBlockingDatabaseBoot.js` (migrate + verify schema) |
| Healthcheck Railway | Path `/` — timeout 300s |

Resposta esperada:

```bash
curl -sS https://SEU-STAGING.up.railway.app/api/health
```

```json
{ "ok": true, "db": { "connected": true } }
```

---

## 4. Migration no staging

Após primeiro deploy, confirme nos logs:

```text
[boot-blocking] Prisma migrate deploy: OK
[boot-blocking] verify_usuario_preferencia_schema: ready=true
```

Validação local adicional (com `DATABASE_URL` staging exportado **no terminal**, não no repo):

```bash
DATABASE_URL='postgresql://...' npm run test:preferences:schema-evidence
```

Checklist SQL:

1. Tabela `UsuarioPreferencia` existe
2. `usuario_id NOT NULL`
3. `UNIQUE(cliente_id, usuario_id, modulo, tela)`
4. Índice `(cliente_id, usuario_id)`
5. Sem UNIQUE antigo `(cliente_id, modulo, tela)` sem usuário
6. Migration `20260624140500_user_screen_preferences` aplicada

---

## 5. Seed Usuários A/B/C (staging only)

**Nunca** rodar em produção.

```bash
export NODE_ENV=staging
export DATABASE_URL='postgresql://...'   # staging isolado
export PREF_ISOLATION_SEED_PASSWORD='sua-senha-forte-teste'

node backend/scripts/seedPreferenceIsolationUsers.js --allow-staging-seed
```

Cria:

| Login | Tenant | Objetivo |
| ----- | ------ | -------- |
| `usera` | `tenant1` | Preferências A |
| `userb` | `tenant1` | Preferências B |
| `userc` | `tenant2` | Preferências C |

Comportamento:

- Cria tenant/usuário **somente se não existir**
- **Não sobrescreve** usuário existente
- Senha via `PREF_ISOLATION_SEED_PASSWORD` (não impressa)
- IDs mascarados no output
- 2 empresas mínimas por tenant (marcadas `pr223-pref-isolation-seed`)

Cleanup após aprovação:

```bash
NODE_ENV=staging DATABASE_URL='...' \
node backend/scripts/cleanupPreferenceIsolationUsers.js --allow-staging-cleanup
```

---

## 6. Scripts de validação (ordem obrigatória)

Substitua `STAGING_URL` pela URL pública do Railway staging.

```bash
export VALIDATE_BASE_URL=https://SEU-STAGING.up.railway.app
export PREF_ISOLATION_SEED_PASSWORD='sua-senha-forte-teste'
```

### 6.1 Schema

```bash
DATABASE_URL='postgresql://...' npm run test:preferences:schema-evidence
```

### 6.2 Health + bootstrap (smoke)

```bash
VALIDATE_BASE_URL=$VALIDATE_BASE_URL \
VALIDATE_CLIENTE=tenant1 VALIDATE_USUARIO=usera \
VALIDATE_SENHA="$PREF_ISOLATION_SEED_PASSWORD" \
node backend/scripts/validateRailwayPreferencesDeployment.js
```

### 6.3 Segurança PUT (Parte 5)

```bash
npm run test:preferences:put-security
```

Esperado: **HTTP 400** para body com `usuario_id`, `cliente_id`, `tenant_id`, `empresa_id`.

### 6.4 Isolamento API A/B/C

```bash
npm run test:preferences:isolation-api
```

Resultados gravados em `scripts/validate-*.results.json`.

---

## 7. Frontend preview + E2E real (Parte 6)

Conectar preview Vercel da PR #223:

```text
VITE_API_PROXY_TARGET=https://SEU-STAGING.up.railway.app
```

Desabilitar auto-login para testes manuais:

```text
VITE_DEV_AUTO_LOGIN=false
```

Mock E2E (já passa localmente):

```bash
npm run test:preferences:isolation-mock
```

E2E real A/B/C (manual ou Playwright contra staging — pendente execução com credenciais seed):

- Usuário A: ocultar Telefone, congelar Razão Social, cards=2, filtros RS+Cidade, max=2, operador contém, layout form
- Usuário B: não herda A; ocultar E-mail, congelar Cidade, cards=4, filtros Status+UF, max=4, operador começa com
- Usuário C: tenant2 isolado
- Validar reload, logout/login, nova aba

---

## 8. Logs obrigatórios a arquivar

Copie do Railway → Deployments:

1. Build Docker
2. `[boot-blocking] migrate deploy`
3. `verify_usuario_preferencia_schema`
4. Start listening :3001
5. Healthcheck passing

Salve como `logs/pr223-railway-staging-YYYYMMDD.txt` (local, não commitar secrets).

---

## 9. Relatório final (Parte 7)

Preencher `docs/pr223-final-validation-report.md` com:

- SHA final
- Tabela cenários A/B/C (colunas, cards, filtros, formulário)
- Resultados schema + PUT security + isolation API
- Payloads GET/PUT (sem tokens)
- Registros DB mascarados
- Pendências fora da PR

---

## 10. Destruir staging após aprovação

1. `cleanupPreferenceIsolationUsers.js --allow-staging-cleanup`
2. Railway → delete serviço `projetomg-pr223-staging`
3. Delete Postgres plugin staging
4. Remover `VITE_API_PROXY_TARGET` do preview Vercel

---

## Critério de merge

Todos devem ser verdadeiros:

- [ ] Staging na branch `cursor/user-preferences-isolation-7d24`
- [ ] Banco staging isolado (não produção)
- [ ] `test:preferences:schema-evidence` PASS
- [ ] `test:preferences:put-security` PASS (400 para IDs injetados)
- [ ] `test:preferences:isolation-api` PASS (A/B/C)
- [ ] E2E real A/B/C com reload/logout/nova aba
- [ ] Produção **não** usada como evidência

Frase de aprovação (somente após todos os itens):

```text
PR #223 aprovada para merge: preferências de Empresas foram validadas em staging com Usuários A, B e C. O backend deriva o usuário do token, rejeita IDs de escopo enviados pelo frontend e usuários diferentes não leem, recebem ou sobrescrevem preferências uns dos outros.
```
