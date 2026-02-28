"use client";
import React, { useState, useEffect } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { BiMessage } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { X } from "lucide-react";
import SharePopup from "./share.jsx";
import { Search as SearchIcon } from "lucide-react";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import axios from "axios";

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
      console.log(response);

      if (response.data) {
        // Transform the chat data for UI display
        const transformedChats = response.data.map((chat) => ({
          id: chat._id,
          name: chat.title || "New Chat",
          description:
            chat.messages && chat.messages.length > 0
              ? chat.messages[0].content.substring(0, 50) + "..."
              : "Chat session",
          time: formatTimeAgo(new Date(chat.updatedAt)),
          checked: false,
        }));

        setChatItems(transformedChats);

        // If we have chats but no active chat is selected, select the most recent one
        if (transformedChats.length > 0 && !activeChat) {
          setActiveChat(transformedChats[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setError("Failed to load chat history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format relative time
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 60)
      return diffInMinutes <= 1 ? "just now" : `${diffInMinutes} mins ago`;
    if (diffInHours < 24)
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    if (diffInDays < 7)
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    if (diffInWeeks < 4)
      return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  };

  // Listen for new chat creation events
  useEffect(() => {
    const handleChatCreated = (event) => {
      if (event.detail && event.detail.chatId && event.detail.title) {
        // Add the new chat to the list
        const newChat = {
          id: event.detail.chatId,
          name: event.detail.title,
          description: "New conversation",
          time: "just now",
          checked: false,
        };

        setChatItems((prevItems) => [newChat, ...prevItems]);
        setActiveChat(event.detail.chatId);
        setShowWelcome(false); // Hide welcome screen when a new chat is created
      }
    };

    document.addEventListener("chatCreated", handleChatCreated);

    return () => {
      document.removeEventListener("chatCreated", handleChatCreated);
    };
  }, [setShowWelcome]);

  // Listen for chat update events
  useEffect(() => {
    const handleChatUpdated = (event) => {
      if (event.detail && event.detail.chatId) {
        // Refresh chat history to get the latest data
        fetchChatHistory();
      }
    };

    document.addEventListener("chatUpdated", handleChatUpdated);

    return () => {
      document.removeEventListener("chatUpdated", handleChatUpdated);
    };
  }, []);

  // Toggle chat history visibility
  const toggleChatHistory = () => {
    setIsChatHistoryOpen(!isChatHistoryOpen);
  };

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();

    // Close sidebar automatically on small screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsChatHistoryOpen(false);
      } else {
        setIsChatHistoryOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteChat = async () => {
    const selectedChats = chatItems.filter((item) => item.checked);

    if (selectedChats.length === 0) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }

      // Delete selected chats one by one
      for (const chat of selectedChats) {
        await axios.delete(`${API_BASE_URL}/chat/${chat.id}`, {
          headers: { authorization: `bearer ${token}` },
        });
      }

      // Update UI after deletion
      setChatItems((prevItems) => prevItems.filter((item) => !item.checked));

      // If the active chat was deleted, reset to welcome screen
      if (selectedChats.some((chat) => chat.id === activeChat)) {
        setActiveChat(null);
        setShowWelcome(true);
        const refreshEvent = new CustomEvent("refreshMainContent");
        document.dispatchEvent(refreshEvent);
      }

      // If there are remaining chats, select the first one
      const remainingChats = chatItems.filter((item) => !item.checked);
      if (
        remainingChats.length > 0 &&
        selectedChats.some((chat) => chat.id === activeChat)
      ) {
        setActiveChat(remainingChats[0].id);
        handleOpenChat(remainingChats[0].id);
      }
    } catch (error) {
      console.error("Error deleting chats:", error);
      setError("Failed to delete selected chats. Please try again.");
    }
  };

  const handleCheckboxChange = (index, e) => {
    e.stopPropagation(); // Prevent chat from opening when checking the box
    setChatItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const openSharePopup = () => {
    setIsSharePopupOpen(true);
  };

  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  // Handle opening a specific chat
  const handleOpenChat = (chatId) => {
    setActiveChat(chatId);

    // Dispatch custom event to notify MainContent to load this chat
    const openChatEvent = new CustomEvent("openChatEvent", {
      detail: { chatId },
    });
    document.dispatchEvent(openChatEvent);

    setShowWelcome(false);

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsChatHistoryOpen(false);
    }
  };

  // Handle new chat button click
  const handleNewChatClick = () => {
    // Clear active chat
    setActiveChat(null);

    // Clear previous chat and reset interface
    setShowWelcome(true);

    // Dispatch a custom event that the main content can listen for
    const refreshEvent = new CustomEvent("refreshMainContent", {
      detail: { isNewChat: true },
    });
    document.dispatchEvent(refreshEvent);

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsChatHistoryOpen(false);
    }
  };

  const filteredChatItems = chatItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  // Check if any chats are selected for deletion
  const hasSelectedChats = chatItems.some((item) => item.checked);

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={toggleChatHistory}
        className={`fixed top-5 right-4 z-50 p-3 rounded-full ${
          theme === "light"
            ? "bg-white text-gray-800 shadow-md hover:bg-gray-100"
            : "bg-[#000103] text-white hover:bg-[#23262A]"
        } transition-colors md:hidden`}
      >
        {isChatHistoryOpen ? (
          <X size={20} />
        ) : (
          <TbLayoutSidebarLeftCollapseFilled size={20} />
        )}
      </button>
      {/* Chat History Sidebar */}
      <div
        className={`fixed md:relative top-0 right-0 h-full z-40 transform transition-transform duration-300 ease-in-out ${
          isChatHistoryOpen
            ? "translate-x-0"
            : "translate-x-full md:translate-x-0"
        } ${
          theme === "light" ? "bg-white" : "bg-[#1E2124]"
        } w-3/4 sm:w-2/3 md:w-1/4 lg:w-1/4 flex flex-col shadow-lg md:shadow-none overflow-hidden`}
      >
        {/* Header with search and share button */}
        <div className="p-2 md:p-4 pt-12 md:pt-4 flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
            <FaCircleUser className="w-8 mr-2 h-8 rounded-full text-[#25f3f3]" />
            <div className="flex items-center border border-[#666363] rounded-lg flex-1 md:w-auto">
              <SearchIcon className="w-4 h-4 md:w-5 md:h-5 text-[#706c6c] mx-1 md:mx-2 flex-shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className={`bg-transparent w-full px-1 md:px-2 py-1 text-sm md:text-base ${
                  theme === "light" ? "text-gray-900" : "text-white"
                } focus:outline-none`}
              />
            </div>
          </div>
          <div className="flex space-x-2 w-full md:w-auto">
            {hasSelectedChats && (
              <button
                onClick={handleDeleteChat}
                className={`px-3 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium ${
                  theme === "light"
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-red-800 text-red-200 hover:bg-red-700"
                } transition-colors flex items-center`}
              >
                <MdOutlineDelete className="mr-1" />
                Delete
              </button>
            )}
            <button
              onClick={openSharePopup}
              className={`px-3 md:px-6 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium ${
                theme === "light"
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#a4a9ad] text-black hover:bg-[#bcc2c9]"
              } transition-colors flex-grow md:flex-grow-0`}
            >
              Share
            </button>
          </div>
        </div>
        <hr
          className={`${
            theme === "light" ? "border-gray-200" : "border-[#565858]"
          } mb-3 md:mb-5`}
        />
        {/* Chat items container */}
        <div className="flex-1 px-2 md:px-4 overflow-y-auto pb-20">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 text-red-500 p-4 text-center">
              <p className="text-sm mb-2">{error}</p>
              <button
                onClick={fetchChatHistory}
                className={`px-3 py-1 rounded-lg text-xs ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                }`}
              >
                Retry
              </button>
            </div>
          ) : filteredChatItems.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {filteredChatItems.map((chat, index) => (
                <div
                  key={chat.id}
                  className={`p-2 md:p-4 rounded-lg cursor-pointer transition-colors ${
                    activeChat === chat.id
                      ? theme === "light"
                        ? "bg-gray-200"
                        : "bg-[#2C2F33]"
                      : theme === "light"
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-[#1E2124] hover:bg-[#23262A]"
                  }`}
                  onClick={() => handleOpenChat(chat.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={chat.checked || false}
                      onChange={(e) => handleCheckboxChange(index, e)}
                      className="mt-1 w-3 h-3 md:w-4 md:h-4 rounded border-gray-500 text-emerald-500 focus:ring-emerald-500 bg-transparent flex-shrink-0 mr-1 md:mr-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3
                          className={`text-xs md:text-sm font-medium ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          } truncate max-w-full`}
                        >
                          {chat.name}
                        </h3>
                        <span
                          className={`text-xs hidden sm:block md:block ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          } flex-shrink-0 ml-1`}
                        >
                          {chat.time}
                        </span>
                      </div>
                      <p
                        className={`text-xs hidden sm:block md:block ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        } truncate mt-1`}
                      >
                        {chat.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <BiMessage className="w-8 h-8 mb-2" />
              <p className="text-sm">No chats found</p>
              {!isLoading && (
                <button
                  onClick={handleNewChatClick}
                  className={`mt-4 px-3 py-1 rounded-lg text-xs ${
                    theme === "light" ? "bg-gray-200" : "bg-gray-700"
                  }`}
                >
                  Create New Chat
                </button>
              )}
            </div>
          )}
        </div>
        {/* Fixed new chat button */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${
            theme === "light" ? "bg-white" : "bg-[#1E2124]"
          } p-4 border-t ${
            theme === "light" ? "border-gray-200" : "border-[#565858]"
          } ${isChatHistoryOpen ? "block" : "hidden md:block"}`}
        >
          <button
            onClick={handleNewChatClick}
            className="flex items-center justify-center space-x-1 md:space-x-2 bg-[#80d758] w-full rounded-lg py-2 md:py-3 text-black hover:bg-[#6dc348] transition-colors"
          >
            <IoMdAddCircleOutline className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-sm md:text-base font-medium">New Chat</span>
          </button>
        </div>
      </div>

      <SharePopup
        isOpen={isSharePopupOpen}
        onClose={closeSharePopup}
        theme={theme}
      />
    </>
  );
}
