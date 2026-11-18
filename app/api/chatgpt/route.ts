import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Optionale KI-Antwort. Läuft nur, wenn OPENAI_API_KEY gesetzt ist,
// und nur für eingeloggte Personen. Sonst könnte jede/r über diese Route
// auf deine Kosten OpenAI-Anfragen schicken.
export const POST = async (request: Request) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI answers are disabled in this demo." }, { status: 503 });
  }

  const { question } = await request.json();

  if (typeof question !== "string" || question.length === 0 || question.length > 10_000) {
    return NextResponse.json({ error: "Invalid question." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable assistant that provides quality information.",
          },
          {
            role: "user",
            content: `Tell me ${question}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "The AI service did not respond." }, { status: 502 });
    }

    const responseData = await response.json();
    const reply = responseData.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
