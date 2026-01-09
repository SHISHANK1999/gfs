"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // 🔹 Daily summary
    fetch("https://gfs-backend-0sy3.onrender.com/api/summary/daily", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then(setSummary);

    // 🔹 Notifications
    fetch("https://gfs-backend-0sy3.onrender.com/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* 🔹 Summary */}
      {summary && (
        <div className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Today&apos;s Study</h2>
          <p>Total Minutes: {summary.totalStudyMinutes}</p>
          <p>Streak: 🔥 {summary.streakCount}</p>
        </div>
      )}

      {/* 🔔 Notifications */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Notifications</h2>

        {notifications.length === 0 && (
          <p className="text-gray-500">No notifications</p>
        )}

        {notifications.map((n: any) => (
          <div
            key={n._id}
            className="border-b py-2 text-sm"
          >
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}