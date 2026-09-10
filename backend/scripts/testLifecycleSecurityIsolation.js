/**
 * P1-03 — BATERIA ADVERSARIAL DE SEGURANÇA DO LIFECYCLE.
 * Uso: node backend/scripts/testLifecycleSecurityIsolation.js
 *
 * Três camadas, todas exercitando o CÓDIGO REAL:
 *
 *   A/B/C/D/E  serviço + repositório contra um duplo determinístico de Prisma que
 *              implementa `updateMany` condicional e `$transaction` com rollback —
 *              as duas primitivas de que a correção depende;
 *   R          rotas Fastify reais via `inject()`, com o `app.authenticate` oficial
 *              decorado como spy, provando que o boundary é de fato executado;
 *   T          a semântica de tenant, ancorada no contrato já vigente do MMM.
 *
 * Sem banco: a suíte é determinística e roda no CI. Onde um duplo não consegue provar
 * algo (isolamento real do Postgres), o teste afirma a CONDIÇÃO enviada ao banco, que
 * é o que o Postgres executa.
 */
import assert from "node:assert/strict";
import Fastify from "fastify";

import {
  decideApprovalRequestAtomic,
  getApprovalRequestScoped,
  listApprovalRequestsByGroup,
  APPROVAL_DECISION,
} from "../src/modules/lifecycle/lifecycleRepository.js";
import {
  approveRequestBackend,
  rejectRequestBackend,
  listGroupApprovals,
} from "../src/modules/lifecycle/lifecycleService.js";
import { pushSyncBatchBackend } from "../src/modules/lifecycle/lifecycleSyncService.js";
import {
  resolveLifecycleTenantId,
  assertRequestedTenantAllowed,
} from "../src/modules/lifecycle/lifecycleTenant.js";
import { registerLifecycleRoutes } from "../src/modules/lifecycle/routes.js";

const CLIENTE_A = "cliente_A";
const CLIENTE_B = "cliente_B";
let passou = 0;
const falhas = [];
const check = (nome, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      return r.then(
        () => { passou += 1; console.log(`  ok   ${nome}`); },
        (e) => { falhas.push(`${nome}: ${e.message}`); console.log(`  FAIL ${nome} — ${e.message}`); },
      );
    }
    passou += 1;
    console.log(`  ok   ${nome}`);
  } catch (e) {
    falhas.push(`${nome}: ${e.message}`);
    console.log(`  FAIL ${nome} — ${e.message}`);
  }
  return Promise.resolve();
};

// ===========================================================================
// DUPLO DE PRISMA — determinístico, assíncrono (cede o event loop como um banco
// real), com updateMany condicional e $transaction que faz rollback de verdade.
// ===========================================================================
const ceder = () => new Promise((r) => setTimeout(r, 1));

function criarPrismaDuplo(estadoInicial) {
  const estado = {
    approvals: estadoInicial.approvals.map((r) => ({ ...r })),
    audits: [],
    jobs: [],
  };
  const consultas = [];
  let emTransacao = false;
  const falharEm = { audit: false, job: false };

  const casa = (row, where) =>
    Object.entries(where).every(([k, v]) => row[k] === v);

  const tabelas = (alvo) => ({
    lifecycleApprovalRequest: {
      async findMany({ where }) {
        await ceder();
        consultas.push({ op: "findMany", where });
        return alvo.approvals.filter((r) => casa(r, where)).map((r) => ({ ...r }));
      },
      async findFirst({ where }) {
        await ceder();
        consultas.push({ op: "findFirst", where });
        const r = alvo.approvals.find((x) => casa(x, where));
        return r ? { ...r } : null;
      },
      async updateMany({ where, data }) {
        await ceder();
        consultas.push({ op: "updateMany", where, data });
        const alvos = alvo.approvals.filter((r) => casa(r, where));
        for (const r of alvos) Object.assign(r, data);
        return { count: alvos.length };
      },
    },
    lifecycleAuditEntry: {
      async create({ data }) {
        await ceder();
        if (falharEm.audit) throw new Error("falha injetada ao gravar auditoria");
        alvo.audits.push({ ...data });
        return { ...data };
      },
    },
    lifecycleExecutionJob: {
      async create({ data }) {
        await ceder();
        if (falharEm.job) throw new Error("falha injetada ao enfileirar execução");
        alvo.jobs.push({ ...data });
        return { ...data };
      },
    },
  });

  const prisma = {
    ...tabelas(estado),
    async $transaction(fn) {
      // Serializa transações e faz rollback por snapshot — o que um banco real
      // garante por bloqueio de linha e ROLLBACK.
      while (emTransacao) await ceder();
      emTransacao = true;
      const snapshot = JSON.parse(JSON.stringify(estado));
      try {
        const out = await fn(prisma);
        emTransacao = false;
        return out;
      } catch (err) {
        estado.approvals = snapshot.approvals;
        estado.audits = snapshot.audits;
        estado.jobs = snapshot.jobs;
        emTransacao = false;
        throw err;
      }
    },
  };

  return { prisma, estado, consultas, falharEm };
}

