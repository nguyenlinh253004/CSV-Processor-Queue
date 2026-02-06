import { Queue, Worker } from "bullmq";
import { Worker as WorkerThread } from "worker_threads";
import IORedis from "ioredis";
import fs from "fs";
import path from "path";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { userCache } from "./cache";
import logger from "./logger"; // Import Winston logger
import { jobEvents } from "./socketEvents";
const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

export const csvQueue = new Queue("csv-processing", { connection });

const worker = new Worker(
  "csv-processing",
  async (job) => {
    const { filePath, originalName } = job.data;
    logger.info(`🚀 Bắt đầu Job ${job.id} - File: ${originalName}`);

    // Ước tính số dòng để làm Progress
    const fileStats = fs.statSync(filePath);
    const estimatedTotal = Math.max(1, Math.round(fileStats.size / 60)); // Giả định ~60 bytes/dòng

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    try {
      // BƯỚC 1: PARSE (Worker Thread)
      const parsedUsers = await new Promise<Partial<User>[]>((resolve, reject) => {
        const workerThread = new WorkerThread(path.resolve(__dirname, "./workers/csv-parser-worker.js"), {
          workerData: { chunkFilePath: filePath },
        });
        workerThread.on("message", (res) => res.status === "success" ? resolve(res.users) : reject(new Error(res.error)));
        workerThread.on("error", reject);
      });

      // BƯỚC 2: INSERT BATCH & PROGRESS
      let processedCount = 0;
      const batchSize = 500;
      let batch: Partial<User>[] = [];

      for (const user of parsedUsers) {
        batch.push(user);
        if (batch.length >= batchSize) {
          await userRepository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values(batch)
          .orIgnore(true)  // Ignore nếu vi phạm unique (email trùng)
          .execute();
          processedCount += batch.length;
          
          // Cập nhật Progress cho BullMQ
          const progress = Math.min(100, Math.round((processedCount / estimatedTotal) * 100));
          await job.updateProgress(progress);
          // Trong worker, khi update progress:
          jobEvents.emit("job-progress", { jobId: job.id, progress: progress });
          logger.info(`Job ${job.id} Progress: ${progress}%`);
          batch = [];
        }
      }

      if (batch.length > 0) {
        await userRepository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values(batch)
          .orIgnore(true)  // Ignore nếu vi phạm unique (email trùng)
          .execute();
        processedCount += batch.length;
        await job.updateProgress(100);
      }

      userCache.flushAll();
      logger.info("Cache flushed sau khi insert mới");
      // Xóa file async, chỉ khi thành công
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      logger.info(`🏁 Job ${job.id} hoàn thành thành công!`);
      return { status: "success", total: processedCount };

    } catch (error) {
      logger.error(` Lỗi tại Job ${job.id}:`, error);
      throw error; // Quăng lỗi để BullMQ kích hoạt Retry
    }
  },
  {
    connection,
    concurrency: 1,
    // CẤU HÌNH RETRY TẠI ĐÂY
  }
);
worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed:`, job.returnvalue);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed sau ${job?.attemptsMade || 0} attempts:`, err);
});
console.log(" BullMQ Queue & Worker (với CSV processing) đã khởi tạo");