// src/middlewares/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Nhận vào 1 Zod schema, trả về middleware
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Parse cả body, query, params cùng lúc
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Nếu parse thành công thì cho đi tiếp
    // Nếu thất bại thì Zod throw ZodError → errorHandler bắt
    next();
  };
}