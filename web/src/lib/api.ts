const BASE_URL = "/api";

interface ValidationBody {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

interface ExceptionBody {
  message: string | string[];
  error?: string;
  statusCode: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

function isValidationBody(body: unknown): body is ValidationBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "fieldErrors" in body &&
    "formErrors" in body
  );
}

function isExceptionBody(body: unknown): body is ExceptionBody {
  return typeof body === "object" && body !== null && "message" in body;
}

function toApiError(status: number, body: unknown): ApiError {
  if (isValidationBody(body)) {
    const firstField = Object.values(body.fieldErrors)[0]?.[0];
    const message =
      body.formErrors[0] ?? firstField ?? "Please check the form and try again.";

    return new ApiError(status, message, body.fieldErrors);
  }

  if (isExceptionBody(body)) {
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message;

    return new ApiError(status, message);
  }

  return new ApiError(status, `Request failed with status ${status}`);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers:
        init?.body === undefined
          ? init?.headers
          : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the API running?");
  }

  const text = await response.text();
  const body: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw toApiError(response.status, body);
  }

  return body as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};
