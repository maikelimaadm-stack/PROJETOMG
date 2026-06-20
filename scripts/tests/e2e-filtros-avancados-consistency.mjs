import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import {
  buildEmpresaColumnFilters,
  buildEmpresaPanelFilters,
  mergeEmpresaListFilters,
} from "@/shared/listing/buildEmpresaListFilters";

const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};
const PAGE_SIZE = 1000;
const RESULTS_PATH = "/workspace/scripts/tests/e2e-filtros-avancados-consistency.results.json";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const hashPayload = (payload) => JSON.stringify(payload || {});

const normalizeDateToken = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  const token = text.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return token || null;
};

const parseNumericToken = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return NaN;
  if (text.toLowerCase() === "undefined" || text.toLowerCase() === "null") return NaN;
  const numeric = Number(text.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric : NaN;
};

const walkSerialized = (value, callback, path = "$") => {
  callback(value, path);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkSerialized(item, callback, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      walkSerialized(item, callback, `${path}.${key}`);
    });
  }
};

const assertNoInvalidLiterals = (payload, label) => {
  walkSerialized(payload, (value, path) => {
    if (typeof value !== "string") return;
    const lowered = value.trim().toLowerCase();
    assert.notEqual(lowered, "undefined", `${label}: literal "undefined" em ${path}`);
    assert.notEqual(lowered, "null", `${label}: literal "null" em ${path}`);
  });
};

const requestJson = async ({ token, path, params = {} }) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    qs.set(key, String(value));
  });
  const url = `${API_BASE}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${path} falhou (${res.status}): ${payload?.message || "sem payload"}`);
  }
  return payload;
};

