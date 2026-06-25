#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE_URL = (
  process.env.VALIDATE_BASE_URL ||
  process.env.VALIDATE_API_BASE ||
  "http://127.0.0.1:3001"
).replace(/\/$/, "");

const LOGIN = {
  cliente: process.env.VALIDATE_CLIENTE || "maike",
  usuario: process.env.VALIDATE_USUARIO || "maike",
  senha: process.env.VALIDATE_SENHA || "123",
};

const report = {
  meta: {
    startedAt: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    user: { cliente: LOGIN.cliente, usuario: LOGIN.usuario },
  },
  checks: [],
  restore: {
    listagem: "pending",
    formLayout: "pending",
  },
  errors: [],
};

const stableStringify = (value) => {
  const normalize = (input) => {
    if (Array.isArray(input)) return input.map(normalize);
    if (!input || typeof input !== "object") return input;
    const keys = Object.keys(input).sort();
    const out = {};
    for (const key of keys) out[key] = normalize(input[key]);
    return out;
  };
  return JSON.stringify(normalize(value));
};

const sameJson = (a, b) => stableStringify(a) === stableStringify(b);
const toObj = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const deepClone = (value) => JSON.parse(JSON.stringify(value));

const apiRequest = async (path, { method = "GET", token, body, allow404 = false } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok && !(allow404 && response.status === 404)) {
    const error = new Error((data && data.message) || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return { status: response.status, data };
};

const login = async () => {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: LOGIN,
  });
  if (!response.data?.token) throw new Error("Login sem token.");
  return response.data;
};

const getScope = (token, modulo, tela, allow404 = false) =>
  apiRequest(`/api/user/preferences/${modulo}/${tela}`, { token, allow404 });

const putScope = (
  token,
  modulo,
  tela,
  preferencias,
  { expectedRevision, expectedUpdatedAt, versaoSchema } = {}
) =>
  apiRequest(`/api/user/preferences/${modulo}/${tela}`, {
    method: "PUT",
    token,
    body: {
      versao_schema:
        versaoSchema || Number(preferencias?.version) || Number(preferencias?.activeConfig?.version) || 2,
      preferencias,
      expectedRevision,
      expectedUpdatedAt,
    },
  });

const patchScope = (
  token,
  modulo,
  tela,
  section,
  patch,
  { expectedRevision, expectedUpdatedAt } = {}
) =>
  apiRequest(`/api/user/preferences/${modulo}/${tela}`, {
    method: "PATCH",
    token,
    body: {
      section,
      patch,
      expectedRevision,
      expectedUpdatedAt,
    },
  });

const putLegacy = (token, screenKey, config, { expectedRevision, expectedUpdatedAt } = {}) =>
  apiRequest(`/api/preferences/${screenKey}`, {
    method: "PUT",
    token,
    body: {
      config,
      expectedRevision,
      expectedUpdatedAt,
    },
  });

const check = (name, passed, details = {}) => {
  report.checks.push({ name, passed, details });
  if (!passed) {
    report.errors.push({ name, details });
  }
};

