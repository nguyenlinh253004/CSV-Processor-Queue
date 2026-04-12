// src/services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { AppConfig } from "../config/app.config";
import { BadRequestError, UnauthorizedError } from "../errors/AppError";

const userRepo = () => AppDataSource.getRepository(User);

export class AuthService {
  async register(name: string, email: string, password: string) {
    // Kiểm tra email đã tồn tại chưa
    const existing = await userRepo().findOne({ where: { email } });
    if (existing) throw new BadRequestError("Email đã được sử dụng");

    // Hash password — không bao giờ lưu plain text
    const hashed = await bcrypt.hash(password, 10);

    const user = userRepo().create({ name, email, password: hashed });
    await userRepo().save(user);

    // Không trả password về
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string) {
    // addSelect để lấy password (vì select:false ở entity)
    const user = await userRepo()
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();

    if (!user) throw new UnauthorizedError("Email hoặc mật khẩu không đúng");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError("Email hoặc mật khẩu không đúng");

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      AppConfig.jwt.secret,
      { expiresIn: AppConfig.jwt.expiresIn } as any
    );

    return { token, userId: user.id, role: user.role };
  }
}

export const authService = new AuthService();