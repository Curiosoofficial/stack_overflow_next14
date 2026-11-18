# Reparatur-Notizen (November 2026)

Was am Kurs-Stand von 2024 kaputt war, warum, und wie es behoben wurde.
Jeder Punkt hat dieselbe Form: **Problem**, **Ursache**, **Lösung**.

---

## 1. Veraltete Pakete und Sicherheitslücken

### 1.1 Next.js 14.1.4 hatte kritische Lücken
- **Problem:** `npm audit` meldete über 30 Sicherheitswarnungen für Next.js, darunter kritische (Umgehung der Middleware-Authentifizierung, Remote Code Execution über den Bild-Optimierer).
- **Ursache:** Next.js 14 bekommt keine Updates mehr. Einige Lücken sind erst ab Next.js 15.5.28 bzw. 16.x geschlossen.
- **Lösung:** Upgrade auf **Next.js 16.4.6** und **React 19**. Radix, TinyMCE-React, lucide-react, Mongoose, Zod 4 und ESLint 10 wurden mitgezogen. Das ungenutzte Paket `mongodb` und `svix` (ersetzt durch Clerks eigene Webhook-Prüfung) wurden entfernt.

### 1.2 Clerk v4 wird nicht mehr unterstützt
- **Problem:** `@clerk/nextjs@4` gehört zu "Clerk Core 1", das offiziell keinen Support mehr hat. `authMiddleware` gibt es in neueren Versionen nicht mehr.
- **Ursache:** Clerk hat seither zwei grosse Versionen veröffentlicht (Core 2 und Core 3). Core 3 (`@clerk/nextjs@7`) setzt Next.js 15.2 oder neuer voraus.
- **Lösung:** Upgrade auf **Clerk Core 3** (siehe Abschnitt 3).

### 1.3 Mongoose mit NoSQL-Injection-Lücken
- **Problem:** Mongoose 8.3 hatte mehrere bekannte Lücken (z.B. "search injection").
- **Lösung:** Mongoose 8.24.10. Zusätzlich prüfen die Server Actions IDs jetzt selbst (`assertObjectId` in `lib/auth.ts`), damit niemand statt einer ID ein Objekt wie `{ "$ne": null }` schicken kann.

### 1.4 Bild-Optimierer als offener Proxy
- **Problem:** In `next.config.mjs` waren für Bilder **alle** Hosts erlaubt (`hostname: '*'`, sogar über `http`).
- **Ursache:** Bequeme Einstellung aus dem Kurs.
- **Lösung:** Nur noch `img.clerk.com` und `images.clerk.dev` (Profilbilder von Clerk) sind erlaubt.

**Bewusst nicht geändert:** `npm audit` meldet noch Warnungen in Tailwind CSS 3 (`picomatch`, `postcss-selector-parser`). Die betreffen nur den Build auf dem eigenen Rechner, nicht die laufende App. Ein Upgrade auf Tailwind 4 würde das ganze Styling betreffen und ist ein eigenes Projekt.

---

## 2. Breaking Changes von Next.js 14 → 16

### 2.1 `params` und `searchParams` sind Promises
- **Problem:** Nach dem Upgrade schlägt der Typ-Check auf allen Seiten fehl.
- **Ursache:** Seit Next.js 15 werden `params` und `searchParams` als Promise übergeben. Next.js 16 hat den synchronen Zugriff ganz entfernt. Dasselbe gilt für `headers()`.
- **Lösung:** Alle Seiten sind `async` und lesen zuerst `const { id } = await props.params`. Die Typen in `types/index.d.ts` wurden angepasst.

### 2.2 `middleware.ts` heisst jetzt `proxy.ts`
- **Ursache:** Next.js 16 hat die Datei umbenannt.
- **Lösung:** `proxy.ts` mit `clerkMiddleware()`.

