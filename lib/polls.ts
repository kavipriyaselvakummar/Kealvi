import { supabase } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

const MOCK_POLLS = [
  {
    id: "p1",
    body: "Which state management tool do you prefer for React? #React #State",
    poll_options: [
      { id: "o1", option_text: "Zustand", votes: 25 },
      { id: "o2", option_text: "Redux Toolkit", votes: 12 },
      { id: "o3", option_text: "React Context", votes: 8 },
    ]
  },
  {
    id: "p2",
    body: "How do you write your CSS in modern projects? #CSS #Styling",
    poll_options: [
      { id: "o4", option_text: "Tailwind CSS", votes: 34 },
      { id: "o5", option_text: "CSS Modules", votes: 15 },
      { id: "o6", option_text: "Vanilla CSS", votes: 5 },
    ]
  },
  {
    id: "p3",
    body: "Which backend framework is your favorite? #Backend",
    poll_options: [
      { id: "o7", option_text: "Next.js API Routes", votes: 40 },
      { id: "o8", option_text: "Express.js", votes: 22 },
      { id: "o9", option_text: "NestJS", votes: 14 },
    ]
  },
  {
    id: "p4",
    body: "What database do you use most often? #Database",
    poll_options: [
      { id: "o10", option_text: "PostgreSQL", votes: 55 },
      { id: "o11", option_text: "MongoDB", votes: 20 },
      { id: "o12", option_text: "MySQL", votes: 15 },
    ]
  },
  {
    id: "p5",
    body: "Tabs or Spaces? #Coding",
    poll_options: [
      { id: "o13", option_text: "Spaces (2)", votes: 60 },
      { id: "o14", option_text: "Tabs", votes: 12 },
      { id: "o15", option_text: "Spaces (4)", votes: 10 },
    ]
  }
];

export async function getPollsPage(
  offset: number,
  limit: number
) {
  noStore();

  try {
    const { data: polls, error } = await supabase
      .from("polls")
      .select(`
        id,
        body,
        author,
        created_at,
        poll_options (
          id,
          option_text
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)
      .retry(false);

    if (error) throw error;

    if (!polls) {
      return { polls: [], hasMore: false };
    }

    const { data: votes } = await supabase
      .from("poll_votes")
      .select("option_id")
      .retry(false);

    const voteCounts: Record<string, number> = {};

    (votes ?? []).forEach((vote: any) => {
      const key = String(vote.option_id);
      voteCounts[key] = (voteCounts[key] ?? 0) + 1;
    });

    const pollsWithVotes = polls.map((poll: any) => ({
      ...poll,
      poll_options: poll.poll_options.map((option: any) => ({
        ...option,
        votes: voteCounts[String(option.id)] ?? 0,
      })),
    }));

    return {
      polls: pollsWithVotes,
      hasMore: (polls?.length ?? 0) === limit,
    };
  } catch (err) {
    return {
      polls: MOCK_POLLS.slice(offset, offset + limit),
      hasMore: offset + limit < MOCK_POLLS.length,
    };
  }
}

export async function getPollVoteCount() {
  noStore();

  try {
    const { count, error } =
      await supabase
        .from("poll_votes")
        .select("*", {
          count: "exact",
          head: true,
        })
        .retry(false);

    if (error) throw error;

    return count ?? 0;
  } catch (err) {
    // console.error("Error getting poll vote count:", err);
    // Fallback static count
    return 99;
  }
}