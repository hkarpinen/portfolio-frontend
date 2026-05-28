"use client";

import { usePlaidLink, usePlaidItems } from "@/hooks/use-connections";
import { Icon } from "@/components/editorial/icon";
import { Btn } from "@/components/editorial";
import type { Connection } from "@/lib/api/plaid";
import { ConnectionCard } from "./connection-card";

// TODO(handoff8): wire OAuth connection state to /api/identity/me or /api/identity/connections
// once the backend exposes GitHub/Google OAuth connection status and connect/disconnect endpoints.
// For now we render the section with static disconnected state.

interface OAuthService {
  id: "github" | "google";
  label: string;
  description: string;
  connected: boolean;
  handle: string | null;
}

const OAUTH_SERVICES: OAuthService[] = [
  {
    id: "github",
    label: "GitHub",
    description: "Sign in with your GitHub account. Scopes requested: read:user.",
    connected: false, // TODO(handoff8): load from /api/identity/connections
    handle: null,
  },
  {
    id: "google",
    label: "Google",
    description: "Sign in with your Google account.",
    connected: false, // TODO(handoff8): load from /api/identity/connections
    handle: null,
  },
];

function OAuthServiceCard({ service }: { service: OAuthService }) {
  return (
    <div className="flex items-center gap-6 border-ink bg-paper p-[16px_20px]">
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">
          {service.label}
          {service.connected && service.handle && (
            <span className="ml-2 text-sm font-normal text-ink-3">· {service.handle}</span>
          )}
        </p>
        <p className="mt-[3px] text-sm text-ink-3">
          {service.connected
            ? `Connected · ${service.description}`
            : `Not connected · ${service.description}`}
        </p>
      </div>
      {service.connected ? (
        <Btn
          variant="danger"
          size="sm"
          type="button"
          onClick={() => {
            /* TODO(handoff8): wire to disconnect endpoint */
          }}
          aria-label={`Disconnect ${service.label}`}
          className="shrink-0 whitespace-nowrap"
        >
          Disconnect
        </Btn>
      ) : (
        <Btn
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => {
            /* TODO(handoff8): wire to OAuth connect flow */
          }}
          aria-label={`Connect ${service.label}`}
          className="shrink-0 whitespace-nowrap"
        >
          Connect
        </Btn>
      )}
    </div>
  );
}

function EmptyState({ onConnect, loading }: { onConnect: () => void; loading: boolean }) {
  return (
    <div className="border border-dashed border-ink-3 bg-paper-2 px-[24px] py-[52px] text-center">
      <div className="mb-10 flex justify-center">
        <span className="text-ink">
          <Icon name="home" size={48} strokeWidth={1.5} />
        </span>
      </div>
      <p className="mb-4 font-serif text-md font-semibold text-ink">No bank accounts connected</p>
      <p className="mx-auto mb-6 max-w-[300px] text-base leading-[1.5] text-ink-3">
        Connect a bank to automatically track income and expenses from your transaction history.
      </p>
      <Btn variant="secondary" size="lg" onClick={onConnect} disabled={loading} loading={loading}>
        {loading ? "Opening…" : "Connect a bank account"}
      </Btn>
    </div>
  );
}

export default function ConnectionsPage() {
  const linkBank = usePlaidLink();
  const itemsQuery = usePlaidItems();
  const items = itemsQuery.data ?? [];
  const isLoading = itemsQuery.isLoading;

  return (
    <div className="flex flex-col gap-10">
      {/* ── OAuth connected accounts ─────────────────────────────────────── */}
      <section aria-labelledby="oauth-section-heading">
        <h2 id="oauth-section-heading" className="mb-2 text-md font-semibold text-ink">
          Connected accounts
        </h2>
        <p className="mb-6 text-base text-ink-2">
          Link social accounts to sign in without a password. Disconnecting removes single sign-on
          access but does not delete your account.
        </p>
        <div className="flex flex-col gap-4">
          {OAUTH_SERVICES.map((svc) => (
            <OAuthServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      </section>

      {/* ── Bank connections ─────────────────────────────────────────────── */}
      <section aria-labelledby="bank-section-heading">
        <div className="mb-6 flex items-start justify-between gap-8">
          <div>
            <h2 id="bank-section-heading" className="mb-2 text-md font-semibold text-ink">
              Bank connections
            </h2>
            <p className="text-base text-ink-2">
              Linked accounts sync incrementally to track income and expenses automatically.
            </p>
          </div>
          {!isLoading && items.length > 0 && (
            <Btn
              variant="primary"
              size="sm"
              onClick={linkBank.launch}
              disabled={linkBank.isLaunching || linkBank.isExchanging}
              loading={linkBank.isExchanging || linkBank.isLaunching}
              className="shrink-0 whitespace-nowrap"
            >
              {linkBank.isExchanging
                ? "Connecting…"
                : linkBank.isLaunching
                  ? "Opening…"
                  : "+ Add account"}
            </Btn>
          )}
        </div>

        {linkBank.exchangeError && (
          <p
            className="mb-8 px-[14px] py-[10px] text-base text-red"
            style={{ background: "color-mix(in oklch, var(--danger) 10%, transparent)" }}
          >
            Could not link account — please try again.
          </p>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-paper-2 opacity-[0.6]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            onConnect={linkBank.launch}
            loading={linkBank.isLaunching || linkBank.isExchanging}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {items.map((item: Connection) => (
              <ConnectionCard key={item.connectionId} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
