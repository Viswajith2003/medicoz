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

export default function Sidebar({ isOpen, setIsOpen, theme, setTheme }) {
  const menuItems = [
    { icon: <MessageSquare className="w-5 h-5" />, text: "Chats", count: "48" },
    { icon: <Search className="w-5 h-5" />, text: "Search" },
    { icon: <CreditCard className="w-5 h-5" />, text: "Manage subscription" },
    { icon: <HelpCircle className="w-5 h-5" />, text: "Updates & FAQ" },
    { icon: <Settings className="w-5 h-5" />, text: "Settings" },
  ];

  const chatCategories = [
    { text: "Welcome", count: "48" },
    { text: "UI8 Production", count: "16" },
    { text: "Favorites", count: "8" },
    { text: "Archived", count: "128" },
    { text: "New list" },
  ];

  return (
    <div className="w-64 bg-[#1A1D1F] border-r border-gray-800 flex flex-col">
      <div className="p-4 flex items-center ">
        <img src="/logo.png" alt="M" className="h-8" />
        <span className="ml-2 text-white text-[30px] font-semibold">
          MediCoz
        </span>
      </div>

      <nav className="flex-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="px-4 py-2 flex items-center text-gray-400 hover:bg-gray-800 cursor-pointer"
          >
            {item.icon}
            <span className="ml-3 flex-1">{item.text}</span>
            {item.count && (
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                {item.count}
              </span>
            )}
          </div>
        ))}

        <div className="mt-8">
          <div className="px-4 py-2 flex items-center justify-between text-gray-400">
            <div className="flex items-center">
              <ChevronDown className="w-4 h-4 mr-2" />
              <span>Chat list</span>
            </div>
          </div>
          {chatCategories.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 flex items-center text-gray-400 hover:bg-gray-800 cursor-pointer"
            >
              <span className="flex-1">{item.text}</span>
              {item.count && (
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 overflow-hidden">
            <img src="/placeholder-avatar.png" alt="User" />
          </div>
          <div className="ml-3">
            <div className="text-sm text-white">fasdff</div>
            <div className="text-xs text-gray-400">tam@uxui.net</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 rounded-xl text-gray-400 bg-[#232627]">
          <button
            onClick={() => setTheme("dark")}
            className="flex items-center hover:bg-gray-800 p-2 px-5 rounded-xl bg-[#151719]"
          >
            <Moon className="w-4 h-4 mr-2" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme("light")}
            className="flex items-center hover:bg-gray-800 p-2 px-5 rounded-xl"
          >
            <Sun className="w-4 h-4 mr-2" />
            <span>Light</span>
          </button>
        </div>
      </div>
    </div>
  );
}
