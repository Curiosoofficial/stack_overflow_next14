import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16: "middleware.ts" heisst jetzt "proxy.ts".
// Clerk liest hier nur die Session aus, damit auth() überall funktioniert.
// Welche Seite oder Aktion ein Login braucht, prüfen wir direkt dort
// (Seite, Server Action, API-Route) und nicht über eine Pfadliste.
export default clerkMiddleware({
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
});

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
