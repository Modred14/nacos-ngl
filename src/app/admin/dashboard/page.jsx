import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllQuestions, getAllResponsesGrouped, getStats } from '@/lib/db';
import AdminLayout from '@/components/AdminLayout';
import StatsCards from '@/components/StatsCards';
import QuestionsManager from '@/components/QuestionCard';
import ResponsesViewer from '@/components/ResponsesViewer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard | Admin - Nacos OAU Feedback',
};

export default async function AdminDashboardPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect('/admin');

  // All db functions are async — must await them
  const [stats, questions, responsesData] = await Promise.all([
    getStats(),
    getAllQuestions(),
    getAllResponsesGrouped(),
  ]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-500 mt-1">Manage questions and view anonymous responses</p>
        </div>

        <StatsCards stats={stats} />
        <QuestionsManager initialQuestions={questions} />
        <ResponsesViewer initialData={responsesData} />
      </div>
    </AdminLayout>
  );
}