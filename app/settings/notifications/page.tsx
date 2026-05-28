"use client";

import { Alert, Btn } from "@/components/editorial";
import { useEffect, useState } from "react";
import { z } from "zod";

// TODO(handoff8): wire to backend persistence via /api/notifications/preferences
// (GET to load, PUT to save). Currently persists to localStorage only.
const PREFS_KEY = "notification_prefs_v2";

type Channel = "email" | "push" | "inApp";

// Schema-validate the localStorage payload on read — a stale shape from an
// older app version (or hand-edited DevTools) silently corrupts the prefs
// otherwise. If parsing fails we fall through to DEFAULT_PREFS.
const EventPrefsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  inApp: z.boolean(),
});
const PrefsSchema = z.object({
  newExpense: EventPrefsSchema,
  settleUp: EventPrefsSchema,
  choreDue: EventPrefsSchema,
  replyToThread: EventPrefsSchema,
  mentionInComment: EventPrefsSchema,
  weeklyDigest: EventPrefsSchema,
});
type Prefs = z.infer<typeof PrefsSchema>;

const DEFAULT_PREFS: Prefs = {
  newExpense: { email: true, push: true, inApp: true },
  settleUp: { email: true, push: true, inApp: true },
  choreDue: { email: false, push: true, inApp: true },
  replyToThread: { email: false, push: true, inApp: true },
  mentionInComment: { email: true, push: true, inApp: true },
  weeklyDigest: { email: true, push: false, inApp: false },
};

interface EventLabel {
  key: keyof Prefs;
  label: string;
  hint?: string;
}

interface EventGroup {
  group: string;
  events: EventLabel[];
}

const EVENT_GROUPS: EventGroup[] = [
  {
    group: "Household & finances",
    events: [
      { key: "newExpense", label: "New expense", hint: "When a roommate logs a shared expense" },
      { key: "settleUp", label: "Settle-up", hint: "When a balance settlement is suggested" },
      {
        key: "choreDue",
        label: "Chore due today",
        hint: "Morning reminder on your assigned chores",
      },
    ],
  },
  {
    group: "Community",
    events: [
      {
        key: "replyToThread",
        label: "Reply to your thread",
        hint: "When someone replies to a thread you started",
      },
      {
        key: "mentionInComment",
        label: "Mention in a comment",
        hint: "When you're @mentioned anywhere",
      },
    ],
  },
  {
    group: "Digest",
    events: [
      {
        key: "weeklyDigest",
        label: "Weekly digest",
        hint: "Summary of household activity every Monday",
      },
    ],
  },
];

const CHANNELS: { key: Channel; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
  { key: "inApp", label: "In-App" },
];

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (!stored) return;
      const result = PrefsSchema.safeParse(JSON.parse(stored));
      if (result.success) setPrefs(result.data);
      // Silently fall through to DEFAULT_PREFS on shape mismatch — the user
      // can re-save and the new write fixes the stored shape.
    } catch {
      // localStorage / JSON.parse failure — ignore.
    }
  }, []);

  const toggle = (eventKey: keyof Prefs, channel: Channel) => {
    setPrefs((prev) => ({
      ...prev,
      [eventKey]: { ...prev[eventKey], [channel]: !prev[eventKey][channel] },
    }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      setSaved(true);
      setDirty(false);
    } catch {
      // ignore
    }
  };

  return (
    <div className="page-enter flex flex-col gap-8">
      {/* aria-live region for save confirmation */}
      <div aria-live="polite" aria-atomic="true" className={saved ? "" : "sr-only"}>
        {saved && <Alert variant="success">Preferences saved.</Alert>}
      </div>

      <div>
        <p className="text-base text-ink-2">
          Choose how you want to be notified. Push notifications require the app installed on your
          device.
        </p>
      </div>

      {/* Per-group tables */}
      {EVENT_GROUPS.map((group) => (
        <section
          key={group.group}
          aria-labelledby={`notif-group-${group.group.replace(/\W+/g, "-").toLowerCase()}`}
        >
          <h2
            id={`notif-group-${group.group.replace(/\W+/g, "-").toLowerCase()}`}
            className="ed-label-muted mb-3"
          >
            {group.group}
          </h2>

          <div
            className="border-ink bg-paper-2"
            role="table"
            aria-label={`${group.group} notification preferences`}
          >
            {/* Table header */}
            <div
              className="grid border-b border-ink"
              style={{ gridTemplateColumns: "1fr 72px 72px 80px" }}
              role="row"
            >
              <div className="px-5 py-4" role="columnheader">
                <span className="ed-label-muted">Event</span>
              </div>
              {CHANNELS.map(({ key, label }) => (
                <div key={key} className="px-2 py-4 text-center" role="columnheader">
                  <span className="ed-label-muted">{label}</span>
                </div>
              ))}
            </div>

            {/* Table rows */}
            {group.events.map(({ key, label, hint }, idx) => (
              <div
                key={key}
                className={`grid items-center${idx < group.events.length - 1 ? "border-b border-rule-soft" : ""}`}
                style={{ gridTemplateColumns: "1fr 72px 72px 80px" }}
                role="row"
              >
                <div className="px-5 py-5" role="cell">
                  <span className="text-base leading-snug text-ink">{label}</span>
                  {hint && <p className="mt-1 text-sm leading-snug text-ink-3">{hint}</p>}
                </div>
                {CHANNELS.map(({ key: ch, label: chLabel }) => (
                  <div key={ch} className="flex items-center justify-center px-2 py-5" role="cell">
                    <label
                      className="flex h-11 w-11 cursor-pointer items-center justify-center"
                      aria-label={`${label} — ${chLabel}`}
                    >
                      <input
                        type="checkbox"
                        checked={prefs[key][ch as Channel]}
                        onChange={() => toggle(key, ch as Channel)}
                        className="h-4 w-4 cursor-pointer accent-[var(--ink)]"
                      />
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-4">
        <Btn variant="primary" type="button" onClick={handleSave} disabled={!dirty}>
          Save preferences
        </Btn>
        {!dirty && !saved && <p className="text-sm text-ink-3">No unsaved changes.</p>}
      </div>
    </div>
  );
}
