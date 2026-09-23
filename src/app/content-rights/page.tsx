import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content & Rights — NO-DISH",
  description: "Content, licensing, copyright, and rights information for NO-DISH.",
};

export default function ContentRightsPage() {
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
            Content &amp; Rights
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            How NO-DISH handles third-party media and rights information.
          </p>
        </header>

        <div className="mt-10 space-y-10 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              NO-DISH is an interface, not a rights holder
            </h2>
            <p className="mt-3">
              NO-DISH is a discovery and presentation layer for media made
              available through external services. It does not claim ownership
              of third-party films, books, television channels, artwork,
              metadata, or trademarks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Public domain is jurisdiction-dependent
            </h2>
            <p className="mt-3">
              A work may be public domain in one country while remaining
              protected by copyright in another. NO-DISH therefore avoids
              treating free accessibility as automatic proof of worldwide
              public-domain status.
            </p>
            <p className="mt-3">
              Users should verify the rights information supplied by the
              relevant source and consider the laws applicable to their own
              location before downloading, redistributing, or otherwise using
              material.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Films and video
            </h2>
            <p className="mt-3">
              NO-DISH may surface films and video hosted by the Internet
              Archive. Individual Internet Archive items can have different
              rights information and access conditions.
            </p>
            <p className="mt-3">
              The presence of an item on Internet Archive does not, by itself,
              mean that the item is public domain everywhere.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Books
            </h2>
            <p className="mt-3">
              NO-DISH may use Project Gutenberg and the Gutendex API to discover
              and present information about books and their available text
              formats.
            </p>
            <p className="mt-3">
              Project Gutenberg provides rights information for its individual
              ebooks. Copyright status can differ by jurisdiction, so users
              should consult the rights information supplied with the
              particular ebook.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Live television
            </h2>
            <p className="mt-3">
              NO-DISH may use channel and stream information from iptv-org.
              These are third-party streams and should not automatically be
              described as public-domain media.
            </p>
            <p className="mt-3">
              NO-DISH does not operate or control the underlying television
              broadcasters or stream servers. Availability and licensing may
              vary by channel, provider, and jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Rights information categories
            </h2>
            <p className="mt-3">
              Where practical, NO-DISH may distinguish between different kinds
              of source material rather than applying a single blanket label.
              These categories can include:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Public Domain</li>
              <li>Open License</li>
              <li>Rights or License Verified</li>
              <li>Third-Party Stream</li>
              <li>Rights Information Unavailable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Copyright concerns
            </h2>
            <p className="mt-3">
              If you believe that material presented through NO-DISH infringes
              your copyright or other rights, please provide the project
              maintainer with enough information to identify the affected item,
              the relevant source, and the basis of your claim.
            </p>
            <p className="mt-3">
              NO-DISH can review and, where appropriate, correct metadata,
              remove an interface reference, or investigate the underlying
              source.
            </p>
          </section>

          <section className="border-t border-border/60 pt-8">
            <p>
              NO-DISH aims to make media from external sources easier to discover
              while avoiding claims about rights that cannot be established
              from the available source information.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
