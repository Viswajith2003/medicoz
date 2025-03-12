"use client";
import React, { useState } from "react";
import { BiMessage } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import SharePopup from "./share.jsx"; // Import the new SharePopup component
import { Search as SearchIcon } from "lucide-react";

export default function ChatHistory({ theme, openChat, setShowWelcome }) {
  // Updated chat items with medical field topics and better headings
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
  ];

  const [chatItems, setChatItems] = useState(
    chatItemsData.map((item, index) => ({
      ...item,
      id: `chat-item-${index + 1}`,
    }))
  );
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false); // State to control share popup

  const handleDeleteChat = () => {
    setChatItems((prevItems) =>
      prevItems.filter((item, index) => !item.checked)
    );
  };

  const handleCheckboxChange = (index) => {
    setChatItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Open share popup
  const openSharePopup = () => {
    setIsSharePopupOpen(true);
  };

  // Close share popup
  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  return (
    <>
      <div
        className={`w-80 border-l rounded-tl-none rounded-bl-none pt-2 rounded-lg lg:block ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-[#485252] dark:bg-[#131619]"
        }`}
      >
        {/* Header Section */}
        <div className="p-4 ">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {/* <BiMessage className="w-8 h-8 text-gray-400 hover:text-gray-300" /> */}
                <span
                  className={
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }
                ></span>
              </div>
              <img src="/profile.png" alt="M" className="h-8 w-8" />
              <div className="flex items-center border border-[#666363] rounded-lg ">
                <SearchIcon className="w-5 h-5 text-[#706c6c] mx-2" />
                <input
                  type="search"
                  // value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="bg-transparent w-24 px-2 py-1 text-white focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={openSharePopup} // Add the onClick handler
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                theme === "light"
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#a4a9ad] text-black hover:bg-[#bcc2c9]"
              } transition-colors`}
            >
              Share
            </button>
          </div>
          <hr
            className={`${
              theme === "light" ? "border-gray-200" : "border-[#565858]"
            } mb-5`}
          />

          {/* Chat History Header */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={theme === "light" ? "text-gray-600" : "text-gray-400"}
            >
              Chat history
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }
              >
                {chatItems.length}/100
              </span>
              <button
                className={`p-1 rounded hover:text-[#a0a5b7] ${
                  theme === "light" ? "text-gray-600" : "text-[#989cae]"
                }`}
                onClick={handleDeleteChat}
              >
                <MdOutlineDelete className=" w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Items List */}
        <div className="Itmes px-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {chatItems.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                theme === "light"
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-[#1E2124] hover:bg-[#23262A]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={chat.checked || false}
                    onChange={() =>
                      handleCheckboxChange(chatItems.indexOf(chat))
                    }
                    className="mt-1 w-4 h-4 rounded border-gray-500 text-emerald-500 focus:ring-emerald-500 bg-transparent"
                  />
                  <div>
                    <h3
                      className={`text-sm font-medium mb-1 ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {chat.name}
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {chat.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {chat.time}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div
          className={`btnDiv ${
            theme === "light" ? "bg-white" : "bg-[#1E2124]"
          }`}
        >
          <button
            // onClick={() => {
            //   openChat();
            //   setShowWelcome(true);
            // }}
            className="flex items-center space-x-2 bg-[#80d758] px-20 rounded-lg mt-32 mx-4 py-3 text-black p-2 fixed bottom-8 right-4 "
          >
            <IoMdAddCircleOutline className="w-7 h-7" />
            <span className="text-xl">New Chat</span>
          </button>
        </div>
      </div>

      {/* Render the SharePopup component */}
      <SharePopup
        isOpen={isSharePopupOpen}
        onClose={closeSharePopup}
        theme={theme}
      />
    </>
  );
}
