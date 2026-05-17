"use client";

import { useEffect, useState } from "react";
import { Toggle } from "@/components/editorial";

const PREFS_KEY = "notification_prefs";

interface Prefs {
  emailNotifications: boolean;
  browserNotifications: boolean;
  billsDueReminders: boolean;
  newMemberAlerts: boolean;
}

const DEFAULT_PREFS: Prefs = {
  emailNotifications: true,
  browserNotifications: false,
  billsDueReminders: true,
  newMemberAlerts: true,
};

const TABS = ["Profile", "Security", "Notifications", "Connections"] as const;
type Tab = (typeof TABS)[number];

const TAB_HREFS: Record<Tab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
  Connections: "/settings/connections",
};

/* ── Notification row ─────────────────────────────────────────────────────── */

function NotifRow({
  label,
  description,
  checked,
  onChange,
  last,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between p-[12px_0]" style={{ borderBottom: last ? "none" : "1.5px solid var(--ink)" }}
    >
      <div>
        <p className="text-md font-medium text-ink">{label}</p>
        <p className="text-base text-ink-3 mt-1">{description}</p>
      </div>
      <Toggle checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ── Category card ────────────────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  padding: "20px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "var(--ts-meta)",
  fontWeight: 700,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const updatePref = (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  const groups: {
    category: string;
    items: { key: keyof Prefs; label: string; description: string }[];
  }[] = [
    {
      category: "Expenses",
      items: [
        {
          key: "billsDueReminders",
          label: "Expense Due Reminders",
          description: "Get reminded when expenses are coming due",
        },
      ],
    },
    {
      category: "Forum",
      items: [
        {
          key: "newMemberAlerts",
          label: "New Member Alerts",
          description: "Notify when someone joins your household",
        },
      ],
    },
    {
      category: "Account",
      items: [
        {
          key: "browserNotifications",
          label: "Browser Notifications",
          description: "Show desktop push notifications",
        },
      ],
    },
    {
      category: "Email",
      items: [
        {
          key: "emailNotifications",
          label: "Email Notifications",
          description: "Receive important updates via email",
        },
      ],
    },
  ];

  return (
    <div className="page-enter max-w-[620px] mx-auto py-16 px-12" >
      {/* Header */}
      <div className="mb-[28px] flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl leading-none tracking-snug font-bold text-ink">
            Settings
          </h1>
          <p className="text-base text-ink-3 mt-2">
            Manage your account, security, and preferences
          </p>
        </div>
        {saved && (
          <span
            className="text-base font-semibold text-green bg-[rgba(61,107,43,0.10)] py-2 px-6 mt-2" style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}
          >
            Saved
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-[28px] flex gap-2" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {TABS.map((tab) => {
          const active = tab === "Notifications";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              className="py-5 px-8 text-md mb-[-1px] no-underline" style={{ fontWeight: active ? 600 : 400, color: active ? "var(--red)" : "var(--ink-3)", borderBottom: active ? "3px solid var(--red)" : "2px solid transparent", transition: "color 150ms" }}
            >
              {tab}
            </a>
          );
        })}
      </div>

      {/* Notification groups */}
      <div className="flex flex-col gap-8">
        {groups.map(({ category, items }) => (
          <div key={category} style={cardStyle}>
            <p className="mb-2" style={{ ...sectionLabelStyle }}>{category}</p>
            {items.map((item, idx) => (
              <NotifRow
                key={item.key}
                label={item.label}
                description={item.description}
                checked={prefs[item.key]}
                onChange={(v) => updatePref(item.key, v)}
                last={idx === items.length - 1}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="text-sm text-ink-3 mt-8">
        Preferences are saved locally in your browser.
      </p>
    </div>
  );
}