const requestExportCsv = async ({ token, filters }) => {
  const qs = new URLSearchParams({
    sortBy: "id_global",
    sortDir: "asc",
    filters: JSON.stringify(filters || {}),
  });
  const res = await fetch(`${API_BASE}/api/empresas/export?${qs.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`/api/empresas/export falhou (${res.status}): ${text.slice(0, 240)}`);
  }
  return text;
};

const extractExportIdGlobals = (csvText) => {
  const lines = String(csvText || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
  if (lines.length <= 1) return [];
  const rows = lines.slice(1);
  return rows
    .map((row) => row.split(";")[0]?.replace(/^"|"$/g, "").trim())
    .filter(Boolean)
    .map((value) => Number(value))
    .filter(Number.isFinite);
};

const idsEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const unionSize = (left, right) => {
  const set = new Set(left);
  right.forEach((item) => set.add(item));
  return set.size;
};

const intersectionSize = (left, right) => {
  const rightSet = new Set(right);
  let count = 0;
  left.forEach((item) => {
    if (rightSet.has(item)) count += 1;
  });
  return count;
};

const run = async () => {
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(LOGIN),
  });
  const loginPayload = await loginRes.json().catch(() => null);
  if (!loginRes.ok || !loginPayload?.token) {
    throw new Error(`Login falhou (${loginRes.status}): ${loginPayload?.message || "sem payload"}`);
  }
  const token = loginPayload.token;

  const listCache = new Map();
  const exportCache = new Map();
  const scenarioResults = [];
  const idsByScenario = new Map();

  const collectListIds = async (filters) => {
    const cacheKey = hashPayload(filters);
    if (listCache.has(cacheKey)) return listCache.get(cacheKey);

    let page = 1;
    let totalPages = 1;
    const ids = [];
    while (page <= totalPages) {
      const payload = await requestJson({
        token,
        path: "/api/empresas",
        params: {
          page,
          pageSize: PAGE_SIZE,
          sortBy: "id_global",
          sortDir: "asc",
          filters: JSON.stringify(filters || {}),
        },
      });
      totalPages = Number(payload.totalPages || 1);
      (payload.items || []).forEach((item) => {
        const idGlobal = Number(item?.id_global);
        if (Number.isFinite(idGlobal)) ids.push(idGlobal);
      });
      page += 1;
    }
    listCache.set(cacheKey, ids);
    return ids;
  };

  const collectExportIds = async (filters) => {
    const cacheKey = hashPayload(filters);
    if (exportCache.has(cacheKey)) return exportCache.get(cacheKey);
    const csv = await requestExportCsv({ token, filters });
    const ids = extractExportIdGlobals(csv);
    exportCache.set(cacheKey, ids);
    return ids;
  };

  const baseline = await requestJson({
    token,
    path: "/api/empresas",
    params: {
      page: 1,
      pageSize: PAGE_SIZE,
      sortBy: "id_global",
      sortDir: "asc",
    },
  });
  const totalRegistros = Number(baseline.total || 0);
  if (totalRegistros < 69997) {
    throw new Error(`Base insuficiente para auditoria exigida: total=${totalRegistros}`);
  }
  if (Number(baseline.totalPages || 0) < 2) {
    throw new Error("Infinite scroll sem segunda página");
  }

  const firstAsc = baseline.items || [];
  const firstDesc = (
    await requestJson({
      token,
      path: "/api/empresas",
      params: {
        page: 1,
        pageSize: PAGE_SIZE,
        sortBy: "id_global",
        sortDir: "desc",
      },
    })
  ).items || [];

  assert(firstAsc.length >= 500, "Amostra asc insuficiente");
  assert(firstDesc.length >= 500, "Amostra desc insuficiente");

  const numEq = Number(firstAsc[Math.floor(firstAsc.length / 2)]?.id_global);
  const numLow = Number(firstAsc[150]?.id_global);
  const numHigh = Number(firstAsc[450]?.id_global);
  const numNearTop = Number(firstDesc[120]?.id_global);
  const numNearBottom = Number(firstAsc[120]?.id_global);
  assert(Number.isFinite(numEq) && Number.isFinite(numLow) && Number.isFinite(numHigh), "Pivôs numéricos inválidos");

  const dateAscSample = (
    await requestJson({
      token,
      path: "/api/empresas",
      params: {
        page: 1,
        pageSize: PAGE_SIZE,
        sortBy: "updatedAt",
        sortDir: "asc",
      },
    })
  ).items || [];
  const dateDescSample = (
    await requestJson({
      token,
      path: "/api/empresas",
      params: {
        page: 1,
        pageSize: PAGE_SIZE,
        sortBy: "updatedAt",
        sortDir: "desc",
      },
    })
  ).items || [];
  const allDates = new Set(
    [...dateAscSample, ...dateDescSample, ...firstAsc, ...firstDesc]
      .map((item) => normalizeDateToken(item?.updatedAt))
      .filter(Boolean)
  );
  if (allDates.size < 4) {
    for (let page = 2; page <= 8 && allDates.size < 4; page += 1) {
      const extra = await requestJson({
        token,
        path: "/api/empresas",
        params: {
          page,
          pageSize: PAGE_SIZE,
          sortBy: "id_global",
          sortDir: "asc",
        },
      });
      (extra.items || []).forEach((item) => {
        const tokenDate = normalizeDateToken(item?.updatedAt);
        if (tokenDate) allDates.add(tokenDate);
      });
    }
  }
  const sortedDates = [...allDates].sort();
  const recentDates = [...sortedDates].reverse();
  assert(sortedDates.length >= 1, "Sem datas válidas para matriz");
  const pickDate = (collection, index, fallback) =>
    collection[Math.min(index, Math.max(collection.length - 1, 0))] || fallback;

  const dateEq = pickDate(recentDates, 1, recentDates[0]);
  const dateBefore = pickDate(sortedDates, 2, sortedDates[0]);
  const dateAfter = pickDate(recentDates, 2, recentDates[0]);
  const betweenStart = pickDate(sortedDates, 1, sortedDates[0]);
  const betweenEnd = pickDate(recentDates, 3, recentDates[0]);
  const [dateBetweenFrom, dateBetweenTo] = [betweenStart, betweenEnd].sort();

  const campoAmostra = [];
  for (let page = 1; page <= 5; page += 1) {
    const payload = await requestJson({
      token,
      path: "/api/empresas",
      params: {
        page,
        pageSize: PAGE_SIZE,
        sortBy: "id_global",
        sortDir: "asc",
      },
    });
    campoAmostra.push(...(payload.items || []));
  }

  const customStats = new Map();
  campoAmostra.forEach((item) => {
    const campos = item?.campos_personalizados;
    if (!campos || typeof campos !== "object") return;
    Object.entries(campos).forEach(([key, rawValue]) => {
      if (!customStats.has(key)) {
        customStats.set(key, { numeric: new Set(), date: new Set() });
      }
      const stat = customStats.get(key);
      const numeric = parseNumericToken(rawValue);
      if (Number.isFinite(numeric)) stat.numeric.add(numeric);
      const dateToken = normalizeDateToken(rawValue);
      if (dateToken) stat.date.add(dateToken);
    });
  });

  const customNumericField = [...customStats.entries()].find(([, stat]) => stat.numeric.size >= 4);
  const customDateField = [...customStats.entries()].find(([, stat]) => stat.date.size >= 4);
  const customNumericAvailable = Boolean(customNumericField);
  const customDateAvailable = Boolean(customDateField);

  const [customNumName, customNumStat] = customNumericField || [
    "__sem_campo_numerico__",
    { numeric: new Set([1, 2, 3, 4]) },
  ];
  const [customDateName, customDateStat] = customDateField || [
    "__sem_campo_data__",
    { date: new Set([dateBetweenFrom, dateBetweenTo, dateEq, dateAfter]) },
  ];
  const customNumValues = [...customNumStat.numeric].sort((a, b) => a - b);
  const customDateValues = [...customDateStat.date].sort();

  const customNumEq = customNumValues[Math.floor(customNumValues.length / 2)] ?? 1;
  const customNumFrom = customNumValues[0] ?? 1;
  const customNumTo = customNumValues[Math.min(customNumValues.length - 1, 2)] ?? customNumFrom;
  const customNumPivot = customNumValues[Math.min(customNumValues.length - 1, 1)] ?? customNumFrom;

  const customDatePivot = customDateValues[Math.floor(customDateValues.length / 2)] ?? dateEq;
  const customDateFrom = customDateValues[0] ?? dateBetweenFrom;
  const customDateTo = customDateValues[Math.min(customDateValues.length - 1, 2)] ?? dateBetweenTo;

  const matrix = [
    {
      id: "num_equals",
      label: "Numérico equals",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: { type: "number", operator: "equals", value: String(numEq) },
        }),
      buildApi: () => ({ id_global: numEq }),
    },
    {
      id: "num_not_equals",
      label: "Numérico not_equals",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: { type: "number", operator: "not_equals", value: String(numEq) },
        }),
      buildApi: () => ({ id_global__not_equals: numEq }),
    },
    {
      id: "num_gt",
      label: "Numérico gt",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: { type: "number", operator: "gt", value: String(numNearTop) },
        }),
      buildApi: () => ({ id_global__gt: numNearTop }),
    },
    {
      id: "num_gte",
      label: "Numérico gte",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: { type: "number", operator: "gte", value: String(numNearTop) },
        }),
      buildApi: () => ({ id_global__gte: numNearTop }),
    },
    {
      id: "num_lt",
      label: "Numérico lt",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: { type: "number", operator: "lt", value: String(numNearBottom) },
        }),
      buildApi: () => ({ id_global__lt: numNearBottom }),
    },
    {
      id: "num_lte",
      label: "Numérico lte",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: { type: "number", operator: "lte", value: String(numNearBottom) },
        }),
      buildApi: () => ({ id_global__lte: numNearBottom }),
    },
    {
      id: "num_between",
      label: "Numérico between",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: {
            type: "number",
            operator: "between",
            value: String(numLow),
            valueTo: String(numHigh),
          },
        }),
      buildApi: () => ({ id_global__between: { from: numLow, to: numHigh } }),
    },
    {
      id: "num_not_between",
      label: "Numérico not_between",
      buildTela: () =>
        buildEmpresaColumnFilters({
          id_global: {
            type: "number",
            operator: "not_between",
            value: String(numLow),
            valueTo: String(numHigh),
          },
        }),
      buildApi: () => ({ id_global__not_between: { from: numLow, to: numHigh } }),
    },
    {
      id: "date_equals",
      label: "Data equals",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: { type: "date", operator: "equals", value: dateEq },
        }),
      buildApi: () => ({ updatedAt__equals: dateEq }),
    },
    {
      id: "date_before",
      label: "Data before",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: { type: "date", operator: "before", value: dateBefore },
        }),
      buildApi: () => ({ updatedAt__before: dateBefore }),
    },
    {
      id: "date_after",
      label: "Data after",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: { type: "date", operator: "after", value: dateAfter },
        }),
      buildApi: () => ({ updatedAt__after: dateAfter }),
    },
    {
      id: "date_between",
      label: "Data between",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: {
            type: "date",
            operator: "between",
            value: dateBetweenFrom,
            valueTo: dateBetweenTo,
          },
        }),
      buildApi: () => ({ updatedAt__between: { from: dateBetweenFrom, to: dateBetweenTo } }),
    },
    {
      id: "date_today",
      label: "Data today",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: { type: "date", operator: "today", value: "" },
        }),
      buildApi: () => ({ updatedAt__today: true }),
    },
    {
      id: "date_yesterday",
      label: "Data yesterday",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: { type: "date", operator: "yesterday", value: "" },
        }),
      buildApi: () => ({ updatedAt__yesterday: true }),
    },
    {
      id: "date_this_month",
      label: "Data this_month",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: { type: "date", operator: "this_month", value: "" },
        }),
      buildApi: () => ({ updatedAt__this_month: true }),
    },
    {
      id: "date_last_month",
      label: "Data last_month",
      buildTela: () =>
        buildEmpresaColumnFilters({
          updatedAt: { type: "date", operator: "last_month", value: "" },
        }),
      buildApi: () => ({ updatedAt__last_month: true }),
    },
    {
      id: "custom_date_gt",
      label: "Custom data gt",
      enabled: customDateAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customDateName}`]: { type: "date", operator: "gt", value: customDatePivot },
        }),
      buildApi: () => ({ [`custom:${customDateName}__date_gt`]: customDatePivot }),
    },
    {
      id: "custom_date_gte",
      label: "Custom data gte",
      enabled: customDateAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customDateName}`]: { type: "date", operator: "gte", value: customDatePivot },
        }),
      buildApi: () => ({ [`custom:${customDateName}__date_gte`]: customDatePivot }),
    },
    {
      id: "custom_date_lt",
      label: "Custom data lt",
      enabled: customDateAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customDateName}`]: { type: "date", operator: "lt", value: customDatePivot },
        }),
      buildApi: () => ({ [`custom:${customDateName}__date_lt`]: customDatePivot }),
    },
    {
      id: "custom_date_lte",
      label: "Custom data lte",
      enabled: customDateAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customDateName}`]: { type: "date", operator: "lte", value: customDatePivot },
        }),
      buildApi: () => ({ [`custom:${customDateName}__date_lte`]: customDatePivot }),
    },
    {
      id: "custom_date_between",
      label: "Custom data between",
      enabled: customDateAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customDateName}`]: {
            type: "date",
            operator: "between",
            value: customDateFrom,
            valueTo: customDateTo,
          },
        }),
      buildApi: () => ({
        [`custom:${customDateName}__date_between`]: { from: customDateFrom, to: customDateTo },
      }),
    },
    {
      id: "custom_date_not_between",
      label: "Custom data not_between",
      enabled: customDateAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customDateName}`]: {
            type: "date",
            operator: "not_between",
            value: customDateFrom,
            valueTo: customDateTo,
          },
        }),
      buildApi: () => ({
        [`custom:${customDateName}__date_not_between`]: { from: customDateFrom, to: customDateTo },
      }),
    },
    {
      id: "custom_num_equals",
      label: "Custom número equals",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: { type: "number", operator: "equals", value: String(customNumEq) },
        }),
      buildApi: () => ({ [`custom:${customNumName}`]: customNumEq }),
    },
    {
      id: "custom_num_not_equals",
      label: "Custom número not_equals",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: { type: "number", operator: "not_equals", value: String(customNumEq) },
        }),
      buildApi: () => ({ [`custom:${customNumName}__num_not_equals`]: customNumEq }),
    },
    {
      id: "custom_num_gt",
      label: "Custom número gt",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: { type: "number", operator: "gt", value: String(customNumPivot) },
        }),
      buildApi: () => ({ [`custom:${customNumName}__num_gt`]: customNumPivot }),
    },
    {
      id: "custom_num_gte",
      label: "Custom número gte",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: { type: "number", operator: "gte", value: String(customNumPivot) },
        }),
      buildApi: () => ({ [`custom:${customNumName}__num_gte`]: customNumPivot }),
    },
    {
      id: "custom_num_lt",
      label: "Custom número lt",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: { type: "number", operator: "lt", value: String(customNumPivot) },
        }),
      buildApi: () => ({ [`custom:${customNumName}__num_lt`]: customNumPivot }),
    },
    {
      id: "custom_num_lte",
      label: "Custom número lte",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: { type: "number", operator: "lte", value: String(customNumPivot) },
        }),
      buildApi: () => ({ [`custom:${customNumName}__num_lte`]: customNumPivot }),
    },
    {
      id: "custom_num_between",
      label: "Custom número between",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: {
            type: "number",
            operator: "between",
            value: String(customNumFrom),
            valueTo: String(customNumTo),
          },
        }),
      buildApi: () => ({
        [`custom:${customNumName}__num_between`]: { from: customNumFrom, to: customNumTo },
      }),
    },
    {
      id: "custom_num_not_between",
      label: "Custom número not_between",
      enabled: customNumericAvailable,
      buildTela: () =>
        buildEmpresaPanelFilters({
          [`custom:${customNumName}`]: {
            type: "number",
            operator: "not_between",
            value: String(customNumFrom),
            valueTo: String(customNumTo),
          },
        }),
      buildApi: () => ({
        [`custom:${customNumName}__num_not_between`]: { from: customNumFrom, to: customNumTo },
      }),
    },
  ];

  console.log(`Matriz de validação: ${matrix.length} cenários`);
  for (const [index, scenario] of matrix.entries()) {
    if (scenario.enabled === false) {
      scenarioResults.push({
        id: scenario.id,
        label: scenario.label,
        telaCount: 0,
        apiCount: 0,
        exportCount: 0,
        idsTelaEqApi: true,
        idsApiEqExport: true,
        idsTelaEqExport: true,
        status: "SKIPPED",
      });
      console.log(`[${index + 1}/${matrix.length}] ${scenario.id}: SKIPPED (sem dados suficientes no tenant)`);
      continue;
    }
    const telaPayload = mergeEmpresaListFilters(scenario.buildTela());
    const apiPayload = mergeEmpresaListFilters(scenario.buildApi());
    assertNoInvalidLiterals(telaPayload, `${scenario.id}:tela`);
    assertNoInvalidLiterals(apiPayload, `${scenario.id}:api`);

    const telaIds = await collectListIds(telaPayload);
    const apiIds = await collectListIds(apiPayload);
    const exportIds = await collectExportIds(apiPayload);

    const idsTelaEqApi = idsEqual(telaIds, apiIds);
    const idsApiEqExport = idsEqual(apiIds, exportIds);
    const idsTelaEqExport = idsEqual(telaIds, exportIds);
    const status = idsTelaEqApi && idsApiEqExport && idsTelaEqExport ? "OK" : "FALHA";

    scenarioResults.push({
      id: scenario.id,
      label: scenario.label,
      telaCount: telaIds.length,
      apiCount: apiIds.length,
      exportCount: exportIds.length,
      idsTelaEqApi,
      idsApiEqExport,
      idsTelaEqExport,
      status,
    });
    idsByScenario.set(scenario.id, { telaIds, apiIds, exportIds });

    console.log(
      `[${index + 1}/${matrix.length}] ${scenario.id}: tela=${telaIds.length} api=${apiIds.length} export=${exportIds.length} => ${status}`
    );
    await wait(300);
  }

  const get = (id) => scenarioResults.find((item) => item.id === id) || { telaCount: 0, status: "MISSING" };
  const ids = (id) => idsByScenario.get(id)?.telaIds || [];
  const semanticChecks = [
    {
      id: "num_not_equals",
      ok:
        get("num_not_equals").status !== "SKIPPED" &&
        get("num_equals").status !== "SKIPPED" &&
        get("num_not_equals").telaCount !== get("num_equals").telaCount &&
        get("num_not_equals").telaCount > 0,
    },
    { id: "num_gt", ok: get("num_gt").telaCount <= get("num_gte").telaCount },
    { id: "num_lt", ok: get("num_lt").telaCount <= get("num_lte").telaCount },
    {
      id: "num_not_between",
      ok:
        intersectionSize(ids("num_between"), ids("num_not_between")) === 0 &&
        unionSize(ids("num_between"), ids("num_not_between")) <= totalRegistros,
    },
    {
      id: "custom_num_not_equals",
      ok:
        get("custom_num_not_equals").status !== "SKIPPED" &&
        get("custom_num_equals").status !== "SKIPPED" &&
        get("custom_num_not_equals").telaCount !== get("custom_num_equals").telaCount &&
        get("custom_num_not_equals").telaCount > 0,
    },
    {
      id: "custom_num_gt",
      ok:
        get("custom_num_gt").status === "SKIPPED" ||
        get("custom_num_gte").status === "SKIPPED" ||
        get("custom_num_gt").telaCount <= get("custom_num_gte").telaCount,
    },
    {
      id: "custom_num_lt",
      ok:
        get("custom_num_lt").status === "SKIPPED" ||
        get("custom_num_lte").status === "SKIPPED" ||
        get("custom_num_lt").telaCount <= get("custom_num_lte").telaCount,
    },
    {
      id: "custom_date_gt",
      ok:
        get("custom_date_gt").status === "SKIPPED" ||
        get("custom_date_gte").status === "SKIPPED" ||
        get("custom_date_gt").telaCount <= get("custom_date_gte").telaCount,
    },
    {
      id: "custom_date_lt",
      ok:
        get("custom_date_lt").status === "SKIPPED" ||
        get("custom_date_lte").status === "SKIPPED" ||
        get("custom_date_lt").telaCount <= get("custom_date_lte").telaCount,
    },
  ];

  const semanticMap = new Map(semanticChecks.map((check) => [check.id, check.ok]));
  const enriched = scenarioResults.map((result) => ({
    ...result,
    semanticApplied:
      result.status === "SKIPPED"
        ? null
        : semanticMap.has(result.id)
          ? semanticMap.get(result.id)
          : result.telaCount >= 0,
  }));
  const failed = enriched.filter(
    (row) => row.status === "FALHA" || (row.status === "OK" && row.semanticApplied !== true)
  );
  const skipped = enriched.filter((row) => row.status === "SKIPPED").map((row) => row.id);

  const summary = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    totalRegistros,
    pageSize: PAGE_SIZE,
    customNumericField: customNumName,
    customDateField: customDateName,
    scenarios: enriched,
    skipped,
    failures: failed.map((row) => row.id),
  };
  writeFileSync(RESULTS_PATH, JSON.stringify(summary, null, 2));

  if (failed.length > 0) {
    throw new Error(`Falhas na matriz: ${failed.map((row) => row.id).join(", ")}`);
  }

  console.log(`Validação concluída com sucesso. Resultado salvo em ${RESULTS_PATH}`);
};

run().catch((error) => {
  console.error(`e2e-filtros-avancados-consistency: FAIL\n${error.stack || error.message}`);
  process.exit(1);
});
