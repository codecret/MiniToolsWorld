import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Extract PDF Images",
  description: "Easy to use app to extract all embedded images from PDF files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-50 text-neutral-900 dark:bg-black dark:text-neutral-50`}
      >
        <div className="min-h-screen">
          <header className="border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-neutral-800 dark:bg-black/80">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
                  T
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    My Tools
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Fast, focused utilities for your files.
                  </p>
                </div>
              </div>
              <nav className="flex items-center gap-3 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                <Link
                  href="/"
                  className="rounded-full px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Extract PDF Images
                </Link>
                <Link
                  href="/image-to-webp"
                  className="rounded-full px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Images → WebP
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
