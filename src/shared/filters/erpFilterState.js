import {
  ERP_OPERATORS_WITHOUT_VALUE,
  getErpDefaultOperator,
} from "@/shared/filters/erpFilterOperators";

export function createErpFilter(filterType = "text", overrides = {}) {
  const type = filterType || "text";
  const operator =
    overrides.operator !== undefined ? overrides.operator : getErpDefaultOperator(type);
  return {
    ...overrides,
    type,
    operator,
    value: overrides.value ?? "",
    valueTo: overrides.valueTo ?? "",
    values: Array.isArray(overrides.values) ? [...overrides.values] : [],
  };
}

export function cloneErpFilter(filter) {
  if (!filter || typeof filter !== "object") {
    return createErpFilter("text");
  }
  return createErpFilter(filter.type || "text", {
    operator: filter.operator,
    value: filter.value ?? "",
    valueTo: filter.valueTo ?? "",
    values: Array.isArray(filter.values) ? [...filter.values] : [],
  });
}

export function isErpFilterActive(filter) {
  if (!filter) return false;
  if (Array.isArray(filter)) return filter.length > 0;

  if (typeof filter !== "object") {
    return filter != null && String(filter).trim() !== "";
  }

  const operator = String(filter.operator || "").trim();
  if (ERP_OPERATORS_WITHOUT_VALUE.has(operator)) return true;

  const hasValues = Array.isArray(filter.values) && filter.values.length > 0;
  const hasValue = filter.value != null && String(filter.value).trim() !== "";
  const hasValueTo = filter.valueTo != null && String(filter.valueTo).trim() !== "";

  return hasValues || hasValue || hasValueTo;
}

export function clearErpFilter(filterType = "text") {
  return createErpFilter(filterType);
}

/** Normaliza filtro legado (array de strings) para objeto ErpFilter. */
export function normalizeLegacyErpFilter(legacyValues = [], filterType = "text") {
  if (!Array.isArray(legacyValues)) return createErpFilter(filterType);

  if (filterType === "number" || filterType === "money") {
    const minToken = legacyValues.find((item) => String(item).startsWith("min:"));
    const maxToken = legacyValues.find((item) => String(item).startsWith("max:"));
    const listValues = legacyValues.filter(
      (item) => !String(item).startsWith("min:") && !String(item).startsWith("max:")
    );
    if (minToken || maxToken) {
      return createErpFilter(filterType, {
        operator: "between",
        value: minToken ? String(minToken).replace("min:", "") : "",
        valueTo: maxToken ? String(maxToken).replace("max:", "") : "",
        values: listValues,
      });
    }
    return createErpFilter(filterType, {
      operator: "equals",
      value: listValues[0] ?? "",
      values: listValues,
    });
  }

  if (filterType === "date") {
    const startToken = legacyValues.find((item) => String(item).startsWith("start:"));
    const endToken = legacyValues.find((item) => String(item).startsWith("end:"));
    const listValues = legacyValues.filter(
      (item) => !String(item).startsWith("start:") && !String(item).startsWith("end:")
    );
    if (startToken || endToken) {
      return createErpFilter(filterType, {
        operator: "between",
        value: startToken ? String(startToken).replace("start:", "") : "",
        valueTo: endToken ? String(endToken).replace("end:", "") : "",
        values: listValues,
      });
    }
    return createErpFilter(filterType, {
      operator: "equals",
      value: listValues[0] ?? "",
      values: listValues,
    });
  }

  if (filterType === "enum" || filterType === "boolean") {
    return createErpFilter(filterType, { values: legacyValues });
  }

  return createErpFilter(filterType, {
    operator: "equals",
    value: legacyValues[0] ?? "",
    values: legacyValues,
  });
}

/** Normaliza valor de painel (array legado ou objeto) para ErpFilter. */
export function normalizePanelFilterValue(value, filterType = "text") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return cloneErpFilter({ type: filterType, ...value });
  }
  if (Array.isArray(value)) {
    if (filterType === "enum" || filterType === "boolean") {
      return createErpFilter(filterType, { values: value });
    }
    return normalizeLegacyErpFilter(value, filterType);
  }
  return createErpFilter(filterType);
}
