// src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/app.config";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError";

// Mở rộng kiểu Request để chứa thông tin user
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

// Middleware xác thực token
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Thiếu token xác thực");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, AppConfig.jwt.secret) as {
      userId: number;
      role: string;
    };
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Token không hợp lệ hoặc đã hết hạn");
  }
}

// Middleware phân quyền theo role
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Bạn không có quyền thực hiện hành động này");
    }
    next();
  };
}