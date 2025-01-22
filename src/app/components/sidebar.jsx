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
  ChevronUp,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen, theme, setTheme }) {
  const [chatListOpen, setChatListOpen] = useState(true);

  const menuItems = [
    { icon: <MessageSquare className="w-5 h-5" />, text: "Chats", count: null },
    { icon: <Search className="w-5 h-5" />, text: "Search", badge: "⌘F" },
    {
      icon: <CreditCard className="w-5 h-5" />,
      text: "Manage subscription",
      count: null,
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      text: "Updates & FAQ",
      count: null,
    },
    { icon: <Settings className="w-5 h-5" />, text: "Settings", count: null },
  ];

  const chatCategories = [
    { name: "Welcome", count: 48 },
    { name: "UI8 Production", count: 16, color: "bg-purple-500" },
    { name: "Favorites", count: 8, color: "bg-blue-500" },
    { name: "Archived", count: 128, color: "bg-red-500" },
  ];

  const bgColor = theme === "light" ? "bg-white" : "bg-[#1A1D1F]";
  const textColor = theme === "light" ? "text-gray-900" : "text-white";
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-800";

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } ${bgColor} border-r ${borderColor} transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 flex items-center">
        <img src="/brainwave-logo.svg" alt="Brainwave" className="h-8" />
        {isOpen && (
          <span className={`ml-2 font-semibold ${textColor}`}>Brainwave</span>
        )}
      </div>

      <nav className="flex-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`px-4 py-3 flex items-center justify-between ${
              theme === "light"
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-400 hover:bg-gray-800"
            } cursor-pointer`}
          >
            <div className="flex items-center">
              {item.icon}
              {isOpen && <span className="ml-3">{item.text}</span>}
            </div>
            {isOpen && item.badge && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {item.badge}
              </span>
            )}
          </div>
        ))}

        {isOpen && (
          <div className="px-4 py-3">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setChatListOpen(!chatListOpen)}
            >
              <span
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Chat list
              </span>
              {chatListOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>

            {chatListOpen && (
              <div className="mt-2 space-y-1">
                {chatCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          category.color || "bg-gray-400"
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className={`p-4 border-t ${borderColor}`}>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />
          {isOpen && (
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                Tran Mau Tri Tam
              </div>
              <div className="text-xs text-gray-500">tam@ux.net</div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-gray-500">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded"
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            {isOpen && <span>{theme === "dark" ? "Dark" : "Light"}</span>}
          </button>
          {isOpen && (
            <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-600 rounded">
              Free
            </div>
          )}
        </div>
        {isOpen && (
          <div className="mt-4 py-2 text-center text-sm text-gray-600 bg-gray-50 rounded-lg">
            Upgraded to Pro
          </div>
        )}
      </div>
    </div>
  );
}
