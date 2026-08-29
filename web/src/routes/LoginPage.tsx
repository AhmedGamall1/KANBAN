import type { FormEvent } from "react";
import { Link } from "react-router";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import AuthLayout from "@/layouts/AuthLayout";

export default function LoginPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Pick up where your team left off."
      footer={
        <>
          New to Collab Board?{" "}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
        />

        <Button type="submit" size="lg" fullWidth className="mt-1">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
