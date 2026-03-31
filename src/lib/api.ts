const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Extract the most useful error message from a backend response body. */
function extractErrorDetail(body: Record<string, unknown>, statusText: string): string {
  if (typeof body.message === "string" && body.message) return body.message;
  if (typeof body.error === "string" && body.error) return body.error;
  if (typeof body.detail === "string" && body.detail) return body.detail;
  if (Array.isArray(body.errors)) {
    const joined = body.errors
      .map((e: { msg?: string }) => (typeof e === "object" && e?.msg ? e.msg : String(e)))
      .join("; ");
    if (joined) return joined;
  }
  return statusText || "Unknown error";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const url = `${API_BASE}${path}`;
  const method = options?.method || "GET";

  console.log(`[API] ${method} ${url}`);
  console.log(`[API]   Base URL: ${API_BASE}`);
  console.log(`[API]   Auth token present: ${Boolean(token)}`);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch (networkErr) {
    console.error(`[API] ${method} ${url} → Network error (request never reached server):`, networkErr);
    throw networkErr;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error(`[API] ${method} ${url} → ${res.status} ${res.statusText}`);
    console.error(`[API]   Response body:`, JSON.stringify(body, null, 2));
    const detail = extractErrorDetail(body, res.statusText);
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json();
}

async function uploadRequest<T>(path: string, body: FormData): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const url = `${API_BASE}${path}`;

  console.log(`[API] POST (upload) ${url}`);
  console.log(`[API]   Base URL: ${API_BASE}`);
  console.log(`[API]   Auth token present: ${Boolean(token)}`);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    });
  } catch (networkErr) {
    console.error(`[API] POST (upload) ${url} → Network error:`, networkErr);
    throw networkErr;
  }

  if (!res.ok) {
    const resBody = await res.json().catch(() => ({}));
    console.error(`[API] POST (upload) ${url} → ${res.status} ${res.statusText}`);
    console.error(`[API]   Response body:`, JSON.stringify(resBody, null, 2));
    const detail = extractErrorDetail(resBody, res.statusText);
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, data: FormData) => uploadRequest<T>(path, data),
};
