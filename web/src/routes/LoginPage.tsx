import type { SubmitEvent } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router";
import { useAuth, useLogin } from "@/auth/useAuth";
import ProviderButtons from "@/components/auth/ProviderButtons";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import AuthLayout from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";

const PROVIDER_ERRORS: Record<string, string> = {
  state: "That sign in attempt expired. Please try again.",
  unverified_email:
    "That account's email address is not verified with the provider.",
  failed: "Could not finish signing in. Please try again.",
};

export default function LoginPage() {
  const { user } = useAuth();
  const login = useLogin();
  const location = useLocation();

  const [params] = useSearchParams();

  const state = location.state as { from?: string } | null;
  const error = login.error instanceof ApiError ? login.error : null;
  const hasFieldErrors = Object.keys(error?.fieldErrors ?? {}).length > 0;
  const providerError = PROVIDER_ERRORS[params.get("error") ?? ""];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    login.mutate({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });
  }

  if (user) {
    return <Navigate to={state?.from ?? "/workspaces"} replace />;
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Pick up where your team left off."
      footer={
        <>
          New to Collab Board?{" "}
          <Link
            to="/signup"
            state={location.state}
            className="font-medium text-brand hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {providerError && (
        <p className="mb-4 rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
          {providerError}
        </p>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && !hasFieldErrors && (
          <p className="rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
            {error.message}
          </p>
        )}

        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={error?.fieldError("email")}
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          error={error?.fieldError("password")}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-1"
          disabled={login.isPending}
        >
          {login.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <ProviderButtons next={state?.from} />
    </AuthLayout>
  );
}
