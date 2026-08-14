import type { ApiResponse } from "../types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const getToken = (): string | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("token");
  }
  return null;
};

interface RequestOptions extends RequestInit {
  body?: any;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  try {
    const res = await fetch(url, {
      ...restOptions,
      headers,
      body:
        body !== undefined && !(body instanceof FormData)
          ? JSON.stringify(body)
          : body,
    });

    let json: ApiResponse<T>;
    try {
      json = await res.json();
    } catch {
      throw new ApiError(
        `Failed to parse response from server (${res.status})`,
        res.status
      );
    }

    if (!res.ok || json.success === false) {
      const errorMessage =
        json.message || `API request failed with status ${res.status}`;
      throw new ApiError(errorMessage, res.status, json.error);
    }

    return json;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || "Network error occurred while contacting Neuschool API",
      500
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "POST", body }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
