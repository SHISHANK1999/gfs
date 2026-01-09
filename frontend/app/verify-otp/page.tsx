"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedPhone = localStorage.getItem("phoneNumber");
    if (!savedPhone) {
      router.push("/");
    } else {
      setPhone(savedPhone);
    }
  }, [router]);

  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://gfs-backend-0sy3.onrender.com/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: phone,
            otp,
            name: "User"
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT – VISUAL */}
      <div className="hidden md:flex w-1/2 items-center justify-center
        bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">
            Stay Focused
          </h1>
          <p className="text-gray-600">
            One step away from your study session
          </p>
        </div>
      </div>

      {/* RIGHT – VERIFY OTP */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-80">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify OTP
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Enter the OTP sent to <b>{phone}</b>
          </p>

          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4
              text-center tracking-widest
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg
              hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <p className="text-xs text-gray-400 mt-6 text-center">
            Didn’t receive OTP? Use <b>123456</b> for demo
          </p>
        </div>
      </div>
    </div>
  );
}