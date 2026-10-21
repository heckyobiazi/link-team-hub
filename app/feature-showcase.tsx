"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    name: "Dashboard",
    title: "A quick, actionable summary of today.",
    bullets: [
      "Welcome header with the date and a primary Submit daily update action",
      "Summary cards for availability, report submissions, completed tasks and open blockers",
      "Team updates, availability, project progress and blockers in one view",
      "Clear loading, empty, error and stale-data states",
    ],
    preview: [
      ["Availability", "7 of 12"],
      ["Reports submitted", "9 of 12"],
      ["Tasks completed", "6"],
      ["Open blockers", "3"],
    ],
  },
  {
    name: "Daily Reports",
    title: "A useful daily update, without the busywork.",
    bullets: [
      "Share what moved forward, what is next and where help is needed",
      "Keep updates short, consistent and easy for teammates to scan",
      "Review your own report history and make permitted edits",
      "See submission progress without turning updates into a score",
    ],
    preview: [
      ["Finished", "Invite flow and role checks"],
      ["Up next", "Review empty states"],
      ["Need help", "SSO configuration"],
      ["Submitted today", "9 of 12"],
    ],
  },
  {
    name: "Tasks & Projects",
    title: "Keep ownership, progress and blockers together.",
    bullets: [
      "Give each task a clear owner, status and due date",
      "Group work into projects with a readable progress summary",
      "Flag blockers with enough context for a teammate to step in",
      "Keep project decisions visible to the people who need them",
    ],
    preview: [
      ["Daily Reports", "72% complete"],
      ["Tasks & Projects", "45% complete"],
      ["Access & Roles", "28% complete"],
      ["Open blocker", "SSO configuration"],
    ],
  },
  {
    name: "Team Directory",
    title: "Know who is on the team and what they own.",
    bullets: [
      "Find teammates by name, role or project",
      "See useful work context alongside each team profile",
      "Understand ownership without searching across multiple tools",
      "Only show profile details that are appropriate for the workspace",
    ],
    preview: [
      ["Mara Reyes", "Daily Reports"],
      ["Dev Kapoor", "Access & Roles"],
      ["Lena Park", "Tasks & Projects"],
      ["Tomas Novak", "Access & Roles"],
    ],
  },
  {
    name: "Availability",
    title: "Share when you are available, on your terms.",
    bullets: [
      "Choose a status such as Available, Focus Time, In a Meeting or Away",
      "Make availability voluntary and easy to change",
      "See team-declared status when coordinating work",
      "Never infer presence from activity, devices or browsing behavior",
    ],
    preview: [
      ["Mara Reyes", "Available"],
      ["Dev Kapoor", "Focus Time"],
      ["Lena Park", "In a Meeting"],
      ["Tomas Novak", "Away"],
    ],
  },
  {
    name: "Calendar",
    title: "See the team rhythm around the work.",
    bullets: [
      "Review upcoming project milestones and team events",
      "Keep dates and ownership connected to project context",
      "Make changes visible to the people affected",
      "Coordinate around schedules without tracking anyone",
    ],
    preview: [
      ["Today", "Daily report check-in"],
      ["Tuesday", "Design review"],
      ["Thursday", "Project milestone"],
      ["Friday", "Team demo"],
    ],
  },
  {
    name: "Management Overview",
    title: "Get the big picture, without losing the details.",
    bullets: [
      "Review project health and major blockers across the workspace",
      "Spot trends in team-reported progress and update coverage",
      "Drill into the context behind a summary",
      "Give executives read-only, high-level visibility",
    ],
    preview: [
      ["Healthy projects", "4"],
      ["Needs attention", "2"],
      ["Reports submitted", "9 of 12"],
      ["Priority blocker", "SSO configuration"],
    ],
  },
  {
    name: "Notifications",
    title: "Get a nudge when something needs your attention.",
    bullets: [
      "Highlight new assignments, mentions and relevant blockers",
      "Keep notifications tied to useful team actions",
      "Let people choose how they want to stay informed",
      "Avoid noisy alerts and surveillance-style activity signals",
    ],
    preview: [
      ["New assignment", "Review report edit policy"],
      ["Blocker update", "SSO setup still pending"],
      ["Team mention", "Mara Reyes · Daily Reports"],
      ["Reminder", "Your update is ready"],
    ],
  },
  {
    name: "Settings",
    title: "Keep workspace access clear and accountable.",
    bullets: [
      "Invite and disable users from one workspace view",
      "Assign role-based access for members, leads and executives",
      "Configure team and project settings",
      "Review administrative changes through audit events",
    ],
    preview: [
      ["Workspace members", "12"],
      ["Team leads", "3"],
      ["Pending invites", "1"],
      ["Recent admin events", "View log"],
    ],
  },
];

export default function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = features[activeIndex];

  return (
    <div className="min-w-0">
      <div
        className="flex overflow-x-auto border-b border-slate-500/20"
        role="tablist"
        aria-label="Product features"
      >
        {features.map((feature, index) => (
          <Button
            aria-selected={activeIndex === index}
            className={`relative h-auto min-h-10 shrink-0 rounded-none bg-transparent px-3.5 text-[11px] whitespace-nowrap transition-colors hover:bg-transparent hover:text-white active:translate-y-0 ${
              activeIndex === index
                ? "text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-blue-600 after:content-['']"
                : "text-slate-400"
            }`}
            variant="ghost"
            id={`feature-tab-${index}`}
            key={feature.name}
            onClick={() => setActiveIndex(index)}
            role="tab"
            type="button"
            aria-controls="feature-panel"
          >
            {feature.name}
          </Button>
        ))}
      </div>

      <div
        aria-labelledby={`feature-tab-${activeIndex}`}
        className="grid grid-cols-1 gap-6 pt-6 md:min-h-64 md:grid-cols-2 md:gap-10"
        id="feature-panel"
        role="tabpanel"
      >
        <div>
          <h3 className="mb-2 text-xl font-medium text-white">
            {activeFeature.name}
          </h3>
          <p className="mb-4 text-sm leading-normal text-slate-400">
            {activeFeature.title}
          </p>
          <ul>
            {activeFeature.bullets.map((bullet) => (
              <li
                className="relative py-1.5 pl-3.5 text-[11px] leading-relaxed text-slate-300 before:absolute before:top-3.5 before:left-0 before:h-px before:w-1.5 before:bg-blue-600 before:content-['']"
                key={bullet}
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <Card
          className="self-start rounded-xl border border-slate-500/20 bg-blue-950/30 py-0 text-slate-400 ring-0"
          aria-label={`${activeFeature.name} preview`}
        >
          <CardContent className="px-4 py-3">
            {activeFeature.preview.map(([label, value]) => (
              <div
                className="flex min-h-9 items-center justify-between gap-3 border-b border-slate-500/10 text-[11px] last:border-b-0"
                key={label}
              >
                <span>{label}</span>
                <strong className="text-right font-medium text-slate-100">
                  {value}
                </strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
