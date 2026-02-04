"use client";
import { logoutUser } from "../lib/auth";

export default function Navbar() {
  return (
    <div className="w-full flex justify-between items-center px-6 py-4 border-b">
      <h2 className="font-bold text-xl">GFS</h2>

      <button
        onClick={() => {
          logoutUser();
          window.location.href = "/login";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}