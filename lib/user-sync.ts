import User from "@/database/user.model";
import Question from "@/database/question.model";
import Answer from "@/database/answer.model";
import { connectToDatabase } from "./mongoose";

// Abgleich zwischen Clerk (Login) und unserer MongoDB-"users"-Collection.
// Bewusst kein "use server": So sind diese Funktionen keine Server Actions und
// von aussen nicht aufrufbar. Aufrufer sind nur lib/auth.ts (eingeloggte Person)
// und der Clerk-Webhook (mit geprüfter Signatur).

export interface ClerkUserData {
  clerkId: string;
  name: string;
  username: string;
  email: string;
  picture: string;
}

/** Die Felder, die wir von Clerk brauchen, egal ob aus dem Webhook oder aus currentUser(). */
export interface ClerkUserFields {
  id: string;
  email: string | null;
  imageUrl: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Wandelt Clerk-Daten in unser User-Format um.
 * Clerk verlangt standardmässig weder Benutzernamen noch Vor-/Nachnamen.
 * Vorher wurde dann "null" als Name gespeichert und das Anlegen scheiterte,
 * weil "username" in MongoDB Pflicht ist. Darum gibt es jetzt Ersatzwerte.
 */
export function toUserData(fields: ClerkUserFields): ClerkUserData {
  const { id, imageUrl, username, firstName, lastName } = fields;
  const email = fields.email ?? `${id}@users.devoverflow.invalid`;

  const emailName = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  // Kurzer Teil der Clerk-ID hinten dran, damit der Ersatzname eindeutig bleibt
  const fallbackUsername = `${emailName || "user"}_${id.slice(-4).toLowerCase()}`;

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return {
    clerkId: id,
    name: fullName || username || emailName || "Anonymous",
    username: username || fallbackUsername,
    email,
    picture: imageUrl,
  };
}

/** Legt den User an. Wird dasselbe doppelt ausgelöst, entsteht kein Duplikat. */
export async function createUserFromClerk(data: ClerkUserData) {
  await connectToDatabase();

  try {
    return await User.findOneAndUpdate(
      { clerkId: data.clerkId },
      { $setOnInsert: data },
      { upsert: true, new: true }
    );
  } catch (error) {
    // Zwei gleichzeitige Anfragen: die andere war schneller (E-Mail ist eindeutig)
    if ((error as { code?: number }).code === 11000) {
      const existing = await User.findOne({ clerkId: data.clerkId });
      if (existing) return existing;
    }
    throw error;
  }
}

export async function updateUserFromClerk(data: ClerkUserData) {
  await connectToDatabase();

  const { clerkId, ...updateData } = data;

  return User.findOneAndUpdate({ clerkId }, updateData, { new: true });
}

export async function deleteUserFromClerk(clerkId: string) {
  await connectToDatabase();

  const user = await User.findOneAndDelete({ clerkId });

  // Schon gelöscht oder nie angelegt: nichts zu tun
  if (!user) return null;

  await Question.deleteMany({ author: user._id });
  await Answer.deleteMany({ author: user._id });

  return user;
}
