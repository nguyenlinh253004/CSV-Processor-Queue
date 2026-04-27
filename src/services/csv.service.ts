// src/services/csv.service.ts
import { csvQueue } from "../queue";
import { AppConfig } from "../config/app.config";

export class CsvService {
  async enqueueFile(filePath: string, originalName: string) {
    const job = await csvQueue.add(
      "process-csv",
      { filePath, originalName },
      {
        attempts: AppConfig.queue.attempts,
        backoff: {
          type: "exponential",
          delay: AppConfig.queue.backoffDelay,
        },
      }
    );
    return job;
  }
}

export const csvService = new CsvService();