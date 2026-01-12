"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "../components/ ChatPanel";

export default function DashboardPage() {
  /* ================= BASIC STATE ================= */
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  /* ================= FOCUS SESSION ================= */
  const [isFocusOn, setIsFocusOn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  const [showFocusSetup, setShowFocusSetup] = useState(false);
  const [showFocusEnd, setShowFocusEnd] = useState(false);

  const [focusDuration, setFocusDuration] = useState(25);
  const [focusSubject, setFocusSubject] = useState("DSA");
  const [focusGroup, setFocusGroup] = useState("Solo");

  /* ================= TIMER LOGIC ================= */
  useEffect(() => {
    if (!isFocusOn) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFocusOn(false);
          setShowFocusEnd(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFocusOn]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative h-screen flex flex-col bg-[#F8FAFC]">

      {/* ================= FOCUS GLOW BACKGROUND ================= */}
      {isFocusOn && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#0EA5E9]/5 animate-pulse" />
        </div>
      )}

      {/* ================= TOP BAR ================= */}
      <div className="relative z-10 h-14 bg-white flex items-center justify-between px-6 shadow-sm">

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center
            text-sm font-medium cursor-pointer hover:ring-2 hover:ring-[#0EA5E9]/40"
          >
            S
          </div>
          <span className="text-sm font-medium text-[#0F172A]">
            Shishank
          </span>
        </div>

        {/* Focus timer & button */}
        <div className="flex items-center gap-4">
          <span
            className={`text-sm font-medium ${
              isFocusOn
                ? "animate-[pulse_3s_ease-in-out_infinite] text-[#0284C7]"
                : "text-[#0F172A]"
            }`}
          >
            ⏱️ {formatTime(secondsLeft)}
          </span>

          <button
            onClick={() => setShowFocusSetup(true)}
            className="px-5 py-1.5 rounded-full text-sm font-medium bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition"
          >
            Start Study
          </button>
        </div>

        {/* Simple stats (dummy) */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>🔥 4 day streak</span>
          <span>Today: 01h 25m</span>
        </div>
      </div>

      {/* ================= PROFILE DROPDOWN ================= */}
      {showProfile && (
        <div className="absolute top-14 left-6 w-64 bg-white rounded-2xl shadow-xl p-4 z-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-sm font-medium text-[#0284C7]">
              S
            </div>
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Shishank</p>
              <p className="text-xs text-gray-500">🔥 4 day streak</p>
            </div>
          </div>

          <div className="border-t my-2" />

          <div className="space-y-1 text-sm">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
              ✏️ Edit Profile
            </button>

            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
              ⚙️ Settings
            </button>

            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
              ℹ️ About
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-500"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN BODY (CHAT APP) ================= */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <ChatPanel />
      </div>

      {/* ================= FOCUS SETUP MODAL ================= */}
      {showFocusSetup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[360px] rounded-2xl p-6 shadow-xl space-y-5">

            <h2 className="text-lg font-semibold text-[#0F172A]">
              Start Study Session
            </h2>

            {/* Duration */}
            <div>
              <p className="text-sm text-gray-500 mb-2">⏱ Duration</p>
              <div className="flex gap-2">
                {[25, 45, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFocusDuration(t)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      focusDuration === t
                        ? "bg-[#0EA5E9] text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {t} min
                  </button>
                ))}

                <input
                  type="number"
                  placeholder="Custom"
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-20 px-2 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <p className="text-sm text-gray-500 mb-2">📘 What are you studying?</p>
              <div className="flex gap-2 flex-wrap">
                {["DSA", "Web", "Exam", "Custom"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFocusSubject(s)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      focusSubject === s
                        ? "bg-[#0EA5E9] text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Group */}
            <div>
              <p className="text-sm text-gray-500 mb-2">👥 Study with</p>
              <div className="flex gap-2 flex-wrap">
                {["Solo", "DSA Group", "MCA Sem 4"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setFocusGroup(g)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      focusGroup === g
                        ? "bg-[#0EA5E9] text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setShowFocusSetup(false)}
                className="text-sm text-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setSecondsLeft(focusDuration * 60);
                  setIsFocusOn(true);
                  setShowFocusSetup(false);
                }}
                className="bg-[#0EA5E9] text-white px-5 py-2 rounded-xl text-sm"
              >
                Start Session
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= FOCUS END MODAL ================= */}
      {showFocusEnd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[340px] rounded-2xl p-6 shadow-xl text-center space-y-5">

            <h2 className="text-lg font-semibold text-[#0F172A]">
              🎉 Session Complete
            </h2>

            <p className="text-sm text-gray-500">
              You studied for {focusDuration} minutes
            </p>

            <div>
              <p className="text-sm mb-2">How was it?</p>
              <div className="flex justify-center gap-4 text-2xl">
                <button>😐</button>
                <button>🙂</button>
                <button>🔥</button>
              </div>
            </div>

            <button
              onClick={() => setShowFocusEnd(false)}
              className="bg-[#0EA5E9] text-white w-full py-2 rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}