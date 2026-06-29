import dotenv from "dotenv";
import { SMOKE_CLIENTE, SMOKE_SENHA, SMOKE_USUARIO, smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requestJson = async (path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, ok: response.ok, payload };
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.log("[smoke-mdp-entities] SKIP — DATABASE_URL ausente.");
    return;
  }

  const login = await requestJson("/api/auth/login", {
    method: "POST",
    body: smokeLoginBody(),
  });
  assert(login.ok, `Login falhou: ${login.payload?.message || login.status}`);
  const token = login.payload?.token;
  assert(token, "Token ausente.");

  const list = await requestJson("/api/mdp/entities?runtimeOnly=true", { token });
  assert(list.ok, `Listagem MDP falhou: ${list.payload?.message || list.status}`);
  assert(list.payload?.total >= 2, "Esperado >= 2 entidades runtime.");

  const empresas = list.payload.items.find((item) => item.moduleId === "empresas");
  assert(empresas?.entityId === "EmpresaCadastro", "EmpresaCadastro ausente na listagem.");

  const detail = await requestJson(`/api/mdp/entities/${empresas.id}`, { token });
  assert(detail.ok, "Detalhe empresas falhou.");
  assert(detail.payload?.persistence?.prismaModel === "Empresa", "Persistence binding inválido.");

  console.log("[smoke-mdp-entities] OK");
};

run().catch((error) => {
  console.error("[smoke-mdp-entities] FATAL:", error.message);
  process.exit(1);
});
