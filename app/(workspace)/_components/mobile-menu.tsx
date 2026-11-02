"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

// Hamburger button + slide-in drawer
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-md p-2 text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Menu aria-hidden className="size-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            aria-hidden
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto border-r border-white/15 bg-black px-4 py-6"
            id="mobile-menu"
          >
            <button
              aria-label="Close menu"
              className="self-end rounded-md p-2 text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X aria-hidden className="size-5" />
            </button>
            {/* Close when a nav link is tapped. Click is delegated from a wrapper; keyboard activation of links also fires click. */}
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-6"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLElement).closest("a")) {
                  setOpen(false);
                }
              }}
            >
              {children}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
