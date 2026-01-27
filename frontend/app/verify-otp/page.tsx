"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingOverlay from "@/components/ui/LoadingOverlay";


export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
// ✅ OTP boxes state
const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
const otpValue = otpDigits.join("");

  useEffect(() => {
    const savedPhone = localStorage.getItem("phoneNumber");
    if (!savedPhone) {
      router.push("/login");
    } else {
      setPhone(savedPhone);
    }
  }, [router]);

  const handleOtpChange = (value: string, index: number) => {
  if (!/^\d?$/.test(value)) return;

  const updated = [...otpDigits];
  updated[index] = value;
  setOtpDigits(updated);

  if (value && index < 5) {
    inputsRef.current[index + 1]?.focus();
  }
};

const handleOtpKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  index: number
) => {
  if (e.key === "Backspace") {
    if (otpDigits[index]) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
    } else if (index > 0) {
      inputsRef.current[index - 1]?.focus();
      const updated = [...otpDigits];
      updated[index - 1] = "";
      setOtpDigits(updated);
    }
  }
};

const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  if (!pasted) return;

  const updated = Array(6).fill("");
  pasted.split("").forEach((ch, i) => {
    if (i < 6) updated[i] = ch;
  });

  setOtpDigits(updated);

  const nextIndex = Math.min(pasted.length, 5);
  inputsRef.current[nextIndex]?.focus();
};

 const verifyOtp = async () => {
  if (otpValue.length !== 6) {
    alert("Enter 6 digit OTP");
    return;
  }

  try {
    setLoading(true);

    const phone = localStorage.getItem("phoneNumber");
    const name = localStorage.getItem("name");

    const res = await fetch("http://localhost:5001/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phoneNumber: phone,
        otp: otpValue,
        name: name || "User"
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || "OTP verification failed");
      return;
    }

    // ✅ Save token + user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);
    localStorage.setItem("name", data.user.name);

    // ✅ profile check
    const isProfileComplete =
      data.user?.name && data.user.name.trim().toLowerCase() !== "user";

    // ✅ अगर profile complete है → dashboard
    if (isProfileComplete) {
      alert("✅ Login Successful");
      router.push("/dashboard");
      return;
    }

    // ✅ वरना बिना msg के profile page
    router.push("/profile");
  } catch (error) {
    alert("Backend issue, try again");
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
        <div className="relative w-70 h-50">
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
        {/* ✅ OTP BOXES (6 digit) */}
<div className="mt-6 w-full flex justify-center">
  <div className="grid grid-cols-6 gap-2 w-full max-w-[320px]">
    {Array.from({ length: 6 }).map((_, i) => (
      <input
        key={i}
        ref={(el) => {
          // @ts-ignore
          inputsRef.current[i] = el;
        }}
        value={otpDigits[i] || ""}
        onChange={(e) => handleOtpChange(e.target.value, i)}
        onKeyDown={(e) => handleOtpKeyDown(e, i)}
        onPaste={handleOtpPaste}
        inputMode="numeric"
        maxLength={1}
        className="h-12 w-full rounded-xl border border-gray-300 text-center text-lg font-semibold
        focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
      />
    ))}
  </div>
</div>

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