import { z } from "zod";

/**
 * Shared schema primitives reused across DTO files.
 *
 * `pagedResponseSchema` factors the `{items: T[], totalCount?: number}`
 * envelope so each list-response schema becomes a one-liner. The audit
 * (§1.5) flagged this envelope being hand-rolled 4+ times — centralising
 * it keeps the shape consistent and means future additions (next-page
 * tokens, sort metadata) land in one place.
 *
 * `MoneyFieldsSchema` is a marker helper for the `{amount, currency}` pair
 * the .NET side exposes as adjacent fields on most DTOs. It's not used
 * directly today (interfaces inline the pair to preserve their existing
 * shape), but exists so a future "promote to nested Money" refactor has
 * one centralised definition to update.
 */
export function pagedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    totalCount: z.number().optional(),
  });
}

export const MoneyFieldsSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});
