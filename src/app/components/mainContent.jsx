import React, { useState } from "react";
import { Send, Paperclip } from "lucide-react";

const MainContent = ({ theme }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  const features = [
    "Ask Medical Questions: Get instant, reliable answers.",
    "Manage Appointments & Medication: Stay on track effortlessly.",
    "Personalized Health Advice: Tailored to your needs.",
  ];

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value && showWelcome) {
      setShowWelcome(false);
    } else if (!e.target.value && messages.length === 0) {
      setShowWelcome(true);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setMessages([...messages, { text: inputText, sender: "user" }]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your message. How can I assist you with your medical concerns today?",
            sender: "bot",
          },
        ]);
      }, 1000);
      setInputText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-3/4 ${
        theme === "light" ? "bg-gray-50" : "bg-[#131619]"
      }`}
    >
      {showWelcome ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-12 overflow-y-auto">
          <div className="max-w-6xl w-full">
            <h1
              className={`font-bold text-4xl md:text-6xl text-center mb-6 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Welcome to Medicoz
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 text-center mb-12">
              "AI Enhanced ChatBot for Medical Assistance"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl ${
                    theme === "light"
                      ? "bg-white shadow-lg text-black"
                      : "bg-[#222425] text-white"
                  }`}
                >
                  <p className="text-base md:text-lg">{feature}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-gray-300 text-center">
              "Let's make healthcare simple, smart, and accessible."
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-xl p-4 ${
                    message.sender === "user"
                      ? theme === "light"
                        ? "bg-blue-500 text-white"
                        : "bg-blue-600 text-white"
                      : theme === "light"
                      ? "bg-gray-200 text-black"
                      : "bg-[#222425] text-white"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-inherit">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6">
          <div
            className={`flex items-center p-4 rounded-xl ${
              theme === "light" ? "bg-white shadow-md" : "bg-[#1b1c21]"
            }`}
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-base md:text-lg dark:text-white"
            />
            <div className="flex items-center gap-2">
              <input type="file" className="hidden" id="chat-file" />
              <label
                htmlFor="chat-file"
                className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Paperclip className="w-6 h-6 text-gray-500" />
              </label>
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Send className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
