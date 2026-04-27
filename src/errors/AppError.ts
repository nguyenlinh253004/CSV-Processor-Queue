// src/errors/AppError.ts

// Class gốc — tất cả lỗi trong app đều kế thừa từ đây
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 400 — dữ liệu người dùng gửi lên sai
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

// 404 — không tìm thấy
export class NotFoundError extends AppError {
  constructor(message: string = "Không tìm thấy") {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError { // ← thêm mới
  constructor(message: string = "Chưa đăng nhập") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError { // ← thêm mới
  constructor(message: string = "Không có quyền truy cập") {
    super(message, 403);
  }
}

// 422 — validation thất bại (sai format, thiếu field...)
export class ValidationError extends AppError {
  constructor(public details: { field: string; message: string }[]) {
    super("Dữ liệu không hợp lệ", 422);
  }
}