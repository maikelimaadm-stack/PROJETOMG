#!/usr/bin/env node
/**
 * Gate G403 — Lifecycle Security Isolation (P1-03)
 *
 * Executa a bateria adversarial do backend e, além dela, afirma diretamente as
 * propriedades estruturais que a fatia P1-03 fecha. Um gate que apenas delegasse ao
 * teste seria um alias; este também reprova se a FORMA do código regredir.
 *
 * Por que vive no agregado `gate:deploy-pipeline`: é o único agregado de validação de
 * BACKEND que o workflow do CI de fato executa — `gate:capabilities`, onde G324/G325
 * moram, não é executado pelo workflow. A alternativa seria acrescentar um step em
 * `.github/workflows/foundation-governance.yml`, que hoje pertence à Slice 49 do
 * Studio scope governance; fazer uma correção de segurança de backend depender de
 * ampliar a propriedade sobre `.github/**` seria pior. Um backend com IDOR
 * cross-tenant não deve chegar ao deploy, então o agregado é coerente.
 *
 * Read-only. Sem rede, sem banco, sem dependência nova. Falha fechada: exit 1.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIFECYCLE = path.join(ROOT, "backend/src/modules/lifecycle");
const SUITE_REL = "backend/scripts/testLifecycleSecurityIsolation.js";

let passed = 0;
const failures = [];
const gate = (id, cond, detail = "") => {
  if (cond) { passed += 1; console.log(`✓ ${id}${detail ? ` — ${detail}` : ""}`); return; }
  failures.push(`${id}${detail ? ` — ${detail}` : ""}`);
  console.log(`✗ ${id}${detail ? ` — ${detail}` : ""}`);
};
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
/** Varre CÓDIGO, não prosa: estes arquivos citam o defeito removido para documentá-lo. */
const code = (rel) =>
  read(rel).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

console.log("=== G403 — Lifecycle Security Isolation ===\n");

/* ---------------- artefatos ---------------- */
gate("G403-A01 — bateria adversarial presente", fs.existsSync(path.join(ROOT, SUITE_REL)));
gate("G403-A02 — módulo de tenant presente", fs.existsSync(path.join(LIFECYCLE, "lifecycleTenant.js")));

/* ---------------- auth real nas rotas ---------------- */
const rotas = code("backend/src/modules/lifecycle/routes.js");
gate("G403-B01 — as seis rotas privadas declaram preHandler: app.authenticate",
  (rotas.match(/preHandler: app\.authenticate/g) ?? []).length === 6,
  String((rotas.match(/preHandler: app\.authenticate/g) ?? []).length));
gate("G403-B02 — nenhum pseudo-auth manual por request.user",
  !/request\.user\?\.cliente_id/.test(rotas));
gate("G403-B03 — auth não é replicado dentro das rotas",
  !/jwtVerify/.test(rotas) && !/isAuthTokenRevoked/.test(rotas));
gate("G403-B04 — escopo confiável vem de loadAccessScope", /loadAccessScope/.test(rotas));
gate("G403-B05 — ator é a identidade autenticada, sem default", !/"administrador"/.test(rotas));

/* ---------------- RBAC: autenticar não é autorizar ---------------- */
gate("G403-B06 — as rotas de decisão exigem PAPEL, não só identidade",
  /assertRole|requireRole/.test(rotas),
  "nenhuma verificação de papel nas rotas");
gate("G403-B07 — o papel vem do helper central, sem RBAC paralelo",
  /from "\.\.\/auth\/accessScope\.js"/.test(rotas) && /assertRole/.test(rotas)
  && !/perfil\s*===/.test(rotas) && !/\.perfil\s*!==/.test(rotas));
// Comportamental: importa a tabela de papéis REAL em vez de procurar literais.
const rotasMod = await import(
  new URL("../backend/src/modules/lifecycle/routes.js", import.meta.url).href
);
gate("G403-B08 — decisão terminal é ADMIN-only (least privilege)",
  JSON.stringify(rotasMod.LIFECYCLE_DECISION_ROLES) === JSON.stringify(["ADMIN"]),
  JSON.stringify(rotasMod.LIFECYCLE_DECISION_ROLES));
gate("G403-B09 — CONSULTA não decide e não escreve no sync",
  !rotasMod.LIFECYCLE_DECISION_ROLES.includes("CONSULTA")
  && !rotasMod.LIFECYCLE_SYNC_WRITE_ROLES.includes("CONSULTA"));
gate("G403-B10 — a escrita de sync é mutação ordinária: ADMIN + OPERADOR",
  JSON.stringify(rotasMod.LIFECYCLE_SYNC_WRITE_ROLES) === JSON.stringify(["ADMIN", "OPERADOR"]),
  JSON.stringify(rotasMod.LIFECYCLE_SYNC_WRITE_ROLES));
gate("G403-B11 — as duas tabelas de papel são congeladas",
  Object.isFrozen(rotasMod.LIFECYCLE_DECISION_ROLES)
  && Object.isFrozen(rotasMod.LIFECYCLE_SYNC_WRITE_ROLES));
