"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, X, Edit2, Phone, Mail, AtSign, Calendar, Package, ArrowRight,
} from "lucide-react";
import { useRole } from "@/lib/useRole";

const NICHES = [
  "Pets & Pet Products",
  "Perfume & Watches",
  "Cars & Automotive",
  "Recruitment & HR",
  "Food & Spices",
  "Fashion & Lifestyle",
  "Real Estate & Construction",
  "Fitness & Wellness",
  "Other",
];

interface Client {
  id: string;
  name: string;
  logoUrl: string;
  niche: string;
  package: string;
  retainerAED: number;
  discountedRate?: number;
  fullRateDate?: string;
  services: string;
  contactName: string;
  contactEmail: string;
  contactWhatsApp: string;
  contactInstagram: string;
  startDate: string;
  notes: string;
  billToCompany: string;
  billToAddress: string;
  billToTrn: string;
  invoiceEmails: string;
  invoicePrefix: string;
  invoiceDesc: string;
  invoiceNotes: string;
}

const EMPTY_CLIENT: Omit<Client, "id"> = {
  name: "",
  logoUrl: "",
  niche: NICHES[0],
  package: "Full Social Media Management",
  retainerAED: 5500,
  discountedRate: 0,
  fullRateDate: "",
  services: "15 short-form videos/month\nFull social media management\nNo on-camera client requirement",
  contactName: "",
  contactEmail: "",
  contactWhatsApp: "",
  contactInstagram: "",
  startDate: new Date().toISOString().split("T")[0],
  notes: "",
  billToCompany: "",
  billToAddress: "",
  billToTrn: "",
  invoiceEmails: "",
  invoicePrefix: "",
  invoiceDesc: "",
  invoiceNotes: "",
};

const DEFAULT_CLIENTS: Client[] = [{
  id: "pets-delight",
  name: "Pets Delight",
  logoUrl: "/logo-pets-delight.jpg",
  niche: "Pets & Pet Products",
  package: "Full Social Media Management",
  retainerAED: 5500,
  services: "15 short-form videos/month\nFull social media management\nNo on-camera client requirement\nContent strategy & planning",
  contactName: "",
  contactEmail: "",
  contactWhatsApp: "",
  contactInstagram: "@petsdelightdubai",
  startDate: "2025-03-01",
  notes: "",
  billToCompany: "Arab Land Trading LLC",
  billToAddress: "Al quoz industrial Area 1, street 8, warehouse 1-4\nP.O Box 29893, Dubai, UAE",
  billToTrn: "100544168600003",
  invoiceEmails: "",
  invoicePrefix: "PD",
  invoiceDesc: "Content Creation & Marketing Package",
  invoiceNotes: "18 videos including scripting, shooting, editing, and delivery\n8 LinkedIn posts\n15 stories\ncommunity management",
}];

function isOnDiscount(client: Client): boolean {
  return !!(
    client.discountedRate && client.discountedRate > 0 &&
    client.fullRateDate &&
    new Date() < new Date(client.fullRateDate + "T00:00:00")
  );
}

function effectiveRate(client: Client): number {
  return isOnDiscount(client) ? client.discountedRate! : client.retainerAED;
}

function getNicheColor(niche: string) {
  const n = niche.toLowerCase();
  if (n.includes("pet")) return "bg-teal-500/15 text-teal-400 border-teal-500/20";
  if (n.includes("food") || n.includes("spice")) return "bg-orange-500/15 text-orange-400 border-orange-500/20";
  if (n.includes("perfume") || n.includes("watch")) return "bg-purple-500/15 text-purple-400 border-purple-500/20";
  if (n.includes("car")) return "bg-blue-500/15 text-blue-400 border-blue-500/20";
  if (n.includes("recruit")) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
  if (n.includes("real estate") || n.includes("construction")) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  return "bg-[#222] text-[#888] border-[#2a2a2a]";
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-AE", { month: "long", year: "numeric" });
}

