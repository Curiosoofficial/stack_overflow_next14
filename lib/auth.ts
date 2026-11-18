import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import User from "@/database/user.model";
import { connectToDatabase } from "./mongoose";
import { createUserFromClerk, toUserData } from "./user-sync";

// Server Actions sind öffentliche HTTP-Endpunkte. Jeder kann sie mit beliebigen
// Daten aufrufen, auch ohne die Oberfläche. Darum prüft jede Aktion, die etwas
// verändert, selbst: Wer ist eingeloggt, und darf diese Person das?

/**
 * Der MongoDB-User der eingeloggten Person, oder null für Gäste.
 *
 * Fehlt der User in MongoDB noch (z.B. direkt nach der Registrierung, oder weil
 * kein Clerk-Webhook eingerichtet ist), wird er hier aus den Clerk-Daten angelegt.
 * cache(): pro Anfrage nur einmal ausführen, auch wenn mehrere Komponenten fragen.
 */
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  await connectToDatabase();
  const existing = await User.findOne({ clerkId: userId });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId) ??
    clerkUser.emailAddresses[0];

  return createUserFromClerk(
    toUserData({
      id: clerkUser.id,
      email: primaryEmail?.emailAddress ?? null,
      imageUrl: clerkUser.imageUrl,
      username: clerkUser.username,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    })
  );
});

/** Wie getCurrentUser, wirft aber einen Fehler, wenn niemand eingeloggt ist. */
export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("You need to be signed in to do this.");
  return user;
}

/** Wirft einen Fehler, wenn der Wert keine gültige MongoDB-ID ist (Schutz vor NoSQL-Injection). */
export function assertObjectId(value: unknown, label = "id"): asserts value is string {
  if (typeof value !== "string" || !/^[a-f0-9]{24}$/i.test(value)) {
    throw new Error(`Invalid ${label}.`);
  }
}

/** Vergleicht zwei IDs (ObjectId oder String). */
export function isSameId(a: unknown, b: unknown) {
  return a != null && b != null && String(a) === String(b);
}
