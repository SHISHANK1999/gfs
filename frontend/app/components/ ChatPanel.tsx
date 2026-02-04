"use client";
import { useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";

/* ================= TYPES ================= */

type Message = {
  _id?: string;
  id?: string; // old support
  sender: string;
  senderId?: string;
  text?: string;
  time: string;
  fileUrl?: string | null;
  fileName?: string;
   isMine?: boolean;
};

type Group = {
  _id: string;
  name: string;
};

type Member = {
  _id: string;
  name?: string;
  phoneNumber: string;
};

/* ================= COMPONENT ================= */
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId; // ✅ तुम backend में यही भेज रहे हो
  } catch (err) {
    return null;
  }
};

export default function ChatPanel() {

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const senderId = getUserIdFromToken();
  const senderName = "Shishank";

  /* ===== Groups ===== */
 const [groups, setGroups] = useState<Group[]>([]);

 useEffect(() => {
  const fetchGroups = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5001/api/groups", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    const realGroups = (data.groups || []).map((g: any) => ({
      id: g._id,
      name: g.name
    }));

    setGroups(realGroups);

     if (realGroups.length > 0) {
      setActiveGroupId(realGroups[0]._id);
      fetchMessages(realGroups[0]._id);
    }
  };

  fetchGroups();
}, []);

const createGroup = async (name: string) => {
   if (creatingGroup) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5001/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Group create failed");
      return;
    }

    // ✅ add new group instantly in sidebar
    setGroups((prev) => [data.group, ...prev]);

    // ✅ auto open that group
    setActiveGroupId(data.group._id);
  } catch (err) {
    console.log("Create group error:", err);
  }finally {
    setCreatingGroup(false);
  }
};


const [activeGroupId, setActiveGroupId] = useState<string>("");
  useEffect(() => {
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      const realGroups = (data.groups || []).map((g: any) => ({
        id: g._id,
        name: g.name
      }));

      setGroups(realGroups);

      // ✅ default first group select
      if (realGroups.length > 0) {
        setActiveGroupId(realGroups[0].id);
      }
    } catch (err) {
      console.log("Fetch groups error:", err);
    }
  };

  fetchGroups();
}, []);

 /* ===== CHAT STATE ===== */

  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitePhone, setInvitePhone] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

 /* ===== CONTEXT MENU ===== */
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileUrl: string;
    fileName?: string;
     } | null>(null);

const activeGroup = groups.find((g: any) => (g._id || g.id) === activeGroupId);

  /* ================= SOCKET ================= */

// ✅ Join active group room
useEffect(() => {
  if (!activeGroupId) return;
  socket.emit("join-group", activeGroupId);
}, [activeGroupId]);

// ✅ Receive messages + Unread count
useEffect(() => {
  const handleReceive = ({ groupId, message }: any) => {
    const incomingId = message?._id || message?.id;

    setMessages((prev) => {
      const oldMessages = prev[groupId] || [];

      // ✅ Duplicate check
      const alreadyExists = oldMessages.some((m: any) => {
        const oldId = m?._id || m?.id;
        return oldId && incomingId && oldId === incomingId;
      });

      // ✅ agar message already hai to kuch mat karo
      if (alreadyExists) return prev;

      // ✅ new message add
      return {
        ...prev,
        [groupId]: [...oldMessages, message]
      };
    });

    // ✅ unread increase ONLY when new msg actually came + other group
    if (groupId !== activeGroupId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] || 0) + 1
      }));
    }
  };

  socket.on("receive-message", handleReceive);

  return () => {
    socket.off("receive-message", handleReceive);
  };
}, [activeGroupId]);

useEffect(() => {
  const handleFocusStarted = (data: any) => {
        console.log("✅ focus-started received:", data);
    alert(
      `🔥 Focus Started!\n\n${data.user} started ${data.subject} for ${data.duration} min`
    );
  };

  socket.on("focus-started", handleFocusStarted);

  return () => {
    socket.off("focus-started", handleFocusStarted);
  };
}, []);

useEffect(() => {
  const handleReceive = ({ groupId, message }: any) => {
    const fixedMsg = {
      ...message,
      isMine: message.senderName === senderName || message.sender === "You"
    };

    setMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), fixedMsg]
    }));
  };

  socket.on("receive-message", handleReceive);

  return () => {
    socket.off("receive-message", handleReceive);
  };
}, []);

