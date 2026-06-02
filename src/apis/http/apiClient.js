const getApiBaseUrl = () => {
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

const getTenantId = () => {
  try {
    const tenant = localStorage.getItem("erp_tenant_id");
    if (tenant && tenant.trim()) return tenant.trim();
  } catch {
    // noop
  }
  return "default";
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

export const apiClient = {
  async request(path, { method = "GET", body, headers = {}, signal } = {}) {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        "X-Tenant-Id": getTenantId(),
        ...headers,
      },
      body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal,
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(
        payload?.message || `Falha na requisição ${method} ${path}`,
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
};
