import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Short Links",
  description: "Create and manage short links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">


            <Link href="/" className="font-semibold">Short Links</Link>
            <nav className="flex gap-4 text-sm">
              <Link className="hover:underline" href="/">Dashboard</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">
          {children}
        </main>
        <footer className="mt-8 border-t bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-zinc-600">
            © {new Date().getFullYear()} Short Links
          </div>
        </footer>
      </body>
    </html>
  );
}
