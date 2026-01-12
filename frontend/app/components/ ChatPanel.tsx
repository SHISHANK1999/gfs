"use client";
import { useState } from "react";

type Message = {
  id: number;
  sender: string;
  text?: string;
  time: string;
  fileUrl?: string | null;
  fileName?: string;
};

type Group = {
  id: string;
  name: string;
};


export default function ChatPanel() {
  const [groups, setGroups] = useState<Group[]>([
    { id: "1", name: "DSA Group" },
    { id: "2", name: "MCA Sem 4" },
    { id: "3", name: "Night Focus" }
  ]);

  const [activeGroupId, setActiveGroupId] = useState("1");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileUrl: string;
    fileName?: string;
  } | null>(null);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      { id: 1, sender: "Aman", text: "Let’s start DSA", time: "8:45 PM" },
      { id: 2, sender: "You", text: "Yes 👍", time: "8:46 PM" }
    ],
    "2": [
      { id: 1, sender: "Riya", text: "Sem 4 notes ready?", time: "9:10 PM" }
    ],
    "3": []
  });

  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  /* ================= UPLOAD FILE ================= */
  const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:5001/api/upload", {
    method: "POST",
    body: formData
  });
  
  const data = await res.json();

  return "http://localhost:5001" + data.fileUrl;
};

const isImage = (fileName?: string) => {
  if (!fileName) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
};

  return (
    <div className="flex h-full w-full bg-[#F8FAFC]">

      {/* ===== LEFT: GROUPS ===== */}
      <aside className="w-64 bg-white p-4 shadow-[1px_0_0_0_#E0F2FE]">
        <button
          onClick={() => {
            const name = prompt("Enter group name");
            if (!name) return;
            setGroups([...groups, { id: Date.now().toString(), name }]);
          }}
          className="w-full mb-3 py-2 text-sm rounded-lg border border-dashed text-gray-500 hover:bg-gray-50"
        >
          + New Group
        </button>

        <ul className="space-y-1 text-sm">
          {groups.map((group) => (
            <li
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={`px-3 py-2 rounded-lg cursor-pointer ${
                activeGroupId === group.id
                  ? "bg-[#E0F2FE] text-[#0369A1] font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              📘 {group.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* ===== RIGHT: CHAT ===== */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE]">

        {/* Header */}
        <div className="h-12 bg-white flex items-center px-6 text-sm font-medium shadow-sm">
          📘 {activeGroup?.name}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm w-full">
          {(messages[activeGroupId] || []).map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "You" ? "justify-end" : "items-start gap-2"
              }`}
            >
              {msg.sender !== "You" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                  {msg.sender[0]}
                </div>
              )}

              <div
                className={`px-4 py-2 rounded-2xl max-w-[60%] ${
                  msg.sender === "You"
                    ? "bg-[#E0F2FE] shadow"
                    : "bg-white shadow"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}

                {msg.fileUrl && (
  <div className="mt-2">
   {isImage(msg.fileName) ? (
  <div className="relative inline-block">
    <img
      src={msg.fileUrl}
      className="max-w-[220px] rounded-xl border shadow cursor-pointer"
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({
          x: e.pageX,
          y: e.pageY,
          fileUrl: msg.fileUrl!,
          fileName: msg.fileName
        });
      }}
    />
  </div>
) : (
      <div className="bg-white border rounded-xl px-3 py-2 flex items-center justify-between gap-3 max-w-[240px]">
        <a
          href={msg.fileUrl}
          target="_blank"
          className="flex items-center gap-2 overflow-hidden"
        >
          <span className="text-xl">
            {msg.fileName?.endsWith(".pdf") ? "📄" : "📎"}
          </span>
          <span className="text-xs text-gray-700 truncate">
            {msg.fileName}
          </span>
        </a>

        <a
          href={`http://localhost:5001/api/download/${msg.fileUrl.split("/").pop()}`}
          className="text-xs text-[#0EA5E9] font-medium"
        >
          ⬇️
        </a>
      </div>
    )}
  </div>
)}

                <p className="text-[10px] text-gray-400 mt-1">
                  {msg.sender} · {msg.time}
                </p>
              </div>
            </div>
          ))}

          {(messages[activeGroupId] || []).length === 0 && (
            <p className="text-center text-gray-400 mt-10">
              No messages yet. Start the conversation 🚀
            </p>
          )}
        </div>

        {/* ===== INPUT ===== */}
        <div className="bg-white px-6 py-3 shadow-[0_-1px_0_0_#E5E7EB]">

          {/* FILE PREVIEW */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-[#E0F2FE] px-3 py-2 rounded-lg mb-2">
              <span className="text-xs text-[#0369A1] truncate">
                📎 {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-red-500"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="cursor-pointer text-xl">
              📎
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </label>

            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message"
              className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
            />

            <button
              onClick={async () => {
                if (!chatInput.trim() && !selectedFile) return;

                let fileUrl = null;

                if (selectedFile) {
                  fileUrl = await uploadFile(selectedFile);
                }

                const newMsg: Message = {
  id: Date.now(),
  sender: "You",
  text: chatInput,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }),
  fileUrl,
  fileName: selectedFile?.name
};

                setMessages({
                  ...messages,
                  [activeGroupId]: [
                    ...(messages[activeGroupId] || []),
                    newMsg
                  ]
                });

                setChatInput("");
                setSelectedFile(null);
              }}
              className="text-[#0EA5E9] font-medium"
            >
              Send
            </button>
          </div>
        </div>

      </main>
      {contextMenu && (
  <div
    style={{ top: contextMenu.y, left: contextMenu.x }}
    className="fixed bg-white rounded-xl shadow-lg border text-sm z-50 w-40"
    onMouseLeave={() => setContextMenu(null)}
  >
    <a
      href={contextMenu.fileUrl}
      target="_blank"
      className="block px-4 py-2 hover:bg-gray-100"
    >
      🖼 View
    </a>

    <a
      href={`http://localhost:5001/api/download/${contextMenu.fileUrl.split("/").pop()}`}
      className="block px-4 py-2 hover:bg-gray-100"
    >
      ⬇️ Download
    </a>

    <div className="px-4 py-2 text-xs text-gray-500">
      {contextMenu.fileName}
    </div>
  </div>
)}
    </div>
  );
}