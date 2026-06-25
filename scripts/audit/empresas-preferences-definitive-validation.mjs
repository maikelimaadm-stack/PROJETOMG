#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3101";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};
const LOGIN_B = {
  cliente: process.env.AUDIT_CLIENTE_B || "",
  usuario: process.env.AUDIT_USUARIO_B || "",
  senha: process.env.AUDIT_SENHA_B || "",
};

const results = {
  meta: { baseUrl: BASE_URL, startedAt: new Date().toISOString(), login: LOGIN.usuario },
  metrics: [],
  scenarios: [],
  restore: { listagem: "pending", form: "pending" },
  network: [],
  errors: [],
};

const now = () => performance.now();
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const toObj = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

async function request(path, { method = "GET", token, body } = {}) {
  const started = now();
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const elapsedMs = Math.round(now() - started);
  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw };
  }
  results.network.push({ method, path, status: response.status, elapsedMs });
  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    error.elapsedMs = elapsedMs;
    throw error;
  }
  return { data, elapsedMs };
}

async function login(credentials = LOGIN) {
  const { data } = await request("/api/auth/login", { method: "POST", body: credentials });
  if (!data?.token) throw new Error("Login sem token");
  return data.token;
}

async function getScope(token, modulo, tela) {
  const { data } = await request(`/api/user/preferences/${modulo}/${tela}`, { token });
  return data;
}

async function putScope(token, modulo, tela, preferencias, { expectedRevision, expectedUpdatedAt, versao = 2 } = {}) {
  const { data, elapsedMs } = await request(`/api/user/preferences/${modulo}/${tela}`, {
    method: "PUT",
    token,
    body: {
      versao_schema: versao,
      preferencias,
      expectedRevision,
      expectedUpdatedAt,
    },
  });
  return { data, elapsedMs };
}

function metricRow(event, payload) {
  results.metrics.push({ event, ...payload });
}

async function runScenario(name, fn) {
  const started = now();
  const row = { name, status: "pass", evidence: null, durationMs: 0 };
  try {
    row.evidence = await fn();
  } catch (error) {
    row.status = "fail";
    row.error = { message: error.message, status: error.status, data: error.data };
    results.errors.push({ scenario: name, ...row.error });
  }
  row.durationMs = Math.round(now() - started);
  results.scenarios.push(row);
  console.log(`[${row.status.toUpperCase()}] ${name} (${row.durationMs}ms)`);
}

function removeColumns(visibleColumns = [], targets = []) {
  const blocked = new Set(targets);
  return visibleColumns.filter((col) => !blocked.has(col));
}

function tweakFormLayout(formPreferences) {
  const cloned = deepClone(formPreferences || {});
  const activeConfig = toObj(cloned.activeConfig || cloned);
  const layout = toObj(activeConfig.layout);
  const principal = Array.isArray(layout.principal) ? [...layout.principal] : [];
  if (principal.length >= 2) {
    const [a, b, ...rest] = principal;
    layout.principal = [b, a, ...rest];
  }
  activeConfig.layout = layout;
  return { version: 3, activeConfig };
}

async function putWithRetryOnConflict({ token, modulo, tela, patch, expectedRevision, expectedUpdatedAt, versao = 2 }) {
  try {
    return await putScope(token, modulo, tela, patch, { expectedRevision, expectedUpdatedAt, versao });
  } catch (error) {
    if (Number(error.status) !== 409) throw error;
    const conflictRevision = Number(error.data?.currentRevision);
    const retry = await putScope(token, modulo, tela, patch, {
      expectedRevision: Number.isFinite(conflictRevision) ? conflictRevision : undefined,
      expectedUpdatedAt: error.data?.currentUpdatedAt,
      versao,
    });
    return { ...retry, retriedFrom409: true };
  }
}

