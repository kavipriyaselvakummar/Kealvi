import VoteChart from "../VoteChart";
import PollAnalytics from "../components/PollAnalytics";
import { getQuestionsPage } from "@/lib/questions";
import { getPollsPage } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [qData, pData] = await Promise.all([
    getQuestionsPage(0, 50),
    getPollsPage(0, 50),
  ]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="space-y-10">
        <VoteChart questions={qData.questions} />
        
        <PollAnalytics polls={pData.polls} />
      </div>
    </main>
  );
}