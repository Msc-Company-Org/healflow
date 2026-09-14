import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealFlow — Autonomous CI/CD Auto-Healing with IBM Bob 2.0",
  description:
    "Autonomous agent that captures failed GitHub Actions runs, identifies root causes using IBM Bob 2.0 full-repository context, and opens surgical healing PRs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
