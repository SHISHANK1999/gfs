"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedPhone = localStorage.getItem("phoneNumber");
    if (!savedPhone) {
      router.push("/login");
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
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phoneNumber: phone,
            otp,
            name: "User"
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "OTP verification failed");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/profile");
    } catch (error) {
      alert("Backend waking up, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {loading && <LoadingOverlay text="Verifying OTP..." />}
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        {/* LOGO */}
        <div className="relative w-28 h-28 mb-6">
          <Image
            src="/logo.png"
            alt="GFS Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-semibold text-[#0F172A]">
          Verify OTP
        </h1>

        <p className="mt-3 text-gray-500 text-sm leading-relaxed">
          Enter the OTP sent to <b>{phone}</b>
        </p>

        {/* OTP INPUT */}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mt-6 w-full border border-gray-300 rounded-xl px-4 py-3
          text-center tracking-widest text-lg focus:outline-none
          focus:ring-2 focus:ring-[#0EA5E9]"
        />

        {/* BUTTON */}
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="mt-6 w-full bg-[#0EA5E9] text-white py-3 rounded-xl font-medium
          hover:bg-[#0284C7] transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        {/* HINT */}
        <p className="mt-4 text-xs text-gray-400">
          For demo, use OTP <b>123456</b>
        </p>
      </div>
    </div>
    </>

  );
}