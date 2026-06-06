import QuestionPageClient from "./QuestionPageClient";

export default async function Page({ params }) {
  const { id } = await params;

  return <QuestionPageClient id={id} />;
}