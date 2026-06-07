"use client";

import { useEffect } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PrintBar({ backHref, autoPrint }: { backHref: string; autoPrint: boolean }) {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <div className="no-print mb-6 flex gap-3 flex-wrap fade-in">
      <Link href={backHref}
        className="flex items-center gap-2 text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-4 py-2 rounded-lg transition-all">
        <ArrowLeft className="w-4 h-4" />Back to billing
      </Link>
      <button onClick={() => window.print()}
        className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
        <Printer className="w-4 h-4" />Print / Save as PDF
      </button>
    </div>
  );
}
