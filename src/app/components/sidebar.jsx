import { useState } from "react";
import {
  MessageSquare,
  Search,
  CreditCard,
  HelpCircle,
  Settings,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const [theme, setTheme] = useState("dark");

  const menuItems = [
    { icon: <MessageSquare className="w-5 h-5" />, text: "Chats" },
    { icon: <Search className="w-5 h-5" />, text: "Search" },
    { icon: <CreditCard className="w-5 h-5" />, text: "Manage subscription" },
    { icon: <HelpCircle className="w-5 h-5" />, text: "Updates & FAQ" },
    { icon: <Settings className="w-5 h-5" />, text: "Settings" },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-[#1A1D1F] border-r border-gray-800 transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 flex items-center">
        <img src="/brainwave-logo.svg" alt="Brainwave" className="h-8" />
        {isOpen && (
          <span className="ml-2 text-white font-semibold">Brainwave</span>
        )}
      </div>

      <nav className="flex-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="px-4 py-3 flex items-center text-gray-400 hover:bg-gray-800 cursor-pointer"
          >
            {item.icon}
            {isOpen && <span className="ml-3">{item.text}</span>}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500" />
          {isOpen && (
            <div className="ml-3">
              <div className="text-sm text-white">User Name</div>
              <div className="text-xs text-gray-400">user@email.com</div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center">
            {theme === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            {isOpen && <span className="ml-2">Dark</span>}
          </div>
          {isOpen && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 hover:bg-gray-800 rounded"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
