import NodeCache from "node-cache";

export const userCache = new NodeCache({
  stdTTL: 300,          // Cache 5 phút
  checkperiod: 120,     // Kiểm tra hết hạn mỗi 2 phút
  useClones: false,     // Không clone object để tiết kiệm memory
});

console.log("✅ In-memory cache (node-cache) đã khởi tạo");