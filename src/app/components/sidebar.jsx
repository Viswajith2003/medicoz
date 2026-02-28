import { useState } from "react";
import { FaPowerOff } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import {
  MessageSquare,
  Search as SearchIcon,
  CreditCard,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { IoSquareOutline } from "react-icons/io5";
import { FiTriangle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import SettingsModal from "./settings.jsx";
import SubscriptionModal from "./subscription.jsx";

export default function Sidebar({
  isOpen,
  setIsOpen,
  theme,
  setTheme,
  onLogout,
  user,
}) {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      text: "Dashboard",
      onClick: () => {
        setActiveMenuItem("Dashboard");
        document.dispatchEvent(new CustomEvent("refreshMainContent"));
      }
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      text: "Messages",
      count: "8",
      onClick: () => setActiveMenuItem("Messages")
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      text: "Subscription",
      onClick: () => {
        setActiveMenuItem("Subscription");
        setShowSubscriptionModal(true);
      }
    },
    {
      icon: <Settings className="w-5 h-5" />,
      text: "Settings",
      onClick: () => {
        setActiveMenuItem("Settings");
        setShowSettingsModal(true);
      }
    },
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
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 border border-blue-400"
        >
          {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className={`w-72 flex flex-col fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0 border-r transition-colors duration-500 ${
          theme === "light" 
            ? "bg-white border-gray-200" 
            : "bg-[#0d0e11] border-gray-800"
        }`}
      >
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <img src="/logo.png" alt="M" className="h-6 w-6 object-contain" />
            </div>
            <span className={`text-2xl font-bold tracking-tight ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}>
              MediCoz
            </span>
          </div>
        </div>

        <div className="px-6 mb-6">
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none ${
                theme === "light"
                  ? "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500"
                  : "bg-[#1b1c21] border-gray-800 text-white focus:border-blue-500/50"
              }`}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 scrollbar-hide">
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Menu</h2>
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = activeMenuItem === item.text;
                return (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                    className="group"
                  >
                    <button
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        isActive 
                          ? (theme === "light" 
                              ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100" 
                              : "bg-blue-500/10 text-white border border-blue-500/20 ring-1 ring-blue-500/10")
                          : (theme === "light"
                              ? "text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent"
                              : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent")
                      }`}
                    >
                      <span className={`${
                        isActive 
                          ? (theme === "light" ? "text-blue-600" : "text-blue-400")
                          : (theme === "light" ? "text-gray-400 group-hover:text-blue-600" : "text-gray-500 group-hover:text-blue-400")
                      } transition-colors`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.text}</span>
                      {item.count && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? "bg-blue-500 text-white border-blue-400"
                            : (theme === "light"
                                ? "bg-blue-100 text-blue-600 border-blue-200"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20")
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          <div>
            <button
              className={`w-full flex items-center justify-between px-3 py-2 mb-2 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest ${
                theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>Knowledge Base</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  {chatCategories.map((item, index) => (
                    <motion.li key={index} variants={itemVariants}>
                      <a
                        href={item.to}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                          theme === "light"
                            ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <item.Icon className="w-4 h-4" style={{ color: item.color }} />
                        <span>{item.name}</span>
                        <Sparkles className={`w-3 h-3 ml-auto ${
                          theme === "light" ? "text-yellow-600/30" : "text-yellow-500/40"
                        }`} />
                      </a>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className={`p-6 border-t mt-auto backdrop-blur-xl transition-colors duration-500 ${
          theme === "light" ? "bg-white/80 border-gray-200" : "bg-[#0d0e11]/80 border-gray-800"
        }`}>
          <motion.div 
            whileHover={{ y: -2 }}
            className={`flex items-center gap-3 mb-6 p-3 rounded-2xl border shadow-xl transition-all ${
              theme === "light"
                ? "bg-gray-50 border-gray-200"
                : "bg-[#1b1c21] border-gray-800"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ${
              theme === "light" ? "bg-blue-100 text-blue-600 ring-blue-50" : "bg-blue-500 text-white ring-blue-500/10"
            }`}>
              <FaCircleUser size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                {user ? `${user.firstName} ${user.lastName || ''}` : "Guest User"}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {user ? user.email : "medicoz-client v1.0"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className={`p-2 transition-colors ${
                theme === "light" ? "text-gray-400 hover:text-red-500" : "text-gray-500 hover:text-red-400"
              }`}
            >
              <FaPowerOff size={16} />
            </motion.button>
          </motion.div>

          <div className={`flex p-1 rounded-xl border transition-colors ${
            theme === "light" ? "bg-gray-100 border-gray-200" : "bg-[#1b1c21] border-gray-800"
          }`}>
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                theme === "light" 
                  ? "bg-white text-blue-600 shadow-md border border-blue-100" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                theme === "dark" 
                  ? "bg-gray-800 text-white shadow-lg border border-gray-700" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </motion.div>

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  );
}