useEffect(() => {
  const handleNotify = ({ groupId, text }: { groupId: string; text: string }) => {
    if (groupId !== activeGroupId) {
      alert("🔔 " + text);
    }
  };

  socket.on("notify", handleNotify);

  return () => {
    socket.off("notify", handleNotify);
  };
}, [activeGroupId]);


  /* ================= HELPERS ================= */
// const createGroup = async (name: string) => {
//   const token = localStorage.getItem("token");

//   const res = await fetch("http://localhost:5001/api/groups/create", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`
//     },
//     body: JSON.stringify({ name })
//   });

//   const data = await res.json();

//   if (!data.success) {
//     alert(data.message || "Group create failed");
//     return null;
//   }

//   return {
//     id: data.group._id,
//     name: data.group.name
//   };
// };
  // Upload file to backend
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

  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [activeGroupId, messages[activeGroupId]?.length]);

  // Fetch group members
  useEffect(() => {
  fetchGroups();
}, []); 

  const fetchGroups = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5001/api/groups", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!data.success) {
      console.log("Fetch groups failed:", data.message);
      return;
    }

    setGroups(data.groups || []);

    // ✅ auto-select first group
    if (data.groups?.length > 0) {
  const firstGroupId = data.groups[0]._id;

  setActiveGroupId(firstGroupId);

  // ✅ group set होते ही messages भी load करा दो
  fetchMessages(firstGroupId);
}
  } catch (err) {
    console.log("Fetch groups error:", err);
  }
};

  const API_BASE = "http://localhost:5001";
const token = () => localStorage.getItem("token");

const fetchMembers = async (groupId: string) => {
  try {
    setLoadingMembers(true);

    const res = await fetch(`${API_BASE}/api/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token()}` }
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to load members");
      return;
    }

    setMembers(data.members || []);
  } catch (err) {
    console.log(err);
    alert("Failed to load members");
  } finally {
    setLoadingMembers(false);
  }
};

// Delete group
const deleteGroup = async () => {
  const confirmDelete = confirm("Are you sure you want to delete this group?");
  if (!confirmDelete) return;

  const res = await fetch(`${API_BASE}/api/groups/${activeGroupId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token()}`
    }
  });

  const data = await res.json();

  if (!data.success) {
  alert(data.message || "Delete failed");
  return;
}

setGroups((prev) => prev.filter((g) => g._id !== activeGroupId));
setActiveGroupId("");

// if (activeGroupId === groupId) {
//   setActiveGroupId("");
// }

await fetchGroups();

alert("✅ Group deleted");

  // UI update
  setGroups((prev) => prev.filter((g) => g._id !== activeGroupId));
  setActiveGroupId((prev) => {
    const remaining = groups.filter((g) => g._id !== prev);
    return remaining.length > 0 ? remaining[0]._id : "";
  });

  setShowGroupMenu(false);
};

const inviteMember = async () => {
  if (!invitePhone.trim()) return alert("Enter phone number");

  const res = await fetch(`${API_BASE}/api/groups/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`
    },
    body: JSON.stringify({
      groupId: activeGroupId,
      phoneNumber: invitePhone.trim()
    })
  });

  const data = await res.json();

  if (!data.success) {
    alert(data.message || "Invite failed");
    return;
  }

  alert("✅ Member added");
  setInvitePhone("");
  fetchMembers(activeGroupId);
};

// Delete message
const handleDeleteMessage = async (msg: Message) => {
  const messageId = msg._id || msg.id;
  if (!messageId) return;

  const ok = confirm("Delete this message?");
  if (!ok) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5001/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Delete failed");
      return;
    }

    // ✅ remove locally
    setMessages((prev) => ({
      ...prev,
      [activeGroupId]: (prev[activeGroupId] || []).filter(
        (m) => (m._id || m.id) !== messageId
      )
    }));

    // ✅ realtime delete
    socket.emit("delete-message", {
      groupId: activeGroupId,
      messageId
    });
  } catch (err) {
    console.log("Delete message error:", err);
  }
};

