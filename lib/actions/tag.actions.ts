"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import Question from "@/database/question.model";
import Interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";
import { escapeRegExp } from "../utils";

/**
 * Die Tags, mit denen ein User am meisten zu tun hatte (Fragen gestellt/beantwortet).
 * Vorher gab diese Funktion fest eingebaute Platzhalter-Tags ("tag", "tag2", "tag3") zurück.
 */
export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase();

    const { userId, limit = 3 } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const topTags: { _id: string; name: string }[] = await Interaction.aggregate([
      { $match: { user: user._id } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $lookup: { from: "tags", localField: "_id", foreignField: "_id", as: "tag" } },
      { $unwind: "$tag" },
      { $project: { _id: 1, name: "$tag.name" } },
    ]);

    return topTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [{ name: { $regex: escapeRegExp(searchQuery), $options: "i" } }];
    }

    let sortOptions = {};

    // Das Tag-Modell hat "createdOn" (nicht "createdAt") und kein "views"-Feld,
    // darum haben "Recent" und "Old" vorher nichts sortiert.
    switch (filter) {
      case "popular":
        sortOptions = { questions: -1 };
        break;
      case "recent":
        sortOptions = { createdOn: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      case "old":
        sortOptions = { createdOn: 1 };
        break;

      default:
        break;
    }

    const tags = await Tag.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);

    const totalTags = await Tag.countDocuments(query);

    const isNext = totalTags > skipAmount + tags.length;

    return { tags, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDatabase();

    const { tagId, page = 1, pageSize = 20, searchQuery } = params;

    // Ungültige ID in der URL: "nicht gefunden" statt Absturz
    if (!/^[a-f0-9]{24}$/i.test(String(tagId))) return null;

    const skipAmount = (page - 1) * pageSize;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: escapeRegExp(searchQuery), $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    // Erst prüfen, dann auf tag.questions zugreifen (Reihenfolge war vertauscht)
    if (!tag) {
      return null;
    }

    const isNext = tag.questions.length > pageSize;
    const questions = tag.questions.slice(0, pageSize);

    return { tagTitle: tag.name, questions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPopularTags() {
  try {
    await connectToDatabase();

    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
