"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "../components/ ChatPanel";
import { socket } from "../lib/socket";

export default function DashboardPage() {
  const router = useRouter();

  /* ================= GLOBAL APP STATE ================= */
  const [showProfile, setShowProfile] = useState(false);

  // 🔑 Single source of truth for selected group
  const [activeGroupId, setActiveGroupId] = useState("1");

  /* ================= FOCUS SESSION ================= */
  const [isFocusOn, setIsFocusOn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [customMinutes, setCustomMinutes] = useState<number>(30);

  const [showFocusSetup, setShowFocusSetup] = useState(false);
  const [showFocusEnd, setShowFocusEnd] = useState(false);

  const [focusDuration, setFocusDuration] = useState(25);
  const [focusSubject, setFocusSubject] = useState("DSA");


  useEffect(() => {
  const userId = localStorage.getItem("userId");
  socket.emit("join-user", userId);
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

  /* ================= START FOCUS ================= */
  const startFocus = () => {
    setSecondsLeft(focusDuration * 60);
    setIsFocusOn(true);
    setShowFocusSetup(false);

    // socket.emit("start-focus", {
    //   groupId: activeGroupId,
    //   user: "Shishank",
    //   duration: focusDuration,
    //   subject: focusSubject
    // });
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
    onClick={() => {
      // ✅ अगर focus चल रहा है → End Session
      if (isFocusOn) {
        setIsFocusOn(false);
        setSecondsLeft(0);

        socket.emit("end-focus", {
          groupId: activeGroupId,
          user: "Shishank"
        });

        return;
      }

      // ✅ अगर focus नहीं चल रहा → Open setup modal
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

        <div className="text-sm text-gray-500">
          🔥 4 day streak
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

        {/* 🔥 ChatPanel gets group state from Dashboard */}
        <ChatPanel
          activeGroupId={activeGroupId}
          setActiveGroupId={setActiveGroupId}
        />

      </div>

      {/* ================= FOCUS SETUP ================= */}
      {showFocusSetup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[360px] rounded-xl p-6 space-y-5">

            <h2 className="text-lg font-semibold">Start Study Session</h2>

            <div>
              <p className="text-sm mb-2">Duration</p>
              
              <div className="flex gap-2">
                {[25, 45, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFocusDuration(t)}
                    className={`px-3 py-2 rounded ${
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
  min={1}
  placeholder="Custom"
  value={customMinutes}
  onChange={(e) => setCustomMinutes(Number(e.target.value))}
  className="w-24 px-3 py-2 border rounded-lg text-sm"
  
/>

<button
  onClick={() => setFocusDuration(customMinutes)}
  className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
>
  Set
</button>
              </div>
            </div>

            <div>
              <p className="text-sm mb-2">Subject</p>
              <div className="flex gap-2">
                {["DSA", "Web", "Exam","Self"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFocusSubject(s)}
                    className={`px-3 py-2 rounded ${
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

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowFocusSetup(false)}>Cancel</button>
              <button
                onClick={() => {
    setSecondsLeft(focusDuration * 60);
    setIsFocusOn(true);
    setShowFocusSetup(false);

    socket.emit("start-focus", {
      groupId: activeGroupId,
      user: "Shishank",
      duration: focusDuration,
      subject: focusSubject
    });
  }}
                className="bg-[#0EA5E9] text-white px-4 py-2 rounded"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOCUS END ================= */}
      {showFocusEnd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center space-y-4">
            <h2 className="text-lg font-semibold">Session Complete 🎉</h2>
            <p>You studied for {focusDuration} minutes</p>
            <button
              onClick={() => setShowFocusEnd(false)}
              className="bg-[#0EA5E9] text-white px-4 py-2 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}