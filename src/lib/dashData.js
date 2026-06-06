import { getStats, getAllQuestions, getAllResponsesGrouped } from '@/lib/db';

export async function dashData() {
  const [stats, questions, responses] = await Promise.all([
    getStats(),
    getAllQuestions(),
    getAllResponsesGrouped(),
  ]);

  return {
    stats,
    questions,
    responses,
  };
}