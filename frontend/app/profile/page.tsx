"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const PURPOSES = [
  { id: "student", label: "🎓 Student", desc: "School or college studies" },
  { id: "professional", label: "💼 Professional", desc: "Job or skill upgrade" },
  { id: "competitive", label: "📚 Competitive Exams", desc: "UPSC, SSC, etc." },
  { id: "self", label: "🧠 Self Improvement", desc: "Habit & personal growth" }
];

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState<string | null>(null);
  const router = useRouter();

  const continueNext = () => {
    if (!name.trim() || !purpose) {
      alert("Please enter name and select your study purpose");
      return;
    }

    // Temporary local save (backend baad me)
    localStorage.setItem("userName", name);
    localStorage.setItem("studyPurpose", purpose);

    router.push("/dashboard");
  };

  return (
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
          Set up your profile
        </h1>

        <p className="mt-2 text-gray-500 text-sm">
          Help us personalize your study experience.
        </p>

        {/* NAME INPUT */}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-6 w-full border border-gray-300 rounded-xl px-4 py-3
          text-center focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
        />

        {/* PURPOSE */}
        <div className="mt-6 w-full text-left">
          <p className="text-sm font-medium text-gray-700 mb-3">
            You’re here to focus on
          </p>

          <div className="space-y-3">
            {PURPOSES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPurpose(p.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border
                transition ${
                  purpose === p.id
                    ? "border-[#0EA5E9] bg-sky-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-[#0F172A]">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>

                {purpose === p.id && (
                  <span className="text-[#0EA5E9] font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTINUE */}
        <button
          onClick={continueNext}
          className="mt-8 w-full bg-[#0EA5E9] text-white py-3 rounded-xl font-medium
          hover:bg-[#0284C7] transition"
        >
          Continue
        </button>

        <p className="mt-4 text-xs text-gray-400">
          You can update this later from settings.
        </p>
      </div>
    </div>
  );
}