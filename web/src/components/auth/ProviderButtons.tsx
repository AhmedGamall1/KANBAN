import { buttonClasses } from "@/components/ui/buttonStyles";
import { GitHubIcon, GoogleIcon } from "@/components/ui/icons";

const PROVIDERS = [
  { id: "google", label: "Continue with Google", Icon: GoogleIcon },
  { id: "github", label: "Continue with GitHub", Icon: GitHubIcon },
];

interface ProviderButtonsProps {
  next?: string;
}

export default function ProviderButtons({ next }: ProviderButtonsProps) {
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-faint">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {PROVIDERS.map(({ id, label, Icon }) => (
          <a
            key={id}
            href={`/api/auth/oauth/${id}${query}`}
            className={buttonClasses({
              variant: "secondary",
              size: "lg",
              fullWidth: true,
            })}
          >
            <Icon />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
