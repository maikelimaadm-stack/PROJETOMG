const FORBIDDEN_IDENTITY_FIELDS = Object.freeze([
  "usuario_id",
  "userId",
  "cliente_id",
  "clienteId",
  "tenant_id",
  "tenantId",
  "empresa_id",
  "empresaId",
]);

export const rejectClientControlledIdentityFields = (body = {}) => {
  const found = FORBIDDEN_IDENTITY_FIELDS.filter(
    (field) => body[field] != null && String(body[field]).trim() !== ""
  );
  if (found.length > 0) {
    const error = new Error(
      `Campos de identidade não são aceitos no payload: ${found.join(", ")}. Use o token autenticado.`
    );
    error.statusCode = 400;
    throw error;
  }
};

export { FORBIDDEN_IDENTITY_FIELDS };
