import type { FormEvent } from "react";
import { Link } from "react-router";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import AuthLayout from "@/layouts/AuthLayout";

export default function SignupPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your account and start your first board."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
        />

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
          autoComplete="new-password"
          hint="At least 8 characters."
        />

        <Button type="submit" size="lg" fullWidth className="mt-1">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