function ClientLogo({ name, logoUrl, size = "lg" }: { name: string; logoUrl: string; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const textSize = size === "lg" ? "text-2xl" : "text-sm";
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${dim} rounded-2xl object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br from-green-500/20 to-green-700/10 border border-green-500/20 flex items-center justify-center flex-shrink-0`}>
      <span className={`${textSize} font-bold text-green-400`}>{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

function ClientCard({
  client,
  onUpdate,
  onDelete,
  readonly,
}: {
  client: Client;
  onUpdate: (c: Client) => void;
  onDelete: (id: string) => void;
  readonly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Client>(client);

  const save = () => {
    onUpdate(form);
    setEditing(false);
  };

  const cancel = () => {
    setForm(client);
    setEditing(false);
  };

  const serviceLines = client.services
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  if (editing) {
    return (
      <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Edit Client</h3>
          <button onClick={cancel} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Client Name</span>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Logo URL</span>
              <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                placeholder="https://... or /logo-pets-delight.jpg"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Niche</span>
              <select value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm appearance-none focus:border-green-500/50 outline-none">
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Package Name</span>
              <input value={form.package} onChange={e => setForm(f => ({ ...f, package: e.target.value }))}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Full Rate (AED)</span>
              <input type="number" value={form.retainerAED} onChange={e => setForm(f => ({ ...f, retainerAED: Number(e.target.value) }))}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!(form.discountedRate && form.discountedRate > 0)}
                  onChange={e => setForm(f => ({ ...f, discountedRate: e.target.checked ? Math.round(f.retainerAED * 0.5) : 0, fullRateDate: e.target.checked ? f.fullRateDate : "" }))}
                  className="rounded accent-amber-400"
                />
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Intro / Discounted Rate</span>
              </label>
              {!!(form.discountedRate && form.discountedRate > 0) && (
                <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-amber-500/30">
                  <label className="block">
                    <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Current Rate (AED)</span>
                    <input type="number" value={form.discountedRate} onChange={e => setForm(f => ({ ...f, discountedRate: Number(e.target.value) }))}
                      className="mt-1 w-full bg-[#1a1a1a] border border-amber-500/30 rounded-xl px-3 py-2.5 text-amber-400 text-sm focus:border-amber-500/60 outline-none" />
                  </label>
                  <label className="block">
                    <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Full Rate From</span>
                    <input type="date" value={form.fullRateDate ?? ""} onChange={e => setForm(f => ({ ...f, fullRateDate: e.target.value }))}
                      className="mt-1 w-full bg-[#1a1a1a] border border-amber-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500/60 outline-none" />
                  </label>
                </div>
              )}
            </div>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Start Date</span>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </label>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Services (one per line)</span>
              <textarea value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
                rows={5}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Contact Person</span>
              <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                placeholder="Name"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Email</span>
              <input value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                placeholder="contact@..."
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">WhatsApp</span>
              <input value={form.contactWhatsApp} onChange={e => setForm(f => ({ ...f, contactWhatsApp: e.target.value }))}
                placeholder="+971..."
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Instagram</span>
              <input value={form.contactInstagram} onChange={e => setForm(f => ({ ...f, contactInstagram: e.target.value }))}
                placeholder="@handle"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Notes</span>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
            </label>
          </div>
        </div>

        {/* Invoice / Billing fields */}
        <div className="border-t border-[#1a1a1a] pt-4">
          <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3">Invoice &amp; Billing Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Bill To — Legal Company Name</span>
              <input value={form.billToCompany} onChange={e => setForm(f => ({ ...f, billToCompany: e.target.value }))}
                placeholder="e.g. Arab Land Trading LLC"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Bill To — TRN</span>
              <input value={form.billToTrn} onChange={e => setForm(f => ({ ...f, billToTrn: e.target.value }))}
                placeholder="e.g. 100544168600003"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block md:col-span-2">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Bill To — Address</span>
              <textarea value={form.billToAddress} onChange={e => setForm(f => ({ ...f, billToAddress: e.target.value }))}
                rows={2} placeholder="Street, area, P.O. Box, city, country"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Email(s)</span>
              <input value={form.invoiceEmails} onChange={e => setForm(f => ({ ...f, invoiceEmails: e.target.value }))}
                placeholder="billing@client.ae, cc@client.ae"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Prefix <span className="text-[#555] normal-case font-normal">(e.g. PD → PD/MAY/001)</span></span>
              <input value={form.invoicePrefix ?? ""} onChange={e => setForm(f => ({ ...f, invoicePrefix: e.target.value.toUpperCase() }))}
                placeholder="e.g. PD, CL, GH"
                maxLength={6}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none font-mono" />
            </label>
            <label className="block">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Line Description</span>
              <input value={form.invoiceDesc} onChange={e => setForm(f => ({ ...f, invoiceDesc: e.target.value }))}
                placeholder="e.g. Content Creation & Marketing Package"
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </label>
            <label className="block col-span-2">
              <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Line Notes <span className="text-[#555] normal-case">(one item per line, shown below description)</span></span>
              <textarea value={form.invoiceNotes} onChange={e => setForm(f => ({ ...f, invoiceNotes: e.target.value }))}
                rows={4}
                placeholder={"18 videos including scripting, shooting, editing, and delivery\n8 LinkedIn posts\n15 stories\ncommunity management"}
                className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none font-mono leading-relaxed" />
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={save} className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Save Changes</button>
          <button onClick={cancel} className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
          <button onClick={() => { onDelete(client.id); }} className="ml-auto bg-red-900/10 hover:bg-red-900/20 border border-red-500/15 text-red-400 px-4 py-2.5 rounded-xl text-sm transition-colors">Remove Client</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <ClientLogo name={client.name} logoUrl={client.logoUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{client.name}</h3>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-medium ${getNicheColor(client.niche)}`}>
                {client.niche}
              </span>
            </div>
            {!readonly && (
              <button
                onClick={() => setEditing(true)}
                className="flex-shrink-0 p-1.5 rounded-lg text-[#444] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Package + Retainer */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2">
          <Package className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          <span className="text-white text-sm font-medium">{client.package}</span>
        </div>
        {isOnDiscount(client) ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <span className="text-amber-400 text-sm font-bold">AED {client.discountedRate!.toLocaleString()}<span className="text-amber-400/60 font-normal">/mo</span></span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#444] flex-shrink-0" />
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2">
              <span className="text-[#888] text-sm font-bold">AED {client.retainerAED.toLocaleString()}</span>
              <span className="text-[#555] text-xs">· {formatDate(client.fullRateDate!)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
            <span className="text-green-400 text-sm font-bold">AED {client.retainerAED.toLocaleString()}<span className="text-green-400/60 font-normal">/mo</span></span>
          </div>
        )}
        {client.startDate && (
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-[#666] flex-shrink-0" />
            <span className="text-[#888] text-sm">Since {formatDate(client.startDate)}</span>
          </div>
        )}
      </div>

      {/* Services */}
      {serviceLines.length > 0 && (
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-2">What We Offer</p>
          <ul className="space-y-1.5">
            {serviceLines.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[#aaa]">
                <span className="w-1 h-1 rounded-full bg-green-500/60 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact */}
      {(client.contactName || client.contactEmail || client.contactWhatsApp || client.contactInstagram) && (
        <div className="border-t border-[#1a1a1a] pt-4">
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-2.5">Contact</p>
          <div className="space-y-1.5">
            {client.contactName && (
              <p className="text-white text-sm font-medium">{client.contactName}</p>
            )}
            {client.contactEmail && (
              <a href={`mailto:${client.contactEmail}`} className="flex items-center gap-2 text-[#888] hover:text-white text-sm transition-colors">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                {client.contactEmail}
              </a>
            )}
            {client.contactWhatsApp && (
              <a href={`https://wa.me/${client.contactWhatsApp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#888] hover:text-white text-sm transition-colors">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {client.contactWhatsApp}
              </a>
            )}
            {client.contactInstagram && (
              <a href={`https://instagram.com/${client.contactInstagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#888] hover:text-white text-sm transition-colors">
                <AtSign className="w-3.5 h-3.5 flex-shrink-0" />
                {client.contactInstagram}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="border-t border-[#1a1a1a] pt-4">
          <p className="text-[#666] text-sm">{client.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function ClientsPage() {
  const { isAdmin } = useRole();
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, "id">>(EMPTY_CLIENT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cactus-clients");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((c: Client) => {
            const defaults = DEFAULT_CLIENTS.find(d => d.id === c.id);
            if (defaults) {
              // Only add fields that are missing from old saved data — never overwrite user edits
              return {
                ...c,
                invoicePrefix: c.invoicePrefix ?? defaults.invoicePrefix,
                discountedRate: c.discountedRate ?? defaults.discountedRate,
                fullRateDate: c.fullRateDate ?? defaults.fullRateDate,
              };
            }
            return {
              ...c,
              invoicePrefix: c.invoicePrefix ?? "",
              discountedRate: c.discountedRate ?? 0,
              fullRateDate: c.fullRateDate ?? "",
              invoiceNotes: c.invoiceNotes ?? "",
            };
          });
          setClients(migrated);
          localStorage.setItem("cactus-clients", JSON.stringify(migrated));
          return;
        }
      }
    } catch {}
    setClients(DEFAULT_CLIENTS);
    localStorage.setItem("cactus-clients", JSON.stringify(DEFAULT_CLIENTS));
  }, []);

  const save = (updated: Client[]) => {
    setClients(updated);
    localStorage.setItem("cactus-clients", JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newClient.name.trim()) return;
    const client: Client = { id: Date.now().toString(), ...newClient };
    save([...clients, client]);
    setNewClient(EMPTY_CLIENT);
    setShowAddForm(false);
  };

  const totalRevenue = clients.reduce((s, c) => s + effectiveRate(c), 0);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
            <Users className="w-4 h-4" />
            Client Roster
          </div>
          <h1 className="text-white text-2xl font-bold">Clients</h1>
          <p className="text-[#666] mt-1">
            {clients.length} {clients.length === 1 ? "client" : "clients"} · AED {totalRevenue.toLocaleString()}/month
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && isAdmin && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">New Client</h3>
            <button onClick={() => setShowAddForm(false)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Client Name *</span>
                <input value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Pets Delight"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Logo URL</span>
                <input value={newClient.logoUrl} onChange={e => setNewClient(p => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="Paste image URL"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Niche</span>
                <select value={newClient.niche} onChange={e => setNewClient(p => ({ ...p, niche: e.target.value }))}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm appearance-none outline-none">
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Package Name</span>
                <input value={newClient.package} onChange={e => setNewClient(p => ({ ...p, package: e.target.value }))}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Full Rate (AED)</span>
                <input type="number" value={newClient.retainerAED} onChange={e => setNewClient(p => ({ ...p, retainerAED: Number(e.target.value) }))}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!(newClient.discountedRate && newClient.discountedRate > 0)}
                    onChange={e => setNewClient(p => ({ ...p, discountedRate: e.target.checked ? Math.round(p.retainerAED * 0.5) : 0, fullRateDate: e.target.checked ? p.fullRateDate : "" }))}
                    className="rounded accent-amber-400"
                  />
                  <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Intro / Discounted Rate</span>
                </label>
                {!!(newClient.discountedRate && newClient.discountedRate > 0) && (
                  <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-amber-500/30">
                    <label className="block">
                      <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Current Rate (AED)</span>
                      <input type="number" value={newClient.discountedRate} onChange={e => setNewClient(p => ({ ...p, discountedRate: Number(e.target.value) }))}
                        className="mt-1 w-full bg-[#1a1a1a] border border-amber-500/30 rounded-xl px-3 py-2.5 text-amber-400 text-sm focus:border-amber-500/60 outline-none" />
                    </label>
                    <label className="block">
                      <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Full Rate From</span>
                      <input type="date" value={newClient.fullRateDate ?? ""} onChange={e => setNewClient(p => ({ ...p, fullRateDate: e.target.value }))}
                        className="mt-1 w-full bg-[#1a1a1a] border border-amber-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500/60 outline-none" />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Services (one per line)</span>
                <textarea value={newClient.services} onChange={e => setNewClient(p => ({ ...p, services: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Contact Person</span>
                <input value={newClient.contactName} onChange={e => setNewClient(p => ({ ...p, contactName: e.target.value }))}
                  placeholder="Name"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Contact Email</span>
                <input value={newClient.contactEmail} onChange={e => setNewClient(p => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="contact@..."
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">WhatsApp</span>
                <input value={newClient.contactWhatsApp} onChange={e => setNewClient(p => ({ ...p, contactWhatsApp: e.target.value }))}
                  placeholder="+971..."
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Instagram</span>
                <input value={newClient.contactInstagram} onChange={e => setNewClient(p => ({ ...p, contactInstagram: e.target.value }))}
                  placeholder="@handle"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
            </div>
          </div>

          {/* Invoice / Billing fields */}
          <div className="border-t border-[#1a1a1a] pt-4">
            <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3">Invoice &amp; Billing Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Bill To — Legal Company Name</span>
                <input value={newClient.billToCompany} onChange={e => setNewClient(p => ({ ...p, billToCompany: e.target.value }))}
                  placeholder="e.g. Arab Land Trading LLC"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Bill To — TRN</span>
                <input value={newClient.billToTrn} onChange={e => setNewClient(p => ({ ...p, billToTrn: e.target.value }))}
                  placeholder="e.g. 100544168600003"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Bill To — Address</span>
                <textarea value={newClient.billToAddress} onChange={e => setNewClient(p => ({ ...p, billToAddress: e.target.value }))}
                  rows={2} placeholder="Street, area, P.O. Box, city, country"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Email(s)</span>
                <input value={newClient.invoiceEmails} onChange={e => setNewClient(p => ({ ...p, invoiceEmails: e.target.value }))}
                  placeholder="billing@client.ae, cc@client.ae"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Prefix <span className="text-[#555] normal-case font-normal">(e.g. PD → PD/MAY/001)</span></span>
                <input value={newClient.invoicePrefix ?? ""} onChange={e => setNewClient(p => ({ ...p, invoicePrefix: e.target.value.toUpperCase() }))}
                  placeholder="e.g. PD, CL, GH"
                  maxLength={6}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none font-mono" />
              </label>
              <label className="block">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Line Description</span>
                <input value={newClient.invoiceDesc} onChange={e => setNewClient(p => ({ ...p, invoiceDesc: e.target.value }))}
                  placeholder="e.g. Content Creation & Marketing Package"
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </label>
              <label className="block col-span-2">
                <span className="text-[#666] text-xs uppercase tracking-wide font-medium">Invoice Line Notes <span className="text-[#555] normal-case">(one item per line, shown below description)</span></span>
                <textarea value={newClient.invoiceNotes} onChange={e => setNewClient(p => ({ ...p, invoiceNotes: e.target.value }))}
                  rows={4}
                  placeholder={"18 videos including scripting, shooting, editing, and delivery\n8 LinkedIn posts\n15 stories\ncommunity management"}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none font-mono leading-relaxed" />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={handleAdd} disabled={!newClient.name.trim()}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Add Client
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Client grid */}
      {clients.length === 0 && !showAddForm ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <Users className="w-10 h-10 text-[#333] mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No clients yet</p>
          <p className="text-[#666] text-sm mb-5">Add your first client to keep all their details in one place.</p>
          {isAdmin && (
            <button onClick={() => setShowAddForm(true)}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Add Your First Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              readonly={!isAdmin}
              onUpdate={(updated) => save(clients.map(c => c.id === updated.id ? updated : c))}
              onDelete={(id) => save(clients.filter(c => c.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
