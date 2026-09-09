# P1-03 — Lifecycle Auth, Tenant Isolation and Atomic Decisions

**Base SHA:** `6ef1a1cf2515d1bbd98f68ac9e8ecc2b5f929b0b` (merge da PR #505)
**Data:** 2026-09-09
**Antecessora:** P1-02B — Fail-Closed Legacy Typecheck Baseline
**Fatia de governança:** Slice 50 — Lifecycle Auth, Tenant Isolation and Atomic Decisions Governance

---

## 1. Os três defeitos que esta fatia fecha

Todos em `backend/src/modules/lifecycle`, todos exploráveis por um usuário autenticado comum —
e o primeiro, por qualquer requisição sem token.

### 1.1 Ausência de autenticação real nas rotas

As seis rotas privadas não declaravam `preHandler`. A identidade do ator era lida de
`request.user?.cliente_id` — campo que só existe se algum outro `preHandler` o houver populado —
com fallback silencioso para o literal `"administrador"`.

**Consequência na base:** uma requisição sem token decidia aprovações como administrador.

### 1.2 IDOR cross-tenant

`getApprovalRequestById(id)` e `updateApprovalRequest(id, data)` liam e escreviam por `id`
isolado, sem `cliente_id` na condição.

**Consequência na base:** um usuário do cliente A lia e decidia solicitações do cliente B
conhecendo apenas o `id`.

### 1.3 Decisão não atômica

Aprovar era: ler, checar `status === "pending"`, atualizar, auditar, enfileirar — cinco passos
sem transação.

**Consequência na base, reproduzida:** duas requisições simultâneas produziram **2 vencedores,
2 entradas de auditoria e 2 jobs de execução** para uma única solicitação.

---

## 2. Reprodução — e um FAIL de harness reportado antes de ser corrigido

A primeira tentativa de reproduzir 1.3 **não** reproduziu a corrida. O duplo de Prisma era
síncrono, então `Promise.all` não interleaveava: os dois caminhos rodavam em sequência e o
segundo via o status já mudado.

Isso foi reportado como **limitação do harness, não como evidência de segurança**, e o harness
foi refeito com um duplo assíncrono (`await` real entre leitura e escrita, `updateMany`
condicional, `$transaction` com rollback por snapshot). A versão assíncrona reproduz o defeito
na base e o vê fechado na branch.

Um harness estruturalmente incapaz de detectar o defeito que investiga produz um verde que não
significa nada. Registrado aqui porque a lição vale além desta fatia.

---

## 3. As correções

### 3.1 Autenticação

As seis rotas passam por `app.authenticate` (`backend/src/server.js:209`) — o mesmo `preHandler`
que o resto do backend usa: Bearer/cookie, `request.jwtVerify()`, verificação de token revogado
e proteção de Origin para mutações autenticadas por cookie. O escopo confiável vem de
`loadAccessScope(request)`, que relê o estado FRESCO do banco e lança `withStatus(msg, 401|403)`,
honrado pelo `setErrorHandler` global.

O auth **não** é replicado dentro do módulo: nenhuma chamada a `jwtVerify` ou
`isAuthTokenRevoked` nas rotas do lifecycle. Uma segunda implementação de autenticação é uma
segunda superfície para divergir.

### 3.2 Escopo

As duas funções globais-por-id foram **removidas**, não corrigidas — corrigi-las deixaria a
assinatura insegura disponível para o próximo consumidor. O que restou é escopado por
construção:

```js
export async function getApprovalRequestScoped({ id, clienteId }, client) {
  return resolveClient(client).lifecycleApprovalRequest.findFirst({
    where: { id, cliente_id: clienteId },
  });
}
```

O serviço devolve a MESMA resposta — `"Solicitação indisponível."` — para inexistente, de outro
cliente e já decidida. Respostas distintas enumerariam a existência de recursos de outro tenant.

### 3.3 Atomicidade

```js
const transitioned = await tx.lifecycleApprovalRequest.updateMany({
  where: { id, cliente_id: clienteId, status: "pending" },
  data: isApproval ? { ... } : { ... },
});
if (transitioned.count !== 1) return { decided: false, request: null };
```

Compare-and-set dentro de `$transaction`: o `where` inclui `cliente_id` **e** `status`, então o
banco decide o vencedor. Quem perde a corrida não grava nada. Auditoria e job vivem na MESMA
transação e herdam `tenant_id`/`group_id` da linha já escopada, nunca do payload.

---

## 4. A semântica de `tenant_id` — derivada, não inventada

A pergunta tinha de ser respondida antes de tocar em qualquer rota: neste produto, `tenant_id` é
(A) o próprio cliente, (B) uma subdivisão real, ou (C) outro contexto?

A resposta veio do código já em produção — `backend/src/modules/mmm/mmmService.js` — não de
suposição: o tenant AUTORIZADO é exatamente o `cliente_id` do escopo autenticado, e um tenant
pedido diferente disso é `403 TENANT_FORBIDDEN`. Não existe hoje subdivisão independente de
cliente.

`lifecycleTenant.js` aplica a MESMA regra ao lifecycle — é o mesmo contrato, não um segundo — e
registra as consequências:

- `LifecycleExecutionJob` e `LifecycleAuditEntry` **não** têm coluna `cliente_id`; carregam só
  `tenant_id`. Como tenant é o cliente, é `tenant_id` que sustenta o isolamento nessas duas
  tabelas — por isso ele é sempre copiado da linha de aprovação já escopada.
- `LifecycleSyncState` tem unique `(cliente_id, group_id, entity_type, entity_id)`. Como tenant
  é funcionalmente determinado por cliente, esse unique já é seguro e **nenhuma migration é
  necessária**. Se um dia tenant virar subdivisão real, a decisão muda e passa a exigir
  migration — o teste desta fatia falha nesse dia, de propósito.

`body.tenantId` jamais é autoridade. Divergência é 403, nunca coerção silenciosa para o valor
certo: um pedido divergente é uma tentativa de escrever fora do escopo e merece ser visível. O
fallback silencioso `"default"`, que gravava dados persistentes sob um tenant que ninguém
provou, foi removido.

---

## 5. Matriz de segurança

Sem `?`. Cada linha é uma afirmação verificável por um teste ou gate nomeado.

| # | Propriedade | Antes | Depois | Prova |
|---|---|---|---|---|
| S01 | As seis rotas privadas exigem autenticação | não | sim | G403-B01 · bateria (rotas) |
| S02 | Auth não é replicado dentro do módulo | n/a | sim | G403-B03 |
| S03 | O escopo vem de `loadAccessScope`, estado fresco do banco | não | sim | G403-B04 |
| S04 | O ator é a identidade autenticada, sem default `"administrador"` | não | sim | G403-B05 |
| S05 | Pseudo-auth por `request.user?.cliente_id` removido | não | sim | G403-B02 |
| S06 | Leitura de solicitação exige `cliente_id` | não | sim | G403-D05 · bateria (IDOR read) |
| S07 | Nenhuma leitura/mutation por `id` isolado permanece | não | sim | G403-D01 |
| S08 | `getApprovalRequestById` removido | não | sim | G403-D02 |
| S09 | `updateApprovalRequest` (update global por id) removido | não | sim | G403-D03 |
| S10 | Toda condição de decisão inclui `cliente_id` **e** `status` | não | sim | G403-D04 |
| S11 | Solicitação de outro cliente é indistinguível de inexistente | não | sim | bateria (não-enumeração) |
| S12 | A decisão roda dentro de `$transaction` | não | sim | G403-E01 |
| S13 | Auditoria e job vivem na mesma transação da decisão | não | sim | G403-E02 |
| S14 | Perder a corrida não grava nada | não | sim | G403-E03 · bateria (corrida) |
| S15 | Auditoria/job herdam escopo da linha, não do payload | não | sim | G403-E04 |
| S16 | Falha ao gravar auditoria aborta a decisão inteira | não | sim | bateria (`falharEm.audit`) |
| S17 | Falha ao enfileirar job aborta a decisão inteira | não | sim | bateria (`falharEm.job`) |
| S18 | `body.tenantId` não é autoridade | não | sim | G403-C01 |
| S19 | Tenant divergente é 403 `TENANT_FORBIDDEN`, não coerção | não | sim | G403-C03 |
| S20 | Tenant coincidente é aceito; ausente deriva do escopo | n/a | sim | G403-C03b |
| S21 | Fallback silencioso `"default"` removido | não | sim | G403-C02 |
| S22 | O sync valida o tenant antes de qualquer escrita | não | sim | G403-C04 |
| S23 | Nenhum escape de teste nos artefatos da fatia | n/a | sim | G403-F01 · slice F006 |

---

## 6. Provas executadas

| Prova | Comando | Resultado |
|---|---|---|
| Bateria adversarial | `npm run test:lifecycle-security` (backend) | **32/32 PASS** |
| Gate de segurança | `npm run gate:lifecycle-security` | **G403 · 28/28 PASS** |
| Gate da fatia | `npm run gate:g423-lifecycle-auth-tenant-atomicity-governance` | **32/32 PASS** |
| Suíte de runtime | `npm run test:runtime` | **0 fail** |

**Prova negativa — e o que ela NÃO é.** A bateria completa **não** roda contra a base: ela
importa `lifecycleTenant.js`, um módulo que a base não possui, de modo que o `exit 1` produzido
lá seria `ERR_MODULE_NOT_FOUND` — um falso negativo, não evidência de vulnerabilidade. Rodá-la
assim e reportar "sai 1 na base" seria reportar o erro do carregador como se fosse o defeito.

A prova negativa executada ataca apenas o que existe nos DOIS lados — a decisão de aprovação —
com o MESMO duplo assíncrono de Prisma em ambos, num worktree em `origin/main`:

| | vencedores | auditorias | jobs | cliente B decide? | exit |
|---|---|---|---|---|---|
| **base** (`origin/main`) | **2** | **2** | **2** | (função global por id existe) | **1** |
| **branch** | **1** | **1** | **1** | **não** | **0** |

A sonda também confirma que a base exporta `getApprovalRequestById` e `updateApprovalRequest`,
as duas assinaturas globais-por-id que esta fatia removeu.

---

## 7. A fatia de governança

`FORBIDDEN_SCOPE_PATTERNS` inclui `/^backend\//`, então **qualquer** alteração de backend é
`forbidden_scope` para todas as fatias. Sem entrada de catálogo, esta correção de segurança
seria estruturalmente impossível de tornar verde: a medição registrou **129 falhas de runtime**.

A Slice 50 declara os **sete arquivos exatos** que toca em
`explicitlyAuthorizedForbiddenPatterns`, cada um ancorado nas duas pontas, sem curinga —
exatamente como a Slice 42 já fazia com `src/App.jsx`. A autorização é da FATIA ATIVA, não do
arquivo: sem o marcador de branch que elege a Slice 50, os mesmos caminhos voltam a ser
recusados.

Redução medida: **129 → 62** (protótipo da fatia) **→ 37** (isenção nas asserções absolutas)
**→ 0**.

### 7.1 Um verde pré-commit que era falso

Uma medição intermediária reportou 0 falhas **antes** de commitar. Era falso: as checagens
relativas à branch leem `git diff origin/main...HEAD`, que compara COMMITS. Naquele instante o
diff carregava apenas os doze arquivos já commitados, e as correções nunca foram exercidas
contra o diff real. Medida de novo após o commit, a suíte reportou **95 falhas**.

Registrado porque a armadilha é sistemática: qualquer asserção que consuma o diff da branch é
cega para o working tree.

### 7.2 O que mudou nos invariantes de governança

Nenhum invariante foi afrouxado para deixar passar; cada um foi reescrito para dizer a verdade
que sempre pretendia dizer:

- **C014** deixou de proibir todo caminho proibido nas listas normais e passou a exigir que um
  caminho proibido ali esteja declarado, **idêntico**, na lista explícita da própria fatia.
- **S004 / F002 / F010** leem um LEDGER de fatias autorizadas com sua cardinalidade exata,
  afirmado inteiro — uma terceira autorizadora não pode aparecer em silêncio.
- **T003 / T004 / D001 / B003** isentam apenas os caminhos ledgerados; toda outra regra continua
  viva para toda branch.
- **B001 / B004** adotam o padrão "fatia ativa estritamente posterior ⇒ inaplicável, envelope
  afirmado", já estabelecido pelo D001 da Slice 48.
- **Manutenção 25/26** passaram a proibir um allow **amplo** de backend/modules em vez da mera
  menção da palavra, com um novo **26a** provando que todo source que as menciona é um arquivo
  exato — e que o predicado de exatidão sabe reprovar.
- **X009 / Hx03 / R005** admitem a Slice 50 por decisão nomeada, e R005 prova que a exceção é
  estreita: a baseline e o workflow continuam inalcançáveis.

---

## 8. Limites declarados

- Nenhum módulo novo, produto novo ou UI nova.
- Nenhuma dependência nova; `package-lock.json` **não** muda.
- Nenhuma migration; `prisma/schema.prisma` **não** muda.
- `.github/**` **não** é tocado.
- O guard central `studioScopeGovernanceGuard.mjs` **não** é tocado.
- **P1-04 (`verify:all`) permanece CONGELADA.**
- Nenhum banco real, credencial real ou segredo persistido em momento algum.

### 8.1 Limitação ambiental pré-existente

`npm run prisma:validate` sai **1** com `P1012` (`DIRECT_URL` ausente). Reproduzido na base
intocada via `git stash`: é **pré-existente**, não regressão desta fatia. O schema foi validado
com variáveis de ambiente efêmeras, apenas em memória; `.env` não foi tocado e nenhuma
credencial foi persistida.
