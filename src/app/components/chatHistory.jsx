"use client";
import React, { useState, useEffect } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { BiMessage } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { X, Search as SearchIcon, MessageSquare, Plus, Share2, Loader2, AlertCircle } from "lucide-react";
import SharePopup from "./share.jsx";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:7000";

export default function ChatHistory({ theme, setShowWelcome }) {
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(true);
  const [chatItems, setChatItems] = useState([]);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [error, setError] = useState(null);

  // Get auth token from localStorage
  const getAuthToken = () => localStorage.getItem("token");

  // Fetch chat history from backend
  const fetchChatHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/chat/user/all`, {
        headers: { authorization: `bearer ${token}` },
      });

      if (response.data) {
        const transformedChats = response.data.map((chat) => ({
          id: chat._id,
          name: chat.title || "New Chat",
          description: chat.messages && chat.messages.length > 0
              ? chat.messages[0].content.substring(0, 50) + "..."
              : "Chat session",
          time: formatTimeAgo(new Date(chat.updatedAt)),
          checked: false,
        }));

        setChatItems(transformedChats);
        if (transformedChats.length > 0 && !activeChat) {
          setActiveChat(transformedChats[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setError("Failed to load conversation history.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) return diffInMinutes <= 1 ? "just now" : `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const handleChatCreated = (event) => {
      if (event.detail && event.detail.chatId && event.detail.title) {
        const newChat = {
          id: event.detail.chatId,
          name: event.detail.title,
          description: "New conversation",
          time: "just now",
          checked: false,
        };

        setChatItems((prevItems) => [newChat, ...prevItems]);
        setActiveChat(event.detail.chatId);
        setShowWelcome(false);
      }
    };

    document.addEventListener("chatCreated", handleChatCreated);
    return () => document.removeEventListener("chatCreated", handleChatCreated);
  }, [setShowWelcome]);

  useEffect(() => {
    const handleChatUpdated = (event) => {
      if (event.detail && event.detail.chatId) fetchChatHistory();
    };

    document.addEventListener("chatUpdated", handleChatUpdated);
    return () => document.removeEventListener("chatUpdated", handleChatUpdated);
  }, []);

  const toggleChatHistory = () => setIsChatHistoryOpen(!isChatHistoryOpen);

  useEffect(() => {
    fetchChatHistory();
    const handleResize = () => {
      setIsChatHistoryOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteChat = async () => {
    const selectedChats = chatItems.filter((item) => item.checked);
    if (selectedChats.length === 0) return;

    try {
      const token = getAuthToken();
      for (const chat of selectedChats) {
        await axios.delete(`${API_BASE_URL}/chat/${chat.id}`, {
          headers: { authorization: `bearer ${token}` },
        });
      }

      setChatItems((prevItems) => prevItems.filter((item) => !item.checked));

      if (selectedChats.some((chat) => chat.id === activeChat)) {
        setActiveChat(null);
        setShowWelcome(true);
        document.dispatchEvent(new CustomEvent("refreshMainContent"));
      }
    } catch (error) {
      console.error("Error deleting chats:", error);
      setError("Deletion failed. Please try again.");
    }
  };

  const handleCheckboxChange = (index, e) => {
    e.stopPropagation();
    setChatItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleOpenChat = (chatId) => {
    setActiveChat(chatId);
    document.dispatchEvent(new CustomEvent("openChatEvent", { detail: { chatId } }));
    setShowWelcome(false);
    if (window.innerWidth < 1024) setIsChatHistoryOpen(false);
  };

  const handleNewChatClick = () => {
    setActiveChat(null);
    setShowWelcome(true);
    document.dispatchEvent(new CustomEvent("refreshMainContent", { detail: { isNewChat: true } }));
    if (window.innerWidth < 1024) setIsChatHistoryOpen(false);
  };

  const filteredChatItems = chatItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const hasSelectedChats = chatItems.some((item) => item.checked);

  return (
    <>
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleChatHistory}
          className={`p-3 rounded-xl shadow-xl border ${
            theme === "light"
              ? "bg-white text-gray-800 border-gray-100"
              : "bg-[#1b1c21] text-white border-gray-800"
          }`}
        >
          {isChatHistoryOpen ? <X size={20} /> : <TbLayoutSidebarLeftCollapseFilled size={20} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isChatHistoryOpen && (
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed md:relative top-0 right-0 h-full z-40 ${
              theme === "light" ? "bg-white border-l border-gray-100 shadow-xl" : "bg-[#0d0e11] border-l border-gray-800"
            } w-[85%] sm:w-[400px] lg:w-1/4 flex flex-col overflow-hidden`}
          >
            <div className="p-6 pt-16 lg:pt-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <FaCircleUser size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold truncate">Clinical Records</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">History Management</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className={`flex items-center flex-1 rounded-xl px-3 py-2 border transition-all ${
                  theme === "light" ? "bg-gray-50 border-gray-200 focus-within:border-blue-500" : "bg-[#1b1c21] border-gray-800 focus-within:border-blue-500/50"
                }`}>
                  <SearchIcon size={16} className="text-gray-500 mr-2" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search history..."
                    className="bg-transparent w-full text-sm outline-none placeholder-gray-500"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSharePopupOpen(true)}
                  className={`p-3 rounded-xl border ${
                    theme === "light" ? "bg-white border-gray-200 text-gray-600" : "bg-[#1b1c21] border-gray-800 text-gray-400"
                  } hover:text-blue-400 transition-colors`}
                >
                  <Share2 size={18} />
                </motion.button>
              </div>

              {hasSelectedChats && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleDeleteChat}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  <MdOutlineDelete size={16} />
                  Delete Selected
                </motion.button>
              )}
            </div>

            <div className="flex-1 px-4 overflow-y-auto pb-24 scrollbar-hide">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500">
                  <Loader2 className="animate-spin" size={24} />
                  <p className="text-xs font-medium italic">Scanning medical library...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <AlertCircle size={32} className="text-red-500/50 mb-3" />
                  <p className="text-xs text-red-500/80 mb-4">{error}</p>
                  <button
                    onClick={fetchChatHistory}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : filteredChatItems.length > 0 ? (
                <motion.div layout className="space-y-3">
                  <AnimatePresence initial={false}>
                    {filteredChatItems.map((chat, index) => (
                      <motion.div
                        key={chat.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ x: 4 }}
                        onClick={() => handleOpenChat(chat.id)}
                        className={`group p-4 rounded-2xl cursor-pointer border transition-all relative ${
                          activeChat === chat.id
                            ? "bg-blue-600/5 border-blue-500/30 ring-1 ring-blue-500/20"
                            : theme === "light"
                            ? "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
                            : "bg-[#1b1c21] border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        {activeChat === chat.id && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-full"
                          />
                        )}
                        <div className="flex items-start gap-3">
                          <div className="relative pt-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={chat.checked || false}
                              onChange={(e) => handleCheckboxChange(index, e)}
                              className="w-4 h-4 rounded-md border-gray-700 bg-[#0d0e11] text-blue-500 focus:ring-blue-500/50 cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h3 className={`text-sm font-bold truncate ${
                                activeChat === chat.id ? "text-blue-400" : "text-gray-200"
                              }`}>
                                {chat.name}
                              </h3>
                              <span className="text-[10px] tabular-nums text-gray-500 whitespace-nowrap">
                                {chat.time}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 italic">
                              {chat.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                  <MessageSquare size={48} className="opacity-10 mb-4" />
                  <p className="text-xs font-medium">No archived conversations</p>
                </div>
              )}
            </div>

            <div className={`p-6 bg-inherit border-t ${
              theme === "light" ? "border-gray-100" : "border-gray-800"
            }`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChatClick}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-2xl text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
              >
                <Plus size={20} />
                <span>Initialize New Chat</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SharePopup
        isOpen={isSharePopupOpen}
        onClose={() => setIsSharePopupOpen(false)}
        theme={theme}
      />
    </>
  );
}
