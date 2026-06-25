import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/empresas-preferences-forensic-prod.spec.js",
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "on",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      VITE_API_PROXY_TARGET: "https://projetomg-production.up.railway.app",
      VITE_DEV_AUTO_LOGIN: "true",
      VITE_DEV_AUTO_LOGIN_CLIENTE: "maike",
      VITE_DEV_AUTO_LOGIN_USUARIO: "maike",
      VITE_DEV_AUTO_LOGIN_SENHA: "123",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
