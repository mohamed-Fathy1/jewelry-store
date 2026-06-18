import { AxiosError } from "axios";

// Error envelope returned by the backend: { success, message, error?, stack? }.
interface ApiErrorBody {
  success?: boolean;
  message?: string;
  error?: unknown;
}

// Maps an API/axios error to a clear, user-facing message, honoring the
// documented status codes (400/401/403/404). 401 is handled by the axios
// interceptor (redirect to /admin/login), so we still return a sane string.
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const axiosErr = error as AxiosError<ApiErrorBody>;
  const status = axiosErr?.response?.status;
  const serverMessage = axiosErr?.response?.data?.message;

  switch (status) {
    case 400:
      return serverMessage || "Invalid request. Please check your input.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return serverMessage || "Order not found.";
    default:
      return serverMessage || fallback;
  }
}
