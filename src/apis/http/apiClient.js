const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL;
  if (!configured) return "";
  return String(configured).replace(/\/+$/, "");
};

const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${normalizedPath}`;
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
