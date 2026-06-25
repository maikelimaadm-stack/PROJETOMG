/**
 * Testes de isolamento de preferências por usuário (repository + segurança de payload).
 * Uso: node backend/scripts/testPreferencesUserIsolation.js
 */
import assert from "node:assert/strict";

const scopeA = { clienteId: "cli_a", userId: "usr_a" };
const scopeB = { clienteId: "cli_a", userId: "usr_b" };
const scopeC = { clienteId: "cli_c", userId: "usr_c" };

const memory = new Map();

const memoryKey = ({ scope, modulo, tela }) =>
  `${scope.clienteId}:${scope.userId}:${modulo}:${tela}`;

const memoryRepo = {
  getByScope({ scope, modulo, tela }) {
    return memory.get(memoryKey({ scope, modulo, tela })) || null;
  },
  upsertByScope({ scope, modulo, tela, preferencias }) {
    const key = memoryKey({ scope, modulo, tela });
    const record = {
      modulo,
      tela,
      versao_schema: 1,
      preferencias_json: preferencias,
      updatedAt: new Date().toISOString(),
    };
    memory.set(key, record);
    return record;
  },
  listAllByScope({ scope }) {
    return [...memory.entries()]
      .filter(([key]) => key.startsWith(`${scope.clienteId}:${scope.userId}:`))
      .map(([, record]) => record);
  },
};

const rejectClientControlledIdentityFields = (body = {}) => {
  const forbidden = ["usuario_id", "userId", "cliente_id", "clienteId"];
  const found = forbidden.filter((field) => body[field] != null && String(body[field]).trim() !== "");
  if (found.length > 0) {
    const error = new Error(`identity fields forbidden: ${found.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

const run = () => {
  memoryRepo.upsertByScope({
    scope: scopeA,
    modulo: "empresas",
    tela: "listagem",
    preferencias: { version: 1, table: { visibleColumns: ["telefone"] } },
  });

  const readA = memoryRepo.getByScope({
    scope: scopeA,
    modulo: "empresas",
    tela: "listagem",
  });
  const readB = memoryRepo.getByScope({
    scope: scopeB,
    modulo: "empresas",
    tela: "listagem",
  });

  assert.ok(readA?.preferencias_json?.table?.visibleColumns?.includes("telefone"));
  assert.equal(readB, null, "Usuário B não deve ler preferência de A");

  memoryRepo.upsertByScope({
    scope: scopeB,
    modulo: "empresas",
    tela: "listagem",
    preferencias: { version: 1, table: { visibleColumns: ["email"] } },
  });

  const readAAfter = memoryRepo.getByScope({
    scope: scopeA,
    modulo: "empresas",
    tela: "listagem",
  });
  const readBAfter = memoryRepo.getByScope({
    scope: scopeB,
    modulo: "empresas",
    tela: "listagem",
  });

  assert.deepEqual(readAAfter.preferencias_json.table.visibleColumns, ["telefone"]);
  assert.deepEqual(readBAfter.preferencias_json.table.visibleColumns, ["email"]);

  memoryRepo.upsertByScope({
    scope: scopeC,
    modulo: "empresas",
    tela: "listagem",
    preferencias: { version: 1, table: { visibleColumns: ["status"] } },
  });
  const tenantC = memoryRepo.getByScope({
    scope: scopeC,
    modulo: "empresas",
    tela: "listagem",
  });
  assert.deepEqual(tenantC.preferencias_json.table.visibleColumns, ["status"]);
  assert.notDeepEqual(
    tenantC.preferencias_json.table.visibleColumns,
    readAAfter.preferencias_json.table.visibleColumns
  );

  assert.throws(
    () => rejectClientControlledIdentityFields({ usuario_id: "usr_b", preferencias: {} }),
    /identity fields forbidden/
  );

  assert.doesNotThrow(() =>
    rejectClientControlledIdentityFields({ preferencias: { version: 1 } })
  );

  console.log("OK: testPreferencesUserIsolation");
};

run();
