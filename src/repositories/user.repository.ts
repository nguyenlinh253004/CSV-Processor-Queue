// src/repositories/user.repository.ts
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export class UserRepository {
  private repo = AppDataSource.getRepository(User);

  async findPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await this.repo.findAndCount({
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
    return { users, total };
  }

  async insertBatch(users: Partial<User>[]) {
    return this.repo
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(users)
      .orIgnore(true)
      .execute();
  }
}

export const userRepository = new UserRepository();