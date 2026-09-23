import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Nodish",
  description: "Terms of use for Nodish — Media without the dish.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <a
          href="/"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Nodish
        </a>

        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Nodish
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: September 20, 2026
          </p>
        </header>

        <div className="mt-10 space-y-10 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. What Nodish is
            </h2>
            <p className="mt-3">
              Nodish, Media without the dish., is a free,
              non-commercial interface created and developed by Tejas Gafat.
              It is designed to help people discover and experience media that
              is made available through external sources.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Free and non-commercial use
            </h2>
            <p className="mt-3">
              Nodish currently operates without paid subscriptions and
              advertising. No payment is required to use the application.
            </p>
            <p className="mt-3">
              The project may change its infrastructure or operating model in
              the future if technical requirements change, but any such change
              will be communicated through the project where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Third-party content
            </h2>
            <p className="mt-3">
              Nodish does not claim ownership of movies, books, television
              streams, artwork, metadata, trademarks, or other material
              belonging to third parties.
            </p>
            <p className="mt-3">
              Nodish acts as an interface and discovery layer over external
              sources. The availability, licensing, copyright status, and
              continued accessibility of individual items may differ by source,
              work, and jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Your responsibility
            </h2>
            <p className="mt-3">
              You are responsible for using Nodish and any linked external
              services in accordance with the laws and regulations applicable
              to you.
            </p>
            <p className="mt-3">
              In particular, the legal status of a work may differ between
              countries. An item being freely accessible through an external
              service does not, by itself, establish that the item is public
              domain in every jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. External services
            </h2>
            <p className="mt-3">
              Nodish may use or link to services including Internet Archive,
              Project Gutenberg, Gutendex, iptv-org, and third-party stream
              providers. Those services operate independently from Nodish and
              may have their own terms, licenses, privacy policies, and
              restrictions.
            </p>
            <p className="mt-3">
              Nodish cannot guarantee that an external service, stream,
              download, book, or media item will remain available or unchanged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Intellectual property
            </h2>
            <p className="mt-3">
              Nodish respects copyright, trademarks, licenses, and other
              intellectual-property rights. Source attribution is provided
              where appropriate, and Nodish does not intend to represent
              third-party material as its own.
            </p>
            <p className="mt-3">
              If you believe material presented through Nodish infringes your
              rights or is incorrectly described, please contact the project
              maintainer with enough information to identify the material and
              explain the concern.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Availability and reliability
            </h2>
            <p className="mt-3">
              Nodish is provided on an as-available basis. External APIs,
              streams, metadata services, hosting infrastructure, network
              connections, and browser capabilities can fail or change without
              notice.
            </p>
            <p className="mt-3">
              No guarantee is made that every feature, item, stream, or source
              will always be available.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Changes to Nodish
            </h2>
            <p className="mt-3">
              Features, sources, interface elements, and technical
              implementation may change as the project develops. These changes
              may include removing unavailable sources, correcting metadata,
              improving rights information, or changing infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              9. Acceptance
            </h2>
            <p className="mt-3">
              By using Nodish, you acknowledge that it is an independent,
              non-commercial project providing an interface to external media
              sources and that your use of those sources remains subject to
              applicable laws and the relevant source&apos;s own terms.
            </p>
          </section>

          <section className="border-t border-border/60 pt-8">
            <p>
              These terms are intended to describe how Nodish operates. They
              are not a substitute for professional legal advice.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