### 2.3 Ungültige Optionen in `next.config.mjs`
- **Problem:** Warnung "Expected object, received boolean at experimental.serverActions".
- **Ursache:** Server Actions sind seit Next.js 14 stabil. Die Option `experimental.serverComponentsExternalPackages` heisst inzwischen `serverExternalPackages`, und `mdxRs` wurde nie gebraucht.
- **Lösung:** Konfiguration aufgeräumt.

### 2.4 CSS-Build bricht ab
- **Problem:** Turbopack (seit Next.js 16 Standard) meldet: "@import rules must precede all rules".
- **Ursache:** In `app/globals.css` stand `@import` nach den `@tailwind`-Zeilen. Das ist laut CSS-Standard ungültig, Webpack hat es bisher toleriert.
- **Lösung:** `styles/theme.css` wird jetzt in `app/layout.tsx` importiert, direkt nach `globals.css`. Die Reihenfolge der Styles bleibt dadurch gleich.

### 2.5 `next lint` gibt es nicht mehr
- **Lösung:** ESLint läuft jetzt direkt (`npm run lint`) mit der neuen Flat Config `eslint.config.mjs`.

### 2.6 Datenbank-Abfragen beim Build
- **Problem:** Beim Build versuchte Next.js, Seiten vorab zu rendern. Die rechte Sidebar fragte dabei die Datenbank ab.
- **Lösung:** `await connection()` in `RightSidebar.tsx` sagt Next.js, dass diese Daten erst bei einer echten Anfrage geladen werden.

---

## 3. Clerk Core 3

| Vorher (Clerk v4) | Jetzt (Clerk v7 / Core 3) |
| --- | --- |
| `authMiddleware({ publicRoutes })` | `clerkMiddleware()` in `proxy.ts`, Prüfung direkt auf der Seite |
| `import { auth } from "@clerk/nextjs"` | `import { auth } from "@clerk/nextjs/server"` |
| `const { userId } = auth()` | `const { userId } = await auth()` |
| `<SignedIn>` / `<SignedOut>` | `<Show when="signed-in">` / `<Show when="signed-out">` |
| `<UserButton afterSignOutUrl="/">` | `afterSignOutUrl` am `ClerkProvider` |
| eigener Svix-Code im Webhook | `verifyWebhook()` aus `@clerk/nextjs/webhooks` |
| `WEBHOOK_SECRET` | `CLERK_WEBHOOK_SIGNING_SECRET` |

Clerk empfiehlt inzwischen, Logins **nicht** über Pfadlisten in der Middleware zu schützen, sondern direkt dort, wo die Daten gelesen oder geändert werden.

Nebenbei gefunden: In der alten Pfadliste fehlte bei `'question/:id'` und `'tags/:id'` der führende Schrägstrich. Gäste wurden darum beim Öffnen einer Frage zum Login umgeleitet.

---

## 4. Abstürze zur Laufzeit

| Problem | Ursache | Lösung |
| --- | --- | --- |
| Fragen-Detailseite stürzt für **alle Gäste** ab | `mongoUser._id` wurde gelesen, obwohl `mongoUser` für Gäste leer ist | Gäste-Fall abgefangen. Statt des Antwortformulars steht "Log in to write an answer" |
| Suche nach `c++` stürzt ab | Benutzereingabe ging ungefiltert in `new RegExp()`, `+` ist ein Sonderzeichen | `escapeRegExp()` in `lib/utils.ts`, verwendet in allen Suchen |
| "Collections" und Tag-Seiten stürzen ab, wenn User bzw. Tag fehlen | Zuerst `user.saved.length` bzw. `tag.questions.length`, erst danach `if (!user)` | Reihenfolge korrigiert |
| `/question/abc`, `/tags/123` oder ein unbekanntes Profil stürzen ab | Keine Prüfung, ob es den Datensatz gibt | `notFound()` zeigt eine 404-Seite |
| Klick auf einen Autor in der Fragenliste stürzt ab | Link nutzte die MongoDB-ID statt der Clerk-ID | `author.clerkId` |
| Neue Accounts landen nicht in MongoDB | Clerk verlangt standardmässig weder Username noch Namen. Der Webhook speicherte `"null"` als Name, und `username` ist in MongoDB Pflicht | Ersatzwerte aus der E-Mail. Doppelte Webhook-Aufrufe legen keine Duplikate mehr an (Upsert) |
| Fragen stellen stürzt ab, wenn der Webhook noch nicht durch ist | `JSON.parse(undefined)` | Hinweis "Your profile is still being set up" |
| Bearbeiten-Seite einer Frage: React-Fehler | Eine MongoDB-`ObjectId` wurde direkt an eine Client-Komponente übergeben | Nur noch serialisierbare Daten |
| Profil-Antworten: Hydration-Fehler | Die Antwort-Karte war ein `<Link>`, der weitere Links enthielt (`<a>` in `<a>`) | Karte ist ein `<div>`, nur Titel und Autor sind Links |

