"use client";

import { useEffect, useState } from "react";
import { Btn, Alert } from "@/components/editorial";

// TODO(handoff8): wire to backend persistence via /api/notifications/preferences
// (GET to load, PUT to save). Currently persists to localStorage only.
const PREFS_KEY = "notification_prefs_v2";

type Channel = "email" | "push" | "inApp";

interface EventPrefs {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface Prefs {
  newExpense: EventPrefs;
  settleUp: EventPrefs;
  choreDue: EventPrefs;
  replyToThread: EventPrefs;
  mentionInComment: EventPrefs;
  weeklyDigest: EventPrefs;
}

const DEFAULT_PREFS: Prefs = {
  newExpense:       { email: true,  push: true,  inApp: true  },
  settleUp:         { email: true,  push: true,  inApp: true  },
  choreDue:         { email: false, push: true,  inApp: true  },
  replyToThread:    { email: false, push: true,  inApp: true  },
  mentionInComment: { email: true,  push: true,  inApp: true  },
  weeklyDigest:     { email: true,  push: false, inApp: false },
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
      { key: "newExpense", label: "New expense",     hint: "When a roommate logs a shared expense" },
      { key: "settleUp",   label: "Settle-up",       hint: "When a balance settlement is suggested" },
      { key: "choreDue",   label: "Chore due today", hint: "Morning reminder on your assigned chores" },
    ],
  },
  {
    group: "Community",
    events: [
      { key: "replyToThread",    label: "Reply to your thread",  hint: "When someone replies to a thread you started" },
      { key: "mentionInComment", label: "Mention in a comment",  hint: "When you're @mentioned anywhere" },
    ],
  },
  {
    group: "Digest",
    events: [
      { key: "weeklyDigest", label: "Weekly digest", hint: "Summary of household activity every Monday" },
    ],
  },
];

const CHANNELS: { key: Channel; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "push",  label: "Push"  },
  { key: "inApp", label: "In-App" },
];

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored) as Prefs);
    } catch {
      // ignore
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
          Choose how you want to be notified. Push notifications require the app installed on your device.
        </p>
      </div>

      {/* Per-group tables */}
      {EVENT_GROUPS.map((group) => (
        <section key={group.group} aria-labelledby={`notif-group-${group.group.replace(/\W+/g, "-").toLowerCase()}`}>
          <h2
            id={`notif-group-${group.group.replace(/\W+/g, "-").toLowerCase()}`}
            className="ed-label-muted mb-3"
          >
            {group.group}
          </h2>

          <div className="border-ink bg-paper-2" role="table" aria-label={`${group.group} notification preferences`}>
            {/* Table header */}
            <div
              className="grid border-b border-ink"
              style={{ gridTemplateColumns: "1fr 72px 72px 80px" }}
              role="row"
            >
              <div className="py-4 px-5" role="columnheader">
                <span className="ed-label-muted">Event</span>
              </div>
              {CHANNELS.map(({ key, label }) => (
                <div key={key} className="py-4 px-2 text-center" role="columnheader">
                  <span className="ed-label-muted">{label}</span>
                </div>
              ))}
            </div>

            {/* Table rows */}
            {group.events.map(({ key, label, hint }, idx) => (
              <div
                key={key}
                className={`grid items-center${idx < group.events.length - 1 ? " border-b border-[var(--rule-soft)]" : ""}`}
                style={{ gridTemplateColumns: "1fr 72px 72px 80px" }}
                role="row"
              >
                <div className="py-5 px-5" role="cell">
                  <span className="text-base text-ink leading-snug">{label}</span>
                  {hint && <p className="text-sm text-ink-3 mt-[2px] leading-snug">{hint}</p>}
                </div>
                {CHANNELS.map(({ key: ch, label: chLabel }) => (
                  <div key={ch} className="py-5 px-2 flex items-center justify-center" role="cell">
                    <label
                      className="flex items-center justify-center w-11 h-11 cursor-pointer"
                      aria-label={`${label} — ${chLabel}`}
                    >
                      <input
                        type="checkbox"
                        checked={prefs[key][ch as Channel]}
                        onChange={() => toggle(key, ch as Channel)}
                        className="w-4 h-4 accent-[var(--ink)] cursor-pointer"
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
        <Btn
          variant="primary"
          type="button"
          onClick={handleSave}
          disabled={!dirty}
        >
          Save preferences
        </Btn>
        {!dirty && !saved && (
          <p className="text-sm text-ink-3">No unsaved changes.</p>
        )}
      </div>
    </div>
  );
}
