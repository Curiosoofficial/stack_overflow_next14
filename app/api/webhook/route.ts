import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { UserJSON } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  ClerkUserData,
  createUserFromClerk,
  deleteUserFromClerk,
  toUserData,
  updateUserFromClerk,
} from "@/lib/user-sync";

// Optional: Clerk schickt bei Registrierung/Änderung/Löschung ein Event hierher.
// Neue User werden auch ohne Webhook beim ersten Besuch angelegt (lib/auth.ts).
// Der Webhook sorgt zusätzlich dafür, dass Namensänderungen und gelöschte
// Accounts in MongoDB ankommen.
export async function POST(req: NextRequest) {
  let evt;

  try {
    // Prüft die Signatur mit dem Signing Secret aus Clerk (Dashboard -> Webhooks).
    // WEBHOOK_SECRET ist der alte Name aus dem Kurs und funktioniert weiterhin.
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.WEBHOOK_SECRET,
    });
  } catch (err) {
    console.error("Webhook-Signatur ungültig:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const mongoUser = await createUserFromClerk(fromWebhook(evt.data));
    return NextResponse.json({ message: "OK", user: mongoUser });
  }

  if (evt.type === "user.updated") {
    const mongoUser = await updateUserFromClerk(fromWebhook(evt.data));
    return NextResponse.json({ message: "OK", user: mongoUser });
  }

  if (evt.type === "user.deleted") {
    if (evt.data.id) {
      await deleteUserFromClerk(evt.data.id);
    }
    return NextResponse.json({ message: "OK" });
  }

  return new Response("", { status: 200 });
}

/** Webhook-Daten (snake_case) in unser Format umwandeln. */
function fromWebhook(data: UserJSON): ClerkUserData {
  const primaryEmail =
    data.email_addresses.find((email) => email.id === data.primary_email_address_id) ??
    data.email_addresses[0];

  return toUserData({
    id: data.id,
    email: primaryEmail?.email_address ?? null,
    imageUrl: data.image_url,
    username: data.username,
    firstName: data.first_name,
    lastName: data.last_name,
  });
}