---

## 5. Sicherheitslücken in der App selbst

### 5.1 Server Actions ohne Berechtigungsprüfung (wichtigster Punkt)
- **Problem:** Jeder konnte fremde Fragen und Antworten löschen oder bearbeiten, im Namen anderer abstimmen und Fragen stellen, fremde Profile ändern (inklusive Reputation) und sogar **beliebige Accounts samt Fragen löschen** (`deleteUser` war eine Server Action).
- **Ursache:** Server Actions sind öffentliche HTTP-Endpunkte. Wer die Aktions-ID kennt (sie steht im JavaScript der Seite), kann sie mit beliebigen Daten aufrufen. Die Aktionen haben der Autor-ID aus dem Browser vertraut.
- **Lösung:**
  - `lib/auth.ts`: `requireCurrentUser()` holt die eingeloggte Person über Clerk.
  - Jede ändernde Aktion nimmt den Autor bzw. Voter vom Server und prüft bei Bearbeiten und Löschen, ob die Person die Autorin oder der Autor ist.
  - Das Profil-Update übernimmt nur noch erlaubte Felder (`name`, `username`, `bio`, `location`, `portfolioWebsite`).
  - `createUser`, `updateUser` und `deleteUser` liegen jetzt in `lib/user-sync.ts` **ohne** `"use server"`. Nur der Webhook (mit geprüfter Signatur) ruft sie auf.
  - Eingaben werden auf dem Server noch einmal mit den Zod-Schemas geprüft.

### 5.2 Stored XSS über den Editor-Inhalt
- **Problem:** Fragen und Antworten werden als HTML gespeichert und mit `html-react-parser` angezeigt. Ein manipulierter Request konnte z.B. `<iframe srcdoc="<script>…">` speichern, und das Script lief dann bei allen Besucher:innen.
- **Lösung:** `ParseHTML.tsx` entfernt gefährliche Tags (`script`, `iframe`, `form` …), Event-Attribute (`onerror` …) und `javascript:`-Links vor dem Rendern.

### 5.3 OpenAI-Route für alle offen
- **Problem:** `/api/chatgpt` war von der Middleware ausgenommen. Mit gesetztem Key hätte jede:r auf fremde Kosten Anfragen schicken können.
- **Lösung:** Nur noch für eingeloggte Personen. Ohne `OPENAI_API_KEY` antwortet die Route mit 503, und der Knopf wird gar nicht angezeigt.

---

## 6. Kleinere Fehler und Platzhalter

