import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";

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
    body: { cliente: "demo", usuario: "demo", senha: "123" },
  });
  if (!ok || !payload?.token) {
    throw new Error("Falha no login para smoke do módulo __MODULE_ID__.");
  }
  return payload;
};

const run = async () => {
  const session = await login();
  const token = session.token;
  const empresaId = session.selectedEmpresaId === "all"
    ? session.empresas?.[0]?.id
    : session.selectedEmpresaId || session.empresas?.[0]?.id;
  if (!empresaId) throw new Error("Nenhuma empresa disponível para smoke.");

  const createResult = await requestJson("/api/__MODULE_ID__", {
    method: "POST",
    token,
    empresaId,
    body: {
      nome: "__SINGULAR_LABEL__ smoke",
      status: "Ativo",
      observacoes: "registro de teste",
      campos_personalizados: {},
    },
  });
  if (!createResult.ok || !createResult.payload?.item?.id) {
    throw new Error(`Falha ao criar __MODULE_ID__: ${createResult.status}`);
  }
  const createdId = createResult.payload.item.id;

  const listResult = await requestJson("/api/__MODULE_ID__?page=1&pageSize=10", {
    token,
    empresaId,
  });

  if (!listResult.ok) {
    throw new Error(`Falha na listagem inicial do módulo __MODULE_ID__: ${listResult.status}`);
  }

  const updateResult = await requestJson(`/api/__MODULE_ID__/${createdId}`, {
    method: "PUT",
    token,
    empresaId,
    body: { nome: "__SINGULAR_LABEL__ smoke editado", status: "Ativo" },
  });
  if (!updateResult.ok) {
    throw new Error(`Falha ao atualizar __MODULE_ID__: ${updateResult.status}`);
  }

  const removeResult = await requestJson(`/api/__MODULE_ID__/${createdId}`, {
    method: "DELETE",
    token,
    empresaId,
  });
  if (!removeResult.ok) {
    throw new Error(`Falha ao excluir __MODULE_ID__: ${removeResult.status}`);
  }

  console.log("Smoke __MODULE_ID__ concluído com sucesso.");
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

