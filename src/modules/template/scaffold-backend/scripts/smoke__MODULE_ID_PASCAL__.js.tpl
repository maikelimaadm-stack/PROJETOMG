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
  const empresaId = session.selectedEmpresaId || "all";

  const listResult = await requestJson("/api/__MODULE_ID__?page=1&pageSize=10", {
    token,
    empresaId,
  });

  if (!listResult.ok) {
    throw new Error(`Falha na listagem inicial do módulo __MODULE_ID__: ${listResult.status}`);
  }

  console.log("Smoke __MODULE_ID__ concluído com sucesso.");
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

