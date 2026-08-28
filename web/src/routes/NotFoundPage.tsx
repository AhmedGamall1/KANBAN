import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-xl font-medium">Page not found</h1>
      <p className="mt-2 text-ink-muted">
        That link does not lead anywhere.{' '}
        <Link to="/workspaces" className="text-brand hover:underline">
          Go to your workspaces
        </Link>
        .
      </p>
    </div>
  )
}
