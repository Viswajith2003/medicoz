"use client";
import React, { useState } from "react";
import { BiMessage } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import chatItemsData from "../DATA/data";
import SharePopup from "./share.jsx"; // Import the new SharePopup component

export default function ChatHistory({ theme, openChat, setShowWelcome }) {
  const [chatItems, setChatItems] = useState(chatItemsData);
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
                <BiMessage className="w-8 h-8 text-gray-400 hover:text-gray-300" />
                <span
                  className={
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }
                ></span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#18aaff]"></div>
            </div>
            <button
              onClick={openSharePopup} // Add the onClick handler
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                theme === "light"
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#dadee1] text-black hover:bg-[#bcc2c9]"
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
                <MdOutlineDelete className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Items List */}
        <div className="Itmes px-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {chatItems.map((chat, index) => (
            <div
              key={index}
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
                    onChange={() => handleCheckboxChange(index)}
                    className="mt-1 w-4 h-4 rounded border-gray-500 text-emerald-500 focus:ring-emerald-500 bg-transparent"
                  />
                  <div>
                    <h3
                      className={`text-sm font-medium mb-1 ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {chat.title}
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
