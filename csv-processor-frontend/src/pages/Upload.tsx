// src/pages/Upload.tsx
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { io, Socket } from "socket.io-client";
import { AxiosError } from "axios";
interface JobStatus {
  jobId: string;
  progress: number;
  status: "processing" | "completed" | "error";
  total?: number;
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState("");
  const socketRef = useRef<Socket | null>(null);

useEffect(() => {
  const socket = io("http://localhost:3000", {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("job-progress", (data: { jobId: string; progress: number }) => {
    console.log("Progress:", data); // ← debug
    setJob((prev) => {
      if (!prev || prev.jobId !== String(data.jobId)) return prev;
      return { ...prev, progress: data.progress, status: "processing" as const };
    });
  });

  socket.on("job-completed", (data: { jobId: string; result?: { total: number } }) => {
    console.log("Completed:", data); // ← debug
    setJob((prev) => {
      if (!prev || prev.jobId !== String(data.jobId)) return prev;
      return { ...prev, progress: 100, status: "completed" as const, total: data.result?.total };
    });
  });

  return () => {
    socket.disconnect();
  };
}, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError("");
    setUploading(true);
    setJob(null);

    const formData = new FormData();
    formData.append("csvFile", file);

    try {
      const res = await api.post("/upload", formData);
      setJob({
        jobId: String(res.data.jobId),
        progress: 0,
        status: "processing",
      });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
   setError(error.response?.data?.message ?? "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload CSV</h1>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="text-blue-600 font-medium">{file.name}</p>
          ) : (
            <p className="text-gray-400">Click để chọn file CSV</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {uploading ? "Đang upload..." : "Upload & Xử lý"}
        </button>
      </form>

      {/* Progress */}
      {job && (
        <div className="bg-white rounded-2xl shadow-md p-6 mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Job #{job.jobId}</span>
            <span>{job.progress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                job.status === "completed" ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${job.progress}%` }}
            />
          </div>

          {job.status === "completed" && (
            <p className="text-green-600 font-medium mt-3 text-center">
              ✅ Hoàn thành! Đã xử lý {job.total?.toLocaleString()} dòng
            </p>
          )}

          {job.status === "processing" && (
            <p className="text-blue-500 text-sm mt-2 text-center animate-pulse">
              Đang xử lý...
            </p>
          )}
        </div>
      )}
    </div>
  );
}