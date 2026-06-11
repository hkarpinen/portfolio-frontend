import { ImageResponse } from "next/og";

/**
 * Default OpenGraph + Twitter card image (1200×630).
 *
 * Auto-served at /opengraph-image at runtime by Next.js when any
 * metadata config references it (the root layout's openGraph.images
 * does — that's why this file exists).
 *
 * Editorial style: paper background, serif headline, mono kickers,
 * red accent. Uses system fonts (ui-serif / ui-monospace) so we don't
 * need to fetch Google Fonts inside the Edge runtime — keeps the
 * response fast and reliable.
 *
 * Pages that want a different OG image can either:
 *   - Add their own `app/<route>/opengraph-image.{tsx,png,jpg}` file, OR
 *   - Override `openGraph.images` in their page metadata.
 */
export const runtime = "edge";
export const alt = "Hank Karpinen — Full-stack engineer · The Stack & Gazette";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f1eadb";
const INK = "#15120a";
const INK_2 = "#3a3424";
const RED = "#b22a1a";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: PAPER,
        display: "flex",
        flexDirection: "column",
        padding: "56px 72px",
        fontFamily: "ui-serif, Georgia, serif",
        color: INK,
      }}
    >
      {/* Top rule: brand on left, "open to roles" pulse on right */}
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${INK}`,
          paddingBottom: 18,
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 18,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
        }}
      >
        <span>The Stack &amp; Gazette</span>
        <span style={{ display: "flex", alignItems: "center", color: RED }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: RED,
              marginRight: 8,
            }}
          />
          Open to senior &amp; staff roles
        </span>
      </div>

      {/* Main editorial block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 22,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: RED,
            marginBottom: 24,
          }}
        >
          Feature · Hank Karpinen
        </div>
        <div
          style={{
            fontSize: 104,
            fontStyle: "italic",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            marginBottom: 28,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Built like&nbsp;
          <span style={{ color: RED, fontStyle: "italic" }}>production</span>, not a tutorial.
        </div>
        <div
          style={{
            fontSize: 30,
            color: INK_2,
            maxWidth: 1000,
            lineHeight: 1.3,
          }}
        >
          Six .NET 8 microservices on a RabbitMQ spine. Hand-rolled auth. DDD × IDesign. Live demo,
          no signup.
        </div>
      </div>

      {/* Bottom rule */}
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `2px solid ${INK}`,
          paddingTop: 18,
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 18,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: INK_2,
        }}
      >
        <span>hankkarpinen.com</span>
        <span>Full-stack engineer · Pullman, WA</span>
      </div>
    </div>,
    { ...size },
  );
}
