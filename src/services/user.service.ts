// src/services/user.service.ts
import { cacheService } from "./cache.service";
import { userRepository } from "../repositories/user.repository";
import { AppConfig } from "../config/app.config";

export class UserService {
  async getPaginatedUsers(page: number, limit: number) {
    // Giới hạn limit tối đa, tránh bị abuse
    const safeLimit = Math.min(limit, AppConfig.pagination.maxLimit);
    const cacheKey = `users_page_${page}_limit_${safeLimit}`;

       // Thử lấy từ cache trước
    const cached = await cacheService.get(cacheKey);
    if (cached) return { ...cached as any, fromCache: true };

    const { users, total } = await userRepository.findPaginated(page, safeLimit);

    const result = {
      data: users,
      total,
      totalPages: Math.ceil(total / safeLimit),
    };
    
    // Lưu vào Redis cache 10 phút
    await cacheService.set(cacheKey, result, 600);

    return { ...result, fromCache: false };
  }

    // Gọi hàm này sau khi insert/update/delete user
  async invalidateUserCache() {
    await cacheService.delByPattern("users:*");
  }
}

export const userService = new UserService();