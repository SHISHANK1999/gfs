"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/intro");
    }, 22000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        {/* BIG LOGO */}
        <div className="relative w-56 h-56 md:w-72 md:h-72">
          <Image
            src="/icon.png"
            alt="GFS Logo"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* TEXT */}
        <h1 className="mt-6 text-3xl font-semibold text-[#0369A1]">
          GFS
        </h1>

        <p className="mt-1 text-sm tracking-wide text-gray-500">
          Group Focused Study
        </p>
      </div>
    </div>
  );
}