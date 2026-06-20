import assert from "node:assert/strict";
import { buildEmpresaColumnFilters, buildEmpresaPanelFilters } from "@/shared/listing/buildEmpresaListFilters";

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
    assert.notEqual(lowered, "undefined", `${label}: literal "undefined" encontrado em ${path}`);
    assert.notEqual(lowered, "null", `${label}: literal "null" encontrado em ${path}`);
  });
};

const run = () => {
  const numericEquals = buildEmpresaColumnFilters({
    id_global: { type: "number", operator: "equals", value: "3073" },
  });
  assert.deepEqual(numericEquals, { id_global: 3073 });
  assertNoInvalidLiterals(numericEquals, "numericEquals");

  const numericNotEquals = buildEmpresaColumnFilters({
    id_global: { type: "number", operator: "not_equals", value: "3073" },
  });
  assert.deepEqual(numericNotEquals, { id_global__not_equals: 3073 });
  assertNoInvalidLiterals(numericNotEquals, "numericNotEquals");

  const numericBetween = buildEmpresaColumnFilters({
    id_global: { type: "number", operator: "between", value: "100", valueTo: "200" },
  });
  assert.deepEqual(numericBetween, { id_global__between: { from: 100, to: 200 } });
  assertNoInvalidLiterals(numericBetween, "numericBetween");

  const dateBetween = buildEmpresaColumnFilters({
    updatedAt: { type: "date", operator: "between", value: "2026-06-01", valueTo: "2026-06-30" },
  });
  assert.deepEqual(dateBetween, { updatedAt__between: { from: "2026-06-01", to: "2026-06-30" } });
  assertNoInvalidLiterals(dateBetween, "dateBetween");

  const customDateBetween = buildEmpresaPanelFilters({
    "custom:teste": {
      type: "date",
      operator: "between",
      value: "2026-06-01",
      valueTo: "2026-06-30",
    },
  });
  assert.deepEqual(customDateBetween, {
    "custom:teste__date_between": { from: "2026-06-01", to: "2026-06-30" },
  });
  assertNoInvalidLiterals(customDateBetween, "customDateBetween");

  const customDateGt = buildEmpresaPanelFilters({
    "custom:teste": {
      type: "date",
      operator: "gt",
      value: "2026-06-30",
    },
  });
  assert.deepEqual(customDateGt, {
    "custom:teste__date_gt": "2026-06-30",
  });
  assertNoInvalidLiterals(customDateGt, "customDateGt");

  const customNumberNotEquals = buildEmpresaPanelFilters({
    "custom:ranking": {
      type: "number",
      operator: "not_equals",
      value: "42",
    },
  });
  assert.deepEqual(customNumberNotEquals, {
    "custom:ranking__num_not_equals": 42,
  });
  assertNoInvalidLiterals(customNumberNotEquals, "customNumberNotEquals");

  const invalidPayloadIgnored = buildEmpresaColumnFilters({
    id_global: { type: "number", operator: "equals", value: undefined },
    codempresa: { type: "number", operator: "equals", values: undefined },
    updatedAt: { type: "date", operator: "between", value: "null", valueTo: "undefined" },
  });
  assert.equal(invalidPayloadIgnored, undefined);

  const panelInvalidPayloadIgnored = buildEmpresaPanelFilters({
    id_global: { type: "number", operator: "equals", value: "undefined" },
    updatedAt: { type: "date", operator: "between", value: "null", valueTo: undefined },
    "custom:teste": { type: "date", operator: "between", values: undefined, value: undefined, valueTo: undefined },
  });
  assert.equal(panelInvalidPayloadIgnored, undefined);

  console.log("frontend-filter-builder.unit: OK");
};

run();
