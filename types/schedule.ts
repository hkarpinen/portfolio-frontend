import { z } from "zod";

/**
 * Schedule / recurrence types — mirrors finance/src/Domain/ValueObjects/RecurrenceFrequency.cs.
 *
 * Wire values are the PascalCase enum names exactly as the backend serializes
 * them (e.g. "BiWeekly", not "Bi-Weekly"). Hyphenation is for display labels
 * only, via FREQUENCY_LABELS.
 *
 * OneTime is included so non-recurring expenses can be a first-class value
 * instead of `null`. Backend mirror is pending — see TODO sites in the
 * expense form / API client.
 */

export enum Frequency {
  OneTime = "OneTime",
  Daily = "Daily",
  Weekly = "Weekly",
  BiWeekly = "BiWeekly",
  Monthly = "Monthly",
  Quarterly = "Quarterly",
  SemiAnnually = "SemiAnnually",
  Annually = "Annually",
}

export const FrequencySchema = z.enum(Frequency);

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  [Frequency.OneTime]: "One-time",
  [Frequency.Daily]: "Daily",
  [Frequency.Weekly]: "Weekly",
  [Frequency.BiWeekly]: "Bi-Weekly",
  [Frequency.Monthly]: "Monthly",
  [Frequency.Quarterly]: "Quarterly",
  [Frequency.SemiAnnually]: "Semi-Annually",
  [Frequency.Annually]: "Annually",
};
