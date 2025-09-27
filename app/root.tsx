import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { AppProvider } from '@shopify/polaris';
import { nyuchiPolarisTheme } from '~/theme';

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>��🇼 Nyuchi Africa Platform</title>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <script src="https://psg.so/web.js"></script>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AppProvider 
      theme={nyuchiPolarisTheme} 
      i18n={{
        Polaris: {
          Avatar: {
            label: 'Avatar',
            labelWithInitials: 'Avatar with initials {initials}',
          },
          ContextualSaveBar: {
            save: 'Save',
            discard: 'Discard',
          },
          TextField: {
            characterCount: '{count} characters',
          },
          TopBar: {
            toggleMenuLabel: 'Toggle menu',
            SearchField: {
              clearButtonLabel: 'Clear',
              search: 'Search',
            },
          },
          Common: {
            checkbox: 'checkbox',
          },
        },
      }}
    >
      <Outlet />
    </AppProvider>
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
    <AppProvider 
      theme={nyuchiPolarisTheme} 
      i18n={{
        Polaris: {
          Avatar: {
            label: 'Avatar',
            labelWithInitials: 'Avatar with initials {initials}',
          },
          ContextualSaveBar: {
            save: 'Save',
            discard: 'Discard',
          },
          TextField: {
            characterCount: '{count} characters',
          },
          TopBar: {
            toggleMenuLabel: 'Toggle menu',
            SearchField: {
              clearButtonLabel: 'Clear',
              search: 'Search',
            },
          },
          Common: {
            checkbox: 'checkbox',
          },
        },
      }}
    >
      <main style={{ padding: '64px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>🇿🇼 Ubuntu Platform - {message}</h1>
        <p>{details}</p>
        <p style={{ color: '#6D7175', fontStyle: 'italic' }}>
          "I am because we are" - Ubuntu philosophy guides us through challenges
        </p>
        {stack && (
          <pre style={{ width: '100%', padding: '16px', overflow: 'auto' }}>
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </AppProvider>
  );
}
