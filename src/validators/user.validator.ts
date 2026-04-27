// src/validators/user.validator.ts
import { z } from "zod";

export const getPaginatedUsersSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => parseInt(val ?? "1"))
      .pipe(z.number().min(1, "page phải >= 1")),

    limit: z
      .string()
      .optional()
      .transform((val) => parseInt(val ?? "50"))
      .pipe(z.number().min(1).max(100, "limit tối đa là 100")),
  }),
});

// Kiểu TypeScript tự động từ schema — dùng trong controller
export type GetPaginatedUsersInput = z.infer<typeof getPaginatedUsersSchema>;