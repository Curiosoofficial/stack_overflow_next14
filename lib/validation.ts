import { z } from "zod";

// Diese Schemas prüfen die Formulare im Browser UND (seit der Reparatur)
// noch einmal in den Server Actions. Die Browser-Prüfung kann man umgehen.

export const QuestionsSchema = z.object({
  title: z.string().min(5).max(130),
  explanation: z.string().min(100).max(20000),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});

export const AnswerSchema = z.object({
  answer: z.string().min(100).max(20000),
});

// Vorher waren alle Felder Pflicht (Bio mind. 10 Zeichen, Portfolio-URL, Ort mind. 5),
// obwohl das Formular sie als optional zeigt. Speichern ging so fast nie.
export const ProfileSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(50),
  bio: z.string().max(150).optional(),
  portfolioWebsite: z.union([z.url(), z.literal("")]).optional(),
  location: z.string().max(50).optional(),
});
