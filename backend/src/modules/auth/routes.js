import { loginSchema } from "./authSchemas.js";
import {
  buildSessionUserFromToken,
  createSessionTokenPayload,
  listEmpresasFromSession,
  loginWithCredentials,
  sanitizeSessionUser,
} from "./authService.js";
import { loadAccessScope } from "./accessScope.js";
import { getSessionEmpresas } from "./sessionCache.js";
import { revokeAuthToken } from "./tokenDenylist.js";

const parseLoginBody = (body) => {
  const parsed = loginSchema.safeParse(body || {});
  if (parsed.success) return parsed.data;
  const firstIssue = parsed.error.issues?.[0];
  const error = new Error(firstIssue?.message || "Payload de login inválido.");
  error.statusCode = 400;
  throw error;
};

const resolveCookieAttributes = () => {
  const secureCookie =
    String(process.env.NODE_ENV || "").toLowerCase() === "production" ||
    String(process.env.AUTH_COOKIE_SECURE || "").toLowerCase() === "true";
  const sameSite = String(process.env.AUTH_COOKIE_SAMESITE || "Lax").trim() || "Lax";
  const maxAgeSeconds = Math.max(300, Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS || 8 * 60 * 60));
  const path = String(process.env.AUTH_COOKIE_PATH || "/").trim() || "/";
  return { secureCookie, sameSite, maxAgeSeconds, path };
};

const buildAuthSetCookieHeader = (token) => {
  const { secureCookie, sameSite, maxAgeSeconds, path } = resolveCookieAttributes();
  return [
    `erp_auth_token=${encodeURIComponent(token)}`,
    `Path=${path}`,
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    `SameSite=${sameSite}`,
    ...(secureCookie ? ["Secure"] : []),
  ].join("; ");
};

const buildAuthClearCookieHeader = () => {
  const { secureCookie, sameSite, path } = resolveCookieAttributes();
  return [
    "erp_auth_token=",
    `Path=${path}`,
    "Max-Age=0",
    "HttpOnly",
    `SameSite=${sameSite}`,
    ...(secureCookie ? ["Secure"] : []),
  ].join("; ");
};

const shouldExposeTokenInBody = () => {
  const explicit = String(process.env.AUTH_EXPOSE_TOKEN_IN_BODY || "").trim().toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return String(process.env.NODE_ENV || "").toLowerCase() !== "production";
};

export const registerAuthRoutes = async (app) => {
  app.post("/api/auth/login", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    try {
      const credentials = parseLoginBody(request.body);
      const session = await loginWithCredentials(credentials);
      const tokenPayload = createSessionTokenPayload(session);
      const token = await reply.jwtSign(tokenPayload, { expiresIn: "8h" });
      reply.header("Set-Cookie", buildAuthSetCookieHeader(token));

      return {
        ...(shouldExposeTokenInBody() ? { token } : {}),
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
        user: sanitizeSessionUser({
          ...buildSessionUserFromToken(request.user),
          codigo: scope.user?.codigo ?? request.user?.codigo ?? null,
          nome: scope.user?.nome ?? request.user?.nome ?? null,
          login: scope.user?.login ?? request.user?.login,
          email: scope.user?.email ?? request.user?.email ?? null,
          telefone: scope.user?.telefone ?? request.user?.telefone ?? null,
          cliente_id: scope.user?.cliente_id ?? request.user?.cliente_id,
          perfil: scope.perfil,
          acesso_global: scope.acessoGlobal,
          ativo: scope.user?.ativo !== false,
          ultimo_acesso: scope.user?.ultimo_acesso ?? request.user?.ultimo_acesso ?? null,
        }),
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

  app.post("/api/auth/logout", { preHandler: app.authenticate }, async (request, reply) => {
    revokeAuthToken({
      token: request.authTokenRaw || null,
      jti: request.user?.jti || null,
      exp: request.user?.exp || null,
    });
    reply.header("Set-Cookie", buildAuthClearCookieHeader());
    return { ok: true };
  });

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
