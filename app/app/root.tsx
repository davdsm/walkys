import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useOutlet,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { createPocketBase } from "./lib/pocketbase";
import { Footer } from "./components/Layout/Footer";
import { Header } from "./components/Layout/Header";
import { LanguageProvider } from "./contexts";
import { PageTransition } from "./components/Layout/PageTransition";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Knewave&family=Outfit:wght@100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  return {
    user: pb.authStore.model,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Routes where Footer should NOT be displayed
  const hideFooterRoutes = ['/auth/login', '/auth/signup', '/dashboard', '/forgot-password', '/logout'];
  const shouldHideFooter = hideFooterRoutes.some(route => location?.pathname?.startsWith(route)) ||
    location?.pathname?.includes('/reset-password');

  // Routes with white backgrounds need dark variant
  const darkVariantRoutes = ['/auth/login', '/auth/signup', '/dashboard', '/forgot-password'];
  const useDarkVariant = darkVariantRoutes.some(route => location?.pathname?.startsWith(route)) ||
    location?.pathname?.includes('/reset-password');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.png" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <LanguageProvider>
          <Header variant={useDarkVariant ? "dark" : "light"} />
          <main className="flex-1 min-h-screen">
            {children}
          </main>
          <ScrollRestoration />
          <Scripts />
        </LanguageProvider>
      </body>
    </html>
  );
}


export default function App() {
  const { user } = useLoaderData<typeof loader>();
  const outlet = useOutlet({ user });

  return (
    <PageTransition>
      {outlet}
    </PageTransition>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
