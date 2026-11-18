import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, type NextFetchEvent } from "next/server";

// Next.js 16: "middleware.ts" heisst jetzt "proxy.ts".
// Clerk liest hier nur die Session aus, damit auth() überall funktioniert.
// Welche Seite oder Aktion ein Login braucht, prüfen wir direkt dort
// (Seite, Server Action, API-Route) und nicht über eine Pfadliste.
const clerk = clerkMiddleware({
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
});

// Eingebettete Demo (z.B. im Portfolio als <iframe>):
// Ohne Cookies leitet Clerk jede Seite zum "Handshake" auf clerk.accounts.dev
// und wieder zurück, um die Session abzugleichen. In einem fremden iframe
// blockiert der Browser die Cookies, also endet das in einer Endlosschleife.
// Clerk macht den Handshake nur bei Seitenaufrufen (Sec-Fetch-Dest "document"
// oder "iframe"). Darum geben wir Anfragen aus einem iframe als normale
// Hintergrund-Anfrage aus: Clerk überspringt den Handshake und die Seite
// wird als Gast angezeigt. Einloggen geht dann im neuen Tab (siehe EmbedBanner).
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (request.headers.get("sec-fetch-dest") === "iframe") {
    const headers = new Headers(request.headers);
    headers.set("sec-fetch-dest", "empty");
    return clerk(new NextRequest(request, { headers }), event);
  }

  return clerk(request, event);
}

export const config = {
  matcher: [
    // Next.js-Interna und statische Dateien überspringen
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API-Routen immer durchlaufen
    "/(api|trpc)(.*)",
    // Clerk-eigene Frontend-API-Routen
    "/__clerk/(.*)",
  ],
};
