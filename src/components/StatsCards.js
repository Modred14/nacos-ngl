"use client";

import {
  LayoutList,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const CARDS = [
  {
    key: "totalQuestions",
    label: "Total Questions",
    icon: LayoutList,
    color: "brand",
    description: "All questions created",
  },
  {
    key: "activeQuestions",
    label: "Active Questions",
    icon: CheckCircle2,
    color: "green",
    description: "Visible to the public",
  },
  {
    key: "totalResponses",
    label: "Total Responses",
    icon: MessageSquare,
    color: "blue",
    description: "Anonymous submissions",
  },
  {
    key: "recentResponses",
    label: "This Week",
    icon: TrendingUp,
    color: "gold",
    description: "Responses in last 7 days",
  },
];

const COLOR_MAP = {
  brand: {
    bg: "bg-brand-50",
    icon: "text-brand-600",
    ring: "ring-brand-100",
    number: "text-brand-700",
    dot: "bg-brand-400",
  },
  green: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    ring: "ring-emerald-100",
    number: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  blue: {
    bg: "bg-sky-50",
    icon: "text-sky-600",
    ring: "ring-sky-100",
    number: "text-sky-700",
    dot: "bg-sky-400",
  },
  gold: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    ring: "ring-amber-100",
    number: "text-amber-700",
    dot: "bg-amber-400",
  },
};

function StatCard({ card, value, index, stats }) {
  const { label, icon: Icon, color, description, key } = card;
  const c = COLOR_MAP[color];
  let progress = value > 0 ? 100 : 0;

  if (key === "activeQuestions") {
    progress =
      stats?.totalQuestions > 0
        ? (stats.activeQuestions / stats.totalQuestions) * 100
        : 0;
  }

  if (key === "recentResponses") {
    progress =
      stats?.totalResponses > 0
        ? (stats.recentResponses / stats.totalResponses) * 100
        : 0;
  }

  return (
    <div
      className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {/* Live indicator on "This Week" */}
        {color === "gold" && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`}
            />
            Live
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className={`text-4xl font-display font-bold tracking-tight ${c.number}`}
        >
          {value ?? "—"}
        </p>
        <p className="text-sm font-semibold text-surface-800 mt-1">{label}</p>
        <p className="text-xs text-surface-400 mt-0.5">{description}</p>
      </div>

      {/* Bottom bar */}
      <div className={`h-1 w-full rounded-full ${c.bg}`}>
        <div
          className={`h-1 rounded-full ${c.dot} transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-4">
        Overview
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card, i) => (
          <StatCard
            key={card.key}
            card={card}
            value={stats?.[card.key] ?? 0}
            stats={stats}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
