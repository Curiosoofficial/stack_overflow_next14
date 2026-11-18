"use client";
import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/question.action";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { toast } from "../ui/use-toast";

interface Props {
  type: string;
  itemId: string;
}

const EditDeleteAction = ({ type, itemId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleEdit = (e: React.MouseEvent) => {
    // Die Karte ist selbst ein Link: Klick nicht an ihn weitergeben
    e.preventDefault();
    e.stopPropagation();
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Löschen ist endgültig, darum vorher nachfragen
    if (!window.confirm(`Delete this ${type.toLowerCase()}? This cannot be undone.`)) return;

    try {
      if (type === "Question") {
        await deleteQuestion({
          questionId: JSON.parse(itemId),
          path: pathname,
        });
      } else if (type === "Answer") {
        await deleteAnswer({
          answerId: JSON.parse(itemId),
          path: pathname,
        });
      }

      toast({ title: `${type} deleted` });
    } catch {
      toast({ title: "Could not delete", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 max-sm:w-full">
      {type === "Question" && (
        <Image
          src="/assets/icons/edit.svg"
          alt="Edit"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          onClick={handleEdit}
        />
      )}

      <Image
        src="/assets/icons/trash.svg"
        alt="Delete"
        width={14}
        height={14}
        className="cursor-pointer object-contain"
        onClick={handleDelete}
      />
    </div>
  );
};

export default EditDeleteAction;
