import { Link } from "react-router";
import { buttonClasses } from "@/components/ui/buttonStyles";
import AuthLayout from "@/layouts/AuthLayout";

export default function NotFoundPage() {
  return (
    <AuthLayout
      title="Page not found"
      subtitle="That link does not lead anywhere. It may have been renamed or deleted."
      footer={
        <>
          Need to sign in again?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Link
        to="/workspaces"
        className={buttonClasses({ size: "lg", fullWidth: true })}
      >
        Go to your workspaces
      </Link>
    </AuthLayout>
  );
}
