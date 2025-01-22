"use client";

// pages/index.js
import { useState } from "react";
import Sidebar from "./components/sidebar";
import MainContent from "./components/mainContent";
import ChatHistory from "./components/chatHistory";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");

  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        theme={theme}
        setTheme={setTheme}
      />
      <div
        className={`flex-1 flex ${
          theme === "light" ? "bg-white" : "bg-[#1A1D1F]"
        }`}
      >
        <MainContent theme={theme} />
        <ChatHistory theme={theme} />
      </div>
    </div>
  );
}
