import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

async function insertTestUser() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const userRepository = AppDataSource.getRepository(User);

    const newUser = new User();
    newUser.name = "Nguyen Van A";
    newUser.email = "vana@example.com";
    newUser.age = 25;

    await userRepository.save(newUser);
    console.log("Đã chèn user thành công:", newUser);

    await AppDataSource.destroy();
  } catch (err) {
    console.error("Lỗi:", err);
  }
}

insertTestUser();