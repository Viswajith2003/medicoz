import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import axios from "axios";

const MainContent = ({ theme }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const callChatAPI = async (userMessage) => {
    setIsLoading(true);
    const apiUrl = "https://c328-54-196-122-230.ngrok-free.app/query";
    console.log("Calling API at:", apiUrl); // Debug
    try {
      const response = await axios.post(
        apiUrl,
        { question: userMessage },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("API Response:", response.data); // Debug
      return response.data.response;
    } catch (error) {
      // console.error("Axios Error:", error.message);
      if (error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Status:", error.response.status);
      }
      return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = inputText.trim();
      setMessages([
        ...messages,
        { text: userMessage, sender: "user", timestamp: "Just now" },
      ]);
      setInputText("");

      // Add typing indicator
      setMessages((prev) => [
        ...prev,
        { text: "...", sender: "bot", isTyping: true },
      ]);

      // Get response from API
      const response = await callChatAPI(userMessage);

      // Remove typing indicator and add actual response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isTyping);
        return [
          ...filtered,
          { text: response, sender: "bot", timestamp: "Just now" },
        ];
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessages([
        ...messages,
        {
          text: `Uploaded file: ${file.name}`,
          sender: "user",
          timestamp: "Just now",
        },
      ]);

      // Mock response for file upload (your FastAPI doesn't handle files yet)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I've received your file. Please note that I have limited ability to analyze files directly. How can I help you with this document?",
            sender: "bot",
            timestamp: "Just now",
          },
        ]);
      }, 1000);
    }
  };

  const handleRegenerateResponse = (index) => {
    let userMessageIndex = index - 1;
    while (
      userMessageIndex >= 0 &&
      messages[userMessageIndex].sender !== "user"
    ) {
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      const userMessage = messages[userMessageIndex].text;

      const newMessages = [...messages];
      newMessages.splice(index, 1, {
        text: "...",
        sender: "bot",
        isTyping: true,
      });
      setMessages(newMessages);

      callChatAPI(userMessage).then((response) => {
        setMessages((prev) => {
          const updated = [...prev];
          const typingIndex = updated.findIndex((msg) => msg.isTyping);
          if (typingIndex !== -1) {
            updated.splice(typingIndex, 1, {
              text: response,
              sender: "bot",
              timestamp: "Just now",
            });
          }
          return updated;
        });
      });
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
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
        <div className="flex-1 flex flex-col relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender === "bot" && !message.isTyping && (
                      <div className="w-10 h-10 mr-3 rounded-full flex items-center justify-center">
                        <img src="/logo.png" alt="M" className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex flex-col max-w-[70%]">
                      <div
                        className={`rounded-xl p-4 ${
                          message.sender === "user"
                            ? theme === "light"
                              ? "bg-blue-500 text-white"
                              : "bg-blue-600 text-white"
                            : theme === "light"
                            ? "bg-gray-200 text-black"
                            : "bg-[#222425] text-white"
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400 animate-bounce"></div>
                            <div
                              className="w-3 h-3 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-3 h-3 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        ) : (
                          message.text
                        )}
                      </div>

                      {message.timestamp && (
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                          {message.timestamp}

                          {message.sender === "bot" && !message.isTyping && (
                            <div className="flex items-center mt-1 space-x-2">
                              <button
                                onClick={() => handleCopy(message.text)}
                                className="text-xs text-gray-400 hover:text-gray-300"
                              >
                                Copy
                              </button>
                              <button
                                onClick={() => handleRegenerateResponse(index)}
                                className="text-xs text-gray-400 hover:text-gray-300 flex items-center"
                              >
                                Regenerate response
                                <span className="ml-1">🔄</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {message.sender === "user" && (
                      <div className="w-10 h-10 ml-3 rounded-full  flex items-center justify-center">
                        <span className="text-white text-lg">👤</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
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
              placeholder="Ask anything you want..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-base md:text-lg dark:text-white"
              disabled={isLoading}
            />
            <div className="flex items-center gap-2">
              <input
                type="file"
                className="hidden"
                id="chat-file"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="chat-file"
                className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Paperclip className="w-6 h-6 text-gray-500" />
              </label>
              <button
                onClick={handleSendMessage}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
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
