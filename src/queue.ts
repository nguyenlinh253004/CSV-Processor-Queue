import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

// Kết nối Redis (cấu hình mặc định local)
const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null, // BullMQ recommend cho Redis 7+
});

// Tạo Queue tên "csv-processing"
export const csvQueue = new Queue("csv-processing", { connection });

// (Tạm thời) Tạo Worker để xử lý job ngay trong file này
// Sau này có thể tách worker ra file riêng để scale
const worker = new Worker(
  "csv-processing",
  async (job) => {
    const { filePath } = job.data;

    console.log(`Bắt đầu xử lý job ${job.id} - File: ${filePath}`);

    // TODO: Ở đây sẽ đọc CSV, parse, insert vào DB bằng TypeORM
    // Hiện tại chỉ log và giả lập delay để test
    await new Promise((resolve) => setTimeout(resolve, 2000)); // giả lập xử lý 2 giây

    console.log(`Hoàn thành job ${job.id}`);
    return { status: "success", processedFile: filePath };
  },
  { connection }
);

// Xử lý event khi job hoàn thành / fail (cho debug)
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("✅ BullMQ Queue & Worker đã khởi tạo");