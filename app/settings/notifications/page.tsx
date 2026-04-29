"use client";

import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";

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

const TABS = ["Profile", "Security", "Notifications"] as const;
type Tab = (typeof TABS)[number];

const TAB_HREFS: Record<Tab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
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
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <div>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{label}</p>
        <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ── Category card ────────────────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "var(--shadow-sm)",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "10px",
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
      category: "Bills",
      items: [
        {
          key: "billsDueReminders",
          label: "Bills Due Reminders",
          description: "Get reminded when bills are coming due",
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
    <div className="page-enter" style={{ maxWidth: "620px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>
            Settings
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-3)", marginTop: "4px" }}>
            Manage your account, security, and preferences
          </p>
        </div>
        {saved && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--success)",
              background: "var(--success-s)",
              borderRadius: "9999px",
              padding: "4px 12px",
              border: "1px solid oklch(68% 0.18 152 / 0.25)",
              marginTop: "4px",
            }}
          >
            Saved
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", marginBottom: "28px", display: "flex", gap: "4px" }}>
        {TABS.map((tab) => {
          const active = tab === "Notifications";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
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

      {/* Notification groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {groups.map(({ category, items }) => (
          <div key={category} style={cardStyle}>
            <p style={{ ...sectionLabelStyle, marginBottom: "4px" }}>{category}</p>
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

      <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "16px" }}>
        Preferences are saved locally in your browser.
      </p>
    </div>
  );
}
