"use client";

import { usePlaidLink, usePlaidItems } from "@/hooks/use-connections";
import { Icon } from "@/components/editorial/icon";
import type { Connection } from "@/lib/api/plaid";
import { ConnectionCard } from "./connection-card";

const TABS = ["Profile", "Security", "Notifications", "Connections"] as const;
type Tab = (typeof TABS)[number];

const TAB_HREFS: Record<Tab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
  Connections: "/settings/connections",
};

function EmptyState({ onConnect, loading }: { onConnect: () => void; loading: boolean }) {
  return (
    <div
      className="text-center py-[52px] px-[24px] bg-paper-2" style={{ border: "1px dashed var(--ink-3)" }}
    >
      <div className="flex justify-center mb-10">
        <span style={{ color: "var(--ink)" }}><Icon name="home" size={48} strokeWidth={1.5} /></span>
      </div>
      <p className="text-md font-semibold text-ink mb-4 font-serif">
        No bank accounts connected
      </p>
      <p
        className="text-base text-ink-3 mb-12 max-w-[300px] leading-[1.5]" style={{ margin: "0 auto 24px" }}
      >
        Connect a bank to automatically track income and expenses from your transaction history.
      </p>
      <button
        onClick={onConnect}
        disabled={loading}
        className="bg-ink text-paper py-5 px-12 text-md font-semibold tracking-[0.05em] uppercase" style={{ border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Opening…" : "Connect a bank account"}
      </button>
    </div>
  );
}

export default function ConnectionsPage() {
  const linkBank = usePlaidLink();
  const itemsQuery = usePlaidItems();
  const items = itemsQuery.data ?? [];
  const isLoading = itemsQuery.isLoading;

  return (
    <div className="page-enter max-w-[620px] mx-auto py-16 px-12" >
      {/* Page header */}
      <div className="mb-[28px]">
        <h1
          className="font-serif text-4xl leading-none tracking-snug font-bold text-ink"
        >
          Settings
        </h1>
        <p className="text-base text-ink-3 mt-2">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div
        className="mb-[28px] flex gap-2" style={{ borderBottom: "1.5px solid var(--ink)" }}
      >
        {TABS.map((tab) => {
          const active = tab === "Connections";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              className="py-5 px-8 text-md mb-[-1px] no-underline" style={{ fontWeight: active ? 600 : 400, color: active ? "var(--text)" : "var(--text-3)", borderBottom: active ? "3px solid var(--red)" : "2px solid transparent", transition: "color 150ms" }}
            >
              {tab}
            </a>
          );
        })}
      </div>

      {/* Section header */}
      <div
        className="flex items-start justify-between gap-8 mb-10"
      >
        <div>
          <h2 className="text-md font-semibold text-ink m-0">
            Bank connections
          </h2>
          <p className="text-base text-ink-3 mt-2">
            Linked accounts sync incrementally to track income and expenses automatically.
          </p>
        </div>
        {!isLoading && items.length > 0 && (
          <button
            onClick={linkBank.launch}
            disabled={linkBank.isLaunching || linkBank.isExchanging}
            className="bg-red text-white py-4 px-8 text-base font-semibold shrink-0 whitespace-nowrap" style={{ border: "none", cursor:
                linkBank.isLaunching || linkBank.isExchanging ? "default" : "pointer", opacity: linkBank.isLaunching || linkBank.isExchanging ? 0.6 : 1 }}
          >
            {linkBank.isExchanging
              ? "Connecting…"
              : linkBank.isLaunching
              ? "Opening…"
              : "+ Add account"}
          </button>
        )}
      </div>

      {linkBank.exchangeError && (
        <p
          className="text-base text-red mb-8 py-[10px] px-[14px]" style={{ background: "color-mix(in oklch, var(--danger) 10%, transparent)" }}
        >
          Could not link account — please try again.
        </p>
      )}

      {/* Skeleton */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 bg-paper-2 opacity-[0.6]"
            />
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
    </div>
  );
}
