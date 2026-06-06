import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function QuestionCard({ question, index }) {
  return (
    <Link href={`/question/${question.id}`}>
      <div className="group bg-white border border-surface-200 rounded-2xl p-5 hover:border-primary-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900 text-lg">
              {question.title}
            </h3>
            <h3 className=" text-surface-900 text-sm ">
              {question.description}
            </h3>
            <div className="flex items-center gap-2 mt-3 text-surface-500 text-sm">
              <MessageCircle size={14} />
              <span>Reply anonymously</span>
            </div>
          </div>

          <ArrowRight
            size={20}
            className="text-surface-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </Link>
  );
}
