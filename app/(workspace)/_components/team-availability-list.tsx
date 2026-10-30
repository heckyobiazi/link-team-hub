"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TeamMember } from "@/lib/db/schema";

type AvailabilityMember = Pick<TeamMember, "id" | "name" | "availability"> & {
  lastActivityAt: number;
};

const statusStyles = {
  available: {
    label: "Available",
    dot: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.75)]",
    text: "text-emerald-300",
  },
  in_meeting: {
    label: "In a meeting",
    dot: "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.7)]",
    text: "text-amber-300",
  },
  away: {
    label: "Away",
    dot: "bg-slate-400 shadow-[0_0_8px_1px_rgba(148,163,184,0.45)]",
    text: "text-slate-300",
  },
} as const;

export function TeamAvailabilityList({
  members,
  currentUserId,
  initialNow,
}: {
  members: AvailabilityMember[];
  currentUserId: string;
  initialNow: number;
}) {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const statuses = members.map((member) => {
    const inactive = now - member.lastActivityAt >= 30 * 60 * 1000;
    const status = member.availability === "available" && inactive
      ? "away"
      : member.availability;
    return { ...member, status, appearance: statusStyles[status] };
  });
  const availableCount = statuses.filter((member) => member.status === "available").length;

  return (
    <>
      <p className="text-xs text-slate-400">
        {availableCount} available among the {members.length} members shown
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Available status switches to Away after 30 minutes without a logged LINK action.
      </p>
      <ul className="mt-4 grid gap-3">
        {statuses.map((member) => (
          <li className="flex items-center gap-3 text-sm" key={member.id}>
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-white text-[10px] font-bold text-blue-700">
              {member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <span className="flex-1 text-slate-100">
              {member.name}{member.id === currentUserId ? " (you)" : ""}
            </span>
            <span aria-hidden className={`size-2 shrink-0 rounded-full ${member.appearance.dot}`} />
            <span className={`text-xs ${member.appearance.text}`}>{member.appearance.label}</span>
          </li>
        ))}
      </ul>
      <Link className="mt-4 inline-block text-xs text-cyan-300 hover:underline" href="/availability">
        Update my status →
      </Link>
    </>
  );
}
