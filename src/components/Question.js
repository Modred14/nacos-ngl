import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Users,
  BadgeQuestionMark,
} from "lucide-react";

const ACCENT_COLORS = [
  {
    dot: "bg-brand-400",
    ring: "ring-brand-100",
    hover: "hover:border-brand-300  hover:shadow-brand-100/60",
  },
  {
    dot: "bg-gold-400",
    ring: "ring-gold-100",
    hover: "hover:border-gold-300   hover:shadow-gold-100/60",
  },
  {
    dot: "bg-sky-400",
    ring: "ring-sky-100",
    hover: "hover:border-sky-300    hover:shadow-sky-100/60",
  },
  {
    dot: "bg-violet-400",
    ring: "ring-violet-100",
    hover: "hover:border-violet-300 hover:shadow-violet-100/60",
  },
  {
    dot: "bg-rose-400",
    ring: "ring-rose-100",
    hover: "hover:border-rose-300   hover:shadow-rose-100/60",
  },
];

export default function QuestionCard({ question, index = 0 }) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const count = Number(question.response_count ?? 0);

  return (
    <Link href={`/question/${question.id}`} className="block group">
      <article
        className={`
        relative bg-white border border-surface-200 rounded-2xl p-5 sm:p-6
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-0.5
        ${accent.hover}
        focus-within:ring-2 focus-within:ring-brand-500
      `}
      >
        {/* Top row: accent dot + number pill */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <BadgeQuestionMark size={20} className="text-brand-400"/>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-surface-400 bg-surface-50 border border-surface-200 px-2.5 py-1 rounded-full">
            <Users className="w-3 h-3" />
            {count === 0
              ? "Be the first to respond"
              : `${count} response${count !== 1 ? "s" : ""}`}
          </div>
        </div>

        {/* Question title */}
        <h3 className="text-base sm:text-lg font-semibold text-surface-900 leading-snug text-balance group-hover:text-brand-700 transition-colors">
          {question.title}
        </h3>

        {/* Description */}
        {question.description && (
          <p className="mt-2 text-sm text-surface-500 leading-relaxed line-clamp-2">
            {question.description}
          </p>
        )}

        {/* Bottom CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-600">
            <MessageCircle className="w-4 h-4" />
            <span>Respond anonymously</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
            <ArrowRight className="w-3.5 h-3.5 text-brand-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </article>
    </Link>
  );
}
