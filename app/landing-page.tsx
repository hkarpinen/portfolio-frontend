import { Ticker } from "@/components/landing/ticker";
import { Masthead } from "@/components/landing/masthead";
import { EditionNav } from "@/components/landing/edition-nav";
import { Lede } from "@/components/landing/lede";
import { LedgerStrip } from "@/components/landing/ledger-strip";
import { Dispatches } from "@/components/landing/dispatches";
import { Modules } from "@/components/landing/modules";
import { StackSpecimen } from "@/components/landing/stack-specimen";
import { Wanted } from "@/components/landing/wanted";
import { Colophon } from "@/components/landing/colophon";
import { Endmark } from "@/components/landing/endmark";

export async function LandingPage() {
  return (
    <div style={{
      minHeight: "100%",
      background: "var(--paper)",
      overflowX: "hidden",
      overflowY: "auto",
    }}>
      <Ticker />
      <Masthead />
      <EditionNav />
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 5%" }} className="landing-col">
        <Lede />
        <LedgerStrip />
        <Dispatches />
        <Modules />
        <StackSpecimen />
        <Wanted />
        <Colophon />
        <Endmark />
      </div>
    </div>
  );
}
