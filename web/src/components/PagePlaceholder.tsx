interface PagePlaceholderProps {
  title: string
  note: string
}

export default function PagePlaceholder({ title, note }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-xl font-medium">{title}</h1>
      <p className="mt-2 text-ink-muted">{note}</p>
    </div>
  )
}
