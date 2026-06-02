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

const login = async ({ usuario = "demo", senha = "123" } = {}) => {
  const { ok, payload, status } = await requestJson("/api/auth/login", {
    method: "POST",
    body: { cliente: "demo", usuario, senha },
  });
  if (!ok || !payload?.token) {
    throw new Error(`Falha de login (${usuario}) no smoke avançado: ${status}`);
  }
  return payload;
};

const uploadTextFile = async ({ token, empresaId, content }) => {
  const boundary = `----smoke-${Date.now()}`;
  const bodyParts = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="smoke.txt"',
    "Content-Type: text/plain",
    "",
    content,
    `--${boundary}--`,
    "",
  ];
  const response = await fetch(`${BASE_URL}/api/anexos/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Empresa-Id": empresaId,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: bodyParts.join("\r\n"),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Upload de anexo falhou (${response.status}): ${payload?.message || "sem payload"}`);
  }
  return payload;
};

const run = async () => {
  const adminSession = await login({ usuario: "demo", senha: "123" });
  const restrictedSession = await login({ usuario: "consulta", senha: "123" });

  const adminToken = adminSession.token;
  const restrictedToken = restrictedSession.token;
  const empresaA = adminSession.empresas?.[0];
  assert(empresaA?.id, "Empresa principal não encontrada para smoke avançado.");

  const createEmpresaResult = await requestJson("/api/empresas", {
    method: "POST",
    token: adminToken,
    empresaId: "all",
    body: {
      razao_social: `EMPRESA SECUNDARIA FAZENDAS ${Date.now()}`,
      nome_fantasia: "EMPRESA SECUNDARIA FAZENDAS",
      status: "Ativa",
    },
  });
  assert(createEmpresaResult.ok, "Falha ao criar empresa secundária para teste de escopo.");
  const empresaB = createEmpresaResult.payload.item;

  const createFieldResult = await requestJson("/api/fazendas/campos", {
    method: "POST",
    token: adminToken,
    empresaId: empresaA.id,
    body: {
      field_name: `area_total_${Date.now()}`.slice(0, 28),
      label: "Área Total (ha)",
      tipo: "number",
      obrigatorio: true,
      visivel_form: true,
      visivel_tabela: true,
      usar_decimal: true,
      decimal_places: 2,
      ativo: true,
    },
  });
  assert(createFieldResult.ok, "Falha ao criar campo personalizado de fazendas.");
  const createdField = createFieldResult.payload.item;

  const createFazendaResult = await requestJson("/api/fazendas", {
    method: "POST",
    token: adminToken,
    empresaId: empresaA.id,
    body: {
      nome: `FAZENDA TESTE ${Date.now()}`,
      status: "Ativo",
      observacoes: "Registro criado no smoke avançado.",
      campos_personalizados: {
        [createdField.field_name]: "125,50",
      },
    },
  });
  assert(createFazendaResult.ok, "Falha ao criar fazenda com campo personalizado.");
  const createdFazenda = createFazendaResult.payload.item;
  assert(createdFazenda?.id, "Registro da fazenda não retornou ID.");

  const readFazendaResult = await requestJson(`/api/fazendas/${createdFazenda.id}`, {
    token: adminToken,
    empresaId: empresaA.id,
  });
  assert(readFazendaResult.ok, "Falha ao consultar fazenda criada.");
  assert(
    readFazendaResult.payload.item?.campos_personalizados?.[createdField.field_name] != null,
    "Campo personalizado não persistiu na fazenda."
  );

  const uploadResult = await uploadTextFile({
    token: adminToken,
    empresaId: empresaA.id,
    content: "arquivo de smoke fazendas",
  });

  const createAttachmentResult = await requestJson("/api/anexos", {
    method: "POST",
    token: adminToken,
    empresaId: empresaA.id,
    body: {
      entity_name: "FazendaCadastro",
      record_id: createdFazenda.id,
      empresa_id: empresaA.id,
      attachment_name: "Comprovante smoke",
      file_name: "smoke.txt",
      file_url: uploadResult.file_url,
      file_type: "text/plain",
      file_size: 22,
      storage_path: uploadResult.storage_path,
      provider: uploadResult.provider,
    },
  });
  assert(
    createAttachmentResult.ok,
    `Falha ao vincular anexo em fazendas (${createAttachmentResult.status}): ${createAttachmentResult.payload?.message || "sem payload"}`
  );
  const createdAttachment = createAttachmentResult.payload.item;

  const listAttachmentResult = await requestJson(
    `/api/anexos?entityName=FazendaCadastro&recordId=${createdFazenda.id}`,
    { token: adminToken, empresaId: empresaA.id }
  );
  assert(listAttachmentResult.ok, "Falha ao listar anexos da fazenda.");
  assert(
    (listAttachmentResult.payload.items || []).some((item) => item.id === createdAttachment.id),
    "Anexo criado não apareceu na listagem."
  );

  const forbiddenMutationResult = await requestJson("/api/fazendas", {
    method: "POST",
    token: restrictedToken,
    empresaId: empresaA.id,
    body: {
      nome: "FAZENDA BLOQUEADA",
      status: "Ativo",
      observacoes: "RBAC teste",
    },
  });
  assert(
    forbiddenMutationResult.status === 403,
    `RBAC falhou: usuário consulta conseguiu criar fazenda (${forbiddenMutationResult.status}).`
  );

  const scopeProbeResult = await requestJson("/api/fazendas", {
    token: restrictedToken,
    empresaId: empresaB.id,
  });
  assert(
    scopeProbeResult.status === 403,
    `Escopo multiempresa falhou: consulta acessou empresa não permitida (${scopeProbeResult.status}).`
  );

  const listEmpresaBResult = await requestJson("/api/fazendas", {
    token: adminToken,
    empresaId: empresaB.id,
  });
  assert(listEmpresaBResult.ok, "Admin não conseguiu listar escopo da empresa secundária.");
  assert(
    !(listEmpresaBResult.payload.items || []).some((item) => item.id === createdFazenda.id),
    "Registro vazou para empresa diferente."
  );

  const deleteAttachmentResult = await requestJson(`/api/anexos/${createdAttachment.id}`, {
    method: "DELETE",
    token: adminToken,
    empresaId: empresaA.id,
  });
  assert(deleteAttachmentResult.ok, "Falha ao remover anexo da fazenda.");

  const deleteFazendaResult = await requestJson(`/api/fazendas/${createdFazenda.id}`, {
    method: "DELETE",
    token: adminToken,
    empresaId: empresaA.id,
  });
  assert(deleteFazendaResult.ok, "Falha ao remover fazenda do smoke avançado.");

  const deleteFieldResult = await requestJson(`/api/fazendas/campos/${createdField.id}`, {
    method: "DELETE",
    token: adminToken,
    empresaId: empresaA.id,
  });
  assert(deleteFieldResult.ok, "Falha ao remover campo personalizado de fazendas.");

  await requestJson(`/api/empresas/${empresaB.id}`, {
    method: "DELETE",
    token: adminToken,
    empresaId: "all",
  });

  console.log("Smoke avançado de fazendas concluído com sucesso.");
};

run().catch((error) => {
  console.error(`Smoke avançado de fazendas falhou: ${error.message}`);
  process.exit(1);
});
