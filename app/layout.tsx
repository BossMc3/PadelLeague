import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PadelLeague",
  description: "Tournament OS for padel leagues",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#070b07] text-zinc-100">
        <div className="flex min-h-screen">
          <aside className="hidden w-72 border-r border-white/10 bg-black/30 p-6 backdrop-blur md:block">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9dfd24]">
                Tourney OS
              </p>
              <h1 className="mt-2 text-2xl font-bold">PadelLeague</h1>
            </div>
            <nav className="space-y-2 text-sm">
              <Link className="nav-link" href="/">
                Dashboard
              </Link>
            </nav>
          </aside>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
