"use client";

import { Btn, ConfirmDeleteDialog, Icon } from "@/components/editorial";
import { useState } from "react";
import { useSyncPlaidItem, useUnlinkPlaidItem } from "@/hooks/use-connections";

import type { Connection, LinkedAccountResponse } from "@/lib/api/plaid";
import { formatCurrency } from "@/lib/formatting";

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
    account.currentBalance != null ? formatCurrency(account.currentBalance, account.currency) : "—";
  return (
    <div className="flex items-center justify-between border-t border-ink p-[8px_0]">
      <div className="flex items-center gap-4">
        <span className="text-base font-medium text-ink-2">
          {account.name}
          {account.mask ? ` ····${account.mask}` : ""}
        </span>
        {account.subtype && (
          <span className="bg-paper-2 px-[7px] py-[2px] text-sm text-ink-3">{account.subtype}</span>
        )}
      </div>
      <span className="text-base tabular-nums text-ink-3">{balance}</span>
    </div>
  );
}

export function ConnectionCard({ item }: { item: Connection }) {
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
      className={`overflow-hidden border-ink bg-paper transition-opacity duration-200${isUnlinking ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex items-center gap-[14px] px-10 py-8">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-paper-2">
          <Icon name="bank" size={20} strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-md font-semibold text-ink">{item.institutionName}</span>
            <span
              className="px-4 py-1 text-sm font-semibold"
              style={{
                color: statusColor[item.status],
                background: `color-mix(in oklch, ${statusColor[item.status]} 15%, transparent)`,
              }} /* dynamic per-status color */
            >
              {statusLabel[item.status]}
            </span>
          </div>
          <p className="mt-[3px] text-base text-ink-3">
            {item.accounts.length} account{item.accounts.length !== 1 ? "s" : ""}
            {lastSync ? ` · Synced ${lastSync}` : " · Never synced"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => sync.mutate(item.connectionId)}
            disabled={isSyncing || isUnlinking}
            loading={isSyncing}
            className="whitespace-nowrap"
          >
            {isSyncing ? "Syncing…" : "↻ Sync"}
          </Btn>

          <Btn
            variant="danger"
            size="sm"
            onClick={() => setConfirming(true)}
            disabled={isUnlinking}
          >
            Remove
          </Btn>
          <ConfirmDeleteDialog
            open={confirming}
            onOpenChange={setConfirming}
            title={`Disconnect ${item.institutionName}?`}
            body="We'll stop syncing transactions from this institution. You can reconnect later; historical data already imported stays in place."
            confirmLabel="Disconnect"
            isPending={isUnlinking}
            onConfirm={() => {
              unlink.mutate(item.connectionId);
              setConfirming(false);
            }}
          />

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`cursor-pointer border-none bg-transparent px-2 py-3 text-md leading-none text-ink-3 transition-transform duration-200${expanded ? "rotate-180" : ""}`}
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
