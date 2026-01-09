"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendOtp = async () => {
    if (!phone) return alert("Enter phone number");
    setLoading(true);
   
    try{
    const res = await fetch(
      "https://gfs-backend-Osy3.onrender.com/api/auth/send-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone })
      }
    );

    const data = await res.json();
    console.log("OTP RESPONSE 👉", data); // 👈 ADD THIS
    setLoading(false);

    if (res.ok) {
      localStorage.setItem("phoneNumber", phone);
      console.log("Redirecting to verify-otp"); // 👈 ADD
      router.push("/verify-otp");
    } else {
     alert(data.message || "OTP send failed");
    }
  } catch (err) {
    console.error("FETCH ERROR 👉", err);
    alert("Network error");
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE – VISUAL */}
      <div className="hidden md:flex w-1/2 items-center justify-center
        bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">
            Group Focused Study
          </h1>
          <p className="text-gray-600">
            Study together. Stay consistent. Build focus.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-80">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Login to start your focus session
          </p>

          <input
            type="tel"
            placeholder="Phone number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg
              hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-xs text-gray-400 mt-6 text-center">
            No spam. Only study reminders.
          </p>
        </div>
      </div>
    </div>
  );
}