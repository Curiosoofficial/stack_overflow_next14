import Question from "@/components/forms/Question";
import ProfileSyncNotice from "@/components/shared/ProfileSyncNotice";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getCurrentUser();

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a question</h1>
      <div className="mt-9">{mongoUser ? <Question /> : <ProfileSyncNotice />}</div>
    </div>
  );
};

export default Page;
