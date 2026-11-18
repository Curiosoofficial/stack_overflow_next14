"use client";
import React, { useRef, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { AnswerSchema } from "@/lib/validation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "../ui/button";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { usePathname } from "next/navigation";
import { toast } from "../ui/use-toast";

interface Props {
  question: string;
  questionId: string;
  // true, wenn OPENAI_API_KEY gesetzt ist. Sonst wird der KI-Knopf gar nicht angezeigt.
  aiEnabled: boolean;
}

const Answer = ({ question, questionId, aiEnabled }: Props) => {
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAI, setIsSubmittingAI] = useState(false);
  const { mode } = useTheme();
  const editorRef = useRef<{ setContent: (content: string) => void } | null>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: "",
    },
  });

  const handleCreateAnswer = async (values: z.infer<typeof AnswerSchema>) => {
    setIsSubmitting(true);

    try {
      // Der Autor wird auf dem Server über Clerk bestimmt
      await createAnswer({
        content: values.answer,
        question: JSON.parse(questionId),
        path: pathname,
      });

      form.reset();
      editorRef.current?.setContent("");
    } catch {
      toast({
        title: "Could not post your answer",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vorher stand hier nur ein alert("CHECK MY CODE. I RAN OUT OF FREE REQUESTS ON OPENAI.").
  const generateAIAnswer = async () => {
    setIsSubmittingAI(true);

    try {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const aiAnswer = await response.json();

      if (!response.ok || !aiAnswer.reply) {
        throw new Error(aiAnswer.error ?? "No answer");
      }

      // Zeilenumbrüche für den Editor in <br /> umwandeln
      const formattedAnswer = aiAnswer.reply.replace(/\n/g, "<br />");
      editorRef.current?.setContent(formattedAnswer);
      form.setValue("answer", formattedAnswer);
    } catch {
      toast({
        title: "AI answer not available",
        description: "Please write your answer yourself.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAI(false);
    }
  };

  return (
    <div>
      <div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light900">Write your answer here</h4>
        {aiEnabled && (
          <Button
            type="button"
            className="btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
            onClick={generateAIAnswer}
            disabled={isSubmittingAI}
          >
            <Image
              src="/assets/icons/stars.svg"
              alt="star"
              width={12}
              height={12}
              className="object-contain"
            />
            {isSubmittingAI ? "Generating..." : "Generate AI Answer"}
          </Button>
        )}
      </div>

      <Form {...form}>
        <form
          className="mt-6 flex w-full flex-col gap-10"
          onSubmit={(event) => form.handleSubmit(handleCreateAnswer)(event)}
        >
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    // Selbst gehostet (public/tinymce, GPL-Lizenz): kein API-Key bei tiny.cloud nötig
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    licenseKey="gpl"
                    onInit={(_evt, editor) => {
                      editorRef.current = editor;
                    }}
                    onBlur={field.onBlur}
                    onEditorChange={(content) => field.onChange(content)}
                    init={{
                      height: 350,
                      menubar: false,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "codesample",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                      ],
                      toolbar:
                        "undo redo | " +
                        "codesample | bold italic forecolor | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist",
                      content_style: "body { font-family:Inter; font-size:16px }",
                      skin: mode === "dark" ? "oxide-dark" : "oxide",
                      content_css: mode === "dark" ? "dark" : "default",
                    }}
                  />
                </FormControl>

                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="primary-gradient w-fit text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Answer;
