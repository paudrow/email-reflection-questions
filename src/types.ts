import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const Email = z.object({
  To: z.string(),
  TextBody: z.string(),
  Subject: z.string(),
  From: z.string(),
  FromName: z.string(),
  Date: z.union([z.date(), z.string().pipe(z.coerce.date())]),
});
export type Email = z.infer<typeof Email>;

export const Reply = z.object({
  id: z.string().ulid(),
  question: z.string(),
  answer: z.string(),
  date: z.date(),
  who: z.string(),
});
export type Reply = z.infer<typeof Reply>;
