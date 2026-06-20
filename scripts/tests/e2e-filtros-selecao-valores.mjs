import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import {
  buildEmpresaColumnFilters,
  mergeEmpresaListFilters,
} from "@/shared/listing/buildEmpresaListFilters";

const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};
const RESULTS_PATH = "/workspace/scripts/tests/e2e-filtros-selecao-valores.results.json";
const DEFAULT_PAGE_SIZE = 1000;

const arraysEqual = (left, right) => {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) return false;
  }
  return true;
};

const requestJson = async ({ token, path, method = "GET", params = {}, body = undefined }) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    qs.set(key, String(value));
  });
  const url = `${API_BASE}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${method} ${path} falhou (${response.status}): ${payload?.message || "sem payload"}`);
  }
  return payload;
};

const collectList = async ({ token, search, filters, pageSize = DEFAULT_PAGE_SIZE }) => {
  let page = 1;
  let totalPages = 1;
  const ids = [];
  const rows = [];

  while (page <= totalPages) {
    const payload = await requestJson({
      token,
      path: "/api/empresas",
      params: {
        page,
        pageSize,
        sortBy: "id_global",
        sortDir: "asc",
        search,
        ...(filters ? { filters: JSON.stringify(filters) } : {}),
      },
    });
    totalPages = Number(payload.totalPages || 1);
    (payload.items || []).forEach((item) => {
      const idGlobal = Number(item?.id_global);
      if (!Number.isFinite(idGlobal)) return;
      ids.push(idGlobal);
      rows.push({
        id: item.id,
        id_global: idGlobal,
        estado: String(item?.estado || ""),
        status: String(item?.status || ""),
      });
    });
    page += 1;
  }

  return {
    ids,
    rows,
    total: ids.length,
    totalPages,
  };
};

