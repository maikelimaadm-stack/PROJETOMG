import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3001";

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("react-dom") || id.includes("/react/")) return "vendor-react";
            if (id.includes("@tanstack/react-query")) return "vendor-query";
            if (id.includes("@tanstack/react-virtual")) return "vendor-virtual";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("@radix-ui")) return "vendor-radix";
            return undefined;
          },
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              // Produção não aceita localhost no CORS; proxy server-side não envia Origin.
              proxyReq.removeHeader("origin");
              proxyReq.removeHeader("referer");
            });
          },
        },
      },
    },
    plugins: [
      react(),
    ],
  };
});