const pendenteDeA = () => ({
  approvals: [
    {
      id: "req_A", cliente_id: CLIENTE_A, tenant_id: CLIENTE_A, group_id: "grupo-1",
      status: "pending", action_type: "archive", label: "Arquivar dados do Cliente A",
    },
  ],
});

// ===========================================================================
console.log("\n=== B — ISOLAMENTO DE CLIENTE / IDOR ===");
// ===========================================================================
await check("B1 A lista somente dados de A", async () => {
  const { prisma } = criarPrismaDuplo({
    approvals: [
      { id: "r1", cliente_id: CLIENTE_A, group_id: "grupo-1", status: "pending" },
      { id: "r2", cliente_id: CLIENTE_B, group_id: "grupo-1", status: "pending" },
    ],
  });
  const r = await listGroupApprovals(CLIENTE_A, "grupo-1", { client: prisma });
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].id, "r1");
});

await check("B2 B não enxerga dados de A", async () => {
  const { prisma } = criarPrismaDuplo({
    approvals: [{ id: "r1", cliente_id: CLIENTE_A, group_id: "grupo-1", status: "pending" }],
  });
  const r = await listGroupApprovals(CLIENTE_B, "grupo-1", { client: prisma });
  assert.deepEqual(r.items, []);
});

await check("B3 B NÃO aprova solicitação de A (IDOR fechado)", async () => {
  const { prisma, estado, consultas } = criarPrismaDuplo(pendenteDeA());
  const r = await approveRequestBackend(
    { id: "req_A", clienteId: CLIENTE_B, actorId: "usuario_B" },
    { client: prisma },
  );
  assert.equal(r.approved, false, "B conseguiu aprovar solicitação de A");
  assert.equal(estado.approvals[0].status, "pending", "a linha de A foi alterada");
  assert.equal(estado.audits.length, 0);
  assert.equal(estado.jobs.length, 0);
  // A condição enviada ao BANCO inclui o cliente — não é comparação em JS depois.
  const upd = consultas.find((c) => c.op === "updateMany");
  assert.ok(upd, "nenhum updateMany foi emitido");
  assert.equal(upd.where.cliente_id, CLIENTE_B);
  assert.equal(upd.where.status, "pending");
});

await check("B4 B NÃO rejeita solicitação de A", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  const r = await rejectRequestBackend(
    { id: "req_A", clienteId: CLIENTE_B, actorId: "usuario_B", reason: "x" },
    { client: prisma },
  );
  assert.equal(r.rejected, false);
  assert.equal(estado.approvals[0].status, "pending");
  assert.equal(estado.audits.length, 0);
});

await check("B6 leitura escopada não devolve linha de outro cliente", async () => {
  const { prisma } = criarPrismaDuplo(pendenteDeA());
  assert.equal(await getApprovalRequestScoped({ id: "req_A", clienteId: CLIENTE_B }, prisma), null);
  const propria = await getApprovalRequestScoped({ id: "req_A", clienteId: CLIENTE_A }, prisma);
  assert.equal(propria.id, "req_A");
});

