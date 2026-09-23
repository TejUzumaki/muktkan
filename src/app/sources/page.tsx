import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sources & Attribution — NO-DISH",
  description: "Sources, APIs, and third-party projects used by NO-DISH.",
};

const sources = [
  {
    name: "Internet Archive",
    role: "Film and video source",
    url: "https://archive.org/",
    description:
      "NO-DISH may use publicly accessible Internet Archive items for film and video discovery and playback. Rights and access conditions are determined at the individual item level.",
  },
  {
    name: "Project Gutenberg",
    role: "Electronic book source",
    url: "https://www.gutenberg.org/",
    description:
      "NO-DISH uses Project Gutenberg as a source for discovering and presenting information about ebooks and their available formats. Users should consult the rights information provided with each ebook.",
  },
  {
    name: "Gutendex",
    role: "Book metadata API",
    url: "https://gutendex.com/",
    description:
      "NO-DISH uses the Gutendex API to retrieve structured metadata about Project Gutenberg books.",
  },
  {
    name: "iptv-org",
    role: "Live TV channel and stream directory",
    url: "https://iptv-org.github.io/",
    description:
      "NO-DISH may use channel and stream information maintained by iptv-org. The underlying broadcasters and stream servers are third-party services and are not operated by NO-DISH.",
  },
  {
    name: "Vercel",
    role: "Application hosting and deployment",
    url: "https://vercel.com/",
    description:
      "NO-DISH is deployed using Vercel infrastructure.",
  },
];

export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <a
          href="/"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to NO-DISH
        </a>

        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            NO-DISH
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sources &amp; Attribution
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The external projects and infrastructure that help power NO-DISH.
          </p>
        </header>

        <div className="mt-10 space-y-5">
          {sources.map((source) => (
            <section
              key={source.name}
              className="rounded-2xl border border-border/60 bg-card/30 p-5"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  {source.name}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {source.role}
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {source.description}
              </p>

              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs font-medium brand-text transition hover:opacity-80"
              >
                Visit source ↗
              </a>
            </section>
          ))}
        </div>

        <section className="mt-10 border-t border-border/60 pt-8 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            About attribution
          </h2>
          <p className="mt-3">
            NO-DISH is an independent project and is not affiliated with,
            endorsed by, or operated by the organizations and projects listed
            above unless explicitly stated otherwise.
          </p>
          <p className="mt-3">
            Third-party names, trademarks, logos, media, metadata, and other
            intellectual property remain the property of their respective
            owners.
          </p>
        </section>

        <section className="mt-8 border-t border-border/60 pt-8 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Created and developed by
          </h2>
          <p className="mt-3">
            Tejas Gafat — independent developer and creator of NO-DISH.
          </p>
        </section>
      </div>
    </main>
  );
}
