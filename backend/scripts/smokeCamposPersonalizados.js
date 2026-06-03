import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requestJson = async (path, { method = "GET", token, empresaId, body } = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(empresaId ? { "X-Empresa-Id": empresaId } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
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
  if (!ok || !payload?.token) throw new Error("Falha no login para smoke de campos.");
  return payload;
};

const run = async () => {
  const tag = Date.now();
  const session = await login();
  const token = session.token;
  const empresaA = session.empresas?.[0];
  const empresaB = session.empresas?.[1] || session.empresas?.[0];
  assert(empresaA?.id, "Empresa A não disponível.");

  const telas = await requestJson("/api/cadcps/telas", { token });
  assert(telas.ok, "Falha ao listar telas.");
  const telaEmpresas = telas.payload.items.find((t) => t.codigo === "EMPRESAS");
  assert(telaEmpresas?.id, "Tela EMPRESAS ausente.");

  const globalFieldName = `campo_global_${tag}`;
  const specificFieldName = `campo_empresa_${tag}`;

  const createGlobal = await requestJson("/api/cadcps/campos", {
    method: "POST",
    token,
    body: {
      nome: `Campo Global ${tag}`,
      field_name: globalFieldName,
      tipo: "texto",
      tela_ids: [telaEmpresas.id],
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(createGlobal.ok, `Falha ao criar campo global (${createGlobal.status}).`);

  const createSpecific = await requestJson("/api/cadcps/campos", {
    method: "POST",
    token,
    body: {
      nome: `Campo Empresa ${tag}`,
      field_name: specificFieldName,
      tipo: "texto",
      tela_ids: [telaEmpresas.id],
      aplicacao_modo: "especificas",
      empresa_ids: [empresaA.id],
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(createSpecific.ok, `Falha ao criar campo específico (${createSpecific.status}).`);

  const listEmpresaA = await requestJson("/api/empresas/campos?mode=aplicavel", {
    token,
    empresaId: empresaA.id,
  });
  assert(listEmpresaA.ok, "Falha ao listar campos aplicáveis empresa A.");
  const namesA = (listEmpresaA.payload?.items || []).map((c) => c.field_name);
  assert(namesA.includes(globalFieldName), "Campo global ausente na empresa A.");
  assert(namesA.includes(specificFieldName), "Campo específico ausente na empresa A.");

  if (empresaB?.id && empresaB.id !== empresaA.id) {
    const listEmpresaB = await requestJson("/api/empresas/campos?mode=aplicavel", {
      token,
      empresaId: empresaB.id,
    });
    assert(listEmpresaB.ok, "Falha ao listar campos aplicáveis empresa B.");
    const namesB = (listEmpresaB.payload?.items || []).map((c) => c.field_name);
    assert(namesB.includes(globalFieldName), "Campo global ausente na empresa B.");
    assert(!namesB.includes(specificFieldName), "Campo específico não deveria aparecer na empresa B.");
  }

  await requestJson(`/api/cadcps/campos/${createGlobal.payload.item.id}`, {
    method: "DELETE",
    token,
  });
  await requestJson(`/api/cadcps/campos/${createSpecific.payload.item.id}`, {
    method: "DELETE",
    token,
  });

  console.log("Smoke campos personalizados (CADCPS): OK");
};

run().catch((error) => {
  console.error("Smoke campos falhou:", error.message);
  process.exit(1);
});
