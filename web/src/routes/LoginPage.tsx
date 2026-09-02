import type { SubmitEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth, useLogin } from "@/auth/useAuth";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import AuthLayout from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { user } = useAuth();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const error = login.error instanceof ApiError ? login.error : null;
  const hasFieldErrors = Object.keys(error?.fieldErrors ?? {}).length > 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const state = location.state as { from?: string } | null;

    login.mutate(
      {
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
      },
      {
        onSuccess: () => {
          navigate(state?.from ?? "/workspaces", { replace: true });
        },
      },
    );
  }

  if (user) {
    return <Navigate to="/workspaces" replace />;
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
    </AuthLayout>
  );
}
