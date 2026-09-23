import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — NO-DISH",
  description: "Privacy information for NO-DISH — Media without the dish.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: September 20, 2026
          </p>
        </header>

        <div className="mt-10 space-y-10 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. About NO-DISH
            </h2>
            <p className="mt-3">
              NO-DISH, Media without the dish., is a free,
              non-commercial media discovery and viewing interface created and
              developed by Tejas Gafat.
            </p>
            <p className="mt-3">
              NO-DISH does not operate paid subscriptions or advertising and
              does not intentionally sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Information stored in your browser
            </h2>
            <p className="mt-3">
              NO-DISH uses browser storage for application functionality and
              preferences. Depending on the features you use, this may include
              your selected theme, accent, onboarding preferences, reading or
              viewing progress, and library-related state.
            </p>
            <p className="mt-3">
              This information is stored locally in your browser rather than
              being used as a NO-DISH account profile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Accounts and personal information
            </h2>
            <p className="mt-3">
              NO-DISH currently does not require an account, password, payment
              information, or personal profile to use its core features.
            </p>
            <p className="mt-3">
              Please do not enter sensitive personal information into fields or
              services that are not specifically designed to receive it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Hosting and server requests
            </h2>
            <p className="mt-3">
              NO-DISH is hosted using third-party infrastructure. Requests to
              the application may therefore be processed by the hosting
              provider and may appear in infrastructure or security logs
              according to that provider&apos;s policies.
            </p>
            <p className="mt-3">
              NO-DISH does not operate its own user analytics database or
              intentionally build advertising profiles from visitors.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Third-party content services
            </h2>
            <p className="mt-3">
              NO-DISH connects with external services to retrieve or display
              media information and content. These currently include Internet
              Archive, Project Gutenberg, Gutendex, and publicly listed IPTV
              stream sources indexed by iptv-org.
            </p>
            <p className="mt-3">
              When your browser or the NO-DISH application requests resources
              from an external service, that service may receive technical
              request information according to its own privacy policy and
              infrastructure practices. NO-DISH does not control the privacy
              practices of independent third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Cookies and tracking
            </h2>
            <p className="mt-3">
              NO-DISH does not intentionally use advertising cookies or
              cross-site tracking technologies as part of its core application.
            </p>
            <p className="mt-3">
              Browser storage used for application preferences and functionality
              should not be interpreted as an advertising or behavioral
              tracking system.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. External websites and services
            </h2>
            <p className="mt-3">
              NO-DISH may link to, embed, or retrieve information from external
              websites and services. Once you leave NO-DISH or interact directly
              with an external provider, that provider&apos;s own terms and
              privacy practices apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Changes to this policy
            </h2>
            <p className="mt-3">
              This policy may be updated when NO-DISH&apos;s architecture,
              features, hosting arrangements, or third-party integrations
              change. The date at the top of this page indicates the latest
              revision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              9. Contact and rights concerns
            </h2>
            <p className="mt-3">
              If you have a privacy question or a concern about content
              presented through NO-DISH, please use the project&apos;s official
              repository or project contact channel to raise the issue.
            </p>
          </section>

          <section className="border-t border-border/60 pt-8">
            <p>
              NO-DISH is a free, non-commercial project. Its goal is to provide
              a respectful interface for discovering and experiencing
              legitimately accessible media while keeping user data collection
              to a minimum.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