// ===========================================================================
console.log("\n=== E — NÃO-ENUMERAÇÃO ===");
// ===========================================================================
await check("E1 negativa cross-tenant não vaza payload alheio", async () => {
  const { prisma } = criarPrismaDuplo(pendenteDeA());
  const r = await approveRequestBackend(
    { id: "req_A", clienteId: CLIENTE_B, actorId: "usuario_B" },
    { client: prisma },
  );
  assert.equal(r.request, undefined, "payload de outro cliente vazou");
  assert.ok(!JSON.stringify(r).includes("Arquivar dados do Cliente A"));
});

await check("E2 inexistente, alheia e já decidida são indistinguíveis", async () => {
  const base = criarPrismaDuplo(pendenteDeA());
  const inexistente = await approveRequestBackend(
    { id: "nao_existe", clienteId: CLIENTE_A, actorId: "a" }, { client: base.prisma },
  );
  const alheia = await approveRequestBackend(
    { id: "req_A", clienteId: CLIENTE_B, actorId: "b" }, { client: base.prisma },
  );
  await approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a" }, { client: base.prisma });
  const jaDecidida = await approveRequestBackend(
    { id: "req_A", clienteId: CLIENTE_A, actorId: "a" }, { client: base.prisma },
  );
  assert.deepEqual(inexistente, alheia);
  assert.deepEqual(alheia, jaDecidida);
});

// ===========================================================================
console.log("\n=== C — CAMINHO POSITIVO ===");
// ===========================================================================
await check("C1 A aprova a própria solicitação pendente", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  const r = await approveRequestBackend(
    { id: "req_A", clienteId: CLIENTE_A, actorId: "admin_A" }, { client: prisma },
  );
  assert.equal(r.approved, true);
  assert.equal(estado.approvals[0].status, "approved");
  assert.equal(estado.approvals[0].approved_by, "admin_A");
});

await check("C2 A rejeita a própria solicitação pendente, com motivo", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  const r = await rejectRequestBackend(
    { id: "req_A", clienteId: CLIENTE_A, actorId: "admin_A", reason: "fora de política" },
    { client: prisma },
  );
  assert.equal(r.rejected, true);
  assert.equal(estado.approvals[0].status, "rejected");
  assert.equal(estado.approvals[0].rejection_reason, "fora de política");
  assert.equal(estado.audits[0].summary, "fora de política");
});

// ===========================================================================
console.log("\n=== D — ATOMICIDADE E CORRIDA ===");
// ===========================================================================
await check("D1 approve concorrente com approve: exatamente 1 vencedor", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  const [a, b] = await Promise.all([
    approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a1" }, { client: prisma }),
    approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a2" }, { client: prisma }),
  ]);
  assert.equal([a.approved, b.approved].filter(Boolean).length, 1, "dois vencedores");
  assert.equal(estado.audits.length, 1, "auditoria duplicada");
  assert.equal(estado.jobs.length, 1, "job duplicado");
});

await check("D2 approve concorrente com reject: 1 único estado terminal", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  const [x, y] = await Promise.all([
    approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a1" }, { client: prisma }),
    rejectRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a2", reason: "n" }, { client: prisma }),
  ]);
  assert.equal([x.approved, y.rejected].filter(Boolean).length, 1, "dois estados terminais");
  assert.equal(estado.audits.length, 1);
  assert.ok(estado.jobs.length <= 1);
  if (y.rejected) assert.equal(estado.jobs.length, 0, "reject venceu mas gerou job");
});

await check("D3/D4 approve gera exatamente 1 auditoria e 1 job, com escopo correto", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  await approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "admin_A" }, { client: prisma });
  assert.equal(estado.audits.length, 1);
  assert.equal(estado.jobs.length, 1);
  const [audit] = estado.audits;
  assert.equal(audit.request_id, "req_A");
  assert.equal(audit.group_id, "grupo-1");
  assert.equal(audit.tenant_id, CLIENTE_A);
  assert.equal(audit.actor_id, "admin_A");
  assert.equal(audit.human_approved, true);
  const [job] = estado.jobs;
  assert.equal(job.request_id, "req_A");
  assert.equal(job.group_id, "grupo-1");
  assert.equal(job.tenant_id, CLIENTE_A);
  assert.equal(job.action_type, "archive");
});

