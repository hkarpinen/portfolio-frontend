"use client";

import { MastheadRow } from "@/components/editorial/masthead-row";

/**
 * <SettingsMasthead> — layout-level masthead for /settings/*.
 *
 * No tabs (the settings group has 6+ sections — those live in the
 * persistent left-rail <SettingsNav> rather than as masthead tabs) and no
 * top action button.
 */
export function SettingsMasthead() {
  return <MastheadRow desk="Settings Desk" />;
}
