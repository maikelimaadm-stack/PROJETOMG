import { loginSchema } from "./authSchemas.js";
import {
  buildSessionUserFromToken,
  createSessionTokenPayload,
  listEmpresasFromSession,
  loginWithCredentials,
} from "./authService.js";
import { loadAccessScope } from "./accessScope.js";
import { getSessionEmpresas } from "./sessionCache.js";

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
        allowAllEmpresas: session.allowAllEmpresas,
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
      const cached = getSessionEmpresas(scope.userId);
      const empresas = cached?.items?.length ? cached.items : await listEmpresasFromSession({ id: scope.userId });
      return {
        user: buildSessionUserFromToken(request.user),
        cliente: {
          id: scope.clienteId,
        },
        empresas,
        empresasTotal: cached?.total ?? Number(request.user?.empresas_total ?? empresas.length),
        empresasHasMore: Boolean(cached?.hasMore),
        selectedEmpresaId: scope.selectedEmpresaId || (scope.allowAllEmpresas ? "all" : null),
        allowAllEmpresas: scope.acessoGlobal,
      };
    }
  );

  app.get(
    "/api/auth/empresas",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await loadAccessScope(request);
      const cached = getSessionEmpresas(scope.userId);
      const empresas = cached?.items?.length ? cached.items : await listEmpresasFromSession({ id: scope.userId });
      return {
        empresas,
        selectedEmpresaId: scope.selectedEmpresaId || (scope.allowAllEmpresas ? "all" : null),
        allowAllEmpresas: scope.acessoGlobal,
      };
    }
  );
};