gate("G403-B12 — o papel é checado ANTES de chamar o serviço no sync push", (() => {
  const inicio = rotas.indexOf("sync/:groupId/push");
  const i = rotas.indexOf("LIFECYCLE_SYNC_WRITE_ROLES", inicio);
  const j = rotas.indexOf("pushSyncBatchBackend(", inicio);
  return inicio > 0 && i > inicio && j > i;
})());

/* ---------------- tenant: contrato do LIFECYCLE, autoridade server-side ---------------- */
// A primeira versão deste gate certificava "tenant == cliente" como semântica universal
// do Lifecycle. Isso projetava a regra do MMM sobre outro bounded context: o contrato
// do Lifecycle (businessDnaStore, lifecycleContextAssembly, approvalWorkflowEngine,
// G323/G324/G325) separa ownerClientId, groupId, authorizedTenantIds[] e tenantId.
gate("G403-C01 — tenant do payload não é autoridade; a rota apenas repassa a declaração",
  !/assertRequestedTenantAllowed/.test(rotas) && !/request\.body\?\.tenantId\s*\?\?/.test(rotas)
  && /tenantAuthority/.test(rotas));
gate("G403-C02 — sem fallback \"default\" e sem o modelo antigo em rota/serviço/tenant",
  !/"default"/.test(rotas)
  && ["routes.js", "lifecycleService.js", "lifecycleSyncService.js", "lifecycleTenant.js"]
    .every((f) => !/resolveLifecycleTenantId|assertRequestedTenantAllowed|assertTenantMatchesCliente/
      .test(code(`backend/src/modules/lifecycle/${f}`))));
const tenantMod = await import(
  new URL("../backend/src/modules/lifecycle/lifecycleTenant.js", import.meta.url).href
);
const autoridadeAB = { async isTenantAuthorizedInGroup({ clienteId, groupId, tenantId }) {
  return clienteId === "owner-A" && groupId === "group-1" && ["tenant-A", "tenant-B"].includes(tenantId);
} };
const tenta = async (args, aut) => {
  try { return { ok: await tenantMod.authorizeLifecycleTenant(args, aut) }; }
  catch (e) { return { erro: e }; }
};
gate("G403-C03 — tenant-A ≠ owner-A NÃO é automaticamente proibido: com autoridade, é legítimo", (
  await Promise.all([
    tenta({ ownerClientId: "owner-A", groupId: "group-1", requestedTenantId: "tenant-A" }, autoridadeAB),
    tenta({ ownerClientId: "owner-A", groupId: "group-1", requestedTenantId: "tenant-B" }, autoridadeAB),
  ])).every((r) => r.ok?.basis === "group_scope"));
gate("G403-C03b — tenant não autorizado pela autoridade → 403 TENANT_FORBIDDEN",
  (await tenta({ ownerClientId: "owner-A", groupId: "group-1", requestedTenantId: "tenant-C" }, autoridadeAB))
    .erro?.code === tenantMod.TENANT_FORBIDDEN);
gate("G403-C03c — owner-B não herda o group de owner-A",
  (await tenta({ ownerClientId: "owner-B", groupId: "group-1", requestedTenantId: "tenant-A" }, autoridadeAB))
    .erro?.code === tenantMod.TENANT_FORBIDDEN);
gate("G403-C03d — tenant ausente → 400 REQUIRED: nunca derivado, nunca default", (
  await Promise.all([undefined, null, ""].map((t) =>
    tenta({ ownerClientId: "owner-A", groupId: "group-1", requestedTenantId: t }, autoridadeAB))))
  .every((r) => r.erro?.statusCode === 400 && r.erro?.code === tenantMod.LIFECYCLE_TENANT_REQUIRED));
gate("G403-C03e — tenant igual ao owner autenticado é aceito pela identidade, não por coerção",
  (await tenta({ ownerClientId: "owner-A", groupId: "group-1", requestedTenantId: "owner-A" })).ok?.basis === "owner_identity");
gate("G403-C03f — a autoridade de PRODUÇÃO não sabe responder, e não saber é recusa fail-closed", (
  await tenantMod.NO_LIFECYCLE_TENANT_AUTHORITY.isTenantAuthorizedInGroup({ clienteId: "owner-A", groupId: "group-1", tenantId: "tenant-A" })) === null
  && (await tenta({ ownerClientId: "owner-A", groupId: "group-1", requestedTenantId: "tenant-A" }))
    .erro?.code === tenantMod.LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE
  && tenantMod.LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE !== tenantMod.TENANT_FORBIDDEN);
