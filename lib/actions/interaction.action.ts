"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/interaction.model";
import { getCurrentUser } from "../auth";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    await connectToDatabase();

    const { questionId } = params;

    // Ungültige IDs still ignorieren (Zähler ist nicht kritisch)
    if (typeof questionId !== "string" || !/^[a-f0-9]{24}$/i.test(questionId)) return;

    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

    // Die Interaktion (für Empfehlungen) nur für die eingeloggte Person speichern
    const currentUser = await getCurrentUser();

    if (currentUser) {
      const existingInteraction = await Interaction.findOne({
        user: currentUser._id,
        action: "view",
        question: questionId,
      });
      if (existingInteraction) return;

      await Interaction.create({
        user: currentUser._id,
        action: "view",
        question: questionId,
      });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
