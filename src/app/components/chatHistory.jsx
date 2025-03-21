"use client";
import React, { useState, useEffect } from "react";
import { BiMessage } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { X } from "lucide-react";
import SharePopup from "./share.jsx";
import { Search as SearchIcon } from "lucide-react";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";

export default function ChatHistory({ theme, openChat, setShowWelcome }) {
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(true);
  const chatItemsData = [
    {
      name: "Oncology Research Review",
      description: "Exploring recent advancements in oncology research",
      time: "2 days ago",
    },
    {
      name: "Diabetes Management Guidelines",
      description: "Patient care protocols for diabetes management",
      time: "5 days ago",
    },
    {
      name: "Cardiovascular Prevention",
      description: "Preventative medicine approaches for cardiovascular health",
      time: "3 weeks ago",
    },
    {
      name: "EHR Systems Analysis",
      description: "Electronic health records systems comparison",
      time: "1 month ago",
    },
    {
      name: "Adolescent Mental Health",
      description: "Mental health treatment protocols for adolescents",
      time: "1 month ago",
    },
    {
      name: "Chronic Pain Management",
      description: "Treatment options for chronic pain patients",
      time: "2 weeks ago",
    },
    {
      name: "Neurology Research Updates",
      description: "New findings in neurology research and their applications",
      time: "1 week ago",
    },
  ];

  const [chatItems, setChatItems] = useState(
    chatItemsData.map((item, index) => ({
      ...item,
      id: `chat-item-${index + 1}`,
    }))
  );
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Toggle chat history visibility
  const toggleChatHistory = () => {
    setIsChatHistoryOpen(!isChatHistoryOpen);
  };

  // Close sidebar automatically on small screens
  useEffect(() => {
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

  const handleDeleteChat = () => {
    setChatItems((prevItems) => prevItems.filter((item) => !item.checked));
  };

  const handleCheckboxChange = (index) => {
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

  const filteredChatItems = chatItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

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
            <img
              src="/profile.png"
              alt="M"
              className="h-6 w-6 md:h-8 md:w-8 mr-2 flex-shrink-0"
            />
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
          <button
            onClick={openSharePopup}
            className={`px-3 md:px-6 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium ${
              theme === "light"
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-[#a4a9ad] text-black hover:bg-[#bcc2c9]"
            } transition-colors w-full md:w-auto`}
          >
            Share
          </button>
        </div>

        <hr
          className={`${
            theme === "light" ? "border-gray-200" : "border-[#565858]"
          } mb-3 md:mb-5`}
        />

        {/* Chat items container */}
        <div className="flex-1 px-2 md:px-4 overflow-y-auto pb-20">
          <div className="space-y-2 md:space-y-3">
            {filteredChatItems.map((chat, index) => (
              <div
                key={chat.id}
                className={`p-2 md:p-4 rounded-lg cursor-pointer transition-colors ${
                  theme === "light"
                    ? "bg-gray-50 hover:bg-gray-100"
                    : "bg-[#1E2124] hover:bg-[#23262A]"
                }`}
                onClick={() => {
                  openChat();
                  setShowWelcome(false);
                  if (window.innerWidth < 768) {
                    setIsChatHistoryOpen(false);
                  }
                }}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={chat.checked || false}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(chatItems.indexOf(chat));
                    }}
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
                          theme === "light" ? "text-gray-600" : "text-gray-400"
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
            onClick={() => {
              openChat();
              setShowWelcome(true);
              if (window.innerWidth < 768) {
                setIsChatHistoryOpen(false);
              }
            }}
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
