import type { ReactNode } from "react";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-95">
        <div className="flex justify-center">
          <Logo />
        </div>

        <section className="mt-8 rounded-card border border-line bg-surface p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-ink-muted">{subtitle}</p>

          <div className="mt-7">{children}</div>
        </section>

        <p className="mt-5 text-center text-ink-muted">{footer}</p>
      </div>
    </main>
  );
}
