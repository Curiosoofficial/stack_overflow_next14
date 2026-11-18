import Link from "next/link";

import Metric from "../shared/Metric";
import { formatBigNumber, getTimeStamp } from "@/lib/utils";
import { Show } from "@clerk/nextjs";
import EditDeleteAction from "../shared/EditDeleteAction";

interface Props {
  clerkId?: string | null;
  _id: string;
  question: {
    _id: string;
    title: string;
  } | null;
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  upvotes: number;
  createdAt: Date;
}

const AnswerCard = ({ clerkId, _id, question, author, upvotes, createdAt }: Props) => {
  // Frage wurde inzwischen gelöscht: Karte nicht anzeigen statt abstürzen
  if (!question) return null;

  const showActionButtons = clerkId && clerkId === author.clerkId;

  // Vorher war die ganze Karte ein <Link>, in dem weitere Links steckten.
  // <a> in <a> ist ungültiges HTML und führt in React 19 zu Hydration-Fehlern.
  return (
    <div className="card-wrapper rounded-[10px] px-11 py-9">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimeStamp(createdAt)}
          </span>
          <Link href={`/question/${question._id}#${_id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {question.title}
            </h3>
          </Link>
        </div>

        <Show when="signed-in">
          {showActionButtons && <EditDeleteAction type="Answer" itemId={JSON.stringify(_id)} />}
        </Show>
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture}
          alt="user avatar"
          value={author.name}
          title={` • answered ${getTimeStamp(createdAt)}`}
          href={`/profile/${author.clerkId}`}
          textStyles="body-medium text-dark400_light700"
          isAuthor
        />

        <div className="flex-center gap-3">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="like icon"
            value={formatBigNumber(upvotes)}
            title=" Votes"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
