import { loginSchema } from "./authSchemas.js";
import {
  createSessionTokenPayload,
  listEmpresasFromSession,
  loginWithCredentials,
  sanitizeSessionUser,
} from "./authService.js";
import { loadAccessScope } from "./accessScope.js";

const parseLoginBody = (body) => {
  const parsed = loginSchema.safeParse(body || {});
  if (parsed.success) return parsed.data;
  const firstIssue = parsed.error.issues?.[0];
  const error = new Error(firstIssue?.message || "Payload de login inválido.");
  error.statusCode = 400;
  throw error;
};

export const registerAuthRoutes = async (app) => {
  app.post("/api/auth/login", async (request, reply) => {
    try {
      const credentials = parseLoginBody(request.body);
      const session = await loginWithCredentials(credentials);
      const tokenPayload = createSessionTokenPayload(session);
      const token = await reply.jwtSign(tokenPayload, { expiresIn: "8h" });

      return {
        token,
        user: session.user,
        cliente: session.cliente,
        empresas: session.empresas,
        selectedEmpresaId: session.selectedEmpresaId,
      };
    } catch (error) {
      const statusCode = error.statusCode || 401;
      return reply.status(statusCode).send({
        message: error.message || "Falha na autenticação.",
      });
    }
  });

  app.get(
    "/api/auth/session",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await loadAccessScope(request);
      const empresas = await listEmpresasFromSession({ id: scope.userId });
      return {
        user: sanitizeSessionUser({
          id: scope.userId,
          cliente_id: scope.clienteId,
          login: request.user?.login || "",
          perfil: scope.perfil,
          acesso_global: scope.acessoGlobal,
        }),
        cliente: {
          id: scope.clienteId,
        },
        empresas,
        selectedEmpresaId: scope.selectedEmpresaId || (scope.allowAllEmpresas ? "all" : null),
      };
    }
  );

  app.get(
    "/api/auth/empresas",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await loadAccessScope(request);
      const empresas = await listEmpresasFromSession({ id: scope.userId });
      return {
        empresas,
        selectedEmpresaId: scope.selectedEmpresaId || (scope.allowAllEmpresas ? "all" : null),
      };
    }
  );
};