// Remove member from group
const removeMember = async (userId: string) => {
  const res = await fetch(`${API_BASE}/api/groups/remove-member`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`
    },
    body: JSON.stringify({
      groupId: activeGroupId,
      userId
    })
  });

  // Fetch messages for a group
  const fetchMessages = async (groupId: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5001/api/messages/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!data.success) return;

  const mapped = (data.messages || []).map((m: any) => ({
    id: m._id,
    sender: m.senderName || "User",
    text: m.text,
    time: new Date(m.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    fileUrl: m.fileUrl,
    fileName: m.fileName
  }));

  setMessages((prev) => {
  const oldMessages = prev[groupId] || [];

  // ✅ new list from api
  const newMessages = mapped;

  const merged = [...oldMessages];

  newMessages.forEach((nm: any) => {
    const nmId = nm._id || nm.id;
    const exists = merged.some((om: any) => {
      const omId = om._id || om.id;
      return omId && nmId && omId === nmId;
    });

    if (!exists) merged.push(nm);
  });

  return {
    ...prev,
    [groupId]: merged
  };
});
};

  const data = await res.json();

  if (!data.success) {
    alert(data.message || "Remove failed");
    return;
  }

  alert("✅ Member removed");
  fetchMembers(activeGroupId);
};

  // Check if file is image
  const isImage = (fileName?: string) => {
    if (!fileName) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  // Fetch messages for a group
  const fetchMessages = async (groupId: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5001/api/messages/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  setMessages((prev) => ({
    ...prev,
    [groupId]: (data.messages || []).map((m: any) => ({
      id: m._id,
      sender: m.senderName || "User",
      senderId: m.senderId,
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      fileUrl: m.fileUrl,
      fileName: m.fileName
    }))
  }));
};

  /* ================= UI ================= */

  return (
    <div className="flex h-full w-full bg-[#F8FAFC]">

      {/* ===== LEFT: GROUP LIST ===== */}
      <aside className="w-64 bg-white p-4 shadow-[1px_0_0_0_#E0F2FE]">
        <button
  disabled={creatingGroup}
  onClick={() => {
    if (creatingGroup) return;

    const name = prompt("Enter group name");
    if (!name) return;

    createGroup(name);
  }}
  className={`w-full mb-3 py-2 text-sm rounded-lg border border-dashed text-gray-500 hover:bg-gray-50 ${
    creatingGroup ? "opacity-60 cursor-not-allowed" : ""
  }`}
>
  {creatingGroup ? "Creating..." : "+ New Group"}
</button>

        <ul className="space-y-1 text-sm">
       {groups.map((group, index) => (
  <li
    key={group._id || `${group.name}-${index}`}
    onClick={() => {
      setActiveGroupId(group._id);
      fetchMessages(group._id);

      // ✅ unread reset when opening the group
      setUnreadCounts((prev) => ({
        ...prev,
        [group._id]: 0
      }));
    }}
    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${
      activeGroupId === group._id
        ? "bg-[#E0F2FE] text-[#0369A1] font-medium"
        : "hover:bg-gray-100"
    }`}
  >
    <span className="truncate">📘 {group.name}</span>

    {/* ✅ UNREAD BADGE */}
    {unreadCounts[group._id] > 0 && (
      <span className="min-w-[22px] h-[22px] px-2 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
        {unreadCounts[group._id]}
      </span>
    )}
  </li>
))}
        </ul>
      </aside>

      {/* ===== RIGHT: CHAT ===== */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE]">

        {/* Header */}
       <div className="h-12 bg-white flex items-center justify-between px-6 text-sm font-medium shadow-sm">
  <span>📘 {activeGroup?.name}</span>

  <div className="relative">
    <button
      onClick={() => setShowGroupMenu((p) => !p)}
      className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg"
    >
      ⋯
    </button>

    {showGroupMenu && (
      <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border text-sm overflow-hidden z-50">
        <button
          onClick={() => {
            setShowGroupMenu(false);
            setShowGroupDetails(true);
            fetchMembers(activeGroupId);
          }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          👥 Group Details
        </button>
        <button
  onClick={deleteGroup}
  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
>
  🗑 Delete Group
</button>
      </div>
    )}
  </div>
</div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm">

          {(messages[activeGroupId] || []).map((msg, idx) => (
            <div
              key={`${msg._id || msg.id}-${idx}`}
              className={`flex ${
                msg.sender === "You" ? "justify-end" : "items-start gap-2"
              }`}
            >
              {msg.sender !== "You" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                  
                  {msg.sender?.[0] || "?"}
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
                {/* ✅ Delete button (text + file both) */}
{msg.senderId && senderId && msg.senderId === senderId && (
  <button
    onClick={() => handleDeleteMessage(msg)}
    className="mt-2 text-[10px] text-red-500 hover:underline"
  >
    Delete
  </button>
)}

                {/* FILE / IMAGE */}
                {msg.fileUrl && (
                  <div className="mt-2">
                    {isImage(msg.fileName) ? (
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
                          <span className="text-xs truncate">
                            {msg.fileName}
                          </span>
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

        
        <div ref={bottomRef} />
        </div>

        {/* ===== INPUT ===== */}
        <div className="bg-white px-6 py-3 shadow-[0_-1px_0_0_#E5E7EB]">
          
          {selectedFile && (
            <div className="flex items-center justify-between bg-[#E0F2FE] px-3 py-2 rounded-lg mb-2">
              <span className="text-xs truncate">📎 {selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)}>✕</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="cursor-pointer text-xl">
              📎
              <input type="file" hidden onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }} />
            </label>

            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm"
              placeholder="Type a message"
            />

            <button
              onClick={async () => {
                if (!chatInput && !selectedFile) return;

                let fileUrl = null;
                if (selectedFile) fileUrl = await uploadFile(selectedFile);

                // const newMsg: any = {
                //   id: crypto.randomUUID(),
                //   sender: "you",
                //   // senderId: senderId,
                //   senderName: Shishank,
                //   text: chatInput,
                //   time: new Date().toLocaleTimeString([], {
                //     hour: "2-digit",
                //     minute: "2-digit"
                //   }),
                //   fileUrl,
                //   fileName: selectedFile?.name
                //    token: localStorage.getItem("token")
                // };
                const newMsg: any = {
  id: crypto.randomUUID(),
  senderId: senderId, 
  senderName: senderName, 
  sender: senderName,
  text: chatInput,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  fileUrl,
  fileName: selectedFile?.name,
   isMine: true,
  token: localStorage.getItem("token")
};

              socket.emit("send-message", {
                groupId: activeGroupId,
                message: newMsg
               });

                setChatInput("");
                setSelectedFile(null);
              }}
              className="text-[#0EA5E9]"
            >
              Send
            </button>
          </div>
        </div>

      </main>

      {/* ===== RIGHT CLICK MENU ===== */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-white rounded-xl shadow-lg border text-sm z-50 w-40"
          onMouseLeave={() => setContextMenu(null)}
        >
          <a href={contextMenu.fileUrl} target="_blank" className="block px-4 py-2 hover:bg-gray-100">
            🖼 View
          </a>
          <a
            href={`http://localhost:5001/api/download/${contextMenu.fileUrl.split("/").pop()}`}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            ⬇️ Download
          </a>
          <div className="px-4 py-2 text-xs text-gray-500">{contextMenu.fileName}</div>
        </div>
      )}

      {showGroupDetails && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-[420px] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0F172A]">👥 Group Details</h2>
        
        {/* <button
          onClick={() => setShowGroupDetails(false)}
          className="text-gray-500 hover:text-black"
        >
          ✕
        </button> */}
      </div>

      {/* Group name */}
      <div className="bg-[#F8FAFC] border rounded-xl p-4">
        <p className="text-sm text-gray-500">Group</p>
        <p className="text-base font-semibold text-[#0F172A]">
          {activeGroup?.name}
        </p>
      </div>

      {/* Invite */}
      <div>
        <p className="text-sm font-medium text-[#0F172A] mb-2">
          Invite Member (Phone)
        </p>

        <div className="flex gap-2">
          <input
            value={invitePhone}
            onChange={(e) => setInvitePhone(e.target.value)}
            placeholder="Enter phone number"
            className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
          />
          <button
            onClick={inviteMember}
            className="bg-[#0EA5E9] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#0284C7]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Members */}
      <div>
        <p className="text-sm font-medium text-[#0F172A] mb-2">Members</p>

        {loadingMembers ? (
          <p className="text-sm text-gray-500">Loading members...</p>
        ) : (
          <div className="max-h-52 overflow-y-auto space-y-2">
            {members.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between bg-[#F8FAFC] border rounded-xl px-3 py-2"
              >
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{m.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{m.phoneNumber}</p>
                </div>

                <button
                  onClick={() => removeMember(m._id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}

            {members.length === 0 && (
              <p className="text-xs text-gray-400">No members yet.</p>
            )}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={() => setShowGroupDetails(false)}
          className="px-4 py-2 rounded-xl text-sm bg-gray-100 hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}