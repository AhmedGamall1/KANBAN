import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { useTheme, type Theme } from "@/theme/useTheme";

const OPTIONS: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex w-full rounded-control border border-line p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={[
            "flex flex-1 items-center justify-center rounded-control py-1 transition-colors",
            theme === value
              ? "bg-brand-soft text-brand"
              : "text-ink-faint hover:bg-subtle hover:text-ink",
          ].join(" ")}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