const collectExportIds = async ({ token, search, filters }) => {
  const qs = new URLSearchParams({
    sortBy: "id_global",
    sortDir: "asc",
    search,
    ...(filters ? { filters: JSON.stringify(filters) } : {}),
  });
  const response = await fetch(`${API_BASE}/api/empresas/export?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const csvText = await response.text();
  if (!response.ok) {
    throw new Error(`/api/empresas/export falhou (${response.status}): ${csvText.slice(0, 240)}`);
  }
  return String(csvText)
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => Number(line.split(";")[0]?.replace(/^"|"$/g, "").trim()))
    .filter(Number.isFinite);
};

const createControlledDataset = async ({ token, marker }) => {
  const createdIds = [];
  const rows = [];
  const totalRecords = 24;
  for (let i = 0; i < totalRecords; i += 1) {
    const estado = i % 2 === 0 ? "MT" : "SP";
    const status = i % 3 === 0 ? "Inativa" : "Ativa";
    const payload = {
      razao_social: `${marker} EMPRESA ${String(i + 1).padStart(2, "0")}`,
      nome_fantasia: `${marker} ${i + 1}`,
      status,
      cidade: i % 2 === 0 ? "CUIABA" : "SAO PAULO",
      estado,
      tipo_pessoa: i % 2 === 0 ? "PJ" : "PF",
      tipo_vinculo: i % 2 === 0 ? "proprietario" : "arrendatario",
      campos_personalizados: {},
    };
    const created = await requestJson({
      token,
      path: "/api/empresas",
      method: "POST",
      body: payload,
    });
    const id = created?.item?.id;
    const idGlobal = Number(created?.item?.id_global);
    if (id) createdIds.push(id);
    if (Number.isFinite(idGlobal)) {
      rows.push({
        id,
        id_global: idGlobal,
        estado,
        status,
      });
    }
  }
  return { createdIds, rows };
};

const cleanupDataset = async ({ token, ids }) => {
  for (const id of ids) {
    try {
      await requestJson({ token, path: `/api/empresas/${id}`, method: "DELETE" });
    } catch {
      // best effort cleanup
    }
  }
};

const run = async () => {
  const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const loginPayload = await loginResponse.json().catch(() => null);
  if (!loginResponse.ok || !loginPayload?.token) {
    throw new Error(`Login falhou (${loginResponse.status})`);
  }
  const token = loginPayload.token;
  const marker = `AGTSEL-${Date.now()}`;

  const createdIds = [];
  try {
    const controlled = await createControlledDataset({ token, marker });
    createdIds.push(...controlled.createdIds);

    const baseline = await collectList({ token, search: marker, filters: undefined });
    assert.equal(baseline.total, controlled.rows.length, "Base controlada não foi carregada corretamente");

    const singleUfState = buildEmpresaColumnFilters({
      estado: { type: "text", operator: "contains", values: ["MT"] },
    });
    const multiUfState = buildEmpresaColumnFilters({
      estado: { type: "text", operator: "contains", values: ["MT", "SP"] },
    });
    const clearUfState = buildEmpresaColumnFilters({
      estado: { type: "text", operator: "contains", values: [] },
    });
    const combinedState = buildEmpresaColumnFilters({
      estado: { type: "text", operator: "contains", values: ["MT", "SP"] },
      status: { type: "enum", operator: "equals", values: ["Ativa"] },
    });

    const scenarios = [
      {
        id: "single_selection",
        label: "UF = MT",
        telaFilters: mergeEmpresaListFilters(singleUfState),
        apiFilters: { estado: "MT" },
        semantic: ({ rows }) => rows.length > 0 && rows.every((row) => row.estado === "MT"),
      },
      {
        id: "multi_selection",
        label: "UF IN [MT, SP]",
        telaFilters: mergeEmpresaListFilters(multiUfState),
        apiFilters: { estado__in: ["MT", "SP"] },
        semantic: ({ rows }) =>
          rows.length > 0 &&
          rows.every((row) => row.estado === "MT" || row.estado === "SP") &&
          rows.some((row) => row.estado === "MT") &&
          rows.some((row) => row.estado === "SP"),
      },
      {
        id: "clear_selection",
        label: "Limpar todos os valores",
        telaFilters: mergeEmpresaListFilters(clearUfState),
        apiFilters: undefined,
        semantic: ({ ids }) => arraysEqual(ids, baseline.ids),
      },
      {
        id: "combined_selection_status",
        label: "UF IN [MT, SP] AND status = Ativa",
        telaFilters: mergeEmpresaListFilters(combinedState),
        apiFilters: { estado__in: ["MT", "SP"], status: "Ativa" },
        semantic: ({ rows }) =>
          rows.length > 0 &&
          rows.every((row) => (row.estado === "MT" || row.estado === "SP") && row.status === "Ativa"),
      },
      {
        id: "infinite_scroll_pages",
        label: "Infinite scroll > 1 página",
        telaFilters: mergeEmpresaListFilters(multiUfState),
        apiFilters: { estado__in: ["MT", "SP"] },
        pageSize: 10,
        semantic: ({ totalPages }) => totalPages > 1,
      },
    ];

    const results = [];
    for (const [index, scenario] of scenarios.entries()) {
      const pageSize = scenario.pageSize || DEFAULT_PAGE_SIZE;
      const tela = await collectList({
        token,
        search: marker,
        filters: scenario.telaFilters,
        pageSize,
      });
      const api = await collectList({
        token,
        search: marker,
        filters: scenario.apiFilters,
        pageSize,
      });
      const exportIds = await collectExportIds({
        token,
        search: marker,
        filters: scenario.apiFilters,
      });

      const idsTelaEqApi = arraysEqual(tela.ids, api.ids);
      const idsApiEqExport = arraysEqual(api.ids, exportIds);
      const idsTelaEqExport = arraysEqual(tela.ids, exportIds);
      const semanticOk = scenario.semantic({
        ids: tela.ids,
        rows: tela.rows,
        totalPages: tela.totalPages,
      });
      const status = idsTelaEqApi && idsApiEqExport && idsTelaEqExport && semanticOk ? "OK" : "FALHA";

      results.push({
        id: scenario.id,
        label: scenario.label,
        idsTela: tela.ids.length,
        idsApi: api.ids.length,
        idsExportacao: exportIds.length,
        idsTelaEqApi,
        idsApiEqExport,
        idsTelaEqExport,
        semanticOk,
        status,
        totalPagesTela: tela.totalPages,
      });

      console.log(
        `[${index + 1}/${scenarios.length}] ${scenario.id}: tela=${tela.ids.length} api=${api.ids.length} export=${exportIds.length} status=${status}`
      );
    }

    const single = results.find((item) => item.id === "single_selection");
    const multi = results.find((item) => item.id === "multi_selection");
    assert(single && multi, "Resultados single/multi não encontrados");
    assert.notEqual(
      single.idsTela,
      multi.idsTela,
      "Semântica inválida: UF=MT e UF IN [MT,SP] não podem retornar o mesmo conjunto"
    );

    const failed = results.filter((item) => item.status !== "OK");
    const summary = {
      timestamp: new Date().toISOString(),
      apiBase: API_BASE,
      marker,
      createdRecords: controlled.rows.length,
      scenarios: results,
      failures: failed.map((item) => item.id),
      backendServerSideFilters: true,
    };
    writeFileSync(RESULTS_PATH, JSON.stringify(summary, null, 2));

    if (failed.length > 0) {
      throw new Error(`Falhas na validação: ${failed.map((item) => item.id).join(", ")}`);
    }

    console.log(`e2e-filtros-selecao-valores: OK (${RESULTS_PATH})`);
  } finally {
    await cleanupDataset({ token, ids: createdIds });
  }
};

run().catch((error) => {
  console.error(`e2e-filtros-selecao-valores: FAIL\n${error.stack || error.message}`);
  process.exit(1);
});
