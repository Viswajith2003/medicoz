import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Copy,
  Link,
  Mail,
  Twitter,
  Facebook,
  LinkedIn,
  Check,
  Users,
  Globe,
  Lock,
} from "lucide-react";

const SharePopup = ({ isOpen, onClose, theme }) => {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState("link"); // link, email, social
  const [accessLevel, setAccessLevel] = useState("view"); // view, edit, admin
  const [visibility, setVisibility] = useState("specific"); // specific, anyone, private
  const popupRef = useRef(null);
  const linkRef = useRef(null);

  const shareUrl = "https://medchat.example.com/share/a7b9c3d5e2";

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Copy link function
  const copyLink = () => {
    if (linkRef.current) {
      navigator.clipboard.writeText(linkRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div
        ref={popupRef}
        className={`w-full max-w-md rounded-xl shadow-2xl ${
          theme === "light" ? "bg-white" : "bg-[#1b1c1f]"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
          <h3
            className={`text-xl font-medium ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Share this chat
          </h3>
          <button
            onClick={onClose}
            className={`text-gray-400 hover:${
              theme === "light" ? "text-gray-600" : "text-white"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Share Type Tabs */}
          <div
            className={`flex mb-5 border rounded-lg overflow-hidden ${
              theme === "light" ? "border-gray-200" : "border-gray-700"
            }`}
          >
            {[
              { id: "link", label: "Link", icon: <Link size={16} /> },
              { id: "email", label: "Email", icon: <Mail size={16} /> },
              { id: "social", label: "Social", icon: <Twitter size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setShareType(tab.id)}
                className={`flex-1 py-2 px-3 flex items-center justify-center transition-colors ${
                  shareType === tab.id
                    ? theme === "light"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-gray-800 text-white"
                    : theme === "light"
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Visibility Settings */}
          <div className="mb-5">
            <label
              className={`block mb-2 font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              Who can access
            </label>
            <div className="space-y-2">
              {[
                {
                  id: "specific",
                  label: "Specific people",
                  icon: <Users size={16} />,
                },
                {
                  id: "anyone",
                  label: "Anyone with the link",
                  icon: <Globe size={16} />,
                },
                { id: "private", label: "Only me", icon: <Lock size={16} /> },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => setVisibility(option.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                    visibility === option.id
                      ? theme === "light"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-blue-900 bg-opacity-20 border border-blue-700"
                      : theme === "light"
                      ? "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      : "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`mr-3 ${
                        visibility === option.id
                          ? "text-blue-500"
                          : theme === "light"
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      {option.icon}
                    </span>
                    <span
                      className={
                        visibility === option.id
                          ? theme === "light"
                            ? "text-blue-700"
                            : "text-blue-400"
                          : theme === "light"
                          ? "text-gray-700"
                          : "text-gray-300"
                      }
                    >
                      {option.label}
                    </span>
                  </div>
                  {visibility === option.id && (
                    <div
                      className={`w-4 h-4 rounded-full ${
                        theme === "light" ? "bg-blue-500" : "bg-blue-600"
                      } flex items-center justify-center`}
                    >
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Permission Level */}
          <div className="mb-5">
            <label
              className={`block mb-2 font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              Permission level
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              className={`w-full p-2.5 rounded-lg border ${
                theme === "light"
                  ? "border-gray-300 bg-white text-gray-900"
                  : "border-gray-700 bg-gray-800 text-white"
              } focus:outline-none`}
            >
              <option value="view">Can view</option>
              <option value="edit">Can edit</option>
              <option value="admin">Can manage</option>
            </select>
          </div>

          {/* Different content based on share type */}
          {shareType === "link" && (
            <div
              className={`flex items-center p-2 rounded-lg border ${
                theme === "light" ? "border-gray-300" : "border-gray-700"
              }`}
            >
              <input
                ref={linkRef}
                type="text"
                value={shareUrl}
                readOnly
                className={`flex-1 bg-transparent border-none focus:outline-none ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              />
              <button
                onClick={copyLink}
                className={`ml-2 p-2 rounded-lg ${
                  copied
                    ? theme === "light"
                      ? "bg-green-100 text-green-600"
                      : "bg-green-900 bg-opacity-30 text-green-400"
                    : theme === "light"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          )}

          {shareType === "email" && (
            <div className="space-y-3">
              <div
                className={`p-2 rounded-lg border ${
                  theme === "light" ? "border-gray-300" : "border-gray-700"
                }`}
              >
                <input
                  type="text"
                  placeholder="Add email addresses"
                  className={`w-full bg-transparent border-none focus:outline-none ${
                    theme === "light"
                      ? "text-gray-700 placeholder-gray-400"
                      : "text-gray-300 placeholder-gray-500"
                  }`}
                />
              </div>
              <textarea
                placeholder="Add a message (optional)"
                rows={3}
                className={`w-full p-2 rounded-lg border ${
                  theme === "light"
                    ? "border-gray-300 bg-white text-gray-700 placeholder-gray-400"
                    : "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                } focus:outline-none`}
              ></textarea>
            </div>
          )}

          {shareType === "social" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Twitter", icon: Twitter, color: "bg-blue-400" },
                { name: "Facebook", icon: Facebook, color: "bg-blue-600" },
                { name: "LinkedIn", icon: LinkedIn, color: "bg-blue-700" },
                {
                  name: "Copy Link",
                  icon: copied ? Check : Copy,
                  color: "bg-gray-600",
                  onClick: copyLink,
                },
              ].map((platform, index) => (
                <button
                  key={index}
                  onClick={platform.onClick || (() => {})}
                  className={`flex items-center justify-center ${platform.color} text-white py-3 px-4 rounded-lg hover:opacity-90`}
                >
                  <span className="mr-2">{platform.icon}</span>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex justify-end p-5 border-t ${
            theme === "light" ? "border-gray-200" : "border-gray-800"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 mr-3 rounded-lg ${
              theme === "light"
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Cancel
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#80d758] text-black hover:bg-[#6dc046]">
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;

// when i click on the new chat button in chathistory page then show the maincontent front page. if i on chating then i press the new chat button then show the main page (when we are refresh the page the what will show that will happen on there).
// In chat history page ,when i search on the above search bar the it act like real search bar in order to the chat history items. 
// make to set these two work in properly without change the current design