import "reflect-metadata"; // Bắt buộc cho TypeORM decorator
import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { AppDataSource } from "./data-source";

// Cấu hình multer: nơi lưu file + tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // thư mục lưu file
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// Khởi tạo Express app
const app = express();
const PORT = 3000;

// Middleware để parse JSON (nếu cần sau này)
app.use(express.json());

// Route test server
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <h1>CSV Processor Queue đang chạy!</h1>
    <p>Server OK tại <a href="http://localhost:${PORT}">localhost:${PORT}</a></p>
    <p>Thử upload file CSV tại: <a href="/upload">/upload</a> (sẽ có form sau)</p>
  `);
});

// Route upload file CSV (chỉ nhận 1 file, field name là "csvFile")
app.post("/upload", upload.single("csvFile"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file được upload" });
    }

    const filePath = req.file.path;
    console.log("File đã upload:", filePath);

    // Sau này: đẩy filePath vào BullMQ queue ở đây
    // Hiện tại chỉ trả về thông báo thành công
    res.json({
      message: "File CSV đã được nhận và lưu tạm",
      fileName: req.file.originalname,
      savedPath: filePath,
      size: req.file.size,
    });
  } catch (err) {
    console.error("Lỗi khi upload:", err);
    res.status(500).json({ error: "Lỗi server khi xử lý file" });
  }
});

// Khởi động server
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database đã kết nối thành công");

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Không thể khởi động server:", err);
    process.exit(1);
  }
}

startServer();