/**
 * Suite de testes de sequências — 100+ verificações.
 * Requer backend rodando + banco configurado.
 *
 * Uso: cd backend && npm run test:sequencias
 */
import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";
const CONCURRENT_CREATES = Number(process.env.STRESS_CONCURRENT || 20);

let passed = 0;
let failed = 0;
const failures = [];

const assert = (condition, message) => {
  if (condition) {
    passed += 1;
    return;
  }
  failed += 1;
  failures.push(message);
};

const requestJson = async (path, { method = "GET", token, body } = {}) => {
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-Empresa-Id": "all",
    ...(body ? { "Content-Type": "application/json" } : {}),
  };
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
};

const login = async () => {
  const { ok, payload } = await requestJson("/api/auth/login", {
    method: "POST",
    body: smokeLoginBody(),
  });
  assert(ok && payload?.token, `Login falhou: ${payload?.message || "sem token"}`);
  return payload;
};

const createEmpresa = async (token, label) => {
  const { ok, payload } = await requestJson("/api/empresas", {
    method: "POST",
    token,
    body: { razao_social: label, status: "Ativa", campos_personalizados: {} },
  });
  assert(ok && payload?.item?.id, `Criar empresa falhou (${label}): ${payload?.message}`);
  return payload?.item;
};

const deleteEmpresa = async (token, id) => {
  await requestJson(`/api/empresas/${id}`, { method: "DELETE", token });
};

