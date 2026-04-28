import { z } from "zod";

export const createCommunitySchema = z.object({
  name: z.string().min(3).max(64),
  description: z.string().max(500),
});

export const createThreadSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1),
});

export const createCommentSchema = z.object({
  content: z.string().min(1),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