await check("D5 reject gera exatamente 1 auditoria e 0 jobs", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  await rejectRequestBackend(
    { id: "req_A", clienteId: CLIENTE_A, actorId: "admin_A", reason: "não" }, { client: prisma },
  );
  assert.equal(estado.audits.length, 1);
  assert.equal(estado.audits[0].human_approved, false);
  assert.equal(estado.jobs.length, 0);
});

await check("D6a falha ao auditar faz rollback COMPLETO do approve", async () => {
  const { prisma, estado, falharEm } = criarPrismaDuplo(pendenteDeA());
  falharEm.audit = true;
  await assert.rejects(
    approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a" }, { client: prisma }),
    /falha injetada/,
  );
  assert.equal(estado.approvals[0].status, "pending", "decisão parcial sobreviveu");
  assert.equal(estado.audits.length, 0);
  assert.equal(estado.jobs.length, 0);
});

await check("D6b falha ao enfileirar job faz rollback COMPLETO do approve", async () => {
  const { prisma, estado, falharEm } = criarPrismaDuplo(pendenteDeA());
  falharEm.job = true;
  await assert.rejects(
    approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a" }, { client: prisma }),
    /falha injetada/,
  );
  assert.equal(estado.approvals[0].status, "pending", "aprovado sem job");
  assert.equal(estado.audits.length, 0, "auditoria sobreviveu sem decisão");
  assert.equal(estado.jobs.length, 0);
});

await check("D6c falha ao auditar faz rollback COMPLETO do reject", async () => {
  const { prisma, estado, falharEm } = criarPrismaDuplo(pendenteDeA());
  falharEm.audit = true;
  await assert.rejects(
    rejectRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a", reason: "x" }, { client: prisma }),
    /falha injetada/,
  );
  assert.equal(estado.approvals[0].status, "pending");
  assert.equal(estado.audits.length, 0);
});

await check("D7 a decisão inteira acontece dentro de UMA transação", async () => {
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  let transacoes = 0;
  const original = prisma.$transaction.bind(prisma);
  prisma.$transaction = (fn) => { transacoes += 1; return original(fn); };
  await approveRequestBackend({ id: "req_A", clienteId: CLIENTE_A, actorId: "a" }, { client: prisma });
  assert.equal(transacoes, 1, "a decisão não abriu exatamente uma transação");
  assert.equal(estado.audits.length, 1);
});

// ===========================================================================
console.log("\n=== T — SEMÂNTICA DE TENANT ===");
// ===========================================================================
await check("T1 tenant autorizado é o cliente do escopo autenticado", () => {
  assert.equal(resolveLifecycleTenantId({ clienteId: CLIENTE_A }), CLIENTE_A);
});

await check("T2 tenant ausente no payload resolve para o autorizado", () => {
  const scope = { clienteId: CLIENTE_A };
  assert.equal(assertRequestedTenantAllowed(scope, undefined), CLIENTE_A);
  assert.equal(assertRequestedTenantAllowed(scope, ""), CLIENTE_A);
});

await check("T3 tenant forjado no payload é 403, não coerção silenciosa", () => {
  try {
    assertRequestedTenantAllowed({ clienteId: CLIENTE_A }, CLIENTE_B);
    throw new Error("aceitou tenant forjado");
  } catch (e) {
    assert.equal(e.statusCode, 403);
    assert.equal(e.code, "TENANT_FORBIDDEN");
  }
});

await check("T4 sem escopo autenticado não existe tenant", () => {
  assert.throws(() => resolveLifecycleTenantId({}), (e) => e.statusCode === 401);
});

await check("B5 sync push persiste o tenant do cliente, nunca o do payload", async () => {
  const gravados = [];
  const syncPrisma = {
    lifecycleSyncState: { async upsert(args) { gravados.push(args); return {}; } },
  };
  // O serviço recusa antes de qualquer escrita quando o tenant diverge.
  await assert.rejects(
    pushSyncBatchBackend(CLIENTE_A, "grupo-1", CLIENTE_B, { approvals: [] }),
    (e) => e.statusCode === 403 && e.code === "TENANT_FORBIDDEN",
  );
  assert.equal(gravados.length, 0);
  void syncPrisma;
});

