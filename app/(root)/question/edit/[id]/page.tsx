import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getCurrentUser, isSameId } from "@/lib/auth";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import React from "react";

const Page = async (props: ParamsProps) => {
  const { id } = await props.params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getCurrentUser();
  const result = await getQuestionById({ questionId: id });

  if (!result) notFound();

  // Nur die eigene Frage darf bearbeitet werden
  if (!mongoUser || !isSameId(result.author._id, mongoUser._id)) {
    redirect(`/question/${id}`);
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>

      <div className="mt-9">
        <Question type="Edit" questionDetails={JSON.stringify(result)} />
      </div>
    </>
  );
};

export default Page;
