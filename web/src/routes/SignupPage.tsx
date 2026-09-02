import type { SubmitEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth, useSignup } from "@/auth/useAuth";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import AuthLayout from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";

export default function SignupPage() {
  const { user } = useAuth();
  const signup = useSignup();
  const navigate = useNavigate();
  const location = useLocation();

  const error = signup.error instanceof ApiError ? signup.error : null;
  const hasFieldErrors = Object.keys(error?.fieldErrors ?? {}).length > 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const state = location.state as { from?: string } | null;

    signup.mutate(
      {
        name: String(data.get("name") ?? ""),
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
      title="Create your account"
      subtitle="Set up your account and start your first board."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-medium text-brand hover:underline"
          >
            Log in
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
          label="Name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          error={error?.fieldError("name")}
        />

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
          autoComplete="new-password"
          hint="At least 8 characters."
          error={error?.fieldError("password")}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-1"
          disabled={signup.isPending}
        >
          {signup.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
