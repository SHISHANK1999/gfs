"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ✅ 10 digit boxes
  const [digits, setDigits] = useState<string[]>(Array(10).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const phoneNumber = digits.join("");

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("phoneNumber");
  }, []);

  // ✅ handle typing
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);

    // move next
    if (value && index < 9) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ✅ backspace support
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key !== "Backspace") return;

    // if current has value → clear
    if (digits[index]) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }

    // else go back
    if (index > 0) {
      inputsRef.current[index - 1]?.focus();
      const updated = [...digits];
      updated[index - 1] = "";
      setDigits(updated);
    }
  };

  // ✅ paste full number
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 10);
    if (!pasted) return;

    const updated = Array(10).fill("");
    pasted.split("").forEach((ch, i) => {
      updated[i] = ch;
    });

    setDigits(updated);

    // focus next empty
    const nextIndex = Math.min(pasted.length, 9);
    inputsRef.current[nextIndex]?.focus();
  };

  const sendOtp = async () => {
    if (phoneNumber.length !== 10) {
      alert("Please enter 10 digit phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://gfs-backend-0sy3.onrender.com/api/auth/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber })
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      localStorage.setItem("phoneNumber", phoneNumber);
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
        <div className="w-full max-w-xl flex flex-col items-center text-center">
          {/* LOGO */}
          <div className="relative w-70 h-50 mb-0.5">
            <Image src="/logo.png" alt="GFS Logo" fill className="object-contain" />
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-semibold text-[#0F172A]">
            Login to GFS
          </h1>

          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            Enter your phone number to continue your focused study journey.
          </p>

          {/* ✅ 10 Digit Input Boxes (Responsive + Always in one row) */}
        <div className="mt-6 w-full flex justify-center">
  <div className="grid grid-cols-10 gap-2 max-w-[520px] w-full">
    {digits.map((d, i) => (
      <input
        key={i}
        ref={(el) => {
          inputsRef.current[i] = el;
        }}
        value={d}
        onChange={(e) => handleChange(e.target.value, i)}
        onKeyDown={(e) => handleKeyDown(e, i)}
        onPaste={handlePaste}
        inputMode="numeric"
        maxLength={1}
        className="w-full aspect-square border border-gray-300 rounded-xl text-center text-base font-semibold
        focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
      />
    ))}
  </div>
</div>

          {/* BUTTON */}
          <button
            onClick={sendOtp}
            disabled={loading}
            className="mt-6 w-full max-w-[360px] bg-[#0EA5E9] text-white py-3 rounded-xl font-medium
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