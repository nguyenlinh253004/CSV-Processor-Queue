# CSV Processor Queue

A high-performance Node.js app for uploading and processing large CSV files using job queue, stream, batch insert, caching, multithreading.

## Features
- Upload CSV via form/API
- Job queue with BullMQ + Redis
- Stream processing for large files
- Batch insert with TypeORM + SQLite
- Worker Threads for CPU-intensive parse
- In-memory caching with node-cache
- Realtime progress with Socket.io
- PM2 cluster mode
- Winston logging + memory monitoring

## Setup
1. `npm install`
2. Run Redis (Docker: `docker run -d -p 6379:6379 redis`)
3. `npx typeorm migration:run -d src/data-source.ts`
4. `npm run dev` or `pm2 start ecosystem.config.js`

## Test
- Upload: http://localhost:3000/upload-form
- Users: http://localhost:3000/users?page=1&limit=50

Push to GitHub: `git init`, `git add .`, `git commit -m "Init"`, `git remote add origin [url]`, `git push`.