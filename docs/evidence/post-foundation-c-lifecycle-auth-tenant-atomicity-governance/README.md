# Slice 50 — Lifecycle Auth, Tenant Isolation and Atomic Decisions Governance

**Missão:** P1-03 · **Base:** `6ef1a1cf2515d1bbd98f68ac9e8ecc2b5f929b0b` ·
**Branch:** `claude/p1-03-lifecycle-auth-tenant-atomicity`

---

## 1. O que a fatia corrige

Três defeitos independentes no módulo `backend/src/modules/lifecycle`, todos exploráveis por
um usuário autenticado comum:

### 1.1 Ausência de autenticação real nas rotas

As seis rotas privadas do lifecycle não declaravam `preHandler`. A identidade do ator era lida
de `request.user?.cliente_id` — um campo que só existe se algum outro `preHandler` o tiver
populado — com fallback silencioso para o literal `"administrador"`. Na prática, qualquer
requisição sem token decidia aprovações como administrador.

**Correção:** as seis rotas passam por `app.authenticate` (o mesmo `preHandler` que o resto do
backend usa: Bearer/cookie, `jwtVerify`, verificação de token revogado e proteção de Origin
para mutações autenticadas por cookie). O escopo confiável vem de `loadAccessScope(request)`,
que relê o estado FRESCO do banco. O ator é a identidade autenticada, sem default.

### 1.2 IDOR cross-tenant

`getApprovalRequestById(id)` e `updateApprovalRequest(id, data)` liam e escreviam por `id`
isolado. Um usuário do cliente A podia ler e decidir uma solicitação do cliente B bastando
conhecer o `id`.

**Correção:** as duas funções globais-por-id foram REMOVIDAS. O que restou é escopado por
construção — `findFirst({ where: { id, cliente_id: clienteId } })` — e o serviço devolve a
MESMA resposta (`"Solicitação indisponível."`) para inexistente, de outro cliente e já
decidida, para que a resposta não enumere.

### 1.3 Decisão não atômica

Aprovar era ler, checar `status === "pending"`, atualizar, auditar e enfileirar — cinco passos
sem transação. Duas requisições simultâneas venciam a mesma corrida: **2 vencedores, 2 entradas
de auditoria, 2 jobs de execução** para uma única solicitação.

**Correção:** `decideApprovalRequestAtomic` roda um compare-and-set dentro de `$transaction`:

```js
const transitioned = await tx.lifecycleApprovalRequest.updateMany({
  where: { id, cliente_id: clienteId, status: "pending" },
  data: { ... },
});
if (transitioned.count !== 1) return { decided: false, request: null };
```

O `where` inclui `cliente_id` **e** `status`, então o banco decide o vencedor. Quem perde a
corrida não grava nada — nem auditoria, nem job. Auditoria e job vivem na MESMA transação e
herdam `tenant_id`/`group_id` da linha já escopada, nunca do payload.

---

## 1.4 RBAC — autenticar não é autorizar (segunda rodada)

A primeira rodada resolveu identidade e isolamento de cliente, mas **qualquer perfil do
cliente certo — CONSULTA incluído — podia decidir uma aprovação terminal** que enfileira
archive/expunge.

D-092 e D-093 não nomeiam perfil aprovador; `approvalWorkflowEngine.js` também não — o
`actorId = "administrador"` de lá era default de assinatura, não contrato. Sem contrato
canônico, vale least privilege, e a decisão fica em código:

```js
export const LIFECYCLE_DECISION_ROLES = Object.freeze(["ADMIN"]);
export const LIFECYCLE_SYNC_WRITE_ROLES = Object.freeze(["ADMIN", "OPERADOR"]);
```

- **approve / reject → ADMIN.** OPERADOR não decide: entra no dia em que houver evidência
  canônica, e `RBAC-05` falha nesse dia para forçar a revisão.
- **sync push → ADMIN + OPERADOR**, mesmo degrau do `POST /api/anexos`.
- **leituras → qualquer perfil**, já isoladas por `cliente_id`.
- **reconcile** é read-only de fato; `RBAC-09` varre a função e falha se ela passar a escrever.

`assertRole` é o helper real de `accessScope.js` — os testes não injetam substituto.

---

## 2. O modelo de tenant do Lifecycle — corrigido na terceira rodada

As rodadas anteriores afirmavam "tenant = cliente_id" com base no MMM. **Estava errado para o
Lifecycle**, cujo contrato (`businessDnaStore.registerAuthorizedGroupScope`,
`lifecycleContextAssembly`, `approvalWorkflowEngine`, G323/G324/G325) separa `ownerClientId`,
`groupId`, `authorizedTenantIds[]` e `tenantId` — `owner-A / group-1 / tenant-A` é legítimo, e
o head anterior o recusava com 403.

Auditoria do backend inteiro: **não existe autoridade server-side** de (owner, group, tenant).
`authorizedTenantIds` só vive no `localStorage` do navegador, escrito pelos gates. Sem fonte
confiável, **OPÇÃO C — fail-closed**:

- `tenantId` é declaração; `authorizedTenantIds`/`ownerClientId` do payload são ignorados.
- ausente → `400 LIFECYCLE_TENANT_REQUIRED` (nunca derivado, nunca default);
- igual ao owner → permitido pela identidade autenticada (isolamento de cliente basta);
- diferente → só com autoridade; sem autoridade → `403 LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE`
  (código distinto de `TENANT_FORBIDDEN`, de propósito). Nada é gravado.

