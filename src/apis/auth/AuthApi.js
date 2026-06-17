import { tokenStore } from "./tokenStore";

const EMPRESA_SELECTION_KEY = "erp_empresa_id";
const DEV_AUTH_MOCK = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_MOCK === "true";

const DEV_MOCK_SESSION = {
  token: "dev-mock-token",
  user: { id: "dev-user", nome: "Desenvolvimento", login: "dev" },
  cliente: { id: "dev-cliente", codigo: "kaiman", nome: "Kaiman (mock)" },
  empresas: [{ id: "dev-empresa-1", codempresa: "001", razao_social: "EMPRESA MOCK" }],
  selectedEmpresaId: "dev-empresa-1",
  allowAllEmpresas: true,
};

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) return "";
  const configured = String(import.meta.env.VITE_API_URL || "").trim();
  if (!configured) return "";
  if (/^https?:\/\//i.test(configured)) return configured.replace(/\/+$/, "");
  return `https://${configured}`.replace(/\/+$/, "");
};

const backendOfflineMessage = () =>
  "Backend local indisponível (porta 3001). Em outro terminal: cd backend && npm install && npm run dev. Confira backend/.env (DATABASE_URL). Ou use login mock: VITE_DEV_AUTH_MOCK=true em .env.local.";

const request = async (path, { method = "GET", body, token, headers: extraHeaders } = {}) => {
  let response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extraHeaders || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    if (import.meta.env.DEV) {
      throw new Error(backendOfflineMessage());
    }
    const networkMessage = String(networkError?.message || "").trim();
    throw new Error(
      networkMessage
        ? `Falha em ${method} ${path}: ${networkMessage}`
        : `Falha em ${method} ${path}`
    );
  }

  const rawBody = await response.text().catch(() => "");
  let payload = null;
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = null;
    }
  }
  if (!response.ok) {
    if (import.meta.env.DEV && response.status >= 500 && !payload?.message) {
      throw new Error(backendOfflineMessage());
    }
    const apiMessage = String(payload?.message || "").trim();
    if (
      import.meta.env.DEV &&
      (apiMessage.includes("DATABASE_URL") || apiMessage.includes("Can't reach database"))
    ) {
      throw new Error(
        "Banco indisponível. Ajuste DATABASE_URL e DIRECT_URL em backend/.env (credenciais reais do Supabase/Postgres)."
      );
    }
    if (import.meta.env.DEV && apiMessage.includes("PROJECT_REF")) {
      throw new Error(
        "backend/.env ainda está com valores de exemplo. Copie as URLs reais do Supabase em DATABASE_URL e DIRECT_URL."
      );
    }
    const fallbackMessage = rawBody
      ? `Falha em ${method} ${path} (HTTP ${response.status})`
      : `Falha em ${method} ${path}`;
    const error = new Error(apiMessage || fallbackMessage);
    error.status = response.status;
    throw error;
  }
  return payload;
};

const emitAuthChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("erp-auth-changed"));
};

const isEmpresaScopeError = (error) => {
  if (Number(error?.status) !== 403) return false;
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("empresa não permitida") ||
    message.includes("sem permissão para visualizar todas as empresas")
  );
};

export const AuthApi = {
  getToken() {
    return tokenStore.getToken();
  },

  setToken(token) {
    if (!token) return;
    tokenStore.setToken(token);
    emitAuthChange();
  },

  getSelectedEmpresaId() {
    try {
      return localStorage.getItem(EMPRESA_SELECTION_KEY) || null;
    } catch {
      return null;
    }
  },

  setSelectedEmpresaId(empresaId) {
    if (!empresaId) {
      localStorage.removeItem(EMPRESA_SELECTION_KEY);
    } else {
      localStorage.setItem(EMPRESA_SELECTION_KEY, empresaId);
    }
    emitAuthChange();
  },

  clearSession() {
    tokenStore.clearToken();
    localStorage.removeItem(EMPRESA_SELECTION_KEY);
    emitAuthChange();
  },

  isConfigured() {
    return true;
  },

  async login(credentials) {
    if (DEV_AUTH_MOCK) {
      const payload = { ...DEV_MOCK_SESSION };
      this.setToken(payload.token);
      this.setSelectedEmpresaId(payload.selectedEmpresaId);
      return payload;
    }

    const payload = await request("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    if (payload?.token) {
      this.setToken(payload.token);
    }
    if (payload?.selectedEmpresaId) {
      this.setSelectedEmpresaId(payload.selectedEmpresaId);
    }
    return payload;
  },

  async getCurrentUser() {
    const session = await this.getSession();
    return session?.user || null;
  },

  async getSession() {
    const token = this.getToken();
    if (DEV_AUTH_MOCK && token === DEV_MOCK_SESSION.token) {
      return {
        user: DEV_MOCK_SESSION.user,
        cliente: DEV_MOCK_SESSION.cliente,
        empresas: DEV_MOCK_SESSION.empresas,
        selectedEmpresaId: this.getSelectedEmpresaId() || DEV_MOCK_SESSION.selectedEmpresaId,
        allowAllEmpresas: true,
      };
    }
    const selectedEmpresaId = this.getSelectedEmpresaId();
    try {
      return await request("/api/auth/session", {
        method: "GET",
        token,
        headers: selectedEmpresaId ? { "X-Empresa-Id": String(selectedEmpresaId) } : {},
      });
    } catch (error) {
      if (selectedEmpresaId && isEmpresaScopeError(error)) {
        this.setSelectedEmpresaId(null);
        try {
          return await request("/api/auth/session", {
            method: "GET",
            token,
          });
        } catch (retryError) {
          if (Number(retryError?.status) === 401) return null;
          throw retryError;
        }
      }
      if (Number(error?.status) === 401) return null;
      throw error;
    }
  },

  async listEmpresas() {
    const token = this.getToken();
    if (DEV_AUTH_MOCK && token === DEV_MOCK_SESSION.token) {
      return DEV_MOCK_SESSION.empresas;
    }
    const selectedEmpresaId = this.getSelectedEmpresaId();
    try {
      const payload = await request("/api/auth/empresas", {
        method: "GET",
        token,
        headers: selectedEmpresaId ? { "X-Empresa-Id": String(selectedEmpresaId) } : {},
      });
      return payload?.empresas || [];
    } catch (error) {
      if (selectedEmpresaId && isEmpresaScopeError(error)) {
        this.setSelectedEmpresaId(null);
        const payload = await request("/api/auth/empresas", {
          method: "GET",
          token,
        });
        return payload?.empresas || [];
      }
      if (Number(error?.status) === 401) return [];
      throw error;
    }
  },

  async logout() {
    const token = this.getToken();
    if (!(DEV_AUTH_MOCK && token === DEV_MOCK_SESSION.token)) {
      try {
        await request("/api/auth/logout", { method: "POST", token });
      } catch {
        // ignora falha de logout remoto e limpa sessão local
      }
    }
    this.clearSession();
    return true;
  },

  onAuthStateChange(callback) {
    const handler = () => callback("session_changed");
    window.addEventListener("erp-auth-changed", handler);
    return {
      unsubscribe: () => {
        window.removeEventListener("erp-auth-changed", handler);
      },
    };
  },
};
