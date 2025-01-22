"use client";
// import Image from "next/image";
// import Login from "./components/login";
// import Register from "./components/register";
import { useState } from "react";
import Sidebar from "./components/sidebar";
import MainContent from "./components/mainContent";
import ChatHistory from "./components/chatHistory";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen bg-[#1A1D1F]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex">
        <MainContent />
        <ChatHistory />
      </div>
    </div>
    // <div className="">
    //   {/* <Login/> */}
    //   {/* <Register /> */}
    // </div>
  );
}
