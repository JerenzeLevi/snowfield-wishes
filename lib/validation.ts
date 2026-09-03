import { z } from "zod";

const trimmed = (max: number) =>
  z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(max));

export const createWishSchema = z
  .object({
    body: trimmed(500),
    visibility: z.enum(["named", "alias"]),
    firstName: z.string().trim().max(60).optional(),
    lastName: z.string().trim().max(60).optional(),
    alias: z.string().trim().max(40).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.visibility === "named") {
      if (!val.firstName)
        ctx.addIssue({ code: "custom", path: ["firstName"], message: "First name is required." });
      if (!val.lastName)
        ctx.addIssue({ code: "custom", path: ["lastName"], message: "Surname is required." });
    } else if (!val.alias) {
      ctx.addIssue({ code: "custom", path: ["alias"], message: "Pick an alias." });
    }
  });

export type CreateWishInput = z.infer<typeof createWishSchema>;
