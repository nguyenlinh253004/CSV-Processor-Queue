import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createObjectCsvWriter } from "csv-writer";  // ← sửa import đúng

const records: { name: string; email: string; age: number }[] = [];

// Tạo 10.000 dòng dữ liệu giả lập
for (let i = 1; i <= 10000; i++) {
  const name = `Người Dùng ${i} ${["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)]}`;
  const email = `user${i}-${uuidv4().slice(0, 8)}@example.com`;
  const age = Math.floor(Math.random() * (65 - 18 + 1)) + 18;

  records.push({ name, email, age });
}

// Đường dẫn file output (lưu ở thư mục gốc project)
const filePath = path.join(__dirname, "../large_test_10k.csv");

const csvWriter = createObjectCsvWriter({
  path: filePath,
  header: [
    { id: "name", title: "name" },
    { id: "email", title: "email" },
    { id: "age", title: "age" },
  ],
  encoding: "utf8",
});

csvWriter
  .writeRecords(records)
  .then(() => {
    console.log(`Đã tạo thành công file CSV 10.000 dòng tại: ${filePath}`);
    console.log(`Kích thước ước tính: ~300-400 KB`);
  })
  .catch((err: unknown) => {  // ← thêm type unknown (hoặc Error nếu muốn cụ thể)
    console.error("Lỗi khi tạo CSV:", err);
  });