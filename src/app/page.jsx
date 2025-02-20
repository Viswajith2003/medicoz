"use client";
import { useState } from "react";
import Sidebar from "./components/sidebar";
import MainContent from "./components/mainContent";
import ChatHistory from "./components/chatHistory";
import AuthPage from "./components/AuthForm";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  return isAuthenticated ? (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        theme={theme}
        setTheme={setTheme}
      />
      <div className="flex-1 flex bg-[#050505]">
        <MainContent theme={theme} showChat={isChatOpen} />{" "}
        <ChatHistory theme={theme} openChat={() => setIsChatOpen(true)} />{" "}
      </div>
    </div>
  ) : (
    <div>
      <AuthPage onSignIn={handleSignIn} />
    </div>
  );
}
