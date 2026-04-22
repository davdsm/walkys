import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  // ScrollRestoration,
  useLoaderData,
  useOutlet,
  useRouteLoaderData,
} from "react-router";
import { Suspense, lazy } from "react";
import { ParallaxProvider } from "react-scroll-parallax";

import type { Route } from "./+types/root";
import "./app.css";
import { createPocketBase } from "./lib/pocketbase";
import { getLanguageFromRequest } from "./lib/utils";
import { getLayoutData, type LayoutData } from "./lib/services/layout.service";
import { Footer } from "./components/Layout/Footer";
import { Header } from "./components/Layout/Header";
import { LanguageProvider, LayoutProvider, CartProvider, HeaderBackgroundProvider } from "./contexts";
import { PageTransition } from "./components/Layout/PageTransition";
import { useFooter } from "./hooks/useFooter";
import { useHeader } from "./hooks/useHeader";
import { buildSeoMeta } from "./lib/seo";

const CartSidebar = lazy(() =>
  import("./components/Cart/CartSidebar").then((mod) => ({
    default: mod.CartSidebar,
  }))
);
const LoginSuccessToast = lazy(() =>
  import("./components/LoginSuccessToast").then((mod) => ({
    default: mod.LoginSuccessToast,
  }))
);

export const links: Route.LinksFunction = () => [];

export function meta() {
  return buildSeoMeta();
}

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  const language = getLanguageFromRequest(request);
  const layout = await getLayoutData(pb);
  return {
    user: pb.authStore.model,
    language,
    layout,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const rootData = useRouteLoaderData("root") as { language?: "pt" | "en"; layout?: LayoutData | null } | undefined;
  const lang = rootData?.language ?? "pt";
  const layout = rootData?.layout ?? null;
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href={layout?.favicon?.faviconUrl ?? "/favicon.png"} />
        {/* Google Fonts - load early so they apply before first paint */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Italiana&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          crossOrigin="anonymous"
        />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <ParallaxProvider>
          <LanguageProvider defaultLanguage={lang}>
            <LayoutProvider layout={layout}>
              {children}
              <Scripts />
            </LayoutProvider>
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

  // Page transitions and scroll management are handled by the PageTransition component

  return (
    <CartProvider>
      <HeaderBackgroundProvider>
        {!shouldHideHeader && <Header variant={headerVariant} />}
        <PageTransition>
          {outlet}
          {!shouldHideFooter && <Footer variant={footerVariant} />}
        </PageTransition>
        <Suspense fallback={null}>
          <CartSidebar />
          <LoginSuccessToast />
        </Suspense>
      </HeaderBackgroundProvider>
    </CartProvider>
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
