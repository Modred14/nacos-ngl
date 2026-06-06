import { ShieldCheck } from "lucide-react";

export default function AnonymousBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
      <ShieldCheck size={16} className="text-green-600" />
      <span className="text-sm font-medium text-green-700">
        100% Anonymous
      </span>
    </div>
  );
}