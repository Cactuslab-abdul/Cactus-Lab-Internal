"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Wand2,
  Link2,
  Users,
  GitBranch,
  Mail,
  Receipt,
  FileSignature,
  MessageSquare,
  BarChart2,
  LogOut,
  Upload,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/useRole";
import type { UserRole } from "@/lib/useRole";

const allNavSections = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
    ],
  },
  {
    label: "SALES",
    items: [
      { href: "/pipeline", label: "Pipeline", icon: GitBranch, adminOnly: true },
      { href: "/outreach", label: "Outreach", icon: Mail, adminOnly: true },
      { href: "/scripts", label: "Scripts", icon: MessageSquare, adminOnly: true },
    ],
  },
  {
    label: "CLIENTS",
    items: [
      { href: "/clients", label: "Clients", icon: Users, adminOnly: false },
      { href: "/growth", label: "Growth", icon: TrendingUp, adminOnly: true },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { href: "/generate", label: "Generator", icon: Wand2, adminOnly: false },
      { href: "/analyze", label: "URL Analyzer", icon: Link2, adminOnly: false },
      { href: "/trends", label: "Trend Scout", icon: BarChart2, adminOnly: false },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/invoices", label: "Invoices", icon: Receipt, adminOnly: true },
      { href: "/payments", label: "Payments", icon: CreditCard, adminOnly: true },
      { href: "/proposals", label: "Proposals", icon: FileSignature, adminOnly: true },
    ],
  },
];

function getNavSections(role: UserRole) {
  return allNavSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.adminOnly || role === "admin"),
    }))
    .filter(section => section.items.length > 0);
}

const KNOWN_AVATARS: Record<string, string> = {
  "awab.sirelkhatim@gmail.com": "https://tpxyegbeluspgashouzb.supabase.co/storage/v1/object/public/avatars/Awab%20Image.jpeg",
  "abdul.ahmed.eg@gmail.com": "https://tpxyegbeluspgashouzb.supabase.co/storage/v1/object/public/avatars/abdulrahman%20image.png",
};

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  initials: string;
  imgError: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [role, setRole] = useState<UserRole>("editor");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) return;
      const meta = u.user_metadata || {};
      const fullName = meta.full_name || meta.name || u.email?.split("@")[0] || "User";
      const initials = fullName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      setUser({
        id: u.id,
        email: u.email || "",
        fullName,
        avatarUrl: meta.avatar_url || KNOWN_AVATARS[u.email || ""] || null,
        initials,
        imgError: false,
      });
      const admin = isAdminEmail(u.email) || meta.role === "admin";
      setRole(admin ? "admin" : "editor");
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const storagePath = `${user.id}/avatar.${ext}`;
    const supabase = createClient();
    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(storagePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(storagePath);

      const urlWithBust = `${publicUrl}?t=${Date.now()}`;

      await supabase.auth.updateUser({
        data: { avatar_url: urlWithBust },
      });

      setUser(prev => prev ? { ...prev, avatarUrl: urlWithBust, imgError: false } : prev);
      setAvatarKey(k => k + 1);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Upload failed. Make sure the 'avatars' bucket exists in Supabase Storage (set to public).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const showImg = user?.avatarUrl && !user?.imgError;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] border-r border-[#1e1e1e] flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-[#1e1e1e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="https://tpxyegbeluspgashouzb.supabase.co/storage/v1/object/public/avatars/cactus%20lab%20social%20logo.png" alt="Cactus Lab" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Cactus Lab</h1>
            <p className="text-[#666] text-xs">Agency OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-5">
        {getNavSections(role).map((section) => (
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

      {/* Bottom — user profile */}
      <div className="p-4 border-t border-[#1e1e1e] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-1">
          {/* Avatar — click to upload */}
          <button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="relative flex-shrink-0 group"
            title="Click to update photo"
          >
            {showImg ? (
              <img
                key={avatarKey}
                src={user!.avatarUrl!}
                alt={user!.fullName}
                onError={() => setUser(prev => prev ? { ...prev, imgError: true } : prev)}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2a2a2a] group-hover:ring-green-500/50 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-[#2a2a2a] group-hover:ring-green-500/50 transition-all">
                {user?.initials || "?"}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading
                ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                : <Upload className="w-3 h-3 text-white" />
              }
            </div>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{user?.fullName || "Loading..."}</p>
            <p className="text-[#555] text-xs truncate">{user?.email || ""}</p>
          </div>

          <button
            onClick={handleLogout}
            className="ml-auto text-[#555] hover:text-red-400 transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