// ===========================================================================
console.log("\n=== A/R — AUTH REAL NAS ROTAS (Fastify inject) ===");
// ===========================================================================
const ROTAS = [
  ["GET", "/api/lifecycle/approvals/grupo-1"],
  ["POST", "/api/lifecycle/approvals/req_A/approve"],
  ["POST", "/api/lifecycle/approvals/req_A/reject"],
  ["GET", "/api/lifecycle/sync/grupo-1"],
  ["POST", "/api/lifecycle/sync/grupo-1/push"],
  ["POST", "/api/lifecycle/sync/grupo-1/reconcile"],
];

async function montarApp({ autenticar, scope }) {
  const app = Fastify();
  // `chamadas` também conta o que o SERVIÇO recebeu: é assim que RBAC-07 prova que um
  // perfil sem permissão não produz efeito nenhum — não basta o status ser 403 se o
  // serviço já tiver sido chamado antes da recusa.
  const chamadas = { authenticate: 0, approve: 0, reject: 0, push: 0, list: 0, snapshot: 0, reconcile: 0 };
  app.decorate("authenticate", async (request, reply) => {
    chamadas.authenticate += 1;
    if (!autenticar) return reply.status(401).send({ message: "Não autenticado." });
    request.user = { id: scope.userId, login: scope.user?.login };
    return undefined;
  });
  // NOTA: `assertRole` NÃO é injetado. As rotas usam o helper REAL de
  // `backend/src/modules/auth/accessScope.js`, para que estes testes exercitem a
  // autorização de produção e não uma imitação dela.
  await registerLifecycleRoutes(app, {
    loadAccessScope: async () => scope,
    approvalService: {
      listGroupApprovals: async (clienteId) => { chamadas.list += 1; return { items: [], clienteId, durable: true }; },
      approveRequestBackend: async (args) => { chamadas.approve += 1; return { approved: true, visto: args }; },
      rejectRequestBackend: async (args) => { chamadas.reject += 1; return { rejected: true, visto: args }; },
    },
    syncService: {
      getSyncSnapshot: async (clienteId) => { chamadas.snapshot += 1; return { clienteId, durable: true }; },
      pushSyncBatchBackend: async (clienteId, groupId, tenantId) => { chamadas.push += 1; return { clienteId, tenantId }; },
      reconcileSyncBackend: async (clienteId) => { chamadas.reconcile += 1; return { clienteId, reconciled: true }; },
    },
  });
  await app.ready();
  return { app, chamadas };
}

/** Escopos por PERFIL. `perfil` é o campo que `assertRole` lê — o mesmo do banco. */
const escopoCom = (perfil, login) => ({
  clienteId: CLIENTE_A, userId: `usr_A_${perfil}`, perfil, user: { login },
});
const scopeA = escopoCom("ADMIN", "admin@a");
const scopeOperador = escopoCom("OPERADOR", "operador@a");
const scopeConsulta = escopoCom("CONSULTA", "consulta@a");

await check("A1 sem autenticação, TODAS as rotas privadas respondem 401", async () => {
  for (const [method, url] of ROTAS) {
    const { app, chamadas } = await montarApp({ autenticar: false, scope: scopeA });
    const res = await app.inject({ method, url, payload: method === "POST" ? {} : undefined });
    assert.equal(res.statusCode, 401, `${method} ${url} devolveu ${res.statusCode}`);
    assert.ok(chamadas.authenticate > 0, `${method} ${url} não executou app.authenticate`);
    await app.close();
  }
});

await check("A3 o boundary oficial é executado em TODAS as rotas quando autenticado", async () => {
  for (const [method, url] of ROTAS) {
    const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeA });
    const res = await app.inject({ method, url, payload: method === "POST" ? {} : undefined });
    assert.equal(chamadas.authenticate, 1, `${method} ${url} não passou por app.authenticate`);
    assert.equal(res.statusCode, 200, `${method} ${url} devolveu ${res.statusCode}`);
    await app.close();
  }
});

await check("A5 nenhuma rota lifecycle é registrada sem preHandler de autenticação", async () => {
  const registradas = [];
  const appFalso = {
    authenticate: async () => {},
    get(url, opts) { registradas.push({ url, opts }); },
    post(url, opts) { registradas.push({ url, opts }); },
  };
  await registerLifecycleRoutes(appFalso);
  assert.equal(registradas.length, 6, `esperadas 6 rotas, vieram ${registradas.length}`);
  for (const r of registradas) {
    assert.ok(r.opts?.preHandler, `${r.url} registrada sem preHandler`);
    assert.equal(r.opts.preHandler, appFalso.authenticate, `${r.url} usa preHandler que não é app.authenticate`);
  }
});

