import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/conditional-layout";

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
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