A decisão roda no serviço, na fronteira de escrita. O frontend passou a **declarar**
`tenantId` no push (uma propriedade). Produção registra as rotas sem `deps`; a seam
`assertRole` foi removida.

**Schema:** o unique de `LifecycleSyncState` passou a incluir `tenant_id` — sem ele, o push de
tenant-B sobrescrevia a linha de tenant-A no mesmo owner/group (`TEN-13b`). Uma migration,
index swap, sem dado tocado.

**Veredito desta rodada: BLOQUEADO PARA MERGE** — o caso multi-tenant está modelado e provado
com autoridade injetada, mas não é autorizável em produção até existir mapping server-side
(TD-021). Lição: o mesmo termo não implica a mesma semântica entre bounded contexts.

---

## 3. Provas

| Prova | Comando | Resultado |
| --- | --- | --- |
| Bateria adversarial | `npm run test:lifecycle-security` (backend) | **58/58 PASS** |
| Gate de segurança | `npm run gate:lifecycle-security` | **G403 · 44/44 PASS** |
| Gate da fatia | `npm run gate:g423-lifecycle-auth-tenant-atomicity-governance` | **40/40 PASS** |
| Suíte de runtime | `npm run test:runtime` | **23778 pass · 0 fail** |

A bateria usa um duplo de Prisma **assíncrono** com `updateMany` condicional e `$transaction`
com rollback por snapshot. A primeira versão do harness era síncrona e por isso `Promise.all`
não interleaveava: ela **não reproduziu** a corrida. Isso foi reportado como limitação do
harness, não como evidência de segurança, e o harness foi refeito — a versão assíncrona
reproduz o defeito na base (2 vencedores, 2 auditorias, 2 jobs) e o vê corrigido na branch.

G403 vive no agregado `gate:deploy-pipeline` porque é o único agregado de validação de backend
que o workflow do CI de fato executa. A alternativa seria acrescentar um step em
`.github/workflows/foundation-governance.yml`, que hoje pertence à Slice 49; fazer uma correção
de segurança de backend depender de ampliar a propriedade sobre `.github/**` seria pior.

---

## 4. Por que esta fatia existe no catálogo

`FORBIDDEN_SCOPE_PATTERNS` inclui `/^backend\//`, então **qualquer** alteração de backend é
`forbidden_scope` para todas as fatias. Sem uma entrada de catálogo, a correção de segurança
seria estruturalmente impossível de tornar verde: a medição registrou **129 falhas de runtime**.

A fatia 50 declara os **sete arquivos exatos** que toca em `explicitlyAuthorizedForbiddenPatterns`
— cada um ancorado nas duas pontas, sem curinga — exatamente como a fatia 42 já fazia com
`src/App.jsx`. Ela é a segunda e última autorizadora do catálogo, e o LEDGER em
`studio-scope-governance-chronological-migration.test.js` (S004/F002/F010) prende essa lista por
identidade e cardinalidade, de modo que uma terceira não pode aparecer em silêncio.

A autorização é da FATIA ATIVA, não do arquivo: sem o marcador de branch que elege a fatia 50,
os mesmos caminhos voltam a ser recusados. É isto que impede a autorização de virar um
salvo-conduto permanente sobre `backend/src/modules/lifecycle/`.

Medição da redução: **129 → 62** (protótipo da fatia) **→ 37** (isenção nas asserções
absolutas) **→ 0**.

---

## 5. Escopo cruzado

52 arquivos de governança de OUTRAS fatias são corrigidos aqui e declarados, um a um, em
`crossSliceAuthorizedPatterns`. Nenhum muda de dono. Duas famílias:

- **(a)** a asserção absoluta "backend não mudou", que passa a isentar o que a fatia ATIVA
  autoriza — o padrão que já existia duas linhas ao lado, nos mesmos arquivos;
- **(b)** a cardinalidade do catálogo (49 → 50) e os invariantes de autorização forbidden, que
  passam a ler um ledger de fatias autorizadas em vez de um nome fixo.

---

## 5b. O que esta fatia NÃO certifica

`pushSyncBatchBackend` executa três laços independentes com `await`, **sem `$transaction`**:
o batch de sync **não** é all-or-nothing, e uma falha num item posterior deixa os anteriores
persistidos. D-093 não exige batch atômico, então o código não foi mudado — a certificação é
que estava errada e foi corrigida.

A atomicidade certificada por esta fatia é a da **decisão approve/reject**, e apenas ela.

G324 (24/26) e G325 (26/28) **não estão verdes**. Medidos base × head no mesmo ambiente,
as contagens e os nomes dos checks falhando são idênticos: é *baseline-red* pré-existente da
cadeia `G306 → G307 → G322 → G323`, tratado como exceção de **não-regressão** autorizada pelo
arquiteto-chefe — nunca como conformidade.

---

## 6. Limites declarados

- Nenhum módulo novo, produto novo ou UI nova.
- Nenhuma dependência nova; `package-lock.json` não muda.
- **Uma migration** (unique de `LifecycleSyncState` com `tenant_id`): index swap, sem dado tocado. Schema e migration como arquivos exatos; `prisma/migrations/` segue proibido.
- `.github/**` não é tocado.
- O guard central `studioScopeGovernanceGuard.mjs` não é tocado.
- P1-04 (`verify:all`) permanece CONGELADA.
- Nenhum banco real, credencial real ou segredo persistido em momento algum.
