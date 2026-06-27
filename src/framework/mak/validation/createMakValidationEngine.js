/**
 * Validation Engine — delega ao schema Zod declarado no módulo.
 */
export function createMakValidationEngine({ schema = null } = {}) {
  return Object.freeze({
    schema,
    parse: (data) => {
      if (schema && typeof schema.parse === "function") return schema.parse(data);
      return data;
    },
    safeParse: (data) => {
      if (schema && typeof schema.safeParse === "function") return schema.safeParse(data);
      return { success: true, data };
    },
    hasSchema: () => Boolean(schema),
  });
}

export default createMakValidationEngine;
