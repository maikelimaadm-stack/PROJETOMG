const requiredRuntimeVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
];

const requiredProductionVars = [
  "FRONTEND_ORIGINS",
];

const missingVars = (keys = []) => keys.filter((key) => !String(process.env[key] || "").trim());

export const validateRuntimeEnv = () => {
  const missing = [
    ...missingVars(requiredRuntimeVars),
    ...(String(process.env.NODE_ENV || "").toLowerCase() === "production" ? missingVars(requiredProductionVars) : []),
  ];

  if (missing.length === 0) return true;

  throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}`);
};

