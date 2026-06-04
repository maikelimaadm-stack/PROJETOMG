const AUTH_TOKEN_KEY = "erp_auth_token";
const EMPRESA_SELECTION_KEY = "erp_empresa_id";

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) return "";
  const configured = String(import.meta.env.VITE_API_URL || "").trim();
  if (!configured) return "";
  if (/^https?:\/\//i.test(configured)) return configured.replace(/\/+$/, "");
  return `https://${configured}`.replace(/\/+$/, "");
};

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
      throw new Error(
        "API indisponível. Inicie o backend local: cd backend && cp .env.example .env (preencha DATABASE_URL) && npm install && npm run dev — porta 3001."
      );
    }
    throw new Error(`Falha em ${method} ${path}`);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || `Falha em ${method} ${path}`);
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
