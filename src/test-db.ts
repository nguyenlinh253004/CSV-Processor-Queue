import { AppDataSource } from "./data-source";

async function testConnection() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected!");
    await AppDataSource.destroy();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testConnection();