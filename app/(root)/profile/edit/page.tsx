import Profile from "@/components/forms/Profile";
import ProfileSyncNotice from "@/components/shared/ProfileSyncNotice";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getCurrentUser();

  // Nur die Felder an den Browser geben, die das Formular braucht
  const profile = mongoUser && {
    name: mongoUser.name,
    username: mongoUser.username,
    portfolioWebsite: mongoUser.portfolioWebsite,
    location: mongoUser.location,
    bio: mongoUser.bio,
  };

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <div className="mt-9">
        {profile ? <Profile user={JSON.stringify(profile)} /> : <ProfileSyncNotice />}
      </div>
    </>
  );
};

export default Page;
