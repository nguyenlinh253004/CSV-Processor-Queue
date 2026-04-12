// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors/AppError";
import logger from "../logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Lỗi Zod — validation schema thất bại
  if (err instanceof ZodError) {
    const details = err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
    }));
    return res.status(422).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      details,
    });
  }

  // Lỗi ValidationError tự định nghĩa
  if (err instanceof ValidationError) {
    return res.status(422).json({
      status: "error",
      message: err.message,
      details: err.details,
    });
  }

  // Lỗi AppError (BadRequest, NotFound...)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Lỗi không xác định — log đầy đủ nhưng không lộ chi tiết ra ngoài
  logger.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  return res.status(500).json({
    status: "error",
    message: "Lỗi server, vui lòng thử lại sau",
  });
}