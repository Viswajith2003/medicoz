import { useState } from "react";
import { FaPowerOff, FaRegCircle } from "react-icons/fa";
import {
  MessageSquare,
  Search,
  CreditCard,
  HelpCircle,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { IoSquareOutline } from "react-icons/io5";
import { FiTriangle } from "react-icons/fi";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function Sidebar({ isOpen, setIsOpen, theme, setTheme }) {
  const menuItems = [
    {
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      text: "Chats",
      count: "48",
    },
    { icon: <Search className="w-5 h-5 text-white" />, text: "Search" },
    {
      icon: <CreditCard className="w-5 h-5 text-white" />,
      text: "Manage subscription",
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

  return (
    <div className="w-64 bg-[#000000] py-2 pl-2 border-gray-800 flex flex-col">
      <div className="p-5 flex items-center ">
        <img src="/logo.png" alt="M" className="h-12 w-10" />
        <span className="ml-4 text-white text-[24px] font-semibold">
          MediCoz
        </span>
      </div>

      <nav className="flex-1">
        <h1 className="text-[#9c9491f3] mt-5 mb-3 ml-4">General</h1>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="px-4 py-2 flex items-center text-white hover:bg-gray-800 cursor-pointer"
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

        <div className="pl-4 mt-8">
          <ul className="list-none">
            <h1 className="text-[#9c9491f3] mb-5">Chatlist</h1>
            {chatCategories.map((item, index) => (
              <li
                key={index}
                className={` hover:bg-[#262729] w-52 p-2 rounded-lg ${
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
        <div className="flex items-center justify-between p-2 rounded-xl text-white bg-[#232627]">
          <button
            onClick={() => setTheme("light")}
            className="flex items-center hover:bg-gray-800 p-2 px-5 rounded-xl"
          >
            <Sun className="w-4 h-4 mr-2 text-white" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className="flex items-center hover:bg-gray-800 p-2 px-5 rounded-xl bg-[#151719]"
          >
            <Moon className="w-4 h-4 mr-2 text-white" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
}
