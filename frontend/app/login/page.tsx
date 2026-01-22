"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
 useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("phoneNumber");
  }, []);

  const sendOtp = async () => {
  if (!phone.trim()) {
    alert("Please enter phone number");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(
      "https://gfs-backend-0sy3.onrender.com/api/auth/send-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone.trim() })
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || "Failed to send OTP");
      return;
    }

    // ✅ only phone save here
    localStorage.setItem("phoneNumber", phone.trim());

    router.push("/verify-otp");
  } catch (error) {
    alert("Backend waking up, try again in few seconds");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
    {loading && <LoadingOverlay text="Sending OTP..." />}
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        {/* LOGO */}
        <div className="relative w-32 h-32 mb-6">
          <Image
            src="/logo.png"
            alt="GFS Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-semibold text-[#0F172A]">
          Login to GFS
        </h1>

        <p className="mt-3 text-gray-500 text-sm leading-relaxed">
          Enter your phone number to continue your focused study journey.
        </p>

        {/* INPUT */}
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-6 w-full border border-gray-300 rounded-xl px-4 py-3
          text-center text-base focus:outline-none
          focus:ring-2 focus:ring-[#0EA5E9]"
        />

        {/* BUTTON */}
        <button
          onClick={sendOtp}
          disabled={loading}
          className="mt-6 w-full bg-[#0EA5E9] text-white py-3 rounded-xl font-medium
          hover:bg-[#0284C7] transition disabled:opacity-50"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {/* NOTE */}
        <p className="mt-4 text-xs text-gray-400">
          We’ll send you a one-time password to verify your number.
        </p>
      </div>
    </div>
    </>

  );
}