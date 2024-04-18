"use server"

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import { CreateAnswerParams } from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function createAnswer(params: CreateAnswerParams) {
    
    try {
        connectToDatabase()
        
        // create the question
        const { content, author, question, path} = params;

        const newAnswer = new Answer({ content, author, question });

        await Question.findByIdAndUpdate(question, {
             $push: { answers: newAnswer._id } 
        })
       

        revalidatePath(path)
        console.log(path)
    } catch (error) {
        console.error(error);
        throw error;
    }
}