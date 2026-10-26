import { Link, useLocation } from "@tanstack/react-router";

export function NotFoundPage() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find what you were looking for. Let's get you back on track.
        </p>
        <p className="mt-3 break-all text-sm text-muted-foreground">
          Requested page: <code>{pathname}</code>
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
