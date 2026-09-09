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

## 2. A semântica de `tenant_id` — derivada, não inventada

A pergunta tinha de ser respondida antes de tocar em qualquer rota. A resposta veio do código
já em produção, em `backend/src/modules/mmm/mmmService.js`: o tenant AUTORIZADO é exatamente o
`cliente_id` do escopo autenticado, e um tenant pedido diferente disso é `403 TENANT_FORBIDDEN`.
Não existe hoje subdivisão independente de cliente.

`backend/src/modules/lifecycle/lifecycleTenant.js` aplica a MESMA regra ao lifecycle — é o
mesmo contrato, não um segundo — e registra as duas consequências:

- `LifecycleExecutionJob` e `LifecycleAuditEntry` **não** têm coluna `cliente_id`; carregam só
  `tenant_id`. Como tenant é o cliente, é `tenant_id` que sustenta o isolamento nessas duas
  tabelas — por isso ele é sempre copiado da linha de aprovação já escopada.
- `LifecycleSyncState` tem unique `(cliente_id, group_id, entity_type, entity_id)`. Como tenant
  é funcionalmente determinado por cliente, esse unique já é seguro e **nenhuma migration é
  necessária**. Se um dia tenant virar subdivisão real, a decisão muda e passa a exigir
  migration — o teste desta fatia falha nesse dia, de propósito.

`body.tenantId` jamais é autoridade: ou coincide com o autorizado, ou é 403. O fallback
silencioso `"default"`, que gravava dados persistentes sob um tenant que ninguém provou, foi
removido.

---

## 3. Provas

| Prova | Comando | Resultado |
| --- | --- | --- |
| Bateria adversarial | `npm run test:lifecycle-security` (backend) | 32/32 PASS |
| Gate de segurança | `npm run gate:lifecycle-security` | G403 · 28/28 PASS |
| Gate da fatia | `npm run gate:g423-lifecycle-auth-tenant-atomicity-governance` | PASS |
| Suíte de runtime | `npm run test:runtime` | 0 fail |

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

51 arquivos de governança de OUTRAS fatias são corrigidos aqui e declarados, um a um, em
`crossSliceAuthorizedPatterns`. Nenhum muda de dono. Duas famílias:

- **(a)** a asserção absoluta "backend não mudou", que passa a isentar o que a fatia ATIVA
  autoriza — o padrão que já existia duas linhas ao lado, nos mesmos arquivos;
- **(b)** a cardinalidade do catálogo (49 → 50) e os invariantes de autorização forbidden, que
  passam a ler um ledger de fatias autorizadas em vez de um nome fixo.

---

## 6. Limites declarados

- Nenhum módulo novo, produto novo ou UI nova.
- Nenhuma dependência nova; `package-lock.json` não muda.
- Nenhuma migration; `prisma/schema.prisma` não muda.
- `.github/**` não é tocado.
- O guard central `studioScopeGovernanceGuard.mjs` não é tocado.
- P1-04 (`verify:all`) permanece CONGELADA.
- Nenhum banco real, credencial real ou segredo persistido em momento algum.
