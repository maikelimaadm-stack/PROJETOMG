import dotenv from "dotenv";
import { smokeLoginBody } from "./smokeCredentials.js";
import { CADCPS_TIPOS } from "../src/modules/cadcps/cadcpsConstants.js";

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
  return { ok: response.ok, status: response.status, payload };
};

const login = async () => {
  const { ok, payload } = await requestJson("/api/auth/login", {
    method: "POST",
    body: smokeLoginBody(),
  });
  if (!ok || !payload?.token) throw new Error("Falha no login smoke CADCPS tipos.");
  return payload;
};

const buildBodyForTipo = (tipo, tag, telaId) => {
  const base = {
    nome: `Smoke ${tipo} ${tag}`,
    field_name: `smoke_${tipo}_${tag}`,
    tipo,
    tela_id: telaId,
    aplicacao_modo: "todas",
    visivel_form: true,
    visivel_tabela: true,
    pesquisavel: true,
    filtravel: true,
  };

  if (tipo === "texto") {
    return { ...base, usar_mascara: true, mascaras_text: "CPF\n###.###.###-##" };
  }
  if (["decimal", "moeda", "percentual"].includes(tipo)) {
    return { ...base, usar_decimal: true, decimal_places: 2 };
  }
  if (tipo === "inteiro") {
    return { ...base, usar_decimal: false };
  }
  if (["lista", "lista_multipla"].includes(tipo)) {
    return {
      ...base,
      opcoes: [
        { codigo: "a", descricao: "Opção A", ordem: 0 },
        { codigo: "b", descricao: "Opção B", ordem: 1 },
      ],
    };
  }
  if (tipo === "relacao") {
    return { ...base, relation_entity: "EmpresaCadastro" };
  }
  if (tipo === "formula") {
    return { ...base, formula: "1 * 1", read_only: true };
  }
  return base;
};

const runTipoCycle = async ({ token, tipo, telaId, tag }) => {
  const create = await requestJson("/api/cadcps/campos", {
    method: "POST",
    token,
    body: buildBodyForTipo(tipo, tag, telaId),
  });
  assert(create.ok, `[${tipo}] falha criar (${create.status})`);
  const id = create.payload?.item?.id;
  assert(id, `[${tipo}] sem id`);

  const getOne = await requestJson(`/api/cadcps/campos/${id}`, { token });
  assert(getOne.ok && getOne.payload?.item?.tipo === tipo, `[${tipo}] tipo divergente após leitura`);

  const update = await requestJson(`/api/cadcps/campos/${id}`, {
    method: "PUT",
    token,
    body: { descricao: `Atualizado ${tipo}` },
  });
  assert(update.ok, `[${tipo}] falha atualizar`);

  const remove = await requestJson(`/api/cadcps/campos/${id}`, { method: "DELETE", token });
  assert(remove.ok, `[${tipo}] falha excluir`);
};

const run = async () => {
  const tag = Date.now();
  const session = await login();
  const token = session.token;

  const telas = await requestJson("/api/cadcps/telas", { token });
  assert(telas.ok && telas.payload?.items?.length > 0, "Sem telas no registry.");
  const telaEmpresas = telas.payload.items.find((t) => t.codigo === "EMPRESAS");
  assert(telaEmpresas?.id, "Tela EMPRESAS ausente — registre o módulo em cadastro-modules.registry.json");

  const legacyCpf = await requestJson("/api/cadcps/campos", {
    method: "POST",
    token,
    body: { ...buildBodyForTipo("texto", tag, telaEmpresas.id), field_name: `smoke_cpf_legacy_${tag}`, nome: `Legacy CPF ${tag}`, tipo: "cpf" },
  });
  assert(legacyCpf.ok, "Payload legado cpf deveria ser aceito.");
  assert(legacyCpf.payload?.item?.tipo === "texto", "Tipo cpf legado deve normalizar para texto.");
  await requestJson(`/api/cadcps/campos/${legacyCpf.payload.item.id}`, { method: "DELETE", token });

  for (const tipo of CADCPS_TIPOS) {
    await runTipoCycle({ token, tipo, telaId: telaEmpresas.id, tag });
  }

  console.log(`Smoke CADCPS tipos: OK (${CADCPS_TIPOS.length} tipos).`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
