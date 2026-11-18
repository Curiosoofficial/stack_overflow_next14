"use client";

import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

// Läuft die Seite in einem <iframe> (z.B. als Demo im Portfolio)?
// Auf dem Server gibt es kein window, darum dort immer "nein".
// useSyncExternalStore sorgt dafür, dass der erste Render im Browser
// gleich aussieht wie der Server-Render (kein Hydration-Fehler).
const noop = () => () => {};

function isInsideIframe() {
  try {
    return window.self !== window.top;
  } catch {
    // Fremde Seiten dürfen window.top nicht lesen, dann sind wir sicher eingebettet
    return true;
  }
}

export function useIsEmbedded() {
  return useSyncExternalStore(noop, isInsideIframe, () => false);
}

const AUTH_PATHS = ["/sign-in", "/sign-up"];

/** Hinweis unten auf jeder Seite, wenn sie eingebettet ist. */
export function EmbedBanner() {
  const embedded = useIsEmbedded();
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);

  // Auf den Login-Seiten zeigt EmbedAuthNotice schon denselben Hinweis
  const onAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));
  if (!embedded || closed || onAuthPage) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-primary-500/40 bg-dark-200/95 px-4 py-3 text-light-900 shadow-lg backdrop-blur"
    >
      <p className="body-regular flex-1">
        You&apos;re viewing an embedded demo. To sign in, ask questions or vote,{" "}
        <a
          href={pathname}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary-500 underline underline-offset-2"
        >
          open it in a new tab
        </a>
        .
      </p>
      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Close notice"
        className="rounded-md px-2 py-1 text-light-500 hover:bg-dark-400 hover:text-light-900"
      >
        ✕
      </button>
    </div>
  );
}

/** Ersetzt im iframe das Clerk-Login, weil Login-Cookies dort blockiert werden. */
export function EmbedAuthNotice({ children }: { children: React.ReactNode }) {
  const embedded = useIsEmbedded();
  const pathname = usePathname();

  if (!embedded) return children;

  return (
    <div className="background-light900_dark200 light-border mx-4 flex max-w-md flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-light-100 dark:shadow-dark-100">
      <h1 className="h2-bold text-dark100_light900">Sign in in a new tab</h1>
      <p className="paragraph-regular text-dark500_light700">
        This is an embedded demo. Browsers block login cookies inside embedded pages, so signing
        in only works when DevOverflow is open in its own tab.
      </p>
      <a
        href={pathname}
        target="_blank"
        rel="noopener noreferrer"
        className="primary-gradient paragraph-medium rounded-lg px-6 py-3 text-light-900"
      >
        Open in a new tab
      </a>
    </div>
  );
}
