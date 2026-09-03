import { z } from "zod";

const trimmed = (max: number) =>
  z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(max));

export const createWishSchema = z.object({
  body: trimmed(500),
  firstName: trimmed(60),
  lastName: trimmed(60),
  alias: trimmed(40),
  // whether the real name goes into the searchable directory. Alias is always
  // shown on the public snowfield regardless.
  searchable: z.boolean().default(true),
  // thematic intent — drives the wax-seal colour on the note
  mood: z.enum(["longing", "gratitude", "hopes"]).default("gratitude"),
});

export type CreateWishInput = z.infer<typeof createWishSchema>;
