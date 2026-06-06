import { MessageSquareDashed } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-surface-300 rounded-2xl bg-surface-50">
      <MessageSquareDashed
        size={48}
        className="text-surface-400 mb-4"
      />

      <h3 className="text-lg font-semibold text-surface-900">
        No Active Questions
      </h3>

      <p className="text-sm text-surface-500 mt-2 max-w-md">
        There are currently no questions available for anonymous responses.
        Check back later when new questions are posted.
      </p>
    </div>
  );
}