async function main() {
  const tokenA = await login(LOGIN);
  const baselineListagem = await getScope(tokenA, "empresas", "listagem").catch((error) => {
    if (Number(error?.status) === 404) return null;
    throw error;
  });
  const baselineForm = await getScope(tokenA, "empresas", "form_layout").catch(() => null);

  const originalListagemPrefs = deepClone(baselineListagem?.preferencias || {});
  const originalListagemRevision = Number(baselineListagem?.revision) || 0;
  const originalListagemUpdatedAt = baselineListagem?.updatedAt || null;
  const originalFormPrefs = baselineForm?.preferencias ? deepClone(baselineForm.preferencias) : null;

  await runScenario("Cenário A — Persistência por categoria", async () => {
    let revision = Number(baselineListagem?.revision) || 0;
    let updatedAt = baselineListagem?.updatedAt;

    const visibleColumns = baselineListagem?.preferencias?.table?.visibleColumns || [];
    const hideTelefonePatch = { table: { visibleColumns: removeColumns(visibleColumns, ["telefone"]) } };
    const hideTelefone = await putWithRetryOnConflict({
      token: tokenA,
      modulo: "empresas",
      tela: "listagem",
      patch: hideTelefonePatch,
      expectedRevision: revision,
      expectedUpdatedAt: updatedAt,
    });
    revision = Number(hideTelefone.data?.revision) || revision;
    updatedAt = hideTelefone.data?.updatedAt || updatedAt;

    const cardsPatch = { cards: { cardsPerRow: 3, layoutConfig: { cardsPerRow: 3 } } };
    const cardsResp = await putWithRetryOnConflict({
      token: tokenA,
      modulo: "empresas",
      tela: "listagem",
      patch: cardsPatch,
      expectedRevision: revision,
      expectedUpdatedAt: updatedAt,
    });
    revision = Number(cardsResp.data?.revision) || revision;
    updatedAt = cardsResp.data?.updatedAt || updatedAt;

    const filtersPatch = {
      filtersConfig: {
        maxVisibleFields: 7,
        filterFieldsLayout: {
          ...(baselineListagem?.preferencias?.filtersConfig?.filterFieldsLayout || {}),
          maxVisible: 7,
        },
      },
    };
    const filtersResp = await putWithRetryOnConflict({
      token: tokenA,
      modulo: "empresas",
      tela: "listagem",
      patch: filtersPatch,
      expectedRevision: revision,
      expectedUpdatedAt: updatedAt,
    });
    revision = Number(filtersResp.data?.revision) || revision;
    updatedAt = filtersResp.data?.updatedAt || updatedAt;

    let formResp = null;
    if (baselineForm?.preferencias) {
      const formPatch = tweakFormLayout(baselineForm.preferencias);
      formResp = await putWithRetryOnConflict({
        token: tokenA,
        modulo: "empresas",
        tela: "form_layout",
        patch: formPatch,
        expectedRevision: Number(baselineForm.revision) || 0,
        expectedUpdatedAt: baselineForm.updatedAt,
        versao: 3,
      });
    }

    const afterReload = await getScope(tokenA, "empresas", "listagem");
    const tokenAgain = await login(LOGIN);
    const afterRelogin = await getScope(tokenAgain, "empresas", "listagem");

    const persisted = {
      telefoneHidden: !(afterRelogin?.preferencias?.table?.visibleColumns || []).includes("telefone"),
      cardsPerRow: Number(afterRelogin?.preferencias?.cards?.cardsPerRow) === 3,
      maxVisible:
        Number(afterRelogin?.preferencias?.filtersConfig?.maxVisibleFields) === 7 ||
        Number(afterRelogin?.preferencias?.filtersConfig?.filterFieldsLayout?.maxVisible) === 7,
    };

    metricRow("Ocultar coluna", {
      uiOptimista: "N/A (API)",
      debounceMs: 0,
      requests: 1,
      apiMs: hideTelefone.elapsedMs,
      persistenciaFinal: persisted.telefoneHidden,
      resetReload: !persisted.telefoneHidden,
      status: persisted.telefoneHidden ? "ok" : "fail",
    });
    metricRow("Cards por linha", {
      uiOptimista: "N/A (API)",
      debounceMs: 0,
      requests: 1,
      apiMs: cardsResp.elapsedMs,
      persistenciaFinal: persisted.cardsPerRow,
      resetReload: !persisted.cardsPerRow,
      status: persisted.cardsPerRow ? "ok" : "fail",
    });
    metricRow("Filtro rápido", {
      uiOptimista: "N/A (API)",
      debounceMs: 0,
      requests: 1,
      apiMs: filtersResp.elapsedMs,
      persistenciaFinal: persisted.maxVisible,
      resetReload: !persisted.maxVisible,
      status: persisted.maxVisible ? "ok" : "fail",
    });

    return {
      hideTelefoneMs: hideTelefone.elapsedMs,
      cardsMs: cardsResp.elapsedMs,
      filtersMs: filtersResp.elapsedMs,
      formMs: formResp?.elapsedMs || null,
      persisted,
      revisionAfter: afterReload?.revision,
      reloginRevision: afterRelogin?.revision,
    };
  });

  await runScenario("Cenário B — Alterações rápidas consolidadas", async () => {
    const current = await getScope(tokenA, "empresas", "listagem");
    const baseRevision = Number(current?.revision) || 0;
    const baseUpdatedAt = current?.updatedAt;
    const baseVisible = current?.preferencias?.table?.visibleColumns || [];

    const patch1 = { table: { visibleColumns: removeColumns(baseVisible, ["telefone"]) } };
    const patch2 = { table: { visibleColumns: removeColumns(baseVisible, ["telefone", "email"]) } };
    const patch3 = { table: { visibleColumns: removeColumns(baseVisible, ["telefone", "email", "cidade"]) } };

    const [r1, r2, r3] = await Promise.all([
      putScope(tokenA, "empresas", "listagem", patch1, {
        expectedRevision: baseRevision,
        expectedUpdatedAt: baseUpdatedAt,
      }).catch((error) => ({ error })),
      putScope(tokenA, "empresas", "listagem", patch2, {
        expectedRevision: baseRevision,
        expectedUpdatedAt: baseUpdatedAt,
      }).catch((error) => ({ error })),
      putScope(tokenA, "empresas", "listagem", patch3, {
        expectedRevision: baseRevision,
        expectedUpdatedAt: baseUpdatedAt,
      }).catch((error) => ({ error })),
    ]);

    const conflict = [r1, r2, r3].find((item) => item?.error?.status === 409);
    if (conflict) {
      await putWithRetryOnConflict({
        token: tokenA,
        modulo: "empresas",
        tela: "listagem",
        patch: patch3,
        expectedRevision: Number(conflict.error.data?.currentRevision) || undefined,
        expectedUpdatedAt: conflict.error.data?.currentUpdatedAt,
      });
    }

    let latest = await getScope(tokenA, "empresas", "listagem");
    let revision = Number(latest?.revision) || 0;
    let updatedAt = latest?.updatedAt;

    const cardsChain = [2, 3, 4];
    for (const cardsPerRow of cardsChain) {
      const response = await putWithRetryOnConflict({
        token: tokenA,
        modulo: "empresas",
        tela: "listagem",
        patch: { cards: { cardsPerRow, layoutConfig: { cardsPerRow } } },
        expectedRevision: revision,
        expectedUpdatedAt: updatedAt,
      });
      revision = Number(response.data?.revision) || revision;
      updatedAt = response.data?.updatedAt || updatedAt;
    }

    latest = await getScope(tokenA, "empresas", "listagem");
    const finalVisible = latest?.preferencias?.table?.visibleColumns || [];
    const finalCards = latest?.preferencias?.cards?.cardsPerRow;

    return {
      finalVisibleSample: finalVisible.slice(0, 10),
      finalCards,
      columnsPersisted: !finalVisible.includes("telefone") && !finalVisible.includes("email"),
      cardsPersisted: Number(finalCards) === 4,
      requestStatuses: [r1, r2, r3].map((item) => (item?.error ? item.error.status : 200)),
    };
  });

  await runScenario("Cenário C — Conflito controlado em duas abas", async () => {
    const token1 = await login(LOGIN);
    const token2 = await login(LOGIN);
    const snapshot = await getScope(token1, "empresas", "listagem");

    const revision = Number(snapshot?.revision) || 0;
    const updatedAt = snapshot?.updatedAt;
    const visible = snapshot?.preferencias?.table?.visibleColumns || [];

    const patchA = { table: { visibleColumns: removeColumns(visible, ["telefone"]) } };
    const patchB = { cards: { cardsPerRow: 4, layoutConfig: { cardsPerRow: 4 } } };

    const [saveA, saveB] = await Promise.all([
      putScope(token1, "empresas", "listagem", patchA, {
        expectedRevision: revision,
        expectedUpdatedAt: updatedAt,
      }).catch((error) => ({ error })),
      putScope(token2, "empresas", "listagem", patchB, {
        expectedRevision: revision,
        expectedUpdatedAt: updatedAt,
      }).catch((error) => ({ error })),
    ]);

    const retryTarget = saveA.error ? { patch: patchA, error: saveA.error } : saveB.error ? { patch: patchB, error: saveB.error } : null;

    if (retryTarget && Number(retryTarget.error?.status) === 409) {
      await putWithRetryOnConflict({
        token: token1,
        modulo: "empresas",
        tela: "listagem",
        patch: retryTarget.patch,
        expectedRevision: Number(retryTarget.error.data?.currentRevision) || undefined,
        expectedUpdatedAt: retryTarget.error.data?.currentUpdatedAt,
      });
    }

    const after = await getScope(token1, "empresas", "listagem");
    const visibleAfter = after?.preferencias?.table?.visibleColumns || [];
    const cardsAfter = Number(after?.preferencias?.cards?.cardsPerRow);

    return {
      saveAStatus: saveA.error ? saveA.error.status : 200,
      saveBStatus: saveB.error ? saveB.error.status : 200,
      telefoneHidden: !visibleAfter.includes("telefone"),
      cardsPerRow: cardsAfter,
      bothPersisted: !visibleAfter.includes("telefone") && cardsAfter === 4,
    };
  });

  await runScenario("Cenário D — Separação filtros temporários x configuração", async () => {
    const current = await getScope(tokenA, "empresas", "listagem");
    let revision = Number(current?.revision) || 0;
    let updatedAt = current?.updatedAt;

    const configPatch = {
      filtersConfig: {
        maxVisibleFields: 6,
        operatorsByField: {
          ...(current?.preferencias?.filtersConfig?.operatorsByField || {}),
          razao_social: "startsWith",
        },
      },
    };

    const saveConfig = await putWithRetryOnConflict({
      token: tokenA,
      modulo: "empresas",
      tela: "listagem",
      patch: configPatch,
      expectedRevision: revision,
      expectedUpdatedAt: updatedAt,
    });

    revision = Number(saveConfig.data?.revision) || revision;
    updatedAt = saveConfig.data?.updatedAt || updatedAt;

    const after = await getScope(tokenA, "empresas", "listagem");
    return {
      maxVisible: after?.preferencias?.filtersConfig?.maxVisibleFields,
      operator: after?.preferencias?.filtersConfig?.operatorsByField?.razao_social,
      hasPermanentColumnFilters: Boolean(after?.preferencias?.table?.columnFilters),
      separated:
        Number(after?.preferencias?.filtersConfig?.maxVisibleFields) === 6 &&
        after?.preferencias?.filtersConfig?.operatorsByField?.razao_social === "startsWith" &&
        !after?.preferencias?.table?.columnFilters,
      saveConfigMs: saveConfig.elapsedMs,
    };
  });

  await runScenario("Cenário E — Persistência de layout de formulário", async () => {
    const current = await getScope(tokenA, "empresas", "form_layout").catch(() => null);
    if (!current?.preferencias) return { skipped: true, reason: "preferência de form_layout ausente" };

    const patch = tweakFormLayout(current.preferencias);
    const save = await putWithRetryOnConflict({
      token: tokenA,
      modulo: "empresas",
      tela: "form_layout",
      patch,
      expectedRevision: Number(current.revision) || 0,
      expectedUpdatedAt: current.updatedAt,
      versao: 3,
    });

    for (let i = 0; i < 10; i += 1) {
      await getScope(tokenA, "empresas", "form_layout");
    }

    const after = await getScope(tokenA, "empresas", "form_layout");
    return {
      saveMs: save.elapsedMs,
      revisionBefore: current.revision,
      revisionAfter: after?.revision,
      persisted: Number(after?.revision) > Number(current.revision || 0),
    };
  });

  await runScenario("Cenário F — Isolamento entre usuários", async () => {
    if (!LOGIN_B.usuario || !LOGIN_B.senha || !LOGIN_B.cliente) {
      return {
        pending: true,
        reason: "AUDIT_CLIENTE_B/AUDIT_USUARIO_B/AUDIT_SENHA_B não configurados no ambiente.",
      };
    }

    const tokenB = await login(LOGIN_B);
    const userA = await getScope(tokenA, "empresas", "listagem");
    const userB = await getScope(tokenB, "empresas", "listagem");

    return {
      userARevision: userA?.revision,
      userBRevision: userB?.revision,
      isolated:
        JSON.stringify(userA?.preferencias?.table?.visibleColumns || []) !==
        JSON.stringify(userB?.preferencias?.table?.visibleColumns || []),
    };
  });

  // Restore baseline
  if (baselineListagem?.preferencias) {
    try {
      await putScope(tokenA, "empresas", "listagem", originalListagemPrefs, {
        expectedRevision: originalListagemRevision,
        expectedUpdatedAt: originalListagemUpdatedAt,
        versao: Number(originalListagemPrefs?.version) || 2,
      }).catch(async (error) => {
        if (Number(error.status) !== 409) throw error;
        return putScope(tokenA, "empresas", "listagem", originalListagemPrefs, {
          expectedRevision: Number(error.data?.currentRevision) || undefined,
          expectedUpdatedAt: error.data?.currentUpdatedAt,
          versao: Number(originalListagemPrefs?.version) || 2,
        });
      });
      results.restore.listagem = "ok";
    } catch (error) {
      results.restore.listagem = `fail: ${error.message}`;
      results.errors.push({ scenario: "restore-listagem", message: error.message });
    }
  } else {
    results.restore.listagem = "skipped:no-baseline";
  }

  if (originalFormPrefs) {
    try {
      const currentForm = await getScope(tokenA, "empresas", "form_layout").catch(() => null);
      await putScope(tokenA, "empresas", "form_layout", originalFormPrefs, {
        expectedRevision: Number(currentForm?.revision) || undefined,
        expectedUpdatedAt: currentForm?.updatedAt,
        versao: 3,
      });
      results.restore.form = "ok";
    } catch (error) {
      results.restore.form = `fail: ${error.message}`;
      results.errors.push({ scenario: "restore-form", message: error.message });
    }
  } else {
    results.restore.form = "skipped:no-baseline";
  }

  results.meta.finishedAt = new Date().toISOString();

  const outDir = join(__dirname, "../../docs/auditoria/evidence");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "definitive-validation-results.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Evidência salva em ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
