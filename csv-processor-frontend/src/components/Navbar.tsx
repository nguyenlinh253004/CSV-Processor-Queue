// src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { token, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-600";

  if (!token) return null;

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="flex gap-6">
        <Link to="/users" className={isActive("/users")}>
          Users
        </Link>
        <Link to="/upload" className={isActive("/upload")}>
          Upload CSV
        </Link>
      </div>
      <button
        onClick={logout}
        className="text-sm text-red-500 hover:text-red-700 transition"
      >
        Đăng xuất
      </button>
    </nav>
  );
}