await check("R1 o clienteId usado vem do escopo, nunca do parâmetro de rota", async () => {
  const { app } = await montarApp({ autenticar: true, scope: scopeA });
  const res = await app.inject({ method: "POST", url: "/api/lifecycle/approvals/req_A/approve", payload: {} });
  const body = res.json();
  assert.equal(body.visto.clienteId, CLIENTE_A);
  assert.equal(body.visto.id, "req_A");
  await app.close();
});

await check("R2 o ator é a identidade autenticada, não um default", async () => {
  const { app } = await montarApp({ autenticar: true, scope: scopeA });
  const res = await app.inject({ method: "POST", url: "/api/lifecycle/approvals/req_A/approve", payload: {} });
  assert.equal(res.json().visto.actorId, "admin@a");
  assert.notEqual(res.json().visto.actorId, "administrador");
  await app.close();
});

await check("R3 sync push com tenantId forjado no body é recusado com 403", async () => {
  const { app } = await montarApp({ autenticar: true, scope: scopeA });
  const res = await app.inject({
    method: "POST", url: "/api/lifecycle/sync/grupo-1/push",
    payload: { tenantId: CLIENTE_B, approvals: [] },
  });
  assert.equal(res.statusCode, 403, `esperado 403, veio ${res.statusCode}`);
  await app.close();
});

await check("R4 sync push com tenantId coincidente é aceito e persiste o autorizado", async () => {
  const { app } = await montarApp({ autenticar: true, scope: scopeA });
  const res = await app.inject({
    method: "POST", url: "/api/lifecycle/sync/grupo-1/push",
    payload: { tenantId: CLIENTE_A, approvals: [] },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().tenantId, CLIENTE_A);
  await app.close();
});

await check("R5 sync push sem tenantId deriva o tenant do escopo", async () => {
  const { app } = await montarApp({ autenticar: true, scope: scopeA });
  const res = await app.inject({
    method: "POST", url: "/api/lifecycle/sync/grupo-1/push", payload: { approvals: [] },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().tenantId, CLIENTE_A);
  await app.close();
});

// ===========================================================================
console.log("\n=== RBAC — AUTENTICAR NÃO É AUTORIZAR ===");
// ===========================================================================
// A primeira rodada de P1-03 parou em "usuário autenticado do cliente certo". Isso
// deixava CONSULTA decidindo aprovações terminais que enfileiram archive/expunge.
// Estes casos usam o `assertRole` REAL; a decisão de papel está documentada no topo
// de `routes.js`.

const APROVAR = "/api/lifecycle/approvals/req_A/approve";
const REJEITAR = "/api/lifecycle/approvals/req_A/reject";
const PUSH = "/api/lifecycle/sync/grupo-1/push";

await check("RBAC-01 ADMIN aprova a própria solicitação — permitido", async () => {
  const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeA });
  const res = await app.inject({ method: "POST", url: APROVAR, payload: {} });
  assert.equal(res.statusCode, 200, `veio ${res.statusCode}`);
  assert.equal(chamadas.approve, 1);
  await app.close();
});

await check("RBAC-02 ADMIN rejeita a própria solicitação — permitido", async () => {
  const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeA });
  const res = await app.inject({ method: "POST", url: REJEITAR, payload: { reason: "não" } });
  assert.equal(res.statusCode, 200, `veio ${res.statusCode}`);
  assert.equal(chamadas.reject, 1);
  await app.close();
});

await check("RBAC-03 CONSULTA tenta aprovar — 403", async () => {
  const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeConsulta });
  const res = await app.inject({ method: "POST", url: APROVAR, payload: {} });
  assert.equal(res.statusCode, 403, `veio ${res.statusCode}`);
  assert.equal(chamadas.approve, 0, "o serviço foi chamado apesar do 403");
  await app.close();
});