const sync = code("backend/src/modules/lifecycle/lifecycleSyncService.js");
gate("G403-C04 — o serviço decide o tenant na fronteira de escrita, via autoridade",
  /authorizeLifecycleTenant/.test(sync) && /NO_LIFECYCLE_TENANT_AUTHORITY/.test(sync)
  // duas fronteiras de escrita, duas chamadas: push e divergência
  && (sync.match(/resolveTenantForWrite\(/g) ?? []).length === 2);
gate("G403-C04b — o serviço nunca lê authorizedTenantIds/ownerClientId do payload",
  !/batch\??\.(authorizedTenantIds|ownerClientId)/.test(sync)
  && !/partial\??\.(authorizedTenantIds|ownerClientId)/.test(sync)
  && !/authorizedTenantIds/.test(sync));
const engine = code("src/intelligence/lifecycle/sync/lifecycleSyncEngine.js");
gate("G403-C05 — o frontend DECLARA tenantId no push e não transmite autoridade", (() => {
  const i = engine.indexOf("await pushSyncBatch(");
  if (i < 0) return false;
  const chamada = engine.slice(i, engine.indexOf("{ clienteId, useMemory }", i));
  return /\btenantId,/.test(chamada) && !/authorizedTenantIds|ownerClientId/.test(chamada);
})());
gate("G403-C06 — produção registra as rotas sem deps: nenhuma autoridade/papel entra por fora",
  /registerLifecycleRoutes\(app\)/.test(read("backend/src/routes/index.js"))
  && !/registerLifecycleRoutes\(app,/.test(read("backend/src/routes/index.js")));
gate("G403-C07 — a seam deps.assertRole foi removida", !/deps\.assertRole/.test(rotas));
const schema = read("backend/prisma/schema.prisma");
const repoSync = code("backend/src/modules/lifecycle/lifecycleSyncRepository.js");
gate("G403-C08 — LifecycleSyncState é único por (cliente, group, TENANT, entity)",
  /@@unique\(\[cliente_id, group_id, tenant_id, entity_type, entity_id\]\)/.test(schema)
  && /cliente_id_group_id_tenant_id_entity_type_entity_id/.test(repoSync)
  && fs.existsSync(path.join(ROOT, "backend/prisma/migrations/20260910130000_lifecycle_sync_state_tenant_scoped_unique/migration.sql")));

/* ---------------- scoping no banco ---------------- */
const repo = code("backend/src/modules/lifecycle/lifecycleRepository.js");
gate("G403-D01 — nenhuma leitura/mutation por id isolado", !/where:\s*\{\s*id\s*\}/.test(repo));
gate("G403-D02 — leitura não escopada removida", !/getApprovalRequestById/.test(repo));
gate("G403-D03 — update global por id removido", !/updateApprovalRequest/.test(repo));
gate("G403-D04 — toda condição de decisão inclui cliente_id e status", (() => {
  const conds = [...repo.matchAll(/updateMany\(\{\s*where:\s*\{([^}]*)\}/g)].map((m) => m[1]);
  return conds.length > 0 && conds.every((c) => /cliente_id/.test(c) && /status/.test(c));
})());
gate("G403-D05 — leitura escopada exige cliente_id",
  /findFirst\(\{\s*\n?\s*where:\s*\{\s*id,\s*cliente_id/.test(repo) || /where:\s*\{\s*id,\s*cliente_id:\s*clienteId\s*\}/.test(repo));

/* ---------------- atomicidade ---------------- */
gate("G403-E01 — a decisão roda dentro de $transaction", /\$transaction/.test(repo));
gate("G403-E02 — auditoria e job vivem na MESMA transação", (() => {
  const i = repo.indexOf("$transaction");
  if (i < 0) return false;
  const bloco = repo.slice(i);
  return /lifecycleAuditEntry\.create/.test(bloco) && /lifecycleExecutionJob\.create/.test(bloco);
})());
gate("G403-E03 — nada é gravado quando a transição não ocorre",
  /transitioned\.count !== 1/.test(repo));
gate("G403-E04 — audit/job herdam escopo da linha escopada, não do payload",
  /tenant_id: request\.tenant_id/.test(repo) && /group_id: request\.group_id/.test(repo));

/* ---------------- higiene ---------------- */
for (const rel of [
  "backend/src/modules/lifecycle/routes.js",
  "backend/src/modules/lifecycle/lifecycleService.js",
  "backend/src/modules/lifecycle/lifecycleRepository.js",
  "backend/src/modules/lifecycle/lifecycleSyncService.js",
  "backend/src/modules/lifecycle/lifecycleTenant.js",
  SUITE_REL,
]) {
  const src = code(rel);
  gate(`G403-F01 — sem escape de teste em ${path.basename(rel)}`,
    !/\.skip\(|\.only\(|\bTODO\b/.test(src) && !/\|\| true/.test(src));
}

/* ---------------- a bateria adversarial ---------------- */
console.log("\n--- bateria adversarial (backend/scripts) ---");
const suite = spawnSync("node", [SUITE_REL], {
  cwd: ROOT, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024,
});
if (suite.error) {
  gate("G403-G01 — bateria adversarial executável", false, suite.error.message);
} else {
  const out = `${suite.stdout ?? ""}${suite.stderr ?? ""}`;
  const resumo = out.split("\n").filter((l) => /^(PASS|FAIL):/.test(l)).pop() ?? "(sem resumo)";
  if (suite.status !== 0) process.stdout.write(out);
  gate("G403-G01 — bateria adversarial verde", suite.status === 0, resumo);
}

console.log(`\nPASS: ${passed}/${passed + failures.length}`);
if (failures.length > 0) {
  console.log(`FAIL: ${failures.length}`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log("\nGATE G403 FAILED");
  process.exit(1);
}
console.log("\nGATE G403 PASSED");
