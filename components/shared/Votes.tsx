"use client";
import { downvoteAnswer, upvoteAnswer } from "@/lib/actions/answer.action";
import { viewQuestion } from "@/lib/actions/interaction.action";
import { downvoteQuestion, upvoteQuestion } from "@/lib/actions/question.action";
import { toggleSaveQuestion } from "@/lib/actions/user.action";
import { formatBigNumber } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "../ui/use-toast";

interface Props {
  type: string;
  itemId: string;
  isSignedIn: boolean;
  upvotes: number;
  hasUpvoted: boolean;
  downvotes: number;
  hasDownvoted: boolean;
  hasSaved?: boolean;
}

const Votes = ({
  type,
  itemId,
  isSignedIn,
  upvotes,
  hasUpvoted,
  downvotes,
  hasDownvoted,
  hasSaved,
}: Props) => {
  const pathname = usePathname();

  const showLoginToast = () =>
    toast({
      title: "Please log in",
      description: "You need to be logged in to perform this action",
    });

  const showErrorToast = () =>
    toast({
      title: "Something went wrong",
      description: "Please try again.",
      variant: "destructive",
    });

  const handleSave = async () => {
    // Vorher fehlte diese Prüfung: JSON.parse(undefined) warf für Gäste einen Fehler
    if (!isSignedIn) return showLoginToast();

    try {
      await toggleSaveQuestion({
        questionId: JSON.parse(itemId),
        path: pathname,
      });
    } catch {
      return showErrorToast();
    }

    return toast({
      title: `Question ${!hasSaved ? "saved in" : "removed from"} your collection`,
      variant: !hasSaved ? "default" : "destructive",
    });
  };

  const handleVote = async (action: "upvote" | "downvote") => {
    if (!isSignedIn) return showLoginToast();

    const voteParams = { hasUpvoted, hasDownvoted, path: pathname };

    try {
      if (type === "Question") {
        const params = { questionId: JSON.parse(itemId), ...voteParams };
        await (action === "upvote" ? upvoteQuestion(params) : downvoteQuestion(params));
      } else if (type === "Answer") {
        const params = { answerId: JSON.parse(itemId), ...voteParams };
        await (action === "upvote" ? upvoteAnswer(params) : downvoteAnswer(params));
      }
    } catch {
      return showErrorToast();
    }

    if (action === "upvote") {
      return toast({
        title: `Upvote ${!hasUpvoted ? "successful" : "removed"}`,
        variant: !hasUpvoted ? "default" : "destructive",
      });
    }

    return toast({
      title: `Downvote ${!hasDownvoted ? "successful" : "removed"}`,
      variant: !hasDownvoted ? "default" : "destructive",
    });
  };

  useEffect(() => {
    // Aufrufe nur für Fragen zählen. Vorher lief das auch für jede Antwort
    // (mit der Antwort-ID als Frage-ID) und legte falsche Interaktionen an.
    if (type !== "Question") return;

    viewQuestion({ questionId: JSON.parse(itemId) }).catch(() => {});
  }, [itemId, type]);

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={hasUpvoted ? "/assets/icons/upvoted.svg" : "/assets/icons/upvote.svg"}
            alt="upvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("upvote")}
          />

          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">{formatBigNumber(upvotes)}</p>
          </div>
        </div>

        <div className="flex-center gap-1.5">
          <Image
            src={hasDownvoted ? "/assets/icons/downvoted.svg" : "/assets/icons/downvote.svg"}
            alt="downvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("downvote")}
          />

          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">{formatBigNumber(downvotes)}</p>
          </div>
        </div>
      </div>

      {type === "Question" && (
        <Image
          src={hasSaved ? "/assets/icons/star-filled.svg" : "/assets/icons/star-red.svg"}
          alt="star"
          width={18}
          height={18}
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
