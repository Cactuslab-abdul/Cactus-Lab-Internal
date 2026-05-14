import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cactus Lab Agency OS",
  description: "Full business operating system for Cactus Lab UAE social media agency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen overflow-auto">
            <div className="p-8">
              {!process.env.ANTHROPIC_API_KEY && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-xl flex items-center gap-3">
                  <span className="text-yellow-400 text-lg">⚠️</span>
                  <div>
                    <p className="text-yellow-400 font-medium text-sm">API Key Required</p>
                    <p className="text-yellow-400/70 text-xs mt-0.5">
                      Add your Anthropic API key to <code className="bg-yellow-900/30 px-1 rounded">.env.local</code> to enable AI features.
                      See <code className="bg-yellow-900/30 px-1 rounded">.env.local.example</code> for the format.
                    </p>
                  </div>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
