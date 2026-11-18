import QuestionCard from "@/components/cards/QuestionCard"
import NoResult from "@/components/shared/NoResult"
import Pagination from "@/components/shared/Pagination"
import LocalSearch from "@/components/shared/search/LocalSearch"
import { getQuestionsByTagId } from "@/lib/actions/tag.actions"
import { URLProps } from "@/types"
import { notFound } from "next/navigation"
import React from 'react'

const Page = async (props: URLProps) => {
  const { id } = await props.params
  const searchParams = await props.searchParams

  const result = await getQuestionsByTagId({
    tagId: id,
    searchQuery: searchParams.q,
    page: searchParams.page ? +searchParams.page : 1,
  })

  // Unbekannter oder ungültiger Tag: 404 statt Absturz
  if (!result) notFound()

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">{result.tagTitle}</h1>

      <div className="mt-11 w-full">
        <LocalSearch
          route={`/tags/${id}`}
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search Tag Questions"
          otherClasses="flex-1"
        />
      </div>

      

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question: any) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no Tag question saved to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

      <div className="mt-10">
        <Pagination 
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}

export default Page