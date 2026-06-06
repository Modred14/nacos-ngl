import { getActiveQuestions } from "@/lib/db";
import PublicLayout from "@/components/PublicLayout";
import HeroSection from "@/components/HeroSection";
import QuestionClient from "./QuestionClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: 'Nacos OAU Feedback',
};
export default async function HomePage() {
  const questions = await getActiveQuestions();
  const safeQuestions = Array.isArray(questions) ? questions : [];

  return (
    <PublicLayout>
      <HeroSection />
      <QuestionClient questions={safeQuestions} />
    </PublicLayout>
  );
}