/**
 * Verifica se o backend local responde na porta 3001.
 * Uso: node scripts/check-local-api.mjs
 */
const BASE = process.env.API_BASE || "http://127.0.0.1:3001";

async function main() {
  try {
    const health = await fetch(`${BASE}/api/health`);
    const healthBody = await health.json().catch(() => null);
    console.log(`GET /api/health → ${health.status}`, healthBody ? JSON.stringify(healthBody) : "");

    const login = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente: "kaiman", usuario: "maike", senha: "123" }),
    });
    const loginBody = await login.json().catch(() => null);
    console.log(`POST /api/auth/login → ${login.status}`, loginBody?.message || loginBody?.token ? "OK (token)" : "");

    if (!login.ok) {
      process.exitCode = 1;
      console.error("\nLogin falhou. Verifique backend/.env, seed (npm run seed) e credenciais.");
    }
  } catch (error) {
    console.error(`Não conectou em ${BASE}:`, error.message);
    console.error("\nSuba a API: cd backend && npm run dev");
    process.exitCode = 1;
  }
}

main();
