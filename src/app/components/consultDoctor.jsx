"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Video, MessageCircle, Clock, Star, ChevronRight,
  CheckCircle, X, Send, ExternalLink, User, Stethoscope, Phone, Wifi, WifiOff,
} from "lucide-react";
import { io } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

// ─── Dummy Doctors ─────────────────────────────────────────────────────────────
const DUMMY_DOCTORS = [
  { id: "dr-001", name: "Arya", specialty: "General Physician", experience: "12 yrs", rating: 4.9, available: true, whatsapp: "+919605644954", slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"], avatar: "AS", color: "from-violet-500 to-purple-600", about: "MBBS, MD – Expert in fever, infections & general health." },
  { id: "dr-002", name: "Viswajith", specialty: "Cardiologist", experience: "8 yrs", rating: 4.8, available: true, whatsapp: "+919072906576", slots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "05:00 PM"], avatar: "SJ", color: "from-cyan-500 to-blue-600", about: "MBBS – General health consultations & preventive care." },
];

const TABS = [
  { id: "book", label: "Book Appointment", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "video", label: "Video Call", icon: Video },
];

// ───────────────────────────────────────────────────────────────────────────────
export default function ConsultDoctor({ theme, user }) {
  const [activeTab, setActiveTab] = useState("book");

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingStep, setBookingStep] = useState("list");
  const [appointments, setAppointments] = useState([]);
  const [booking, setBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Real-time messages state
  const [chatDoctor, setChatDoctor] = useState(DUMMY_DOCTORS[0]);
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Video call state
  const [activeRoom, setActiveRoom] = useState(null);

  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#0d0e11]" : "bg-gray-50";
  const card = isDark ? "bg-[#1b1c21] border-gray-800" : "bg-white border-gray-200";
  const text = isDark ? "text-white" : "text-gray-900";
  const subtext = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-[#0d0e11] border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900";

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const patientName = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "Patient";
  const userId = user?._id || user?.id || "guest";

  // ── Current room ID ───────────────────────────────────────────────────────
  const roomId = `${userId}_${chatDoctor.id}`;

  // ── Socket.io connection ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("receive_message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on("user_typing", ({ senderName, senderType }) => {
      if (senderType === "doctor") {
        setIsTyping(true);
        setTypingName(senderName);
      }
    });

    socket.on("user_stop_typing", () => {
      setIsTyping(false);
      setTypingName("");
    });

    return () => socket.disconnect();
  }, []);

  // ── Join room when doctor changes ─────────────────────────────────────────
  useEffect(() => {
    if (!socketRef.current || !isConnected) return;
    socketRef.current.emit("join_room", { roomId, name: patientName, role: "patient" });

    // Load message history
    axios.get(`${API_BASE_URL}/messages/${roomId}`)
      .then((res) => setChatMessages(res.data))
      .catch(() => setChatMessages([]));
  }, [chatDoctor, isConnected, roomId]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // ── Fetch appointments ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAppointments(res.data))
      .catch(() => {});
  }, [token]);

  const todayStr = new Date().toISOString().split("T")[0];

  // ── Book appointment ──────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setBooking(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/appointments/book`,
        { doctorId: selectedDoctor.id, doctorName: selectedDoctor.name, doctorSpecialty: selectedDoctor.specialty, doctorWhatsapp: selectedDoctor.whatsapp, date: selectedDate, timeSlot: selectedSlot, notes, patientName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const appt = res.data.appointment;
      setBookedAppointment({ ...appt, roomUrl: res.data.roomUrl });
      setAppointments((prev) => [appt, ...prev]);
      setBookingStep("success");
    } catch (err) {
      alert("Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // ── Cancel appointment ────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch { alert("Could not cancel appointment."); }
  };

  // ── Send message via socket ───────────────────────────────────────────────
  const sendMessage = () => {
    if (!messageInput.trim() || !socketRef.current) return;
    socketRef.current.emit("send_message", {
      roomId,
      senderId: userId,
      senderType: "patient",
      senderName: patientName,
      doctorId: chatDoctor.id,
      userId,
      text: messageInput.trim(),
    });
    socketRef.current.emit("stop_typing", { roomId });
    setMessageInput("");
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { roomId, senderName: patientName, senderType: "patient" });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { roomId });
    }, 1500);
  };

  const joinVideoCall = (appt) => { setActiveRoom(appt.roomId); setActiveTab("video"); };

  const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col h-screen w-full ${bg} ${text} transition-colors duration-500 overflow-hidden`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 flex items-center gap-3 ${isDark ? "border-gray-800 bg-[#0d0e11]" : "border-gray-200 bg-white"}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className={`text-lg font-bold ${text}`}>Consult a Doctor</h1>
          <p className={`text-xs ${subtext}`}>Book, message & video call with certified doctors</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className={`flex border-b ${isDark ? "border-gray-800 bg-[#0d0e11]" : "border-gray-200 bg-white"} px-6`}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${isActive ? "border-blue-500 text-blue-500" : `border-transparent ${subtext} hover:text-blue-400`}`}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">

          {/* ══════════ BOOK TAB ══════════ */}
          {activeTab === "book" && (
            <motion.div key="book" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="p-4 sm:p-6 max-w-5xl mx-auto">
              {bookingStep === "list" && (
                <>
                  <h2 className={`text-base font-bold mb-4 ${text}`}>Choose a Doctor</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {DUMMY_DOCTORS.map((doc) => (
                      <motion.div key={doc.id} whileHover={{ y: -4 }}
                        onClick={() => { if (!doc.available) return; setSelectedDoctor(doc); setBookingStep("slots"); }}
                        className={`relative border rounded-2xl p-5 cursor-pointer transition-all ${card} ${doc.available ? "hover:border-blue-500/50" : "opacity-50 cursor-not-allowed"}`}>
                        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.available ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>
                          {doc.available ? "Available" : "Busy"}
                        </span>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg`}>{doc.avatar}</div>
                        <p className={`font-bold text-sm ${text}`}>Dr. {doc.name}</p>
                        <p className={`text-xs ${subtext} mb-1`}>{doc.specialty}</p>
                        <p className={`text-[11px] ${subtext} mb-3`}>{doc.about}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> {doc.rating}</span>
                          <span className={subtext}>{doc.experience}</span>
                        </div>
                        {doc.available && <div className="mt-3 flex items-center gap-1 text-blue-400 text-xs font-semibold">Book Now <ChevronRight className="w-3 h-3" /></div>}
                      </motion.div>
                    ))}
                  </div>
                  {appointments.length > 0 && (
                    <>
                      <h2 className={`text-base font-bold mb-3 ${text}`}>Your Appointments</h2>
                      <div className="space-y-3">
                        {appointments.map((appt) => (
                          <div key={appt._id} className={`border rounded-xl p-4 flex items-center gap-4 ${card}`}>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-400" /></div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm ${text}`}>Dr. {appt.doctorName}</p>
                              <p className={`text-xs ${subtext}`}>{appt.doctorSpecialty} • {appt.date} • {appt.timeSlot}</p>
                              {appt.doctorWhatsapp && (
                                <p className={`text-xs ${subtext} mt-1 flex items-center gap-1`}><Phone className="w-3 h-3 text-emerald-400" /> {appt.doctorWhatsapp}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => joinVideoCall(appt)} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"><Video className="w-3 h-3" /> Join</button>
                              <button onClick={() => handleCancel(appt._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {bookingStep === "slots" && selectedDoctor && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <button onClick={() => { setBookingStep("list"); setSelectedSlot(""); setSelectedDate(""); }} className={`flex items-center gap-1 text-xs ${subtext} hover:text-blue-400 mb-5 transition-colors`}>← Back to doctors</button>
                  <div className={`border rounded-2xl p-5 mb-5 flex items-center gap-4 ${card}`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedDoctor.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>{selectedDoctor.avatar}</div>
                    <div><p className={`font-bold ${text}`}>Dr. {selectedDoctor.name}</p><p className={`text-sm ${subtext}`}>{selectedDoctor.specialty} · {selectedDoctor.experience}</p></div>
                  </div>
                  <div className="mb-5">
                    <label className={`block text-sm font-semibold mb-2 ${text}`}>Select Date</label>
                    <input type="date" min={todayStr} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`border rounded-xl px-4 py-2.5 text-sm w-full sm:w-auto focus:outline-none focus:border-blue-500 ${inputBg}`} />
                  </div>
                  <div className="mb-5">
                    <label className={`block text-sm font-semibold mb-2 ${text}`}>Select Time Slot</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.slots.map((slot) => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedSlot === slot ? "bg-blue-500 text-white border-blue-500" : `${card} ${subtext} hover:border-blue-500/50`}`}>
                          <Clock className="w-3.5 h-3.5" /> {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-2 ${text}`}>Notes (optional)</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe your concern briefly..." className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none ${inputBg}`} />
                  </div>
                  <button disabled={!selectedDate || !selectedSlot} onClick={() => setBookingStep("confirm")} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Review Booking →</button>
                </motion.div>
              )}

              {bookingStep === "confirm" && selectedDoctor && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md">
                  <button onClick={() => setBookingStep("slots")} className={`flex items-center gap-1 text-xs ${subtext} hover:text-blue-400 mb-5 transition-colors`}>← Edit booking</button>
                  <h2 className={`text-base font-bold mb-4 ${text}`}>Confirm Appointment</h2>
                  <div className={`border rounded-2xl p-5 space-y-4 mb-6 ${card}`}>
                    <Row icon={<User className="w-4 h-4 text-blue-400" />} label="Doctor" val={`Dr. ${selectedDoctor.name}`} subtext={subtext} text={text} />
                    <Row icon={<Stethoscope className="w-4 h-4 text-emerald-400" />} label="Specialty" val={selectedDoctor.specialty} subtext={subtext} text={text} />
                    <Row icon={<Calendar className="w-4 h-4 text-purple-400" />} label="Date" val={selectedDate} subtext={subtext} text={text} />
                    <Row icon={<Clock className="w-4 h-4 text-amber-400" />} label="Time" val={selectedSlot} subtext={subtext} text={text} />
                    <Row icon={<Phone className="w-4 h-4 text-rose-400" />} label="WhatsApp" val={selectedDoctor.whatsapp} subtext={subtext} text={text} />
                    {notes && <Row icon={<MessageCircle className="w-4 h-4 text-teal-400" />} label="Notes" val={notes} subtext={subtext} text={text} />}
                  </div>
                  <p className={`text-xs ${subtext} mb-5 leading-relaxed`}>📲 A WhatsApp notification with the video call link will be sent to the doctor upon confirmation.</p>
                  <button onClick={handleBook} disabled={booking} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/30">
                    {booking ? "Booking..." : "✓ Confirm & Notify Doctor"}
                  </button>
                </motion.div>
              )}

              {bookingStep === "success" && bookedAppointment && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center pt-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-10 h-10 text-emerald-400" /></div>
                  <h2 className={`text-xl font-bold mb-2 ${text}`}>Appointment Confirmed!</h2>
                  <p className={`text-sm ${subtext} mb-6`}>Dr. {bookedAppointment.doctorName} has been notified via WhatsApp.</p>
                  <div className={`border rounded-2xl p-5 text-left mb-6 space-y-3 ${card}`}>
                    <p className={`text-sm ${text}`}><span className={subtext}>Date:</span> {bookedAppointment.date}</p>
                    <p className={`text-sm ${text}`}><span className={subtext}>Time:</span> {bookedAppointment.timeSlot}</p>
                    {bookedAppointment.doctorWhatsapp && (
                      <p className={`text-sm ${text} flex items-center gap-1`}><span className={subtext}>WhatsApp:</span> <Phone className="w-3 h-3 text-emerald-400" /> {bookedAppointment.doctorWhatsapp}</p>
                    )}
                    <p className={`text-sm break-all ${text}`}><span className={subtext}>Room:</span>{" "}
                      <a href={`https://meet.jit.si/${bookedAppointment.roomId}#config.prejoinPageEnabled=false&config.lobby.enabled=false`} target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300">Join Video Call <ExternalLink className="w-3 h-3 inline" /></a>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setBookingStep("list"); setSelectedDoctor(null); setSelectedDate(""); setSelectedSlot(""); setNotes(""); setBookedAppointment(null); }} className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm ${card} ${subtext} hover:border-blue-500/50 transition-colors`}>Book Another</button>
                    <button onClick={() => { setActiveRoom(bookedAppointment.roomId); setActiveTab("video"); }} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors"><Video className="w-4 h-4 inline mr-1" /> Join Now</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══════════ MESSAGES TAB ══════════ */}
          {activeTab === "messages" && (
            <motion.div key="messages" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex" style={{ height: "calc(100vh - 136px)" }}>
              {/* Doctor list sidebar */}
              <div className={`w-56 border-r flex-shrink-0 overflow-y-auto scrollbar-hide ${isDark ? "border-gray-800 bg-[#0d0e11]" : "border-gray-200 bg-gray-50"}`}>
                <div className={`flex items-center justify-between px-4 pt-4 pb-2`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${subtext}`}>Doctors</p>
                  <span title={isConnected ? "Connected" : "Disconnected"}>
                    {isConnected
                      ? <Wifi className="w-3 h-3 text-emerald-400" />
                      : <WifiOff className="w-3 h-3 text-red-400" />}
                  </span>
                </div>
                {DUMMY_DOCTORS.filter((d) => d.available).map((doc) => (
                  <button key={doc.id}
                    onClick={() => { setChatDoctor(doc); setChatMessages([]); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${chatDoctor.id === doc.id
                      ? isDark ? "bg-blue-500/10 border-r-2 border-blue-500" : "bg-blue-50 border-r-2 border-blue-500"
                      : isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100"}`}>
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${doc.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{doc.avatar}</div>
                    <div className="text-left min-w-0">
                      <p className={`text-xs font-semibold truncate ${chatDoctor.id === doc.id ? "text-blue-400" : text}`}>Dr. {doc.name}</p>
                      <p className={`text-[10px] truncate ${subtext}`}>{doc.specialty}</p>
                    </div>
                  </button>
                ))}
                {/* Doctor portal link */}
                <div className={`mt-4 mx-3 p-3 rounded-xl border text-center ${card}`}>
                  <p className={`text-[10px] ${subtext} mb-1`}>Are you a doctor?</p>
                  <a href={`/doctor/${chatDoctor.id}`} target="_blank" rel="noreferrer"
                    className="text-[10px] text-blue-400 hover:underline font-semibold">Open Doctor Portal ↗</a>
                </div>
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Chat header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${chatDoctor.color} flex items-center justify-center text-white text-xs font-bold`}>{chatDoctor.avatar}</div>
                    <div>
                      <p className={`text-sm font-bold ${text}`}>Dr. {chatDoctor.name}</p>
                      <p className={`text-xs ${subtext}`}>{chatDoctor.specialty}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {isConnected ? "● Live" : "○ Offline"}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className={`w-10 h-10 mx-auto mb-2 ${subtext}`} />
                        <p className={`text-sm font-semibold ${text}`}>Start the conversation</p>
                        <p className={`text-xs ${subtext}`}>Messages are saved and delivered in real-time</p>
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => {
                    const isPatient = msg.senderType === "patient";
                    return (
                      <div key={msg._id || i} className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isPatient
                          ? "bg-blue-500 text-white rounded-tr-none"
                          : isDark ? "bg-[#1b1c21] border border-gray-800 text-white rounded-tl-none" : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"}`}>
                          {!isPatient && <p className="text-[10px] font-bold text-blue-400 mb-1">Dr. {chatDoctor.name}</p>}
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isPatient ? "text-blue-200" : subtext}`}>{fmt(msg.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className={`rounded-2xl rounded-tl-none px-4 py-3 ${isDark ? "bg-[#1b1c21] border border-gray-800" : "bg-white border border-gray-200"}`}>
                        <p className="text-[10px] font-bold text-blue-400 mb-1">Dr. {chatDoctor.name}</p>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} className="w-2 h-2 rounded-full bg-blue-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`px-4 py-3 border-t flex gap-2 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <input
                    value={messageInput}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={`Message Dr. ${chatDoctor.name}...`}
                    className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${inputBg}`}
                  />
                  <button onClick={sendMessage} disabled={!messageInput.trim() || !isConnected}
                    className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════ VIDEO CALL TAB ══════════ */}
          {activeTab === "video" && (
            <motion.div key="video" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="p-4 sm:p-6 max-w-4xl mx-auto">
              {activeRoom ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><h2 className={`text-base font-bold ${text}`}>Video Call in Progress</h2><p className={`text-xs ${subtext}`}>Room: {activeRoom}</p></div>
                    <div className="flex items-center gap-2">
                       <a href={`https://meet.jit.si/${activeRoom}#config.prejoinPageEnabled=false&config.lobby.enabled=false`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Full Screen
                       </a>
                       <button onClick={() => setActiveRoom(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"><X className="w-3.5 h-3.5" /> End Call</button>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height: "60vh" }}>
                    <iframe
                      src={`https://meet.jit.si/${activeRoom}#userInfo.displayName="${user ? user.firstName : "Patient"}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.lobby.enabled=false`}
                      allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="Medicoz Video Consultation"
                    />
                  </div>
                  <p className={`text-xs ${subtext} text-center`}>🔒 Powered by Jitsi Meet · End-to-end encrypted · No account needed</p>
                </div>
              ) : (
                <div>
                  <h2 className={`text-base font-bold mb-4 ${text}`}>Your Upcoming Video Calls</h2>
                  {appointments.length === 0 ? (
                    <div className={`border rounded-2xl p-10 text-center ${card}`}>
                      <Video className={`w-12 h-12 mx-auto mb-3 ${subtext}`} />
                      <p className={`font-semibold ${text}`}>No appointments yet</p>
                      <p className={`text-sm ${subtext} mb-5`}>Book a consultation to get a video call room link.</p>
                      <button onClick={() => setActiveTab("book")} className="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors">Book Now</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appt) => (
                        <div key={appt._id} className={`border rounded-2xl p-5 flex items-center gap-4 ${card}`}>
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><Video className="w-6 h-6 text-blue-400" /></div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${text}`}>Dr. {appt.doctorName}</p>
                            <p className={`text-xs ${subtext}`}>{appt.doctorSpecialty}</p>
                            <p className={`text-xs ${subtext}`}>{appt.date} · {appt.timeSlot}</p>
                          </div>
                          <button onClick={() => setActiveRoom(appt.roomId)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"><Video className="w-3.5 h-3.5" /> Join Call</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`mt-6 border rounded-2xl p-5 ${card}`}>
                    <p className={`text-sm font-semibold mb-3 ${text}`}>Have a room link?</p>
                    <div className="flex gap-2">
                      <input placeholder="Paste room ID or meeting link..." className={`flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 ${inputBg}`} id="quick-join-input" />
                      <button onClick={() => { const val = document.getElementById("quick-join-input").value.trim(); if (!val) return; const roomId = val.includes("meet.jit.si/") ? val.split("meet.jit.si/")[1] : val; setActiveRoom(roomId); }} className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors">Join</button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ icon, label, val, subtext, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-500/10 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <p className={`text-[10px] uppercase tracking-widest font-bold ${subtext}`}>{label}</p>
        <p className={`text-sm font-semibold ${text}`}>{val}</p>
      </div>
    </div>
  );
}
