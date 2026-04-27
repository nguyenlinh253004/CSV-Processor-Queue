// src/controllers/upload.controller.ts
import { Request, Response } from "express";
import { csvService } from "../services/csv.service";
import logger from "../logger";

export class UploadController {
  async uploadCsv(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file được upload" });
    }

    try {
      const job = await csvService.enqueueFile(
        req.file.path,
        req.file.originalname
      );

      return res.json({
        message: "File CSV đã được nhận và đẩy vào queue",
        jobId: job.id,
        fileName: req.file.originalname,
      });
    } catch (err) {
      logger.error("Lỗi khi upload:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }
}

export const uploadController = new UploadController();