- **Fragen liessen sich nie löschen:** `QuestionCard` übergab `type="question"`, `EditDeleteAction` prüfte aber `"Question"`. Löschen fragt jetzt zuerst nach und zeigt eine Meldung.
- **Profil-Link wuchs bei jedem Rendern** (`/profile/id/id/…`): `LeftSidebar` veränderte die gemeinsame Konstante `sidebarLinks`. In der mobilen Navigation führte der Link auf `/profile` (404).
- **Toter Link "Find Jobs":** Die Seite `/jobs` wurde im Kurs nie gebaut. Der Link wurde entfernt.
- **Platzhalter-Tags:** `getTopInteractedTags` gab immer `tag`, `tag2`, `tag3` zurück (mit kaputten Links). Jetzt kommen die echten Tags per MongoDB-Aggregation aus den Interaktionen.
- **Fake-Suchtreffer:** Die globale Suche zeigte kurz fest eingebaute Treffer ("How to create a new project?"). Ausserdem las sie den falschen URL-Parameter (`q` statt `global`).
- **KI-Knopf:** Er zeigte nur `alert("CHECK MY CODE. I RAN OUT OF FREE REQUESTS ON OPENAI.")`. Jetzt ist er funktionsfähig, aber optional.
- **Aufrufe wurden falsch gezählt:** Der View-Zähler lief auch für jede Antwort, mit der Antwort-ID als Frage-ID.
- **Speichern-Stern für Gäste:** Ohne Login gab es einen JavaScript-Fehler statt "Please log in".
- **Profil speichern ging fast nie:** Bio (mind. 10 Zeichen), Portfolio-URL und Ort waren Pflicht, obwohl das Formular sie als optional zeigt. Ein Name unter 5 Zeichen (z.B. "Luka") war nicht erlaubt.
- **Tippfehler `PortfolioWebsite`:** Der Portfolio-Link im Profil zeigte ins Leere.
- **Tag-Filter "Recent" und "Old" taten nichts:** Sortiert wurde nach `createdAt` bzw. `views`, das Tag-Modell hat aber `createdOn`.
- **Antwort-Karte:** Die Votes wurden als Liste von IDs angezeigt statt als Zahl.
- **Fehler wurden verschluckt:** `catch (error) {}` beim Fragen-Formular. Jetzt erscheint eine Meldung.
- **Fehlendes `await`** beim Bearbeiten einer Frage: Die Seite wechselte, bevor gespeichert war.
- Debug-`console.log`s und Zeitstempel-Kommentare aus den Kursvideos entfernt.

---

## 7. Neu dazugekommen

- `.env.example` mit allen Variablen
- `npm run seed`: Demo-Daten für die Live-Demo (`scripts/seed.mjs`). `npm run build` füllt eine **leere** Datenbank automatisch damit. Fehler dabei brechen den Build nicht ab.
- `.gitignore` ignoriert jetzt alle `.env`-Dateien ausser der Vorlage
- **TinyMCE selbst gehostet:** `npm install` kopiert den Editor nach `public/tinymce` (`scripts/copy-tinymce.mjs`). Er läuft mit `licenseKey="gpl"`, also ohne Account, API-Key und "Approved Domains".
- **User ohne Webhook:** `getCurrentUser()` in `lib/auth.ts` legt eingeloggte Personen beim ersten Besuch selbst in MongoDB an, mit den Daten aus Clerks `currentUser()`. Der Webhook ist damit optional. Er überträgt nur noch Profiländerungen und Löschungen. `cache()` von React sorgt dafür, dass das pro Anfrage nur einmal läuft.
- **Vercel-Integrationen:** Der Code liest `MONGODB_URI` (so heisst die Variable der MongoDB-Atlas-Integration von Vercel) und als Fallback den alten Namen `MONGODB_URL`.

## 8. Was (noch) nicht getestet ist

Geprüft wurden `npm run build`, der TypeScript-Check und `npm run lint` (alles ohne Fehler) sowie der HTML-Filter mit typischen XSS-Beispielen.
Ohne echte Clerk- und MongoDB-Zugänge konnten Login, Webhook und Datenbank **nicht** im Browser durchgespielt werden. Das ist der erste Test nach dem Deployment (siehe Checkliste in der README).
