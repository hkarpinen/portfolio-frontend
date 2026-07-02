import { NotificationsProvider } from "@/components/layout/notifications-provider";
import { LandingPublicNav } from "./_landing/landing-public-nav";
import { LandingHero } from "./_landing/landing-hero";
import { LandingArchitectureSection } from "./_landing/landing-architecture-section";
import { LandingModulesSection } from "./_landing/landing-modules-section";
import { LandingAboutSection } from "./_landing/landing-about-section";
import { LandingHiringBanner } from "./_landing/landing-hiring-banner";
import { LandingFooter } from "./_landing/landing-footer";

/**
 * <LandingPage> — public landing.
 *
 * Composition over implementation. Each region lives in its own file in
 * `app/_landing/`. The notifications popover in the nav is the only piece
 * that depends on NotificationsProvider, so the provider wraps the whole
 * tree (it's cheap when there's no signed-in user and the dropdown stays
 * unmounted).
 *
 * Visual rules in /app/globals.css under `.public-nav` / `.hero` /
 * `.hero-visual` / `.term-line` / `.public-section` / `.claims` /
 * `.module-grid` / `.skills-grid` / `.banner` / `.public-footer`.
 */
type LandingPageProps = {
  displayName?: string | null;
  avatarUrl?: string | null;
};

export function LandingPage({ displayName = null, avatarUrl = null }: LandingPageProps) {
  const signedIn = displayName !== null;

  return (
    <NotificationsProvider>
      <div className="public-shell">
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <LandingPublicNav signedIn={signedIn} displayName={displayName} avatarUrl={avatarUrl} />

        <main id="main" tabIndex={-1} className="public-main">
          <LandingHero />
          {/* Architecture leads as the thesis; modules are the proof
              points; bio is who built it; banner is the call to action. */}
          <LandingArchitectureSection />
          <LandingModulesSection />
          <LandingAboutSection />
          <LandingHiringBanner />
        </main>

        <LandingFooter />
      </div>
    </NotificationsProvider>
  );
}
