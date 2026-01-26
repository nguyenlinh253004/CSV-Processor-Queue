import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",          // file db sẽ nằm ngay trong project
  synchronize: false,                   // Tắt ở production, dùng migration thay thế
  logging: ["query", "error"],          // Log query để debug
  entities: ["src/entity/*.ts"],        // Nơi chứa các entity
  migrations: ["src/migration/*.ts"],   // Nơi chứa migration
  subscribers: [],
});