import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";
const tenantPrimary = `smoke-${Date.now()}`;
const tenantSecondary = `${tenantPrimary}-other`;

const requestJson = async (path, { method = "GET", tenantId = tenantPrimary, body } = {}) => {
  const headers = {
    "X-Tenant-Id": tenantId,
  };
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

const requestUpload = async (fileName, content, tenantId = tenantPrimary) => {
  const form = new FormData();
  const file = new File([content], fileName, { type: "text/plain" });
  form.append("file", file);
  const response = await fetch(`${BASE_URL}/api/anexos/upload`, {
    method: "POST",
    headers: {
      "X-Tenant-Id": tenantId,
    },
    body: form,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`upload falhou ${response.status}: ${payload?.message || "sem payload"}`);
  }
  if (!payload.file_url) {
    throw new Error("upload retornou sem file_url");
  }
  return payload;
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  console.log("Iniciando smoke test Empresas...");

  const health = await fetch(`${BASE_URL}/api/health`).then((r) => r.json());
  assert(health.ok === true, "healthcheck não está saudável");

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
  const empresaOtherTenant = await requestJson("/api/empresas", {
    method: "POST",
    tenantId: tenantSecondary,
    body: {
      razao_social: "Empresa Outro Tenant",
      nome_fantasia: "Outro",
      status: "Ativa",
      cidade: "Curitiba",
      campos_personalizados: {},
    },
  });

  assert(empresaA.item?.id && empresaB.item?.id, "falha ao criar empresas no tenant principal");
  assert(empresaOtherTenant.item?.id, "falha ao criar empresa no tenant secundário");

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

  const tenantIsolation = await requestJson("/api/empresas?page=1&pageSize=20", {
    tenantId: tenantSecondary,
  });
  assert(
    tenantIsolation.items.length === 1 && tenantIsolation.items[0].id === empresaOtherTenant.item.id,
    "isolamento de tenant falhou"
  );

  const updated = await requestJson(`/api/empresas/${empresaA.item.id}`, {
    method: "PUT",
    body: {
      ...empresaA.item,
      razao_social: "Empresa Alfa Atualizada",
      status: "Ativa",
    },
  });
  assert(updated.item?.razao_social === "Empresa Alfa Atualizada", "update de empresa falhou");

  const campo = await requestJson("/api/empresas/campos", {
    method: "POST",
    body: {
      field_name: `campo_smoke_${Date.now()}`,
      label: "Campo Smoke",
      tipo: "text",
      visivel_form: true,
      visivel_tabela: true,
      ativo: true,
      ordem_tabela: 10,
    },
  });
  assert(campo.item?.id, "create campo personalizado falhou");

  const camposList = await requestJson("/api/empresas/campos");
  assert(camposList.items.some((item) => item.id === campo.item.id), "campo não encontrado na listagem");

  const campoUpdated = await requestJson(`/api/empresas/campos/${campo.item.id}`, {
    method: "PUT",
    body: {
      ...campo.item,
      label: "Campo Smoke Atualizado",
    },
  });
  assert(campoUpdated.item?.label === "Campo Smoke Atualizado", "update de campo falhou");

  const upload = await requestUpload("smoke.txt", "smoke-upload");
  const anexo = await requestJson("/api/anexos", {
    method: "POST",
    body: {
      entity_name: "EmpresaCadastro",
      record_id: empresaA.item.id,
      empresa_id: empresaA.item.id,
      attachment_name: "Arquivo Smoke",
      file_name: "smoke.txt",
      file_url: upload.file_url,
      file_type: "text/plain",
      file_size: 12,
    },
  });
  assert(anexo.item?.id, "create anexo falhou");

  const anexosList = await requestJson(
    `/api/anexos?entityName=EmpresaCadastro&recordId=${encodeURIComponent(empresaA.item.id)}`
  );
  assert(anexosList.items.some((item) => item.id === anexo.item.id), "anexo não encontrado na listagem");

  await requestJson(`/api/anexos/${anexo.item.id}`, { method: "DELETE" });
  await requestJson(`/api/empresas/campos/${campo.item.id}`, { method: "DELETE" });
  await requestJson(`/api/empresas/${empresaA.item.id}`, { method: "DELETE" });
  await requestJson(`/api/empresas/${empresaB.item.id}`, { method: "DELETE" });
  await requestJson(`/api/empresas/${empresaOtherTenant.item.id}`, {
    method: "DELETE",
    tenantId: tenantSecondary,
  });

  console.log("Smoke test Empresas finalizado com sucesso.");
};

run().catch((error) => {
  console.error(`Smoke test falhou: ${error.message}`);
  process.exit(1);
});

