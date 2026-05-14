"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Wand2,
  Link2,
  BookOpen,
  Leaf,
  ExternalLink,
  Users,
  FileText,
  CheckSquare,
  GitBranch,
  Mail,
  ClipboardList,
  Receipt,
  FileSignature,
  MessageSquare,
  Target,
  ListChecks,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "SALES",
    items: [
      { href: "/pipeline", label: "Pipeline", icon: GitBranch },
      { href: "/outreach", label: "Outreach", icon: Mail },
    ],
  },
  {
    label: "PLAYBOOKS",
    items: [
      { href: "/scripts", label: "Outreach Scripts", icon: MessageSquare },
      { href: "/sales-playbook", label: "Sales Playbook", icon: Target },
      { href: "/sops", label: "SOPs & Ops", icon: ListChecks },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { href: "/clients", label: "Client Plans", icon: Users },
      { href: "/checklist", label: "Ops Checklist", icon: ClipboardList },
      { href: "/qc", label: "QC Checklist", icon: CheckSquare },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { href: "/generate", label: "Content Generator", icon: Wand2 },
      { href: "/captions", label: "Caption Library", icon: FileText },
      { href: "/analyze", label: "URL Analyzer", icon: Link2 },
      { href: "/trends", label: "Trend Scout", icon: TrendingUp },
      { href: "/playbook", label: "Growth Playbook", icon: BookOpen },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/invoices", label: "Invoices", icon: Receipt },
      { href: "/proposals", label: "Proposals", icon: FileSignature },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] border-r border-[#1e1e1e] flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e1e1e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Cactus Lab</h1>
            <p className="text-[#666] text-xs">Agency OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[#444] text-[10px] font-semibold uppercase tracking-wider px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-green-400" : ""}`} />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[#1e1e1e] space-y-3 flex-shrink-0">
        {/* Growth goal badge */}
        <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 text-xs font-semibold">Growth Goal</span>
            <span className="text-green-400 text-xs">May 31</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-white text-sm font-bold">15 → 10K</div>
            <div className="text-[#555] text-xs">followers</div>
          </div>
          <div className="mt-2 bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
              style={{ width: "0.15%" }}
            ></div>
          </div>
        </div>

        {/* Agency info */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <div>
            <p className="text-white text-xs font-medium">Awab Sirelkhatim</p>
            <p className="text-[#555] text-xs">Cactus Lab FZ LLC</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto text-[#555] hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
