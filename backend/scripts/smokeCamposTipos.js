import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";
const CAMPOS_PATH = "/api/cadcps/campos";

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
    body: smokeLoginBody(),
  });
  if (!ok || !payload?.token) throw new Error("Falha no login para smoke de tipos de campo.");
  return payload;
};

const buildFieldDefinitions = (tag) => [
  {
    key: "text",
    body: {
      field_name: `tipo_text_${tag}`,
      label: `Texto ${tag}`,
      tipo: "text",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
    initialValue: "valor texto",
    updatedValue: "valor texto editado",
  },
  {
    key: "textarea",
    body: {
      field_name: `tipo_textarea_${tag}`,
      label: `Observação ${tag}`,
      tipo: "textarea",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
    initialValue: "observação longa",
    updatedValue: "observação editada",
  },
  {
    key: "number",
    body: {
      field_name: `tipo_number_${tag}`,
      label: `Número ${tag}`,
      tipo: "number",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
      usar_decimal: true,
      decimal_places: 2,
    },
    initialValue: "125,50",
    updatedValue: "200,75",
  },
  {
    key: "date",
    body: {
      field_name: `tipo_date_${tag}`,
      label: `Data ${tag}`,
      tipo: "date",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
    initialValue: "2024-01-15",
    updatedValue: "2024-06-20",
  },
  {
    key: "time",
    body: {
      field_name: `tipo_time_${tag}`,
      label: `Hora ${tag}`,
      tipo: "time",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
    initialValue: "08:30",
    updatedValue: "14:45",
  },
  {
    key: "datetime",
    body: {
      field_name: `tipo_datetime_${tag}`,
      label: `Data/Hora ${tag}`,
      tipo: "datetime",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
    initialValue: "2024-01-15T10:00",
    updatedValue: "2024-06-20T16:30",
  },
  {
    key: "select",
    body: {
      field_name: `tipo_select_${tag}`,
      label: `Lista ${tag}`,
      tipo: "select",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
      opcoes: [
        { label: "Opção A", value: "A" },
        { label: "Opção B", value: "B" },
      ],
    },
    initialValue: "A",
    updatedValue: "B",
  },
  {
    key: "option_list",
    body: {
      field_name: `tipo_option_list_${tag}`,
      label: `Lista Opções ${tag}`,
      tipo: "option_list",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
      opcoes: [
        { label: "Item X", value: "X" },
        { label: "Item Y", value: "Y" },
      ],
    },
    initialValue: "X",
    updatedValue: "Y",
  },
];

const runFieldTypeCycle = async ({ token, empresaId, fieldDef }) => {
  const createField = await requestJson(CAMPOS_PATH, {
    method: "POST",
    token,
    body: fieldDef.body,
  });
  assert(createField.ok, `[${fieldDef.key}] falha ao criar campo (${createField.status}).`);
  const createdField = createField.payload.item;
  const fieldName = createdField.field_name;

  const createRecord = await requestJson("/api/empresas", {
    method: "POST",
    token,
    empresaId,
    body: {
      razao_social: `EMPRESA TIPO ${fieldDef.key.toUpperCase()} ${Date.now()}`,
      status: "Ativa",
      campos_personalizados: { [fieldName]: fieldDef.initialValue },
    },
  });
  assert(createRecord.ok, `[${fieldDef.key}] falha ao incluir registro (${createRecord.status}).`);
  const recordId = createRecord.payload.item.id;

  const readRecord = await requestJson(`/api/empresas/${recordId}`, { token, empresaId: recordId });
  assert(readRecord.ok, `[${fieldDef.key}] falha ao consultar registro.`);
  assert(
    readRecord.payload.item?.campos_personalizados?.[fieldName] != null,
    `[${fieldDef.key}] valor não persistiu após inclusão.`
  );

  const blockDelete = await requestJson(`${CAMPOS_PATH}/${createdField.id}`, {
    method: "DELETE",
    token,
    empresaId,
  });
  assert(blockDelete.status === 409, `[${fieldDef.key}] exclusão deveria bloquear com registros filhos.`);

  const blockUpdate = await requestJson(`${CAMPOS_PATH}/${createdField.id}`, {
    method: "PUT",
    token,
    empresaId,
    body: { label: "Tentativa bloqueada" },
  });
  assert(blockUpdate.status === 409, `[${fieldDef.key}] edição deveria bloquear com registros filhos.`);

  const updateRecord = await requestJson(`/api/empresas/${recordId}`, {
    method: "PUT",
    token,
    empresaId: recordId,
    body: {
      campos_personalizados: {
        ...createRecord.payload.item.campos_personalizados,
        [fieldName]: fieldDef.updatedValue,
      },
    },
  });
  assert(updateRecord.ok, `[${fieldDef.key}] falha ao editar registro (${updateRecord.status}).`);

  await requestJson(`/api/empresas/${recordId}`, { method: "DELETE", token, empresaId: recordId });

  const deleteField = await requestJson(`${CAMPOS_PATH}/${createdField.id}`, {
    method: "DELETE",
    token,
    empresaId,
  });
  assert(deleteField.ok, `[${fieldDef.key}] falha ao excluir campo após remover registros.`);

  return createdField;
};

const runCalculadoCycle = async ({ token, empresaId, tag }) => {
  const baseAName = `tipo_calc_base_a_${tag}`;
  const baseBName = `tipo_calc_base_b_${tag}`;
  const calcName = `tipo_calculado_${tag}`;

  const createBaseA = await requestJson(CAMPOS_PATH, {
    method: "POST",
    token,
    empresaId,
    body: {
      field_name: baseAName,
      label: `Base A ${tag}`,
      tipo: "number",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  const createBaseB = await requestJson(CAMPOS_PATH, {
    method: "POST",
    token,
    empresaId,
    body: {
      field_name: baseBName,
      label: `Base B ${tag}`,
      tipo: "number",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(createBaseA.ok && createBaseB.ok, "[calculado] falha ao criar campos base.");

  const createCalc = await requestJson(CAMPOS_PATH, {
    method: "POST",
    token,
    empresaId,
    body: {
      field_name: calcName,
      label: `Calculado ${tag}`,
      tipo: "calculado",
      aplicacao_modo: "todas",
      visivel_form: true,
      visivel_tabela: true,
      formula: `${baseAName} * ${baseBName}`,
      read_only: true,
    },
  });
  assert(createCalc.ok, `[calculado] falha ao criar campo (${createCalc.status}).`);
  const calcField = createCalc.payload.item;

  const createRecord = await requestJson("/api/empresas", {
    method: "POST",
    token,
    empresaId,
    body: {
      razao_social: `EMPRESA CALCULADO ${tag}`,
      status: "Ativa",
      campos_personalizados: {
        [baseAName]: "10",
        [baseBName]: "5",
      },
    },
  });
  assert(createRecord.ok, "[calculado] falha ao incluir registro.");
  const recordId = createRecord.payload.item.id;

  const blockDelete = await requestJson(`${CAMPOS_PATH}/${calcField.id}`, {
    method: "DELETE",
    token,
    empresaId,
  });
  assert(blockDelete.status === 409, "[calculado] exclusão deveria bloquear com registros filhos.");

  await requestJson(`/api/empresas/${recordId}`, { method: "DELETE", token, empresaId: recordId });

  await requestJson(`${CAMPOS_PATH}/${calcField.id}`, { method: "DELETE", token, empresaId });
  await requestJson(`${CAMPOS_PATH}/${createBaseA.payload.item.id}`, { method: "DELETE", token, empresaId });
  await requestJson(`${CAMPOS_PATH}/${createBaseB.payload.item.id}`, { method: "DELETE", token, empresaId });
};

const run = async () => {
  const tag = Date.now();
  const session = await login();
  const token = session.token;
  const empresaId = session.empresas?.[0]?.id;
  assert(empresaId, "Empresa não disponível para smoke de tipos.");

  const definitions = buildFieldDefinitions(tag);
  for (const fieldDef of definitions) {
    await runFieldTypeCycle({ token, empresaId, fieldDef });
  }
  await runCalculadoCycle({ token, empresaId, tag });

  const specificFieldName = `tipo_empresa_${tag}`;
  const createSpecific = await requestJson(CAMPOS_PATH, {
    method: "POST",
    token,
    body: {
      field_name: specificFieldName,
      label: `Campo Empresa ${tag}`,
      tipo: "text",
      aplicacao_modo: "especificas",
      empresa_ids: [empresaId],
      visivel_form: true,
      visivel_tabela: true,
    },
  });
  assert(createSpecific.ok, "Falha ao criar campo específico de empresa.");
  const specificField = createSpecific.payload.item;

  const aplicavel = await requestJson("/api/cadcps/aplicavel/EmpresaCadastro", {
    token,
    empresaId,
  });
  assert(
    (aplicavel.payload?.items || []).some((item) => item.field_name === specificFieldName),
    "Campo específico não apareceu na listagem aplicável."
  );

  const empresaB = session.empresas?.[1];
  if (empresaB?.id && empresaB.id !== empresaId) {
    const listB = await requestJson("/api/cadcps/aplicavel/EmpresaCadastro", {
      token,
      empresaId: empresaB.id,
    });
    assert(listB.ok, "Falha ao listar campos na empresa B.");
    const namesB = (listB.payload.items || []).map((item) => item.field_name);
    assert(!namesB.includes(specificFieldName), "Campo específico vazou para outra empresa.");
  }

  await requestJson(`${CAMPOS_PATH}/${specificField.id}`, { method: "DELETE", token });

  console.log("Smoke tipos de campo (CADCPS): OK");
};

run().catch((error) => {
  console.error("Smoke tipos de campo falhou:", error.message);
  process.exit(1);
});
