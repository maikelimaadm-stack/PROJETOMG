import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requestJson = async (path, { method = "GET", token, body, empresaId } = {}) => {
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
  if (!ok || !payload?.token) throw new Error("Falha no login smoke CADCPS.");
  return payload;
};

const run = async () => {
  const session = await login();
  const token = session.token;
  const empresaId = session.selectedEmpresaId === "all" ? session.empresas?.[0]?.id : session.selectedEmpresaId;

  const telas = await requestJson("/api/cadcps/telas", { token });
  assert(telas.ok && telas.payload?.items?.length > 0, "Falha ao listar telas CADCPS.");

  const telaEmpresas = telas.payload.items.find((t) => t.codigo === "EMPRESAS");
  assert(telaEmpresas?.id, "Tela EMPRESAS não encontrada.");

  const tag = Date.now();
  const create = await requestJson("/api/cadcps/campos", {
    method: "POST",
    token,
    body: {
      nome: `Campo Smoke ${tag}`,
      field_name: `campo_smoke_${tag}`,
      tipo: "texto",
      tela_id: telaEmpresas.id,
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(create.ok, `Falha criar campo (${create.status})`);
  const campoId = create.payload?.item?.id;
  assert(campoId, "Campo criado sem id.");

  const getOne = await requestJson(`/api/cadcps/campos/${campoId}`, { token });
  assert(getOne.ok, "Falha ao consultar campo.");

  const update = await requestJson(`/api/cadcps/campos/${campoId}`, {
    method: "PUT",
    token,
    body: { descricao: "Atualizado smoke", obrigatorio: true },
  });
  assert(update.ok, `Falha atualizar (${update.status})`);

  const aplicavel = await requestJson("/api/cadcps/aplicavel/EmpresaCadastro", {
    token,
    empresaId: empresaId || "all",
  });
  assert(aplicavel.ok, "Falha listar aplicável EmpresaCadastro.");
  assert(
    (aplicavel.payload?.items || []).some((item) => item.field_name === create.payload.item.field_name),
    "Campo não apareceu na listagem aplicável."
  );

  const list = await requestJson("/api/cadcps/campos?page=1&pageSize=10", { token });
  assert(list.ok && list.payload?.items?.length > 0, "Falha listagem paginada.");

  const historico = await requestJson(`/api/cadcps/campos/${campoId}/historico`, { token });
  assert(historico.ok, "Falha histórico.");

  const remove = await requestJson(`/api/cadcps/campos/${campoId}`, { method: "DELETE", token });
  assert(remove.ok, `Falha excluir (${remove.status})`);

  console.log("Smoke CADCPS: OK");
};

run().catch((error) => {
  console.error("Smoke CADCPS falhou:", error.message);
  process.exit(1);
});
