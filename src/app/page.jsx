"use client";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import MainContent from "./components/mainContent";
import ChatHistory from "./components/chatHistory";
import AuthPage from "./components/AuthForm";
import ConsultDoctor from "./components/consultDoctor";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [activeView, setActiveView] = useState("chat"); // "chat" | "consult"

  const fetchUserProfile = async (token) => {
    if (!token) {
      console.log("No token found in localStorage");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000"}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user); // Update user data
      } else {
        console.error("API Error:", data.message);
        if (data.message === "Invalid token") {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false); // Ensure loading ends
    }
  };

  const openChat = () => {
    setShowChat(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(token !== null);
    fetchUserProfile(token); // Run on mount

    // Listen for view switch events from sidebar
    const handleSetView = (e) => setActiveView(e.detail.view);
    document.addEventListener("setView", handleSetView);
    return () => document.removeEventListener("setView", handleSetView);
  }, []); // Runs only once on mount

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      fetchUserProfile(token); // Run after login
    }
  }, [isAuthenticated]); // Re-run when isAuthenticated changes

  const handleSignIn = () => {
    setIsAuthenticated(true); // Trigger the second useEffect
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
        user={user}
      />
      <div
        className={`flex h-screen flex-1 relative ${
          theme === "light" ? "bg-gray-50" : "bg-[#131619]"
        }`}
      >
        {activeView === "consult" ? (
          <ConsultDoctor theme={theme} user={user} />
        ) : (
          <>
            {showChat && (
              <MainContent
                theme={theme}
                showWelcome={showWelcome}
                setShowWelcome={setShowWelcome}
              />
            )}
            <ChatHistory
              theme={theme}
              openChat={openChat}
              setShowWelcome={setShowWelcome}
            />
          </>
        )}
      </div>
    </div>
  ) : (
    <AuthPage onSignIn={handleSignIn} />
  );
}
