"use client";
import { useState } from 'react';
import Sidebar from './components/sidebar';
import MainContent from './components/mainContent';
import ChatHistory from './components/chatHistory';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  
  return (
    <div className={`flex h-screen ${theme === 'light' ? 'bg-white' : 'bg-[#1A1D1F]'}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} theme={theme} setTheme={setTheme} />
      <div className="flex-1 flex">
        <MainContent theme={theme} />
        <ChatHistory theme={theme} />
      </div>
    </div>
  );
}
