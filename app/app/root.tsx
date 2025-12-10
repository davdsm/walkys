import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  // ScrollRestoration,
  useLoaderData,
  useLocation,
  useOutlet,
} from "react-router";
import { ParallaxProvider } from "react-scroll-parallax";
import { useEffect } from "react";

import type { Route } from "./+types/root";
import "./app.css";
import { createPocketBase } from "./lib/pocketbase";
import { Footer } from "./components/Layout/Footer";
import { Header } from "./components/Layout/Header";
import { LanguageProvider } from "./contexts";
import { PageTransition } from "./components/Layout/PageTransition";
import { useFooter } from "./hooks/useFooter";
import { useHeader } from "./hooks/useHeader";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  return {
    user: pb.authStore.model,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.png" />
        <title>Walkys - By Shoe Me</title>
        <meta name="title" content="Walkys - By Shoe Me" />
        <meta
          name="description"
          content=" Walkys is a Portuguese brand that is described by the creation of elegant and comfortable shoes. Our primary purpose is to combine design and comfort as a way to achieve a product that stands out for its quality and excellence. We are a community brand produced 100% in Portugal. "
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://walkys.com/" />
        <meta property="og:title" content="Walkys - By Shoe Me" />
        <meta
          property="og:description"
          content=" Walkys is a Portuguese brand that is described by the creation of elegant and comfortable shoes. Our primary purpose is to combine design and comfort as a way to achieve a product that stands out for its quality and excellence. We are a community brand produced 100% in Portugal. "
        />
        <meta property="og:image" content="/cover.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://walkys.com/" />
        <meta property="twitter:title" content="Walkys - By Shoe Me" />
        <meta
          property="twitter:description"
          content=" Walkys is a Portuguese brand that is described by the creation of elegant and comfortable shoes. Our primary purpose is to combine design and comfort as a way to achieve a product that stands out for its quality and excellence. We are a community brand produced 100% in Portugal. "
        />
        <meta property="twitter:image" content="/cover.png" />

        <Meta />
        <Links />
      </head>
      <body className="flex flex-col overflow-x-hidden">
        <ParallaxProvider>
          <LanguageProvider>
            {children}
            <Scripts />
          </LanguageProvider>
        </ParallaxProvider>
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  const { shouldHideFooter, variant: footerVariant } = useFooter();
  const { shouldHideHeader, variant: headerVariant } = useHeader();
  const outlet = useOutlet({ user });
  const location = useLocation();

  // Scroll to top when location changes
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500);
  }, [location.pathname]);

  return (
    <>
      {!shouldHideHeader && <Header variant={headerVariant} />}
      <PageTransition>
        {outlet}
        {!shouldHideFooter && <Footer variant={footerVariant} />}
      </PageTransition>
    </>
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
