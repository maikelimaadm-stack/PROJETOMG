import dotenv from "dotenv";

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
  return { status: response.status, ok: response.ok, payload };
};

const login = async ({ usuario = "demo", senha = "123" }) => {
  const result = await requestJson("/api/auth/login", {
    method: "POST",
    body: { cliente: "demo", usuario, senha },
  });
  if (!result.ok || !result.payload?.token) {
    throw new Error(`Falha ao autenticar ${usuario} para probe de segurança.`);
  }
  return result.payload;
};

const run = async () => {
  const admin = await login({ usuario: "demo", senha: "123" });
  const consulta = await login({ usuario: "consulta", senha: "123" });

  const empresaPermitidaConsulta = consulta.empresas?.[0]?.id;
  assert(empresaPermitidaConsulta, "Usuário consulta sem empresa permitida.");

  const createEmpresaExtra = await requestJson("/api/empresas", {
    method: "POST",
    token: admin.token,
    empresaId: "all",
    body: {
      razao_social: `EMPRESA PROBE ${Date.now()}`,
      nome_fantasia: "EMPRESA PROBE",
      status: "Ativa",
    },
  });
  assert(createEmpresaExtra.ok, "Não foi possível criar empresa para probe.");
  const empresaNaoPermitida = createEmpresaExtra.payload.item.id;

  const forgedHeader = await requestJson("/api/empresas", {
    token: consulta.token,
    empresaId: empresaNaoPermitida,
  });
  assert(
    forgedHeader.status === 403,
    `Bypass de empresa detectado: consulta acessou empresa não autorizada (${forgedHeader.status}).`
  );

  const allScopeProbe = await requestJson("/api/empresas", {
    token: consulta.token,
    empresaId: "all",
  });
  assert(
    allScopeProbe.status === 403,
    `Bypass de escopo global detectado para usuário sem acesso global (${allScopeProbe.status}).`
  );

  const malformedTokenProbe = await requestJson("/api/empresas", {
    token: `${consulta.token}tampered`,
    empresaId: empresaPermitidaConsulta,
  });
  assert(
    malformedTokenProbe.status === 401,
    `Token inválido aceito indevidamente (${malformedTokenProbe.status}).`
  );

  const noTokenProbe = await requestJson("/api/empresas", {
    empresaId: empresaPermitidaConsulta,
  });
  assert(noTokenProbe.status === 401, `Rota protegida aceitou request sem token (${noTokenProbe.status}).`);

  await requestJson(`/api/empresas/${empresaNaoPermitida}`, {
    method: "DELETE",
    token: admin.token,
    empresaId: "all",
  });

  console.log("Probe de intrusão multiempresa concluído com sucesso.");
};

run().catch((error) => {
  console.error(`Probe de intrusão falhou: ${error.message}`);
  process.exit(1);
});
