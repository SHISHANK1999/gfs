"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "../components/ ChatPanel";
import { socket } from "../lib/socket";

export default function DashboardPage() {
  const router = useRouter();

  /* ================= GLOBAL APP STATE ================= */
  const [showProfile, setShowProfile] = useState(false);

  // ✅ Single source of truth for selected group (ChatPanel + Focus both use this)
  const [activeGroupId, setActiveGroupId] = useState("1");

  /* ================= SUMMARY (STREAK + TODAY) ================= */
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(60);
  const [streakCount, setStreakCount] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);

  /* ================= FOCUS SESSION ================= */
  const [isFocusOn, setIsFocusOn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [showFocusSetup, setShowFocusSetup] = useState(false);
  const [showFocusEnd, setShowFocusEnd] = useState(false);

  const [focusDuration, setFocusDuration] = useState(25);
  const [focusSubject, setFocusSubject] = useState("DSA");

  // ✅ Custom minutes input
  const [customMinutes, setCustomMinutes] = useState<number>(30);

  // ================= TOAST & PROGRESS PULSE =================
  const [toast, setToast] = useState<string | null>(null);
  const [showProgressPulse, setShowProgressPulse] = useState(false);

  /* ================= SOCKET: JOIN USER ================= */
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    socket.emit("join-user", userId);
  }, []);

  /* ================= FETCH TODAY SUMMARY ================= */
  const fetchTodaySummary = async () => {
    try {
      setLoadingSummary(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/summary/today", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!data.success) {
        console.log("Summary fetch failed:", data.message);
        return;
      }

      setTodayMinutes(data.data?.user?.todayStudyMinutes || 0);
      setTargetMinutes(data.data?.user?.dailyStudyTarget || 60);
      setStreakCount(data.data?.user?.streakCount || 0);
    } catch (err) {
      console.log("Summary fetch error:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  /* ================= TIMER ================= */
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

  // ✅ FIXED: renamed showToast() -> triggerToast()
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="relative h-screen flex flex-col bg-[#F8FAFC]">
      {/* ================= FOCUS GLOW ================= */}
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
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium cursor-pointer"
          >
            S
          </div>
          <span className="text-sm font-medium">Shishank</span>
        </div>

        {/* Focus */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            ⏱️ {formatTime(secondsLeft)}
          </span>

          {/* ✅ ONE BUTTON: Start / End */}
          <button
            onClick={async () => {
              // ✅ if session running -> End
              if (isFocusOn) {
                setIsFocusOn(false);
                setSecondsLeft(0);

                socket.emit("end-focus", {
                  groupId: activeGroupId,
                  user: "Shishank"
                });

                await fetchTodaySummary(); // ✅ refresh stats

                // ✅ progress animation trigger
                setShowProgressPulse(true);
                setTimeout(() => setShowProgressPulse(false), 1200);


                triggerToast(`✅ Today +${focusDuration} min added`);

                // ✅ bottom toast
                triggerToast("✅ Focus session ended + stats updated!");

                return;
              }

              // ✅ if not running -> open setup modal
              setShowFocusSetup(true);
            }}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
              isFocusOn
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#0EA5E9] text-white hover:bg-[#0284C7]"
            }`}
          >
            {isFocusOn ? "End Session" : "Start Study"}
          </button>
        </div>

        {/* ===== TODAY PROGRESS + STREAK ===== */}
        <div className="flex items-end gap-4">
          <p className="text-xs text-gray-500">Today</p>

          <div className="text-right">
            <p className="text-sm font-semibold text-[#0F172A]">
              {loadingSummary ? "..." : `${todayMinutes} / ${targetMinutes} min`}
            </p>

            {/* Progress Bar */}
            <div
              className={`w-40 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden ${
                showProgressPulse ? "ring-2 ring-[#0EA5E9]/40" : ""
              }`}
            >
              <div
                className={`h-full bg-[#0EA5E9] transition-all duration-700 ${
                  showProgressPulse ? "animate-pulse" : ""
                }`}
                style={{
                  width: `${Math.min(100, (todayMinutes / targetMinutes) * 100)}%`
                }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 font-medium">
            🔥 {loadingSummary ? "..." : streakCount} day streak
          </div>
        </div>
      </div>

      {/* ================= PROFILE MENU ================= */}
      {showProfile && (
        <div className="absolute top-14 left-6 w-60 bg-white rounded-xl shadow-xl p-4 z-50">
          <p className="text-sm font-medium mb-3">Shishank</p>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="text-sm text-red-500"
          >
            Logout
          </button>
        </div>
      )}

      {/* ================= MAIN BODY ================= */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <ChatPanel
          activeGroupId={activeGroupId}
          setActiveGroupId={setActiveGroupId}
        />
      </div>

      {/* ================= FOCUS SETUP MODAL ================= */}
      {showFocusSetup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl p-6 shadow-xl space-y-6 border">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Start Study Session
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Choose duration and start focus mode
                </p>
              </div>

              <button
                onClick={() => setShowFocusSetup(false)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#0F172A]">⏱ Duration</p>

                <span className="text-xs px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] font-medium">
                  Selected: {focusDuration} min
                </span>
              </div>

              {/* Quick Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[25, 45, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFocusDuration(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                      focusDuration === t
                        ? "bg-[#0EA5E9] text-white border-[#0EA5E9]"
                        : "bg-white text-[#0F172A] border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {t} min
                  </button>
                ))}
              </div>

              {/* Custom Minutes */}
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={1}
                  placeholder="Custom minutes..."
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                />

                <button
                  onClick={() => {
                    if (!customMinutes || customMinutes <= 0) return;
                    setFocusDuration(customMinutes);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
                    focusDuration === customMinutes && customMinutes > 0
                      ? "bg-[#0EA5E9] text-white border-[#0EA5E9]"
                      : "bg-white text-[#0F172A] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Set
                </button>
              </div>

              <p className="text-[11px] text-gray-500">
                Tip: You can set any duration like 10 / 15 / 90 minutes.
              </p>
            </div>

            {/* Subject (Custom Only) */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#0F172A]">📘 Subject</p>
              <input
                value={focusSubject}
                onChange={(e) => setFocusSubject(e.target.value)}
                placeholder="Enter subject (Example: DSA / Project / Exam)"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowFocusSetup(false)}
                className="px-4 py-2 rounded-xl text-sm bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setSecondsLeft(focusDuration * 60);
                  setIsFocusOn(true);
                  setShowFocusSetup(false);

                  socket.emit("start-focus", {
                    groupId: activeGroupId,
                    user: "Shishank",
                    duration: focusDuration,
                    subject: focusSubject || "Study"
                  });
                }}
                className="bg-[#0EA5E9] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#0284C7]"
              >
                Start Focus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOCUS END MODAL ================= */}
      {showFocusEnd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center space-y-4 w-[320px]">
            <h2 className="text-lg font-semibold">Session Complete 🎉</h2>

            <p className="text-sm text-gray-600">
              You studied for <b>{focusDuration}</b> minutes
            </p>

            <button
              onClick={() => setShowFocusEnd(false)}
              className="bg-[#0EA5E9] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0284C7]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ✅ TOAST (bottom) */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

    </div>
  );
}