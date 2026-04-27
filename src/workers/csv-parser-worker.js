const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const csvParser = require("csv-parser");
// import { User } from "../entity/User";

const { chunkFilePath } = workerData; // Nhận đường dẫn chunk từ main

const parsedUsers = [];

fs.createReadStream(chunkFilePath)
  .pipe(csvParser())
  .on("data", (row) => {
    const user= {
      name: row.name?.trim() || "Unknown",
      email: row.email?.trim() || null,
      age: parseInt(row.age) || 0,
    };

    if (user.email && user.email !== "") {
      parsedUsers.push(user);
    }
  })
  .on("end", () => {
    // Gửi kết quả về main thread
    parentPort?.postMessage({ status: "success", users: parsedUsers });
  })
  .on("error", (err) => {
    parentPort?.postMessage({ status: "error", error: err.message });
  });