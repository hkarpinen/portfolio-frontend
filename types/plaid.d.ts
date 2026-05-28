/**
 * Ambient module typing for the Plaid Link CDN script. The runtime injects
 * `window.Plaid` after `link-initialize.js` loads, but the official
 * react-plaid-link package isn't a dependency here — we lazy-load the
 * vanilla CDN build via a `<script>` tag (see hooks/use-connections.ts).
 *
 * This declaration replaces the previous `(window as any).Plaid` cast plus
 * two `eslint-disable @typescript-eslint/no-explicit-any` lines (audit
 * §1.3). Keep the shape minimal — extend only when the consumer needs
 * additional Plaid Link options.
 */

declare global {
  interface PlaidLinkHandler {
    open(): void;
    exit(): void;
    destroy(): void;
  }

  interface PlaidLinkConfig {
    token: string;
    onSuccess: (
      publicToken: string,
      metadata: { institution?: { institution_id: string; name: string } | null },
    ) => void;
    onExit?: (err: unknown, metadata: unknown) => void;
  }

  interface PlaidLinkGlobal {
    create(config: PlaidLinkConfig): PlaidLinkHandler;
  }

  interface Window {
    Plaid?: PlaidLinkGlobal;
  }
}

// `export {}` makes this a module file so the `declare global` block takes
// effect (without it, the file becomes a script and the global Window
// augmentation is ignored).
export {};
