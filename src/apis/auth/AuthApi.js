const AUTH_TOKEN_KEY = "erp_auth_token";
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
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extraHeaders || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    if (import.meta.env.DEV) {
      throw new Error(backendOfflineMessage());
    }
    throw new Error(`Falha em ${method} ${path}`);
  }

  const payload = await response.json().catch(() => null);
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
    throw new Error(apiMessage || `Falha em ${method} ${path}`);
  }
  return payload;
};

const emitAuthChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("erp-auth-changed"));
};

export const AuthApi = {
  getToken() {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },

  setToken(token) {
    if (!token) return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
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
    if (!token) return null;
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
    return request("/api/auth/session", {
      method: "GET",
      token,
      headers: selectedEmpresaId ? { "X-Empresa-Id": String(selectedEmpresaId) } : {},
    });
  },

  async listEmpresas() {
    const token = this.getToken();
    if (!token) return [];
    if (DEV_AUTH_MOCK && token === DEV_MOCK_SESSION.token) {
      return DEV_MOCK_SESSION.empresas;
    }
    const selectedEmpresaId = this.getSelectedEmpresaId();
    const payload = await request("/api/auth/empresas", {
      method: "GET",
      token,
      headers: selectedEmpresaId ? { "X-Empresa-Id": String(selectedEmpresaId) } : {},
    });
    return payload?.empresas || [];
  },

  async logout() {
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
