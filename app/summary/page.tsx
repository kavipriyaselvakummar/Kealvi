import ExecutiveSummary from "../ExecutiveSummary";
import AiInsights from "../components/AiInsights";

import {
  getQuestionsPage,
  getQuestionCount,
} from "@/lib/questions";

import {
  getPollsPage,
  getPollVoteCount,
} from "@/lib/polls";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function SummaryPage() {
  const [
    questionsResult,
    pollsResult,
    totalQuestions,
    totalPollVotes,
  ] = await Promise.all([
    getQuestionsPage(0, PAGE_SIZE),
    getPollsPage(0, PAGE_SIZE),
    getQuestionCount(),
    getPollVoteCount(),
  ]);

  const questions = questionsResult.questions;
  const polls = pollsResult.polls;

  const totalQuestionVotes =
    questions.reduce(
      (sum, q) => sum + q.votes,
      0
    );

  const totalPolls =
    polls.length;

  const featuredQuestions =
    questions.filter(
      (q: { is_featured: boolean }) => q.is_featured
    ).length;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Executive Summary
      </h1>

      <ExecutiveSummary
        totalQuestions={
          totalQuestions
        }
        totalQuestionVotes={
          totalQuestionVotes
        }
        totalPolls={
          totalPolls
        }
        totalPollVotes={
          totalPollVotes
        }
        featuredQuestions={
          featuredQuestions
        }
      />

      <div style={{ marginTop: "24px" }}>
        <AiInsights />
      </div>
    </main>
  );
}