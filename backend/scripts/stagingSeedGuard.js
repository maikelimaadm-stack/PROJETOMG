/**
 * Guardas para scripts de seed/cleanup em ambiente staging.
 * Nunca executar seeds de isolamento em produção sem flag explícita.
 */

const PRODUCTION_HOST_MARKERS = [
  "projetomg-production",
  "makgestao.com",
  "production.up.railway.app",
];

export const maskId = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;
  if (text.length <= 10) return `${text.slice(0, 2)}…${text.slice(-2)}`;
  return `${text.slice(0, 4)}…${text.slice(-4)}`;
};

export const assertStagingSeedAllowed = ({
  allowFlag = false,
  scriptLabel = "staging seed",
} = {}) => {
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const explicitAllow =
    allowFlag ||
    process.argv.includes("--allow-staging-seed") ||
    process.argv.includes("--allow-staging-cleanup");

  if (nodeEnv === "production" && !explicitAllow) {
    throw new Error(
      `[${scriptLabel}] Bloqueado: NODE_ENV=production. Use NODE_ENV=staging ou --allow-staging-seed em ambiente controlado.`
    );
  }

  if (nodeEnv !== "staging" && !explicitAllow) {
    throw new Error(
      `[${scriptLabel}] Bloqueado: defina NODE_ENV=staging ou passe --allow-staging-seed.`
    );
  }

  const databaseUrl = String(process.env.DATABASE_URL || "").toLowerCase();
  if (!databaseUrl) {
    throw new Error(`[${scriptLabel}] DATABASE_URL ausente.`);
  }

  const looksLikeProduction = PRODUCTION_HOST_MARKERS.some((marker) =>
    databaseUrl.includes(marker)
  );
  if (looksLikeProduction && !explicitAllow) {
    throw new Error(
      `[${scriptLabel}] Bloqueado: DATABASE_URL parece produção. Use banco staging isolado.`
    );
  }
};

export const PREF_ISOLATION_TENANTS = Object.freeze([
  { codigo: "tenant1", nome: "Tenant 1 PR223" },
  { codigo: "tenant2", nome: "Tenant 2 PR223" },
]);

export const PREF_ISOLATION_USERS = Object.freeze([
  { login: "usera", nome: "Usuário A PR223", tenantCodigo: "tenant1", codigo: 1 },
  { login: "userb", nome: "Usuário B PR223", tenantCodigo: "tenant1", codigo: 2 },
  { login: "userc", nome: "Usuário C PR223", tenantCodigo: "tenant2", codigo: 1 },
]);

export const PREF_ISOLATION_SEED_MARKER = "pr223-pref-isolation-seed";