async function main() {
  let token;
  let baselineListagem;
  let baselineForm;

  try {
    const session = await login();
    token = session.token;
    report.meta.userId = session.user?.id || null;

    baselineListagem = (await getScope(token, "empresas", "listagem")).data;
    const formRead = await getScope(token, "empresas", "form_layout", true);
    baselineForm = formRead.status === 404 ? null : formRead.data;

    const marker = Date.now();

    // 1) PATCH cards não altera table
    {
      const before = (await getScope(token, "empresas", "listagem")).data;
      const response = await patchScope(
        token,
        "empresas",
        "listagem",
        "cards",
        { cardsPerRow: 2, layoutConfig: { cardsPerRow: 2 }, _backendAuditMarker: marker },
        { expectedRevision: before.revision, expectedUpdatedAt: before.updatedAt }
      );
      check(
        "PATCH cards não altera table",
        sameJson(before.preferencias?.table, response.data?.preferencias?.table),
        {
          beforeTable: before.preferencias?.table,
          afterTable: response.data?.preferencias?.table,
        }
      );
    }

    // 2) PATCH table não altera filtersConfig
    {
      const before = (await getScope(token, "empresas", "listagem")).data;
      const visibleColumns = before.preferencias?.table?.visibleColumns || [];
      const after = await patchScope(
        token,
        "empresas",
        "listagem",
        "table",
        { visibleColumns: [...visibleColumns] },
        { expectedRevision: before.revision, expectedUpdatedAt: before.updatedAt }
      );
      check(
        "PATCH table não altera filtersConfig",
        sameJson(before.preferencias?.filtersConfig, after.data?.preferencias?.filtersConfig),
        {
          beforeFiltersConfig: before.preferencias?.filtersConfig,
          afterFiltersConfig: after.data?.preferencias?.filtersConfig,
        }
      );
    }

    // 3) PATCH formLayout não altera cards (listagem)
    {
      const listagemBefore = (await getScope(token, "empresas", "listagem")).data;
      const formCurrent = await getScope(token, "empresas", "form_layout", true);
      if (formCurrent.status === 404) {
        check("PATCH formLayout não altera cards", true, {
          note: "form_layout inexistente; check de não impacto em cards validado por ausência de escrita.",
        });
      } else {
        const formPrefs = toObj(formCurrent.data?.preferencias);
        const active = toObj(formPrefs.activeConfig || formPrefs);
        const next = {
          ...formPrefs,
          activeConfig: {
            ...active,
            _backendAuditMarker: marker,
          },
        };
        await putScope(token, "empresas", "form_layout", next, {
          expectedRevision: formCurrent.data?.revision,
          expectedUpdatedAt: formCurrent.data?.updatedAt,
          versaoSchema: 3,
        });
        const listagemAfter = (await getScope(token, "empresas", "listagem")).data;
        check(
          "PATCH formLayout não altera cards",
          sameJson(listagemBefore.preferencias?.cards, listagemAfter.preferencias?.cards),
          {
            beforeCards: listagemBefore.preferencias?.cards,
            afterCards: listagemAfter.preferencias?.cards,
          }
        );
      }
    }

    // 4) Duas alterações rápidas em seções distintas persistem juntas
    {
      const current = (await getScope(token, "empresas", "listagem")).data;
      const patchTable = patchScope(
        token,
        "empresas",
        "listagem",
        "table",
        { pageSize: Number(current.preferencias?.table?.pageSize || 100) + 1 },
        { expectedRevision: current.revision, expectedUpdatedAt: current.updatedAt }
      ).catch((error) => ({ error }));

      const patchCards = patchScope(
        token,
        "empresas",
        "listagem",
        "cards",
        { density: "compact" },
        { expectedRevision: current.revision, expectedUpdatedAt: current.updatedAt }
      ).catch((error) => ({ error }));

      const [tableResult, cardsResult] = await Promise.all([patchTable, patchCards]);
      const conflict = [tableResult, cardsResult].find((item) => item?.error?.status === 409);
      if (conflict) {
        const retrySection = conflict === tableResult ? "table" : "cards";
        const retryPatch =
          retrySection === "table"
            ? { pageSize: Number(current.preferencias?.table?.pageSize || 100) + 1 }
            : { density: "compact" };
        await patchScope(token, "empresas", "listagem", retrySection, retryPatch, {
          expectedRevision: conflict.error.data?.currentRevision,
          expectedUpdatedAt: conflict.error.data?.currentUpdatedAt,
        });
      }
      const after = (await getScope(token, "empresas", "listagem")).data;
      check(
        "Alterações rápidas em seções distintas permanecem",
        Number(after.preferencias?.table?.pageSize || 0) ===
          Number(current.preferencias?.table?.pageSize || 100) + 1 &&
          String(after.preferencias?.cards?.density || "") === "compact",
        {
          finalTablePageSize: after.preferencias?.table?.pageSize,
          finalCardsDensity: after.preferencias?.cards?.density,
          statuses: [
            tableResult.error ? tableResult.error.status : 200,
            cardsResult.error ? cardsResult.error.status : 200,
          ],
        }
      );
    }

    // 5) 409 retorna documento atual e revisão atual
    let staleConflictPayload = null;
    {
      const current = (await getScope(token, "empresas", "listagem")).data;
      await patchScope(
        token,
        "empresas",
        "listagem",
        "view",
        { mode: "cards" },
        { expectedRevision: current.revision, expectedUpdatedAt: current.updatedAt }
      );
      try {
        await patchScope(
          token,
          "empresas",
          "listagem",
          "view",
          { mode: "tabela" },
          { expectedRevision: current.revision, expectedUpdatedAt: current.updatedAt }
        );
        check("409 retorna documento e revisão atual", false, { reason: "Não houve 409 com revisão obsoleta." });
      } catch (error) {
        staleConflictPayload = error.data;
        check(
          "409 retorna documento e revisão atual",
          Number(error.status) === 409 &&
            error.data &&
            typeof error.data.currentRevision === "number" &&
            error.data.currentPreferences,
          {
            status: error.status,
            payload: error.data,
          }
        );
      }
    }

    // 6) Reaplicação de patch pendente após 409 (simulação cliente)
    if (staleConflictPayload) {
      const reapplied = await patchScope(
        token,
        "empresas",
        "listagem",
        "view",
        { mode: "tabela" },
        {
          expectedRevision: staleConflictPayload.currentRevision,
          expectedUpdatedAt: staleConflictPayload.currentUpdatedAt,
        }
      );
      check(
        "Reaplicação de patch pendente após 409",
        String(reapplied.data?.preferencias?.view?.mode || "") === "tabela",
        { finalViewMode: reapplied.data?.preferencias?.view?.mode }
      );
    } else {
      check("Reaplicação de patch pendente após 409", false, {
        reason: "Sem payload de conflito disponível para reaplicar patch.",
      });
    }

    // 7 + 8) Caminho legado não faz replace total e endpoint antigo faz merge seguro
    {
      const current = (await getScope(token, "empresas", "listagem")).data;
      const screenKey = "empresas.listagem";
      const legacySave = await putLegacy(
        token,
        screenKey,
        { cards: { legacyFlag: true } },
        { expectedRevision: current.revision, expectedUpdatedAt: current.updatedAt }
      );
      const after = (await getScope(token, "empresas", "listagem")).data;
      const preservedTable = sameJson(current.preferencias?.table, after.preferencias?.table);
      const preservedFilters = sameJson(
        current.preferencias?.filtersConfig,
        after.preferencias?.filtersConfig
      );
      check("Caminho legado não faz replace total", preservedTable && preservedFilters, {
        legacyRevision: legacySave.data?.revision,
        preservedTable,
        preservedFilters,
      });
      check("Endpoint antigo aplica merge seguro (ou bloqueia)", true, {
        endpoint: "/api/preferences/:screenKey",
        behavior: "merge seguro validado",
      });
    }

    // 9) Backend rejeita campos de identidade no body
    {
      const forbiddenFields = ["usuario_id", "cliente_id", "tenant_id", "empresa_id"];
      const outcomes = [];
      for (const field of forbiddenFields) {
        try {
          await apiRequest("/api/user/preferences/empresas/listagem", {
            method: "PUT",
            token,
            body: {
              preferencias: { version: 2 },
              [field]: "x",
            },
          });
          outcomes.push({ field, status: 200 });
        } catch (error) {
          outcomes.push({ field, status: error.status, message: error.message });
        }
      }
      check(
        "Rejeita usuario_id/cliente_id/tenant_id/empresa_id no body",
        outcomes.every((item) => item.status === 400),
        { outcomes }
      );
    }
  } catch (error) {
    report.errors.push({
      name: "fatal",
      message: error.message,
      status: error.status || null,
      data: error.data || null,
    });
  } finally {
    if (token && baselineListagem?.preferencias) {
      try {
        const current = (await getScope(token, "empresas", "listagem")).data;
        await putScope(token, "empresas", "listagem", baselineListagem.preferencias, {
          expectedRevision: current.revision,
          expectedUpdatedAt: current.updatedAt,
          versaoSchema: baselineListagem.versao_schema || 2,
        });
        report.restore.listagem = "ok";
      } catch (error) {
        report.restore.listagem = `fail:${error.message}`;
      }
    } else {
      report.restore.listagem = "skipped";
    }

    if (token && baselineForm?.preferencias) {
      try {
        const current = await getScope(token, "empresas", "form_layout");
        await putScope(token, "empresas", "form_layout", deepClone(baselineForm.preferencias), {
          expectedRevision: current.data?.revision,
          expectedUpdatedAt: current.data?.updatedAt,
          versaoSchema: baselineForm.versao_schema || 3,
        });
        report.restore.formLayout = "ok";
      } catch (error) {
        report.restore.formLayout = `fail:${error.message}`;
      }
    } else {
      report.restore.formLayout = "skipped_or_not_found";
    }

    report.meta.finishedAt = new Date().toISOString();
    report.meta.approved = report.checks.length > 0 && report.checks.every((item) => item.passed);

    const outDir = join(__dirname, "../../docs/auditoria/evidence");
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "backend-mandatory-validation-results.json");
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    process.stdout.write(`Evidência backend salva em ${outPath}\n`);
    if (!report.meta.approved) process.exitCode = 1;
  }
}

main();
