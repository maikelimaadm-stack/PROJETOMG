const requiredRuntimeVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "JWT_SECRET",
];

const missingVars = (keys = []) => keys.filter((key) => !String(process.env[key] || "").trim());

export const validateRuntimeEnv = () => {
  const missing = [...missingVars(requiredRuntimeVars)];

  if (missing.length === 0) return true;

  throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}`);
};

