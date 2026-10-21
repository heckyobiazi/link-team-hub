import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/ui";
import { members } from "@/lib/sample-data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireRole(["admin"]);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Keep workspace access clear and accountable."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Workspace">
          <form className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs text-slate-400" htmlFor="workspace-name">
                Workspace name
              </label>
              <input
                className="min-h-10 rounded-md border border-slate-500/30 bg-transparent px-3 text-sm focus:border-blue-500 focus:outline-none"
                defaultValue="LINK Team Hub"
                id="workspace-name"
                name="workspace-name"
              />
            </div>
            <button
              className="min-h-10 w-fit cursor-pointer rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              type="submit"
            >
              Save changes
            </button>
          </form>
        </Panel>

        <Panel title="Members and roles">
          <ul className="grid gap-3">
            {members.map((m) => (
              <li className="flex items-center justify-between text-sm" key={m.id}>
                <span>{m.name}</span>
                <span className="rounded-full bg-slate-500/20 px-2.5 py-0.5 text-xs text-slate-300">
                  {m.role}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
