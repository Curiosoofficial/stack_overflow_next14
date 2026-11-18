import mongoose from "mongoose";

// Auf Vercel laufen Server-Funktionen in kurzlebigen Instanzen. Wir merken uns
// das Verbindungs-Promise, damit parallele Aufrufe nicht je eine eigene
// Verbindung aufbauen.
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) return;

  // MONGODB_URI setzt die MongoDB-Atlas-Integration von Vercel automatisch,
  // MONGODB_URL ist der Name aus dem Kurs. Beides funktioniert.
  const url = process.env.MONGODB_URI || process.env.MONGODB_URL;

  if (!url) {
    throw new Error(
      "MONGODB_URI fehlt. Trage den Connection-String von MongoDB Atlas in .env.local bzw. in Vercel ein."
    );
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(url, { dbName: "devFlow" }).catch((error) => {
      // Beim nächsten Aufruf neu versuchen statt für immer den Fehler zu behalten
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
};
