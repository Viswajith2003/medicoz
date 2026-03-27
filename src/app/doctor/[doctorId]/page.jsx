"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Send, Stethoscope, MessageCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

const DOCTORS = {
  "dr-001": { name: "Ananya Sharma", specialty: "General Physician", avatar: "AS", color: "from-violet-500 to-purple-600" },
  "dr-002": { name: "Vipinjith", specialty: "Cardiologist", avatar: "VP", color: "from-rose-500 to-red-600" },
  "dr-003": { name: "Priya Nair", specialty: "Dermatologist", avatar: "PN", color: "from-emerald-500 to-teal-600" },
  "dr-005": { name: "Divya Patel", specialty: "Neurologist", avatar: "DP", color: "from-amber-500 to-orange-600" },
  "dr-006": { name: "Sajith", specialty: "General Physician", avatar: "SJ", color: "from-cyan-500 to-blue-600" },
};

export default function DoctorPortal({ params }) {
  const doctorId = params?.doctorId || "dr-006";
  const doctor = DOCTORS[doctorId] || { name: "Doctor", specialty: "", avatar: "DR", color: "from-blue-500 to-indigo-600" };

  const [rooms, setRooms] = useState([]); // list of patient room IDs this doctor has
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ── Connect socket ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user_typing", ({ senderName, senderType }) => {
      if (senderType === "patient") setIsTyping(true);
    });

    socket.on("user_stop_typing", () => setIsTyping(false));

    return () => socket.disconnect();
  }, []);

  // ── Load rooms (unique patient sessions for this doctor) ──────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/messages/rooms/${doctorId}`)
      .then((r) => r.json())
      .then((data) => setRooms(data || []))
      .catch(() => setRooms([]));
  }, [doctorId]);

  // ── Join room ─────────────────────────────────────────────────────────────
  const joinRoom = (roomId) => {
    setActiveRoom(roomId);
    socketRef.current?.emit("join_room", { roomId, name: `Dr. ${doctor.name}`, role: "doctor" });
    fetch(`${API_BASE_URL}/messages/${roomId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data || []))
      .catch(() => setMessages([]));
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!input.trim() || !activeRoom || !socketRef.current) return;
    const [userId] = activeRoom.split("_");
    socketRef.current.emit("send_message", {
      roomId: activeRoom,
      senderId: doctorId,
      senderType: "doctor",
      senderName: `Dr. ${doctor.name}`,
      doctorId,
      userId,
      text: input.trim(),
    });
    socketRef.current.emit("stop_typing", { roomId: activeRoom });
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current || !activeRoom) return;
    socketRef.current.emit("typing", { roomId: activeRoom, senderName: `Dr. ${doctor.name}`, senderType: "doctor" });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socketRef.current?.emit("stop_typing", { roomId: activeRoom }), 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-screen bg-[#0d0e11] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-800 flex flex-col bg-[#0d0e11]">
        {/* Doctor header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${doctor.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {doctor.avatar}
            </div>
            <div>
              <p className="font-bold text-white">Dr. {doctor.name}</p>
              <p className="text-xs text-gray-400">{doctor.specialty}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${isConnected ? "text-emerald-400" : "text-red-400"}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`} />
            {isConnected ? "Connected" : "Connecting..."}
          </div>
        </div>

        {/* Patient rooms */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2 mb-3">Patient Chats</p>

          {rooms.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">No patient messages yet</p>
              <p className="text-[10px] text-gray-600 mt-1">Messages will appear here when patients write to you</p>
            </div>
          )}

          {rooms.map((room) => (
            <button key={room.roomId}
              onClick={() => joinRoom(room.roomId)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all ${activeRoom === room.roomId ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-gray-800/50"}`}>
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                {room.patientName?.[0] || "P"}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-white truncate">{room.patientName || "Patient"}</p>
                <p className="text-[10px] text-gray-500 truncate">{room.lastMessage || "No messages yet"}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Manual room join */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-[10px] text-gray-500 mb-2">Enter patient room ID manually:</p>
          <div className="flex gap-2">
            <input
              id="manual-room"
              placeholder="userId_doctorId"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                const val = document.getElementById("manual-room").value.trim();
                if (val) joinRoom(val);
              }}
              className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
            >Join</button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeRoom ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0d0e11]">
              <div>
                <p className="font-bold text-white">Patient Chat</p>
                <p className="text-xs text-gray-500">Room: {activeRoom}</p>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400 font-semibold">Doctor View</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-hide">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-semibold text-gray-400">No messages yet</p>
                    <p className="text-xs text-gray-600">The patient's messages will appear here</p>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => {
                const isDoctor = msg.senderType === "doctor";
                return (
                  <div key={msg._id || i} className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isDoctor ? "bg-blue-500 text-white rounded-tr-none" : "bg-[#1b1c21] border border-gray-800 text-white rounded-tl-none"}`}>
                      {!isDoctor && <p className="text-[10px] font-bold text-emerald-400 mb-1">{msg.senderName || "Patient"}</p>}
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isDoctor ? "text-blue-200" : "text-gray-500"}`}>{fmt(msg.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1b1c21] border border-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">Patient</p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} className="w-2 h-2 rounded-full bg-gray-400" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
              <input
                value={input}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Reply to patient..."
                className="flex-1 bg-[#1b1c21] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button onClick={sendMessage} disabled={!input.trim() || !isConnected}
                className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${doctor.color} flex items-center justify-center mx-auto mb-5 shadow-2xl text-white font-bold text-2xl`}>{doctor.avatar}</div>
              <h1 className="text-xl font-bold text-white mb-2">Welcome, Dr. {doctor.name}</h1>
              <p className="text-gray-400 text-sm mb-6">Select a patient conversation from the left,<br />or wait for a new message.</p>
              <p className="text-xs text-gray-600">Share your portal link with patients:<br />
                <span className="text-blue-400 font-mono">/doctor/{doctorId}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
