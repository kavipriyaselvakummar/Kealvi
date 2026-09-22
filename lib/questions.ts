import { supabase } from "@/lib/supabase";

const MOCK_QUESTIONS = [
  { id: "1", body: "How do I deploy to Vercel? #Vercel #Nextjs", author: "Priya", is_featured: true, votes: 12 },
  { id: "2", body: "What's the difference between server and client components? #React #Nextjs", author: "Marcus", is_featured: true, votes: 9 },
  { id: "3", body: "When should I add a database index? #Database #Postgres", author: "Aisha", is_featured: false, votes: 4 },
  { id: "4", body: "How does Postgres full-text search work? #Database #Search", author: "Diego", is_featured: false, votes: 3 },
  { id: "5", body: "Should I store a vote count or count vote rows? #Architecture", author: "Sam", is_featured: false, votes: 2 },
  { id: "6", body: "What is a unique constraint good for? #Database", author: "Priya", is_featured: false, votes: 1 },
  { id: "7", body: "How do I prevent double voting? #Auth #Database", author: "Noah", is_featured: false, votes: 5 },
  { id: "8", body: "What's the difference between SSR and hydration? #React #SSR", author: "Aisha", is_featured: false, votes: 8 },
  { id: "9", body: "How does optimistic UI actually work? #UI #UX", author: "Marcus", is_featured: true, votes: 15 },
  { id: "10", body: "When do I really need pagination? #UX #Performance", author: "Ravi", is_featured: false, votes: 7 },
  { id: "11", body: "Offset vs cursor pagination — which one? #Database #API", author: "Lena", is_featured: false, votes: 6 },
  { id: "12", body: "How do I debounce a search input? #React #Performance", author: "Diego", is_featured: false, votes: 11 },
  { id: "13", body: "Why must secrets stay on the server? #Security", author: "Sam", is_featured: false, votes: 14 },
  { id: "14", body: "What is row-level security in Supabase? #Supabase #Security", author: "Noah", is_featured: false, votes: 10 },
  { id: "15", body: "How does connection pooling help on Vercel? #Database #Performance", author: "Priya", is_featured: false, votes: 8 },
  { id: "16", body: "What is a GIN index and when do I use it? #Postgres", author: "Ravi", is_featured: false, votes: 5 },
  { id: "17", body: "How do foreign keys protect my data? #Database", author: "Aisha", is_featured: false, votes: 3 },
  { id: "18", body: "When should I move counts into Redis? #Architecture #Performance", author: "Marcus", is_featured: false, votes: 13 },
  { id: "19", body: "How do I run a database migration safely? #DevOps #Database", author: "Lena", is_featured: false, votes: 9 },
  { id: "20", body: "What does on delete cascade actually do? #Database", author: "Diego", is_featured: false, votes: 6 },
  { id: "21", body: "How do I seed test data quickly? #Testing", author: "Sam", is_featured: false, votes: 4 },
  { id: "22", body: "Why is my Vercel function cold starting? #Vercel #Performance", author: "Noah", is_featured: false, votes: 12 },
  { id: "23", body: "How do I scale reads with replicas? #Architecture #Database", author: "Ravi", is_featured: false, votes: 2 },
  { id: "24", body: "What's the best way to add auth later? #Auth", author: "Priya", is_featured: false, votes: 7 },
  { id: "25", body: "Is state management in React getting too complex? #React #State", author: "Kavi", is_featured: false, votes: 20 },
];

export async function getQuestionsPage(
  offset: number,
  limit: number
) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        body,
        author,
        created_at,
        is_featured,
        votes(count)
      `)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)
      .retry(false);

    if (error) throw error;

    const rows = (data ?? []).map((q: any) => ({
      id: q.id,
      body: q.body,
      author: q.author,
      is_featured: q.is_featured,
      votes: q.votes?.[0]?.count ?? 0,
    }));

    return {
      questions: rows,
      hasMore: rows.length === limit,
    };
  } catch (err) {
    return {
      questions: MOCK_QUESTIONS.slice(offset, offset + limit),
      hasMore: offset + limit < MOCK_QUESTIONS.length,
    };
  }
}

export async function getQuestionCount() {
  try {
    const { count, error } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .retry(false);

    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    return MOCK_QUESTIONS.length;
  }
}

export async function searchQuestions(
  q: string,
  limit: number
) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        body,
        author,
        created_at,
        is_featured,
        votes(count)
      `)
      .textSearch("body", q, { type: "websearch", config: "english" })
      .limit(limit)
      .retry(false);

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      id: row.id,
      body: row.body,
      author: row.author,
      is_featured: row.is_featured,
      votes: row.votes?.[0]?.count ?? 0,
    }));
  } catch (err) {
    return MOCK_QUESTIONS
      .filter((mq) => mq.body.toLowerCase().includes(q.toLowerCase()))
      .slice(0, limit);
  }
}