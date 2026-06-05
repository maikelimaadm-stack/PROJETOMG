import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";
let authToken = null;
let selectedEmpresaHeader = "all";

const login = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(smokeLoginBody()),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`login falhou ${response.status}: ${payload?.message || "sem payload"}`);
  }
  if (!payload?.token) {
    throw new Error("login sem token");
  }

  authToken = payload.token;
  selectedEmpresaHeader = payload.selectedEmpresaId || "all";
};

const requestJson = async (path, { method = "GET", empresaId = selectedEmpresaHeader, body } = {}) => {
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  if (empresaId) headers["X-Empresa-Id"] = empresaId;
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(`${method} ${path} falhou com ${response.status}: ${payload?.message || "sem payload"}`);
  }

  return payload;
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  console.log("Iniciando smoke test Empresas...");

  await login();

  const health = await fetch(`${BASE_URL}/api/health`).then((r) => r.json());
  assert(health.ok === true, "healthcheck não está saudável");
  assert(health.migration?.restructureApplied === true, "schema ERP incompleto");

  const empresaA = await requestJson("/api/empresas", {
    method: "POST",
    body: {
      razao_social: "Empresa Alfa",
      nome_fantasia: "Alfa",
      status: "Ativa",
      cidade: "Sao Paulo",
      campos_personalizados: {},
    },
  });
  const empresaB = await requestJson("/api/empresas", {
    method: "POST",
    body: {
      razao_social: "Empresa Beta",
      nome_fantasia: "Beta",
      status: "Inativa",
      cidade: "Rio de Janeiro",
      campos_personalizados: {},
    },
  });
  assert(empresaA.item?.id && empresaB.item?.id, "falha ao criar empresas");
  assert(Number(empresaA.item.id_global) > 0, "empresa A sem id_global");
  assert(Number(empresaB.item.id_global) > Number(empresaA.item.id_global), "id_global não sequencial");
  assert(Number(empresaB.item.codempresa) > Number(empresaA.item.codempresa), "codempresa não sequencial");

  const listPaged = await requestJson(
    "/api/empresas?page=1&pageSize=1&sortBy=razao_social&sortDir=asc&search=Empresa"
  );
  assert(listPaged.total >= 2, "total paginado incorreto");
  assert(listPaged.items.length === 1, "pageSize não aplicado");

  const listFiltered = await requestJson(
    `/api/empresas?page=1&pageSize=10&filters=${encodeURIComponent(JSON.stringify({ status: "Inativa" }))}`
  );
  assert(
    listFiltered.items.every((item) => item.status === "Inativa"),
    "filtro por status não retornou apenas itens inativos"
  );

  const selectedEmpresa = await requestJson("/api/empresas?page=1&pageSize=20", {
    empresaId: empresaA.item.id,
  });
  assert(
    selectedEmpresa.items.some((item) => item.id === empresaA.item.id),
    "empresa criada não encontrada na listagem do cadastro"
  );

  const updateWithOtherHeader = await requestJson(`/api/empresas/${empresaB.item.id}`, {
    method: "PUT",
    empresaId: empresaA.item.id,
    body: {
      ...empresaB.item,
      razao_social: "Empresa Beta Atualizada",
    },
  });
  assert(
    updateWithOtherHeader.item?.razao_social === "Empresa Beta Atualizada",
    "update de empresa falhou com header de outra empresa"
  );

  const deleteWithOtherHeader = await requestJson(`/api/empresas/${empresaB.item.id}`, {
    method: "DELETE",
    empresaId: empresaA.item.id,
  });
  assert(deleteWithOtherHeader.ok === true, "delete de empresa falhou com header de outra empresa");

  const updated = await requestJson(`/api/empresas/${empresaA.item.id}`, {
    method: "PUT",
    body: {
      ...empresaA.item,
      razao_social: "Empresa Alfa Atualizada",
      status: "Ativa",
    },
  });
  assert(updated.item?.razao_social === "Empresa Alfa Atualizada", "update de empresa falhou");

  const camposList = await requestJson("/api/empresas/campos");
  assert(Array.isArray(camposList.items), "listagem de campos aplicáveis falhou");

  await requestJson(`/api/empresas/${empresaA.item.id}`, { method: "DELETE" });

  console.log("Smoke test Empresas finalizado com sucesso.");
};

run().catch((error) => {
  console.error(`Smoke test falhou: ${error.message}`);
  process.exit(1);
});