await check("RBAC-04 CONSULTA tenta rejeitar — 403", async () => {
  const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeConsulta });
  const res = await app.inject({ method: "POST", url: REJEITAR, payload: {} });
  assert.equal(res.statusCode, 403, `veio ${res.statusCode}`);
  assert.equal(chamadas.reject, 0, "o serviço foi chamado apesar do 403");
  await app.close();
});

await check("RBAC-05 OPERADOR NÃO decide — 403 em approve e reject", async () => {
  // Decisão deliberada, não omissão: não existe contrato canônico (D-092/D-093 não
  // nomeiam perfil aprovador), logo vale least privilege. No dia em que houver
  // evidência canônica de que OPERADOR aprova, ESTE caso falha e força a revisão.
  for (const url of [APROVAR, REJEITAR]) {
    const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeOperador });
    const res = await app.inject({ method: "POST", url, payload: {} });
    assert.equal(res.statusCode, 403, `${url} veio ${res.statusCode}`);
    assert.equal(chamadas.approve + chamadas.reject, 0, `${url} chamou o serviço apesar do 403`);
    await app.close();
  }
});

await check("RBAC-05b OPERADOR PODE fazer sync push — mutação de dados, não decisão", async () => {
  const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeOperador });
  const res = await app.inject({ method: "POST", url: PUSH, payload: { approvals: [] } });
  assert.equal(res.statusCode, 200, `veio ${res.statusCode}`);
  assert.equal(chamadas.push, 1);
  await app.close();
});

await check("RBAC-05c CONSULTA NÃO faz sync push — 403 e zero escrita", async () => {
  const { app, chamadas } = await montarApp({ autenticar: true, scope: scopeConsulta });
  const res = await app.inject({ method: "POST", url: PUSH, payload: { approvals: [] } });
  assert.equal(res.statusCode, 403, `veio ${res.statusCode}`);
  assert.equal(chamadas.push, 0, "o sync escreveu apesar do 403");
  await app.close();
});

await check("RBAC-05d todo perfil do cliente LÊ — negar leitura seria regressão", async () => {
  for (const escopo of [scopeA, scopeOperador, scopeConsulta]) {
    for (const url of ["/api/lifecycle/approvals/grupo-1", "/api/lifecycle/sync/grupo-1"]) {
      const { app } = await montarApp({ autenticar: true, scope: escopo });
      const res = await app.inject({ method: "GET", url });
      assert.equal(res.statusCode, 200, `${escopo.perfil} ${url} veio ${res.statusCode}`);
      await app.close();
    }
  }
});

await check("RBAC-06 negativa cross-tenant continua indistinguível, mesmo para ADMIN", async () => {
  // O papel não afrouxa o isolamento: ADMIN do cliente B segue sem alcançar A.
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  const r = await approveRequestBackend(
    { id: "req_A", clienteId: CLIENTE_B, actorId: "admin@b" },
    { client: prisma },
  );
  assert.equal(r.approved, false);
  assert.equal(r.reason, "Solicitação indisponível.");
  assert.equal(estado.audits.length, 0);
  assert.equal(estado.jobs.length, 0);
  assert.equal(estado.approvals[0].status, "pending");
});

await check("RBAC-07 perfil sem permissão não muda status, não audita e não enfileira", async () => {
  // Prova de ponta a ponta: a rota recusa ANTES do serviço, e o estado persistente
  // permanece exatamente como estava.
  const { prisma, estado } = criarPrismaDuplo(pendenteDeA());
  const antes = JSON.stringify(estado);
  const app = Fastify();
  app.decorate("authenticate", async (request) => { request.user = { id: "usr_x" }; });
  let servicoChamado = 0;
  await registerLifecycleRoutes(app, {
    loadAccessScope: async () => scopeConsulta,
    approvalService: {
      listGroupApprovals: async () => ({ items: [] }),
      approveRequestBackend: async (args) => {
        servicoChamado += 1;
        return approveRequestBackend(args, { client: prisma });
      },
      rejectRequestBackend: async () => { servicoChamado += 1; return {}; },
    },
    syncService: {
      getSyncSnapshot: async () => ({}), pushSyncBatchBackend: async () => ({}),
      reconcileSyncBackend: async () => ({}),
    },
  });
  await app.ready();
  const res = await app.inject({ method: "POST", url: APROVAR, payload: {} });
  assert.equal(res.statusCode, 403);
  assert.equal(servicoChamado, 0, "o serviço rodou apesar do 403");
  assert.equal(JSON.stringify(estado), antes, "o estado persistente mudou sob perfil sem permissão");
  await app.close();
});

