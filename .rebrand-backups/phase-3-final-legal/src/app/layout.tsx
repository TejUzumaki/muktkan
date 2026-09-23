import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeApplier } from "@/components/muktkan/theme-applier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nodish — Media without the dish.",
  description:
    "NO-DISH is a premium interface for discovering films, books, and live channels from external sources. Rights and availability vary by source, item, and jurisdiction.",
  keywords: [
    "Nodish",
    "public domain",
    "Internet Archive",
    "Project Gutenberg",
    "IPTV",
    "open source",
    "films",
    "books",
  ],
  authors: [{ name: "Tejas Gafat" }],
  icons: {
    icon: "/muktkan-icon.svg",
    shortcut: "/muktkan-icon.svg",
    apple: "/muktkan-icon.svg",
  },
  openGraph: {
    title: "Nodish — Media without the dish.",
    description:
      "A premium interface for discovering films, books and live channels from external sources. Rights and availability vary by source, item and jurisdiction.",
    siteName: "Nodish",
    type: "website",
  },
};

// Inline script: apply persisted theme + accent before first paint to avoid flash.
// --brand-soft and --ring derive from --brand via color-mix in CSS, so we only
// need to set --brand (and the dark class) here.
const themeBootstrap = `(function(){try{
  var raw=localStorage.getItem('muktkan-onboarding');
  var accent='oklch(0.68 0.19 38)';
  var theme='dark';
  if(raw){var p=JSON.parse(raw);var s=p&&p.state;if(s){if(s.accent)accent=s.accent;if(s.theme)theme=s.theme;}}
  var r=document.documentElement;
  r.style.setProperty('--brand',accent);
  if(theme==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}
}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeApplier />
        {children}
      </body>
    </html>
  );
}
