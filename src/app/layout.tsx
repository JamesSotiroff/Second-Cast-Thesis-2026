import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "Second Cast | Techno-Economic Model",
  description:
    "Interactive embodied carbon and Midwest cost model for Second Cast composite wall panels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                ACADIA 2026
              </p>
              <p className="text-lg font-semibold">Second Cast</p>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Overview
              </Link>
              <Link href="/model/" className="hover:underline">
                Interactive Model
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
