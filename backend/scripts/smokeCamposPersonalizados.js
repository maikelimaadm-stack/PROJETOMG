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
  return { ok: response.ok, status: response.status, payload };
};

const login = async () => {
  const { ok, payload } = await requestJson("/api/auth/login", {
    method: "POST",
    body: { cliente: "demo", usuario: "demo", senha: "123" },
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

  const globalFieldName = `campo_global_${tag}`;
  const specificFieldName = `campo_empresa_${tag}`;

  const createGlobal = await requestJson("/api/empresas/campos", {
    method: "POST",
    token,
    empresaId: empresaA.id,
    body: {
      field_name: globalFieldName,
      label: `Campo Global ${tag}`,
      tipo: "text",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(createGlobal.ok, `Falha ao criar campo global (${createGlobal.status}).`);

  const createSpecific = await requestJson("/api/empresas/campos", {
    method: "POST",
    token,
    empresaId: empresaA.id,
    body: {
      field_name: specificFieldName,
      label: `Campo Empresa ${tag}`,
      tipo: "text",
      aplicacao_modo: "empresa",
      empresa_id: empresaA.id,
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(createSpecific.ok, `Falha ao criar campo específico (${createSpecific.status}).`);

  const listEmpresaA = await requestJson("/api/empresas/campos?mode=aplicavel", {
    token,
    empresaId: empresaA.id,
  });
  assert(listEmpresaA.ok, "Falha ao listar campos aplicáveis na empresa A.");
  const namesA = (listEmpresaA.payload.items || []).map((item) => item.field_name);
  assert(namesA.includes(globalFieldName), "Campo global não apareceu na empresa A.");
  assert(namesA.includes(specificFieldName), "Campo específico não apareceu na empresa A.");

  if (empresaB?.id && empresaB.id !== empresaA.id) {
    const listEmpresaB = await requestJson("/api/empresas/campos?mode=aplicavel", {
      token,
      empresaId: empresaB.id,
    });
    assert(listEmpresaB.ok, "Falha ao listar campos aplicáveis na empresa B.");
    const namesB = (listEmpresaB.payload.items || []).map((item) => item.field_name);
    assert(namesB.includes(globalFieldName), "Campo global não apareceu na empresa B.");
    assert(!namesB.includes(specificFieldName), "Campo específico vazou para empresa B.");
  }

  const createRecord = await requestJson("/api/empresas", {
    method: "POST",
    token,
    empresaId: empresaA.id,
    body: {
      razao_social: `EMPRESA CAMPOS ${tag}`,
      status: "Ativa",
      campos_personalizados: {
        [globalFieldName]: "valor global",
        [specificFieldName]: "valor empresa",
      },
    },
  });
  assert(
    createRecord.ok,
    `Falha ao criar registro com campos (${createRecord.status}): ${createRecord.payload?.message || "sem mensagem"}`
  );
  const recordId = createRecord.payload.item.id;

  const blockDelete = await requestJson(`/api/empresas/campos/${createGlobal.payload.item.id}`, {
    method: "DELETE",
    token,
    empresaId: empresaA.id,
  });
  assert(blockDelete.status === 409, "Campo com registros filhos deveria bloquear exclusão.");

  const blockUpdate = await requestJson(`/api/empresas/campos/${createGlobal.payload.item.id}`, {
    method: "PUT",
    token,
    empresaId: empresaA.id,
    body: { label: "Tentativa de edição bloqueada" },
  });
  assert(blockUpdate.status === 409, "Campo com registros filhos deveria bloquear edição.");

  await requestJson(`/api/empresas/${recordId}`, {
    method: "DELETE",
    token,
    empresaId: recordId,
  });

  const deleteGlobal = await requestJson(`/api/empresas/campos/${createGlobal.payload.item.id}`, {
    method: "DELETE",
    token,
    empresaId: empresaA.id,
  });
  assert(deleteGlobal.ok, "Campo global deveria excluir após remover registros.");

  const deleteSpecific = await requestJson(`/api/empresas/campos/${createSpecific.payload.item.id}`, {
    method: "DELETE",
    token,
    empresaId: empresaA.id,
  });
  assert(deleteSpecific.ok, "Campo específico deveria excluir após remover registros.");

  console.log("Smoke de campos personalizados concluído com sucesso.");
};

run().catch((error) => {
  console.error(`Smoke de campos personalizados falhou: ${error.message}`);
  process.exit(1);
});
