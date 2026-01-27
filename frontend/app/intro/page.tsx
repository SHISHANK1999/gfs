"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function IntroPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        {/* LOGO SMALL */}
        <div className="relative  w-70 h-50 ">
          <Image
            src="/logo.png"
            alt="GFS Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* TEXT */}
        <h1 className="text-3xl font-semibold text-[#0F172A]">
          Group Focused Study
        </h1>

        <p className="mt-3 text-gray-500 text-sm leading-relaxed">
          Study together, stay consistent and build focus with your group.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push("/login")}
          className="mt-8 w-full bg-[#0EA5E9] text-white py-3 rounded-xl font-medium
          hover:bg-[#0284C7] transition"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}