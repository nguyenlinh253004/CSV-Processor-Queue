// src/server.ts  — khởi động server, kết nối DB
import http from "http";
import { Server } from "socket.io";
import { AppDataSource } from "./data-source";
import { AppConfig } from "./config/app.config";
import { jobEvents } from "./socketEvents";
import logger from "./logger";
import app from "./app";
import { csvQueue } from "./queue";
import redisClient from "./config/redis";
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Forward job events ra socket
  const onProgress = (data: any) => socket.emit("job-progress", data);
  const onCompleted = (data: any) => socket.emit("job-completed", data);
  jobEvents.on("job-progress", onProgress);
  jobEvents.on("job-completed", onCompleted);

  socket.on("disconnect", () => {
    jobEvents.off("job-progress", onProgress);
    jobEvents.off("job-completed", onCompleted);
  });
});

// Hàm tắt server an toàn
async function gracefulShutdown(signal: string) {
  logger.info(`Nhận tín hiệu ${signal}, bắt đầu graceful shutdown...`);

  // Force exit sau 10 giây — đặt trước để đảm bảo luôn chạy
  const forceExit = setTimeout(() => {
    logger.warn("Shutdown quá 10 giây, force exit!");
    process.exit(0);
  }, 10000);

  // Không để timeout này giữ process sống
  forceExit.unref();

  

    try {
      // Bước 2: Đóng Queue — chờ job đang chạy xong
      await new Promise<void>((resolve) => server.close(() => resolve()));
    logger.info("HTTP server đã đóng");

    // Bước 2: Đóng Queue — thêm timeout 3 giây riêng
    try {
      await Promise.race([
        csvQueue.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Queue close timeout")), 3000)
        ),
      ]);
      logger.info("BullMQ queue đã đóng");
    } catch {
      logger.warn("Queue close timeout, bỏ qua...");
    }

      // Sau khi đóng Queue, thêm đóng Redis
      try {
        await redisClient.quit();
        logger.info("Redis connection đã đóng");
      } catch {
        logger.warn("Redis close timeout, bỏ qua...");
      }

      // Bước 3: Đóng kết nối Database
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        logger.info("Database connection đã đóng");
      }

      logger.info("Graceful shutdown hoàn tất");
      process.exit(0);

    } catch (err) {
      logger.error("Lỗi khi shutdown:", err);
      process.exit(1);
    }

}

// Lắng nghe các tín hiệu tắt từ OS
process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // PM2, Docker dùng cái này
process.on("SIGINT", () => gracefulShutdown("SIGINT"));   // Ctrl+C

// Bắt lỗi không được xử lý — tránh server crash âm thầm
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});

async function startServer() {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected!");

    server.listen(3000, () => {
      logger.info(`Server running at http://localhost:${AppConfig.port}`);
    });
  } catch (err) {
    logger.error("Không thể khởi động server:", err);
    process.exit(1);
  }
}

startServer();