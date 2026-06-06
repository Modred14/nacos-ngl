import { getStats, getAllQuestions, getAllResponsesGrouped } from "@/lib/db";

export async function GET() {
  const [stats, questions, responses] = await Promise.all([
    getStats(),
    getAllQuestions(),
    getAllResponsesGrouped(),
  ]);

  return Response.json({
    stats,
    questions,
    responses,
  });
}