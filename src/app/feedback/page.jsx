import { notFound } from 'next/navigation';
import { getQuestionById } from '@/lib/db';
import PublicLayout from '@/components/PublicLayout';

import { ArrowLeft, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const question = getQuestionById(params.id);
  if (!question) return { title: 'Question Not Found' };
  return {
    title: `${question.title} — Nacos OAU Feedback`,
    description: 'Respond anonymously to this question.',
  };
}

export default function QuestionPage({ params }) {
  const question = getQuestionById(params.id);

  if (!question || !question.is_active) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-800 transition-colors mb-8 text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all questions
        </Link>

        {/* Question card */}
        <div className="card p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-surface-900 text-balance leading-tight">
                {question.title}
              </h1>
              {question.description && (
                <p className="mt-3 text-surface-600 leading-relaxed">
                  {question.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-surface-400 border-t border-surface-100 pt-4">
            <span>{question.response_count} response{question.response_count !== 1 ? 's' : ''} so far</span>
          </div>
        </div>

        {/* Anonymity notice */}
        <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-6">
          <Shield className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-brand-800">Your response is completely anonymous</p>
            <p className="text-sm text-brand-700 mt-0.5">
              We collect no names, emails, or identifying information. Not even your IP address is stored.
            </p>
          </div>
        </div>

        {/* Response form */}
     
      </div>
    </PublicLayout>
  );
}