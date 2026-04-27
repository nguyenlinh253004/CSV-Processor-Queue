// src/controllers/user.controller.ts
import { Request, Response } from "express";
import { userService } from "../services/user.service";
import logger from "../logger";

export class UserController {
  async getUsers(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = parseInt(req.query.limit as string) || 50;
      const result = await userService.getPaginatedUsers(page, limit);
      return res.json({
        status: result.fromCache ? "success (from cache)" : "success",
        page,
        limit,
        ...result,
      });
  }
}

export const userController = new UserController();