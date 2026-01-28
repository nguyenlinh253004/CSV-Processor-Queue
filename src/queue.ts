import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import fs from "fs";
import csvParser from "csv-parser";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

// Kết nối Redis
const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

export const csvQueue = new Queue("csv-processing", { connection });

// Worker xử lý job thật
const worker = new Worker(
  "csv-processing",
  async (job) => {
    const { filePath, originalName } = job.data;
    console.log(`Bắt đầu xử lý job ${job.id} - File: ${originalName} (${filePath})`);

    // Kiểm tra memory trước khi xử lý
    console.log("Memory usage trước xử lý:", process.memoryUsage());

    let processedCount = 0;
    const batchSize = 500; // Insert theo batch 500 records/lần để tối ưu
    let batch: Partial<User>[] = [];

    // Sử dụng stream để đọc CSV (rất quan trọng cho file lớn)
    const stream = fs
      .createReadStream(filePath)
      .pipe(csvParser());

    // Khởi tạo DataSource nếu chưa (vì worker chạy riêng)
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);

    // Xử lý từng row từ stream
    for await (const row of stream) {
      const user = new User();
      user.name = row.name?.trim() || "Unknown";
      user.email = row.email?.trim() || null;
      user.age = parseInt(row.age) || 0;

      // Validate cơ bản (có thể thêm validation tốt hơn sau)
      if (!user.email || user.email === "") continue;

      batch.push(user);

      // Khi đủ batch → save bulk
      if (batch.length >= batchSize) {
        await userRepository.save(batch);
        processedCount += batch.length;
        console.log(`Đã insert ${processedCount} records...`);
        batch = []; // reset batch
      }
    }

    // Insert batch cuối nếu còn
    if (batch.length > 0) {
      await userRepository.save(batch);
      processedCount += batch.length;
    }

    console.log(`Hoàn thành job ${job.id} - Tổng records: ${processedCount}`);

    // Log memory sau xử lý
    console.log("Memory usage sau xử lý:", process.memoryUsage());

    // Xóa file tạm sau khi xử lý xong (tùy chọn, để tiết kiệm disk)
    fs.unlinkSync(filePath); // Uncomment nếu muốn xóa file gốc
    
    return {
      status: "success",
      processedRecords: processedCount,
      fileName: originalName,
    };
  },
  {
    connection,
    concurrency: 1, // Hiện tại 1 worker, sau có thể tăng nếu dùng nhiều core
  }
);

// Event listener
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed:`, job.returnvalue);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("✅ BullMQ Queue & Worker (với CSV processing) đã khởi tạo");