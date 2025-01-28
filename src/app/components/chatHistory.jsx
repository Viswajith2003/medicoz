import React, { useState } from "react";
import { BiMessage } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function ChatHistory({ theme }) {
  const chatItems = Array(5).fill({
    title: "Diseases relate he...",
    description: "The main disease related to he...",
    time: "Just now",
  });

  return (
    <div
      className={`w-80 border-l rounded-tl-none rounded-bl-none mr-5 mb-5 mt-5 pt-2 rounded-lg hidden lg:block ${
        theme === "light"
          ? "border-gray-200 bg-white"
          : "border-[#485252] dark:bg-[#131619]"
      }`}
    >
      {/* Header Section */}
      <div className="p-4">
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
            <div className="w-8 h-8 rounded-full bg-teal-400"></div>
          </div>
          <button
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
              className={theme === "light" ? "text-gray-600" : "text-gray-400"}
            >
              24/100
            </span>
            <button
              className={`p-1 rounded hover:text-[#a0a5b7] ${
                theme === "light" ? "text-gray-600" : "text-[#989cae]"
              }`}
            >
              <MdOutlineDelete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Items List */}
      <div className="px-4 space-y-3">
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
                  className="mt-1 rounded border-gray-500 text-emerald-500 focus:ring-emerald-500"
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
      <button className="flex items-center space-x-2 bg-[#80d758] px-20 rounded-lg mt-32 mx-4 py-3 text-black p-2">
        <IoMdAddCircleOutline className="w-7 h-7" />
        <span className="text-xl">New Chat</span>
      </button>
    </div>
  );
}
