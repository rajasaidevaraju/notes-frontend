import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Notification from "./components/Notification";

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
  title: "Notes",
  description: "Share notes on LAN",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        href: "/icon.svg",
      },
    ],
  }
};


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
                  document.documentElement.classList.toggle('dark', isDark);
                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', 'theme-color');
                    document.head.appendChild(meta);
                  }
                  meta.setAttribute('content', isDark ? '#171717' : '#f8fafc');
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
        <Notification />
      </body>
    </html>
  );
}
