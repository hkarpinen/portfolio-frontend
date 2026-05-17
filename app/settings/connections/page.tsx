"use client";

import { useState } from "react";
import {
  usePlaidLink,
  usePlaidItems,
  useSyncPlaidItem,
  useUnlinkPlaidItem,
} from "@/hooks/use-connections";
import type { Connection, LinkedAccountResponse } from "@/lib/api/plaid";

const TABS = ["Profile", "Security", "Notifications", "Connections"] as const;
type Tab = (typeof TABS)[number];

const TAB_HREFS: Record<Tab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
  Connections: "/settings/connections",
};

const statusColor: Record<Connection["status"], string> = {
  Healthy: "var(--success)",
  LoginRequired: "var(--warning)",
  Revoked: "var(--danger)",
  Error: "var(--danger)",
};

const statusLabel: Record<Connection["status"], string> = {
  Healthy: "Connected",
  LoginRequired: "Login required",
  Revoked: "Revoked",
  Error: "Error",
};

function AccountRow({ account }: { account: LinkedAccountResponse }) {
  const balance =
    account.currentBalance != null
      ? `${account.currency} ${account.currentBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—";
  return (
    <div
      className="flex justify-between items-center p-[8px_0]" style={{ borderTop: "1.5px solid var(--ink)" }}
    >
      <div className="flex items-center gap-4">
        <span className="text-base text-ink-2 font-medium">
          {account.name}
          {account.mask ? ` ····${account.mask}` : ""}
        </span>
        {account.subtype && (
          <span
            className="text-sm text-ink-3 bg-paper-2 py-[2px] px-[7px]"
          >
            {account.subtype}
          </span>
        )}
      </div>
      <span
        className="text-base text-ink-3" style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {balance}
      </span>
    </div>
  );
}

function InstitutionCard({ item }: { item: Connection }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const sync = useSyncPlaidItem();
  const unlink = useUnlinkPlaidItem();

  const lastSync = item.lastSyncedAt
    ? new Date(item.lastSyncedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const isSyncing = sync.isPending && sync.variables === item.connectionId;
  const isUnlinking = unlink.isPending && unlink.variables === item.connectionId;

  return (
    <div
      className="bg-paper overflow-hidden" style={{ border: "1.5px solid var(--ink)", opacity: isUnlinking ? 0.5 : 1, transition: "opacity 200ms" }}
    >
      <div className="py-8 px-10 flex items-center gap-[14px]">
        {/* Icon */}
        <div
          className="w-[42px] h-[42px] bg-paper-2 flex items-center justify-center text-xl shrink-0"
        >
          🏦
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-md font-semibold text-ink">
              {item.institutionName}
            </span>
            <span
              className="text-sm font-semibold py-1 px-4" style={{ color: statusColor[item.status], background: `color-mix(in oklch, ${statusColor[item.status]} 15%, transparent)` }}
            >
              {statusLabel[item.status]}
            </span>
          </div>
          <p className="text-base text-ink-3" style={{ margin: "3px 0 0" }}>
            {item.accounts.length} account{item.accounts.length !== 1 ? "s" : ""}
            {lastSync ? ` · Synced ${lastSync}` : " · Never synced"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => sync.mutate(item.connectionId)}
            disabled={isSyncing || isUnlinking}
            className="bg-paper-2 py-3 px-6 text-base font-medium whitespace-nowrap" style={{ border: "1.5px solid var(--ink)", color: isSyncing ? "var(--text-3)" : "var(--text-2)", cursor: isSyncing ? "default" : "pointer" }}
          >
            {isSyncing ? "Syncing…" : "↻ Sync"}
          </button>

          {confirming ? (
            <>
              <button
                onClick={() => setConfirming(false)}
                className="bg-transparent py-3 px-5 text-base text-ink-3 cursor-pointer" style={{ border: "1.5px solid var(--ink)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  unlink.mutate(item.connectionId);
                  setConfirming(false);
                }}
                className="bg-red py-3 px-6 text-base font-semibold text-white cursor-pointer whitespace-nowrap" style={{ border: "none" }}
              >
                Confirm remove
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={isUnlinking}
              className="bg-transparent py-3 px-5 text-base text-red cursor-pointer" style={{ border: "1.5px solid var(--red)" }}
            >
              Remove
            </button>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="bg-transparent py-3 px-2 cursor-pointer text-ink-3 text-md leading-none" style={{ border: "none", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
            aria-label={expanded ? "Collapse accounts" : "Expand accounts"}
          >
            ▾
          </button>
        </div>
      </div>

      {expanded && item.accounts.length > 0 && (
        <div className="p-[0_20px_16px]">
          {item.accounts.map((a) => (
            <AccountRow key={a.accountId} account={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onConnect, loading }: { onConnect: () => void; loading: boolean }) {
  return (
    <div
      className="text-center py-[52px] px-[24px] bg-paper-2" style={{ border: "1px dashed var(--ink-3)" }}
    >
      <div className="flex justify-center mb-10">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
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
            <InstitutionCard key={item.connectionId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
