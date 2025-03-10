"use client";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import MainContent from "./components/mainContent";
import ChatHistory from "./components/chatHistory";
import AuthPage from "./components/AuthForm";
import { FaPowerOff } from "react-icons/fa";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(token !== null);
    setLoading(false); // ✅ Ensure loading is false after checking token
  }, []);

  const handleSignIn = () => {
    localStorage.setItem("token", "yourAuthToken");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // ✅ Show loading screen until token is checked
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex bg-[#050505]">
        <MainContent theme={theme} showChat={isChatOpen} />
        <ChatHistory theme={theme} openChat={() => setIsChatOpen(true)} />
      </div>
    </div>
  ) : (
    <AuthPage onSignIn={handleSignIn} />
  );
}
