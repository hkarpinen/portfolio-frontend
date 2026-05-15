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
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-2)", fontWeight: 500 }}>
          {account.name}
          {account.mask ? ` ····${account.mask}` : ""}
        </span>
        {account.subtype && (
          <span
            style={{
              fontSize: "var(--ts-meta)",
              color: "var(--text-3)",
              background: "var(--surface-2)",
              padding: "2px 7px",
              borderRadius: "6px",
            }}
          >
            {account.subtype}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: "var(--ts-label)",
          color: "var(--text-3)",
          fontVariantNumeric: "tabular-nums",
        }}
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
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        overflow: "hidden",
        opacity: isUnlinking ? 0.5 : 1,
        transition: "opacity 200ms",
      }}
    >
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Icon */}
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--ts-sub)",
            flexShrink: 0,
          }}
        >
          🏦
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--ts-body)", fontWeight: 600, color: "var(--text)" }}>
              {item.institutionName}
            </span>
            <span
              style={{
                fontSize: "var(--ts-meta)",
                fontWeight: 600,
                color: statusColor[item.status],
                background: `color-mix(in oklch, ${statusColor[item.status]} 15%, transparent)`,
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              {statusLabel[item.status]}
            </span>
          </div>
          <p style={{ fontSize: "var(--ts-label)", color: "var(--text-3)", margin: "3px 0 0" }}>
            {item.accounts.length} account{item.accounts.length !== 1 ? "s" : ""}
            {lastSync ? ` · Synced ${lastSync}` : " · Never synced"}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={() => sync.mutate(item.connectionId)}
            disabled={isSyncing || isUnlinking}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "var(--ts-label)",
              fontWeight: 500,
              color: isSyncing ? "var(--text-3)" : "var(--text-2)",
              cursor: isSyncing ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isSyncing ? "Syncing…" : "↻ Sync"}
          </button>

          {confirming ? (
            <>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  fontSize: "var(--ts-label)",
                  color: "var(--text-3)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  unlink.mutate(item.connectionId);
                  setConfirming(false);
                }}
                style={{
                  background: "var(--danger)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "6px 12px",
                  fontSize: "var(--ts-label)",
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Confirm remove
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={isUnlinking}
              style={{
                background: "transparent",
                border: "1px solid color-mix(in oklch, var(--danger) 40%, var(--border))",
                borderRadius: "10px",
                padding: "6px 10px",
                fontSize: "var(--ts-label)",
                color: "var(--danger)",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              padding: "6px 4px",
              cursor: "pointer",
              color: "var(--text-3)",
              fontSize: "var(--ts-body)",
              lineHeight: 1,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms",
            }}
            aria-label={expanded ? "Collapse accounts" : "Expand accounts"}
          >
            ▾
          </button>
        </div>
      </div>

      {expanded && item.accounts.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
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
      style={{
        textAlign: "center",
        padding: "52px 24px",
        background: "var(--paper-2)",
        border: "1px dashed var(--ink-3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <p style={{ fontSize: "var(--ts-body)", fontWeight: 600, color: "var(--ink)", marginBottom: "8px", fontFamily: "var(--ff-serif)" }}>
        No bank accounts connected
      </p>
      <p
        style={{
          fontSize: "var(--ts-body-sm)",
          color: "var(--ink-3)",
          marginBottom: "24px",
          maxWidth: "300px",
          margin: "0 auto 24px",
          lineHeight: 1.5,
        }}
      >
        Connect a bank to automatically track income and expenses from your transaction history.
      </p>
      <button
        onClick={onConnect}
        disabled={loading}
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          border: "none",
          borderRadius: 0,
          padding: "10px 24px",
          fontSize: "var(--ts-body)",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
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
    <div className="page-enter" style={{ maxWidth: "620px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontFamily: "var(--ff-display)",
            fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", marginTop: "4px" }}>
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          marginBottom: "28px",
          display: "flex",
          gap: "4px",
        }}
      >
        {TABS.map((tab) => {
          const active = tab === "Connections";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              style={{
                padding: "10px 16px",
                fontSize: "var(--ts-body)",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text)" : "var(--text-3)",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: "-1px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              {tab}
            </a>
          );
        })}
      </div>

      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--ts-body)", fontWeight: 600, color: "var(--text)", margin: 0 }}>
            Bank connections
          </h2>
          <p style={{ fontSize: "var(--ts-body-sm)", color: "var(--text-3)", marginTop: "4px" }}>
            Linked accounts sync incrementally to track income and expenses automatically.
          </p>
        </div>
        {!isLoading && items.length > 0 && (
          <button
            onClick={linkBank.launch}
            disabled={linkBank.isLaunching || linkBank.isExchanging}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "8px 16px",
              fontSize: "var(--ts-body-sm)",
              fontWeight: 600,
              cursor:
                linkBank.isLaunching || linkBank.isExchanging ? "default" : "pointer",
              opacity: linkBank.isLaunching || linkBank.isExchanging ? 0.6 : 1,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
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
          style={{
            fontSize: "var(--ts-body-sm)",
            color: "var(--danger)",
            marginBottom: "16px",
            padding: "10px 14px",
            background: "color-mix(in oklch, var(--danger) 10%, transparent)",
            borderRadius: "10px",
          }}
        >
          Could not link account — please try again.
        </p>
      )}

      {/* Skeleton */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: "80px",
                borderRadius: "16px",
                background: "var(--surface-2)",
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          onConnect={linkBank.launch}
          loading={linkBank.isLaunching || linkBank.isExchanging}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item: Connection) => (
            <InstitutionCard key={item.connectionId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
