"use server"

import Tag from "@/database/tag.model";
import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose"

export async function createQuestion(params: any) {
    
    try {
        connectToDatabase()
        
        // create the question
        const { title, content, tags, author, path} = params;

        const question = await Question.create({
            title,
            content,
            author
        });

        
        const tagDocuments = [];
    
        // create the tags or get them if they already exist

        for ( const tag of tags) {
            const existingTag = await Tag.findOneAndUpdate(
                { name: {$regex: new RegExp(`^${tag}$`, "i")}},
                { $setOnInsert: { name: tag}, $push: { question: question._id}},
                { upsert: true, new: true}
            )

            tagDocuments.push(existingTag._id)
        }

        await Question.findByIdAndUpdate(question._id, {
            $push: { tags: { $each: tagDocuments }}
        });

        // cretae an interaction record for the users ask_question action

        // Increment authors reputation by +5 for creating a question
    } catch (error) {
        
    }
}