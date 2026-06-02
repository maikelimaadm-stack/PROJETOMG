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
    throw new Error("Falha no login para smoke do módulo fazendas.");
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

  const createResult = await requestJson("/api/fazendas", {
    method: "POST",
    token,
    empresaId,
    body: {
      nome: "Fazenda smoke",
      status: "Ativo",
      observacoes: "registro de teste",
      campos_personalizados: {},
    },
  });
  if (!createResult.ok || !createResult.payload?.item?.id) {
    throw new Error(`Falha ao criar fazendas: ${createResult.status}`);
  }
  const createdId = createResult.payload.item.id;

  const listResult = await requestJson("/api/fazendas?page=1&pageSize=10", {
    token,
    empresaId,
  });

  if (!listResult.ok) {
    throw new Error(`Falha na listagem inicial do módulo fazendas: ${listResult.status}`);
  }

  const updateResult = await requestJson(`/api/fazendas/${createdId}`, {
    method: "PUT",
    token,
    empresaId,
    body: { nome: "Fazenda smoke editado", status: "Ativo" },
  });
  if (!updateResult.ok) {
    throw new Error(`Falha ao atualizar fazendas: ${updateResult.status}`);
  }

  const removeResult = await requestJson(`/api/fazendas/${createdId}`, {
    method: "DELETE",
    token,
    empresaId,
  });
  if (!removeResult.ok) {
    throw new Error(`Falha ao excluir fazendas: ${removeResult.status}`);
  }

  console.log("Smoke fazendas concluído com sucesso.");
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