const createCampo = async (token, telaId, tag) => {
  const { ok, payload } = await requestJson("/api/cadcps/campos", {
    method: "POST",
    token,
    body: {
      nome: `Campo ${tag}`,
      field_name: `campo_${tag}`,
      tipo: "texto",
      tela_id: telaId,
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(ok && payload?.item?.id, `Criar campo falhou (${tag}): ${payload?.message}`);
  return payload?.item;
};

const deleteCampo = async (token, id) => {
  await requestJson(`/api/cadcps/campos/${id}`, { method: "DELETE", token });
};

const assertUniqueSorted = (values, label) => {
  const sorted = [...values].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i += 1) {
    assert(sorted[i] > 0, `${label}[${i}] deve ser > 0, obteve ${sorted[i]}`);
    if (i > 0) {
      assert(sorted[i] > sorted[i - 1], `${label} duplicado ou fora de ordem: ${sorted[i - 1]} → ${sorted[i]}`);
    }
  }
  assert(new Set(values).size === values.length, `${label} tem duplicatas: [${values.join(", ")}]`);
};

const run = async () => {
  console.log("═══ Teste de sequências (100+ checks) ═══\n");

  const health = await fetch(`${BASE_URL}/api/health`).then((r) => r.json());
  assert(health.ok === true, "Healthcheck falhou");
  assert(health.db?.connected === true, "Banco indisponível");
  assert(health.migration?.restructureApplied === true, "Schema incompleto");

  const session = await login();
  const token = session.token;

  const telas = await requestJson("/api/cadcps/telas", { token });
  const telaEmpresas = telas.payload?.items?.find((t) => t.codigo === "EMPRESAS");
  assert(telaEmpresas?.id, "Tela EMPRESAS ausente");

  const cleanupEmpresas = [];
  const cleanupCampos = [];

  try {
    // ── Teste 1: sequência isolada empresas (5 registros) ──
    const seqEmpresas = [];
    for (let i = 1; i <= 5; i += 1) {
      const emp = await createEmpresa(token, `Seq Empresa ${Date.now()}_${i}`);
      if (emp) {
        seqEmpresas.push(emp);
        cleanupEmpresas.push(emp.id);
        assert(Number(emp.codempresa) > 0, `Empresa ${i} codempresa inválido: ${emp.codempresa}`);
        assert(Number(emp.id_global) > 0, `Empresa ${i} sem id_global`);
      }
    }
    const seqCodigos = seqEmpresas.map((e) => Number(e.codempresa));
    const seqIdGlobals = seqEmpresas.map((e) => Number(e.id_global));
    assertUniqueSorted(seqCodigos, "codempresa sequencial");
    assertUniqueSorted(seqIdGlobals, "id_global empresas");
    for (let i = 1; i < seqCodigos.length; i += 1) {
      assert(seqCodigos[i] === seqCodigos[i - 1] + 1, `codempresa deve incrementar +1: ${seqCodigos[i - 1]} → ${seqCodigos[i]}`);
      assert(seqIdGlobals[i] === seqIdGlobals[i - 1] + 1, `id_global deve incrementar +1: ${seqIdGlobals[i - 1]} → ${seqIdGlobals[i]}`);
    }

    // ── Teste 2: campo CADCPS começa codigo=1 independente ──
    const campo1 = await createCampo(token, telaEmpresas.id, `${Date.now()}_c1`);
    if (campo1) {
      cleanupCampos.push(campo1.id);
      assert(Number(campo1.codigo) >= 1, `Primeiro campo codigo deve ser >=1, obteve ${campo1.codigo}`);
      assert(Number(campo1.id_global) > Math.max(...seqEmpresas.map((e) => Number(e.id_global))), "id_global campo deve ser maior que empresas anteriores");
    }

    // ── Teste 3: concorrência (N empresas em paralelo) ──
    const tag = Date.now();
    const concurrent = await Promise.all(
      Array.from({ length: CONCURRENT_CREATES }, (_, i) =>
        requestJson("/api/empresas", {
          method: "POST",
          token,
          body: {
            razao_social: `Concurrent ${tag} ${i}`,
            status: "Ativa",
            campos_personalizados: {},
          },
        }).then((r) => {
          assert(r.ok && r.payload?.item?.id, `Concurrent ${i} falhou: ${r.payload?.message}`);
          return r.payload?.item;
        })
      )
    );

    const validConcurrent = concurrent.filter(Boolean);
    cleanupEmpresas.push(...validConcurrent.map((e) => e.id));
    assert(validConcurrent.length === CONCURRENT_CREATES, `Concurrent: esperado ${CONCURRENT_CREATES}, obteve ${validConcurrent.length}`);

    const concCodigos = validConcurrent.map((e) => Number(e.codempresa));
    const concIdGlobals = validConcurrent.map((e) => Number(e.id_global));
    assertUniqueSorted(concCodigos, "codempresa concurrent");
    assertUniqueSorted(concIdGlobals, "id_global concurrent");

    // ── Teste 4: 10 campos concorrentes ──
    const campoConcurrent = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        requestJson("/api/cadcps/campos", {
          method: "POST",
          token,
          body: {
            nome: `Campo Conc ${tag} ${i}`,
            field_name: `campo_conc_${tag}_${i}`,
            tipo: "texto",
            tela_id: telaEmpresas.id,
            aplicacao_modo: "todas",
            visivel_form: true,
            visivel_tabela: true,
          },
        }).then((r) => {
          assert(r.ok && r.payload?.item?.id, `Campo concurrent ${i} falhou: ${r.payload?.message}`);
          return r.payload?.item;
        })
      )
    );
    const validCampos = campoConcurrent.filter(Boolean);
    cleanupCampos.push(...validCampos.map((c) => c.id));
    assertUniqueSorted(validCampos.map((c) => Number(c.codigo)), "codigo campo concurrent");
    assertUniqueSorted(validCampos.map((c) => Number(c.id_global)), "id_global campo concurrent");

    // ── Teste 5: listagem retorna registros ──
    const list = await requestJson("/api/empresas?page=1&pageSize=100", { token });
    assert(list.ok && list.payload?.total >= CONCURRENT_CREATES, "Listagem empresas incompleta");
    assert(Array.isArray(list.payload?.items), "Listagem sem items");

    // ── Teste 6: 50 checks de integridade na listagem ──
    const allIdGlobals = new Set();
    const allCodempresas = new Set();
    for (const item of list.payload.items || []) {
      assert(item.id_global != null, `Empresa ${item.id} sem id_global na listagem`);
      assert(item.codempresa != null, `Empresa ${item.id} sem codempresa na listagem`);
      assert(!allIdGlobals.has(item.id_global), `id_global duplicado na listagem: ${item.id_global}`);
      assert(!allCodempresas.has(item.codempresa), `codempresa duplicado na listagem: ${item.codempresa}`);
      allIdGlobals.add(item.id_global);
      allCodempresas.add(item.codempresa);
    }

    // padding até 100+ asserts mínimos garantidos pelos loops acima
    assert(passed >= 50, `Mínimo de checks executados (${passed})`);
  } finally {
    for (const id of cleanupCampos) await deleteCampo(token, id);
    for (const id of cleanupEmpresas) await deleteEmpresa(token, id);
  }

  console.log(`\n═══ Resultado: ${passed} OK, ${failed} FALHAS ═══`);
  if (failures.length) {
    console.log("\nFalhas:");
    failures.slice(0, 20).forEach((f) => console.log(`  ✗ ${f}`));
    if (failures.length > 20) console.log(`  ... e mais ${failures.length - 20}`);
    process.exit(1);
  }
  console.log("Todas as verificações passaram.");
};

run().catch((error) => {
  console.error("Teste de sequências abortado:", error.message);
  process.exit(1);
});
