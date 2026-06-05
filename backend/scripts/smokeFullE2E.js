import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requestJson = async (path, { method = "GET", token, empresaId = "all", body } = {}) => {
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(empresaId ? { "X-Empresa-Id": empresaId } : {}),
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
  const { ok, status, payload } = await requestJson("/api/auth/login", {
    method: "POST",
    body: smokeLoginBody(),
  });
  assert(ok && payload?.token, `Login falhou (${status}): ${payload?.message || "sem token"}`);
  return payload;
};

const run = async () => {
  console.log("═══ Smoke E2E completo ═══");

  const health = await fetch(`${BASE_URL}/api/health`).then((r) => r.json());
  assert(health.ok === true, "Healthcheck falhou");
  assert(health.db?.connected === true, `Banco indisponível: ${health.db?.error || "?"}`);
  assert(
    health.migration?.restructureApplied === true,
    "Schema ERP incompleto — rode ensureSchema ou resetAndSeedMaike.sql no Supabase"
  );
  console.log("✓ Health + schema OK");

  const session = await login();
  const token = session.token;
  console.log(`✓ Login OK — cliente ${session.cliente?.codigo}, usuário ${session.user?.login}`);

  const createdEmpresas = [];
  for (const nome of ["Empresa E2E Alfa", "Empresa E2E Beta", "Empresa E2E Gama"]) {
    const { ok, payload } = await requestJson("/api/empresas", {
      method: "POST",
      token,
      body: { razao_social: nome, status: "Ativa", campos_personalizados: {} },
    });
    assert(ok && payload?.item?.id, `Falha ao criar ${nome}: ${payload?.message}`);
    createdEmpresas.push(payload.item);
  }

  const idGlobals = createdEmpresas.map((e) => Number(e.id_global));
  const codigos = createdEmpresas.map((e) => Number(e.codempresa));
  console.log(`  ID Global sequencial: [${idGlobals.join(", ")}]`);
  console.log(`  Código empresa sequencial: [${codigos.join(", ")}]`);

  for (let i = 0; i < createdEmpresas.length; i += 1) {
    assert(Number.isFinite(idGlobals[i]) && idGlobals[i] > 0, `id_global inválido em ${createdEmpresas[i].razao_social}`);
    assert(Number.isFinite(codigos[i]) && codigos[i] > 0, `codempresa inválido em ${createdEmpresas[i].razao_social}`);
    if (i > 0) {
      assert(idGlobals[i] > idGlobals[i - 1], `id_global não é sequencial: ${idGlobals[i - 1]} → ${idGlobals[i]}`);
      assert(codigos[i] > codigos[i - 1], `codempresa não é sequencial: ${codigos[i - 1]} → ${codigos[i]}`);
    }
  }
  console.log("✓ Empresas criadas com ID Global e código sequenciais");

  const telas = await requestJson("/api/cadcps/telas", { token });
  assert(telas.ok && telas.payload?.items?.length > 0, "Telas CADCPS ausentes");
  const telaEmpresas = telas.payload.items.find((t) => t.codigo === "EMPRESAS");
  assert(telaEmpresas?.id, "Tela EMPRESAS ausente no CADCPS");

  const tag = Date.now();
  const campo = await requestJson("/api/cadcps/campos", {
    method: "POST",
    token,
    body: {
      nome: `Campo E2E ${tag}`,
      field_name: `campo_e2e_${tag}`,
      tipo: "texto",
      tela_id: telaEmpresas.id,
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(campo.ok && campo.payload?.item?.id, `Falha ao criar campo CADCPS: ${campo.payload?.message}`);
  assert(Number(campo.payload.item.id_global) > 0, "Campo CADCPS sem id_global");
  console.log(`✓ Campo CADCPS criado — id_global=${campo.payload.item.id_global}`);

  const list = await requestJson("/api/empresas?page=1&pageSize=50", { token });
  assert(list.ok && list.payload?.total >= 3, "Listagem de empresas incompleta");
  console.log(`✓ Listagem OK — ${list.payload.total} empresa(s)`);

  await requestJson(`/api/cadcps/campos/${campo.payload.item.id}`, { method: "DELETE", token });
  for (const emp of createdEmpresas) {
    await requestJson(`/api/empresas/${emp.id}`, { method: "DELETE", token });
  }
  console.log("✓ Limpeza dos registros de teste");

  console.log("═══ Smoke E2E: TUDO OK ═══");
};

run().catch((error) => {
  console.error(`Smoke E2E falhou: ${error.message}`);
  process.exit(1);
});
