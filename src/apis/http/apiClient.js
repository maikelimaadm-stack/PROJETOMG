const getApiBaseUrl = () => {
  if (import.meta.env.DEV) return "";
  const configured = String(import.meta.env.VITE_API_URL || "").trim();
  const defaultProductionApiUrl = "https://projetomg-production.up.railway.app";

  const normalizeUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value.replace(/\/+$/, "");
    // Common misconfiguration in Vercel: domain without protocol.
    return `https://${value}`.replace(/\/+$/, "");
  };

  if (configured) return normalizeUrl(configured);
  if (import.meta.env.PROD) return defaultProductionApiUrl;
  return "";
};

const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${normalizedPath}`;
};

const getAuthToken = () => {
  try {
    const token = localStorage.getItem("erp_auth_token");
    if (token && token.trim()) return token.trim();
  } catch {
    // noop
  }
  return null;
};

const clearAuthSession = () => {
  try {
    localStorage.removeItem("erp_auth_token");
    localStorage.removeItem("erp_empresa_id");
  } catch {
    // noop
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("erp-auth-changed"));
  }
};

const getSelectedEmpresaId = () => {
  try {
    const empresaId = localStorage.getItem("erp_empresa_id");
    if (empresaId && empresaId.trim()) return empresaId.trim();
  } catch {
    // noop
  }
  return null;
};

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const resolveEmpresaHeader = (empresaHeader) => {
  if (empresaHeader === false) return {};
  if (empresaHeader != null && String(empresaHeader).trim()) {
    return { "X-Empresa-Id": String(empresaHeader).trim() };
  }
  const selectedEmpresaId = getSelectedEmpresaId();
  if (selectedEmpresaId) return { "X-Empresa-Id": selectedEmpresaId };
  return {};
};

export const apiClient = {
  async request(path, { method = "GET", body, headers = {}, signal, empresaHeader } = {}) {
    const token = getAuthToken();
    const hasJsonBody = body != null && !(body instanceof FormData);
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...resolveEmpresaHeader(empresaHeader),
        ...headers,
      },
      body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal,
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession();
      }
      throw new ApiError(
        response.status === 401
          ? "Sessão expirada ou inválida. Faça login novamente."
          : payload?.message || `Falha na requisição ${method} ${path}`,
        response.status,
        payload
      );
    }
    return payload;
  },

  get(path, options) {
    return this.request(path, { ...options, method: "GET" });
  },

  post(path, body, options) {
    return this.request(path, { ...options, method: "POST", body });
  },

  put(path, body, options) {
    return this.request(path, { ...options, method: "PUT", body });
  },

  delete(path, options) {
    return this.request(path, { ...options, method: "DELETE" });
  },

  async download(path, { filename, empresaHeader, signal } = {}) {
    const token = getAuthToken();
    const response = await fetch(buildUrl(path), {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...resolveEmpresaHeader(empresaHeader),
      },
      signal,
    });

    if (!response.ok) {
      const payload = await parseResponse(response);
      throw new ApiError(
        payload?.message || `Falha ao baixar ${path}`,
        response.status,
        payload
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "export.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
