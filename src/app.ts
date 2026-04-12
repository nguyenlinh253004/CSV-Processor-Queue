// src/app.ts  — chỉ định nghĩa Express app và routes
import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import multer from "multer";
import path from "path";
import { AppConfig } from "./config/app.config";
import { userController } from "./controllers/user.controller";
import { uploadController } from "./controllers/upload.controller";
import { authController } from "./controllers/auth.controller";
import { validate } from "./middlewares/validate";
import { authenticate, authorize } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { getPaginatedUsersSchema } from "./validators/user.validator";
import { registerSchema, loginSchema } from "./validators/auth.validator";
import { AppDataSource } from "./data-source";
const app = express();

// Helmet — tự động set header bảo mật
app.use(helmet());

app.use(express.json());

// Rate limiting — giới hạn 100 request / 15 phút mỗi IP
const limiter = rateLimit({
  windowMs: AppConfig.rateLimit.windowMs,
  max: AppConfig.rateLimit.max,
  message: {
    status: "error",
    message: "Quá nhiều request, vui lòng thử lại sau",
  },
});
app.use(limiter);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, AppConfig.upload.dest),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
}); 
const upload = multer({ storage });

// Auth routes — public
app.post("/auth/register", validate(registerSchema), (req, res) =>
  authController.register(req, res)
);
app.post("/auth/login", validate(loginSchema), (req, res) =>
  authController.login(req, res)
);

// Routes — gọn hơn nhiều so với trước
app.get("/", (_, res) => res.send("CSV Processor đang chạy!"));
app.get("/users",
  authenticate, // ← xác thực trước 
  validate(getPaginatedUsersSchema), // ← validate trước khi vào controller 
 (req, res) => userController.getUsers(req, res));
app.post("/upload",
  authenticate, // ← chỉ cho user đã đăng nhập upload
  authorize("admin"), // ← chỉ admin mới được upload
  upload.single("csvFile"), (req, res) =>
  uploadController.uploadCsv(req, res)
);

app.get("/health", async (_, res) => {
  const dbStatus = AppDataSource.isInitialized ? "ok" : "error";

  res.status(dbStatus === "ok" ? 200 : 503).json({
    status: dbStatus === "ok" ? "ok" : "error",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),     // server đã chạy bao nhiêu giây
    memory: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
    },
    services: {
      database: dbStatus,
    },
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.url} không tồn tại`,
  });
});

app.use(errorHandler); // Đặt sau cùng để bắt hết lỗi từ trên xuống
export default app;