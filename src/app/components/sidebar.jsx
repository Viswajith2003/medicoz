import { useState } from "react";
import { FaPowerOff, FaRegCircle } from "react-icons/fa";
import {
  MessageSquare,
  Search as SearchIcon,
  CreditCard,
  HelpCircle,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { IoSquareOutline } from "react-icons/io5";
import { FiTriangle } from "react-icons/fi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { ChevronDown } from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen, theme, setTheme }) {
  const [search, setSearch] = useState("");
  const menuItems = [
    {
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      text: "Chats",
      count: "48",
    },
    {
      icon: (
        <div className="flex items-center">
          <SearchIcon className="w-5 h-5 text-white mr-2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="bg-transparent w-full px-2 py-1 text-white focus:outline-none"
          />
        </div>
      ),
      text: "",
    },
    {
      icon: <CreditCard className="w-5 h-5 text-white" />,
      text: "subscription",
    },
    { icon: <Settings className="w-5 h-5 text-white" />, text: "Settings" },
  ];

  const chatCategories = [
    {
      to: "/",
      name: "Medicine",
      Icon: IoSquareOutline,
      color: "#b6f19d",
    },
    {
      to: "/profile",
      name: "Diseases",
      Icon: FiTriangle,
      color: "#d1402f",
    },
    {
      to: "/dashboard",
      name: "Prescriptions",
      Icon: IoSquareOutline,
      color: "#e26e21",
    },
    {
      to: "/test-components",
      name: "Symptoms",
      Icon: FaRegCircle,
      color: "#82dbf7",
    },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="w-64 bg-[#050505] py-2 pl-2 border-gray-800 flex flex-col">
      <div className="p-5 flex items-center ">
        <img src="/logo.png" alt="M" className="h-12 w-10" />
        <span className="ml-4 text-white text-[24px] font-semibold">
          MediCoz
        </span>
      </div>

      <nav className="flex-1">
        <h1 className="text-[#9c9491f3] mt-5 mb-3 ml-4">General</h1>
        <ul className="list-none pl-4">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="hover:bg-[#262729] w-52 p-2 rounded-lg flex items-center gap-2"
            >
              {item.icon}
              <span className="flex-1">{item.text}</span>
              {item.count && (
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                  {item.count}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="pl-3 mt-8">
          <button
            className="w-52 flex items-center justify-between p-2 rounded-lg hover:bg-[#262729]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-[#9c9491f3] ">Chatlist</span>
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-all ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isDropdownOpen && (
            <ul className="list-none pl-4 mt-2">
              {chatCategories.map((item, index) => (
                <li
                  key={index}
                  className={` hover:bg-[#262729] w-52 p-2 rounded-lg flex items-center gap-2 ${
                    item.to === item.route ? "active" : ""
                  }`}
                >
                  <a href={item.to} className="flex items-center gap-2">
                    <item.Icon style={{ color: item.color }} />
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
              <button className="text-[#9c9491f3] flex mt-4 gap-3 text-center pl-1 hover:text-gray-600">
                <IoMdAddCircleOutline className="mt-1 hover:text-gray-600 " />
                <h1 className="hover:text-gray-600">Add new project</h1>
              </button>
            </ul>
          )}
        </div>
      </nav>

      <div className="p-4  border-gray-800">
        <div className="items-center mb-4 bg-[#222727] p-3 rounded-xl">
          <div className="flex">
            <div className="flex ">
              <div className="w-8 h-8 rounded-full bg-blue-500 overflow-hidden">
                <img src="/placeholder-avatar.png" alt="User" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-white">medicoz</div>
                <div className="text-xs text-gray-400">medicoz@01.net</div>
              </div>
            </div>
            <div className="ml-auto">
              <FaPowerOff className="mt-2 mr-4 text-white" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 py-4 rounded-xl bg-[#222727] text-white">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center hover:bg-[#000000] p-2 px-5 rounded-xl ${
              theme === "light" ? "bg-[#000000]" : "bg-[#232627]"
            }`}
          >
            <Sun className="w-4 h-4 mr-2 text-white" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center hover:bg-[#000000] p-2 px-5 rounded-xl ${
              theme === "dark" ? "bg-[#000000]" : "bg-[#232627]"
            }`}
          >
            <Moon className="w-4 h-4 mr-2 text-white" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
}
