"use client";
import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");

  const sendOtp = async () => {
    await fetch("https://gfs-backend-0sy3.onrender.com/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone })
    });

    alert("OTP sent");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-80 p-6 border rounded-xl">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        <input
          className="border p-2 w-full mb-4"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={sendOtp}
          className="bg-black text-white w-full py-2 rounded"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}