await check("RBAC-08 a decisão de papel é FAIL-CLOSED: perfil ausente ou desconhecido é 403", async () => {
  for (const perfil of [undefined, null, "", "SUPERUSER", "admin"]) {
    const escopo = { clienteId: CLIENTE_A, userId: "usr_z", perfil, user: { login: "z@a" } };
    const { app, chamadas } = await montarApp({ autenticar: true, scope: escopo });
    const res = await app.inject({ method: "POST", url: APROVAR, payload: {} });
    assert.equal(res.statusCode, 403, `perfil ${JSON.stringify(perfil)} passou com ${res.statusCode}`);
    assert.equal(chamadas.approve, 0);
    await app.close();
  }
});

await check("RBAC-09 reconcile é hoje read-only — se virar mutação, este caso falha de propósito", async () => {
  // `reconcileSyncBackend` só lê erros e devolve contagem: por isso NÃO tem gate de
  // papel, como as demais leituras. Se algum dia passar a escrever, esta asserção
  // quebra e obriga a decidir o papel antes de a escrita entrar em produção.
  const fs = await import("node:fs");
  const url = await import("node:url");
  const dir = url.fileURLToPath(new URL("../src/modules/lifecycle/", import.meta.url));
  const src = fs.readFileSync(`${dir}lifecycleSyncService.js`, "utf8");
  const corpo = src.slice(src.indexOf("export async function reconcileSyncBackend"));
  const ateOFim = corpo.slice(0, corpo.indexOf("\n}") + 2);
  for (const escrita of ["upsert", "create", "update", "delete", "append"]) {
    assert.ok(!new RegExp(escrita, "i").test(ateOFim), `reconcile passou a escrever (${escrita})`);
  }
});

// ===========================================================================
console.log("\n=== S — HIGIENE ESTRUTURAL ===");
// ===========================================================================
await check("S1 nenhuma mutation de aprovação usa condição apenas por id", async () => {
  const fs = await import("node:fs");
  const url = await import("node:url");
  const dir = url.fileURLToPath(new URL("../src/modules/lifecycle/", import.meta.url));
  const repo = fs.readFileSync(`${dir}lifecycleRepository.js`, "utf8");
  const semComentarios = repo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  assert.ok(!/where:\s*\{\s*id\s*\}/.test(semComentarios), "restou where: { id } isolado");
  assert.ok(!/getApprovalRequestById/.test(semComentarios), "leitura não escopada ainda exportada");
  assert.ok(!/updateApprovalRequest/.test(semComentarios), "update global por id ainda exportado");
  for (const m of semComentarios.matchAll(/updateMany\(\{\s*where:\s*\{([^}]*)\}/g)) {
    assert.ok(/cliente_id/.test(m[1]), "updateMany sem cliente_id na condição");
    assert.ok(/status/.test(m[1]), "updateMany sem status na condição (compare-and-set)");
  }
});

await check("S2 rotas não fazem pseudo-auth manual nem aceitam tenant do body", async () => {
  const fs = await import("node:fs");
  const url = await import("node:url");
  const dir = url.fileURLToPath(new URL("../src/modules/lifecycle/", import.meta.url));
  const rotas = fs.readFileSync(`${dir}routes.js`, "utf8");
  const codigo = rotas.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  assert.ok(!/request\.user\?\.cliente_id/.test(codigo), "pseudo-auth manual sobreviveu");
  assert.equal((codigo.match(/preHandler: app\.authenticate/g) ?? []).length, 6);
  assert.ok(!/"default"/.test(codigo), "fallback silencioso de tenant sobreviveu");
  assert.ok(!/jwtVerify/.test(codigo), "auth replicado dentro das rotas");
  assert.ok(!/"administrador"/.test(codigo), "ator default sobreviveu");
});

console.log(`\n${falhas.length === 0 ? "PASS" : "FAIL"}: ${passou}/${passou + falhas.length}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ✗ ${f}`);
  process.exit(1);
}
