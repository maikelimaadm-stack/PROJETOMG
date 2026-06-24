# Railway staging — validação PR #222

Este roteiro provisiona um **backend temporário** da branch da PR #222 no Railway, com **banco staging isolado**, para validação antes do merge.

**Branch obrigatória:**

```text
cursor/stabilize-empresas-preferences-railway
```

**Commit de referência:** `c0b7ca84` ou posterior na mesma branch.

---

## 1. Criar serviço Railway temporário

1. Acesse [Railway Dashboard](https://railway.app/dashboard).
2. **New Project** → **Deploy from GitHub repo** → selecione `PROJETOMG`.
3. Crie um **novo serviço** (não reutilize produção):
   - Nome sugerido: `projetomg-pr222-staging`
   - Ambiente sugerido: `staging` ou `pr222-validation`
4. Em **Settings → Source**, fixe a branch:

   ```text
   cursor/stabilize-empresas-preferences-railway
   ```

5. Confirme que o build usa os arquivos da raiz:
   - `railway.json`
   - `Dockerfile.railway`

---

## 2. Banco de dados (staging isolado)

**Nunca** use o `DATABASE_URL` de produção.

Opções:

| Opção | Quando usar |
| ----- | ----------- |
| **PostgreSQL plugin Railway (novo)** | Recomendado — banco vazio dedicado ao staging |
| **Supabase projeto staging** | Se já existir projeto separado de staging |
| **Clone seguro** | Somente snapshot restaurado em instância nova, nunca apontar produção |

Passos (Railway Postgres plugin):

1. No projeto staging → **Add Plugin** → **PostgreSQL**.
2. Copie `DATABASE_URL` e `DATABASE_URL` direct (porta 5432) para variáveis do serviço backend.
3. Defina no serviço backend:
   - `DATABASE_URL` → URL pooler (6543 ou equivalente)
   - `DIRECT_URL` → URL direct (5432)

---

## 3. Variáveis de ambiente obrigatórias

Configure no serviço backend staging:

| Variável | Valor |
| -------- | ----- |
| `NODE_ENV` | `production` |
| `BACKEND_HOST` | `0.0.0.0` |
| `BACKEND_PORT` | `3001` |
| `DATABASE_URL` | Postgres **staging** |
| `DIRECT_URL` | Postgres **staging** direct |
| `JWT_SECRET` | Segredo forte (diferente de produção) |
| `SUPABASE_URL` | Projeto Supabase staging ou mesmo de dev |
| `SUPABASE_ANON_KEY` | Chave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role |
| `SUPABASE_STORAGE_BUCKET` | `erp-anexos` |
| `FRONTEND_ORIGINS` | URL preview Vercel da PR + `http://127.0.0.1:5173` |
| `SEED_SKIP` | `true` (padrão Dockerfile) |

Opcional para boot legado:

| Variável | Valor |
| -------- | ----- |
| `BOOT_ALLOW_PREFERENCES_COMPAT_MODE` | não necessário se migrations OK |
| `BOOT_SKIP_MIGRATIONS` | **não definir** — boot deve rodar migrate |

Credenciais de teste (seed manual ou existente no staging):

| Variável | Exemplo |
| -------- | ------- |
| `SEED_CLIENTE_CODIGO` | `maike` |
| `SEED_USUARIO_LOGIN` | `maike` |
| `SEED_USUARIO_SENHA` | `123` |

---

## 4. Build e start (automáticos via Docker)

**Build:** Railway usa `Dockerfile.railway`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV SEED_SKIP=true
COPY backend/package*.json ./
RUN npm ci
COPY backend/prisma ./prisma
RUN npm run prisma:generate
COPY backend/src ./src
COPY backend/scripts ./scripts
COPY backend/config ./config
EXPOSE 3001
CMD ["node", "src/server.js"]
```

**Start command:** `node src/server.js` (já no CMD).

Na subida, `src/server.js` executa `runBlockingDatabaseBoot.js` antes de aceitar tráfego.

---

## 5. Healthcheck esperado

Railway healthcheck (configurado em `railway.json`):

- Path: `/` ou `/api/health`
- Timeout: 300s

Resposta esperada:

```bash
curl -sS https://SEU-STAGING.up.railway.app/api/health
```

```json
{
  "ok": true,
  "alive": true,
  "ready": true,
  "db": { "connected": true }
}
```

---

## 6. Logs obrigatórios a copiar após deploy

No painel Railway → **Deployments** → build + runtime logs, copie:

1. Build Docker (`npm ci`, `prisma generate`) — sucesso
2. `[boot-blocking] Prisma migrate deploy` — OK ou warn com schema verificado
3. `[boot-blocking] ensure_usuario_preferencia_table`
4. `[boot-blocking] verify_usuario_preferencia_schema` — ready=true
5. `[boot-blocking] Servidor iniciará...` (se migrate falhou mas schema OK)
6. Start command / listening on port 3001
7. Healthcheck passing

Salve em arquivo local, ex.: `logs/pr222-railway-staging-YYYYMMDD.txt`.

---

## 7. Validação HTTP pós-deploy

Substitua `STAGING_URL`:

```bash
export VALIDATE_BASE_URL=https://SEU-STAGING.up.railway.app
export VALIDATE_CLIENTE=maike
export VALIDATE_USUARIO=maike
export VALIDATE_SENHA=123

node backend/scripts/validateRailwayPreferencesDeployment.js
```

O script valida:

- healthcheck + DB
- login
- bootstrap (`empresas.listagem`, `empresas.form_layout`)
- GET/PUT/GET preferências
- limpeza do dado de teste
- schema (se `DATABASE_URL` disponível no runner local)

Resultado em: `scripts/validate-railway-preferences.results.json`

---

## 8. Conectar frontend preview da PR ao backend staging

No preview Vercel da PR #222, configure:

```text
VITE_API_URL=https://SEU-STAGING.up.railway.app
```

Ou, em dev local:

```bash
# .env.local
VITE_API_PROXY_TARGET=https://SEU-STAGING.up.railway.app
# remover VITE_API_URL
```

**Proibido** usar `projetomg-production.up.railway.app` como evidência de aprovação da PR #222.

---

## 9. Endpoints de smoke manual

```bash
STAGING=https://SEU-STAGING.up.railway.app
TOKEN=$(curl -sS -X POST "$STAGING/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"cliente":"maike","usuario":"maike","senha":"123"}' | jq -r .token)

curl -sS "$STAGING/api/health"
curl -sS -H "Authorization: Bearer $TOKEN" "$STAGING/api/user/preferences/bootstrap"
curl -sS -H "Authorization: Bearer $TOKEN" "$STAGING/api/user/preferences/empresas/listagem"
curl -sS -H "Authorization: Bearer $TOKEN" "$STAGING/api/empresas?page=1&pageSize=5"
```

---

## 10. Destruir ambiente após validação

1. Railway → serviço `projetomg-pr222-staging` → **Settings** → **Delete Service**.
2. Se criou Postgres dedicado → delete plugin/database staging.
3. Remover variáveis temporárias do preview Vercel.
4. Arquivar logs em `docs/auditoria/` se necessário.

---

## Critério de aprovação desta etapa

Todos devem ser verdadeiros:

- [ ] Serviço staging na branch `cursor/stabilize-empresas-preferences-railway`
- [ ] Banco staging isolado (não produção)
- [ ] Boot completo nos logs (`runBlockingDatabaseBoot`)
- [ ] Healthcheck HTTP 200
- [ ] `validateRailwayPreferencesDeployment.js` exit 0
- [ ] Frontend preview apontando para staging (não produção)

Somente então prosseguir etapas 4–7 da validação completa (persistência visual, faixa filtros, medição GET/PUT).
