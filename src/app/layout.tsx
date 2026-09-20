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
  title: "Muktkan — The Hall of Liberated Media",
  description:
    "Muktkan (मुक्त 館) is a premium front door to 100% legal, open-source and public-domain media — public-domain films from the Internet Archive, books from Project Gutenberg, and open IPTV channels.",
  keywords: ["Muktkan", "public domain", "Internet Archive", "Project Gutenberg", "IPTV", "open source", "films", "books"],
  authors: [{ name: "Muktkan" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Muktkan — The Hall of Liberated Media",
    description: "A premium interface for public-domain films, books and live TV.",
    siteName: "Muktkan",
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
