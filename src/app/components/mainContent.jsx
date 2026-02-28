import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Edit2, Bot, User, Sparkles } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:7000";

const MainContent = ({ theme, showWelcome, setShowWelcome }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]); // Track messages waiting for chat ID
  const messagesEndRef = useRef(null);

  // Get auth token from localStorage
  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    const handleRefresh = (event) => {
      setMessages([]);
      setCurrentChatId(null);
      setPendingMessages([]);
      setShowWelcome(true);
    };

    const handleOpenChat = (event) => {
      if (event.detail && event.detail.chatId) {
        loadChatHistory(event.detail.chatId);
      }
    };

    document.addEventListener("refreshMainContent", handleRefresh);
    document.addEventListener("openChatEvent", handleOpenChat);

    return () => {
      document.removeEventListener("refreshMainContent", handleRefresh);
      document.removeEventListener("openChatEvent", handleOpenChat);
    };
  }, [setShowWelcome]);

  // Handle pending messages when chat ID changes
  useEffect(() => {
    const processPendingMessages = async () => {
      if (currentChatId && pendingMessages.length > 0) {
        // Process all pending messages in sequence
        for (const msg of pendingMessages) {
          await axios.post(
            `${API_BASE_URL}/chat/${currentChatId}`,
            {
              role: msg.role,
              content: msg.content,
            },
            {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
            }
          );
        }
        // Clear pending messages after processing
        setPendingMessages([]);
      }
    };

    processPendingMessages();
  }, [currentChatId, pendingMessages]);

  const loadChatHistory = async (chatId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("Authentication token missing. Please log in again.");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/chat/${chatId}`, {
        headers: { authorization: `bearer ${token}` },
      });
      if (response.data) {
        setCurrentChatId(chatId);

        // Transform messages to the format expected by the UI
        const formattedMessages = response.data.map((msg) => ({
          text: msg.content,
          sender: msg.role,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          id: msg._id,
        }));

        setMessages(formattedMessages);
        setShowWelcome(false);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const features = [
    { text: "Ask Medical Questions: Get instant, reliable answers.", icon: <Sparkles className="w-5 h-5 text-blue-400" /> },
    { text: "Manage Appointments & Medication: Stay on track effortlessly.", icon: <Sparkles className="w-5 h-5 text-green-400" /> },
    { text: "Personalized Health Advice: Tailored to your needs.", icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
  ];

  const getCurrentTimestamp = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value && showWelcome) {
      setShowWelcome(false);
    } else if (!e.target.value && messages.length === 0) {
      setShowWelcome(true);
    }
  };

  // Save message to the backend
  const saveMessage = async (role, content) => {
    try {
      if (currentChatId) {
        // Add message to existing chat
        const response = await axios.post(
          `${API_BASE_URL}/chat/${currentChatId}`,
          {
            role,
            content,
          },
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );
        return response.data;
      } else {
        // If there's no current chat ID but we're trying to save a bot message,
        // add it to pending messages
        if (role === "bot") {
          setPendingMessages((prev) => [...prev, { role, content }]);
          return null;
        }

        // Create new chat for user messages
        const response = await axios.post(
          `${API_BASE_URL}/chat/new`,
          {
            role,
            content,
          },
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );

        // Set the new chat ID
        if (response.data && response.data._id) {
          setCurrentChatId(response.data._id);

          // Dispatch an event to update the chat list
          document.dispatchEvent(
            new CustomEvent("chatCreated", {
              detail: { chatId: response.data._id, title: response.data.title },
            })
          );
        }
        return response.data;
      }
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = inputText.trim();
      const timestamp = getCurrentTimestamp();

      if (editingMessageId !== null) {
        // Update the existing message
        const updatedMessages = [...messages];
        const messageIndex = updatedMessages.findIndex(
          (msg, index) => index === editingMessageId
        );

        if (messageIndex !== -1) {
          // Update the user message
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            text: userMessage,
            edited: true,
          };

          // Find the next bot message if it exists
          const nextBotIndex = messageIndex + 1;
          if (
            nextBotIndex < updatedMessages.length &&
            updatedMessages[nextBotIndex].sender === "bot"
          ) {
            // Replace with typing indicator
            updatedMessages[nextBotIndex] = {
              text: "...",
              sender: "bot",
              isTyping: true,
            };

            // Update messages with the edited user message and typing indicator
            setMessages(updatedMessages);

            // Get new response based on the edited message
            setIsLoading(true);
            const updatedSession = await saveMessage("user", userMessage);
            setIsLoading(false);

            if (updatedSession && updatedSession.messages) {
              const assistantMsg = updatedSession.messages[updatedSession.messages.length - 1];
              
              // Update the bot response
              setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const typingIndex = newMessages.findIndex((msg) => msg.isTyping);

                if (typingIndex !== -1) {
                  newMessages[typingIndex] = {
                    text: assistantMsg.content,
                    sender: "bot",
                    timestamp: getCurrentTimestamp(),
                    id: assistantMsg._id || Date.now(),
                  };
                }

                return newMessages;
              });
            } else {
              // Handle error case
              setMessages((prev) => prev.filter((msg) => !msg.isTyping));
            }
          } else {
            // Just update the user message if there's no bot response to regenerate
            setMessages(updatedMessages);
          }
        }

        // Reset editing state
        setEditingMessageId(null);
        setInputText("");
      } else {
        // Add new message to UI immediately
        const userMsgObj = {
          text: userMessage,
          sender: "user",
          timestamp,
          id: Date.now(),
        };
        setMessages([...messages, userMsgObj]);
        setInputText("");

        // Save message to backend and get the full session back (includes AI response)
        setIsLoading(true);
        const updatedSession = await saveMessage("user", userMessage);
        setIsLoading(false);

        if (updatedSession && updatedSession.messages) {
          const assistantMsg = updatedSession.messages[updatedSession.messages.length - 1];
          
          // Remove typing indicator and add actual response
          setMessages((prev) => {
            const filtered = prev.filter((msg) => !msg.isTyping);
            return [
              ...filtered,
              {
                text: assistantMsg.content,
                sender: "bot",
                timestamp: getCurrentTimestamp(),
                id: assistantMsg._id || Date.now(),
              },
            ];
          });
        } else {
          // Handle error case
          setMessages((prev) => prev.filter((msg) => !msg.isTyping));
        }
      }
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
      const timestamp = getCurrentTimestamp();
      setMessages([
        ...messages,
        {
          text: `Uploaded file: ${file.name}`,
          sender: "user",
          timestamp: timestamp,
          id: Date.now(),
        },
      ]);

      // Mock response for file upload
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I've received your file. Please note that I have limited ability to analyze files directly. How can I help you with this document?",
            sender: "bot",
            timestamp: getCurrentTimestamp(),
            id: Date.now(),
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

      setIsLoading(true);
      saveMessage("user", userMessage).then((updatedSession) => {
        setIsLoading(false);
        if (updatedSession && updatedSession.messages) {
          const assistantMsg = updatedSession.messages[updatedSession.messages.length - 1];
          setMessages((prev) => {
            const updated = [...prev];
            const typingIndex = updated.findIndex((msg) => msg.isTyping);
            if (typingIndex !== -1) {
              updated.splice(typingIndex, 1, {
                text: assistantMsg.content,
                sender: "bot",
                timestamp: getCurrentTimestamp(),
                id: assistantMsg._id || Date.now(),
              });
            }
            return updated;
          });
        } else {
          setMessages((prev) => prev.filter((msg) => !msg.isTyping));
        }
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

  const handleEditMessage = (index) => {
    const messageToEdit = messages[index];
    setEditingMessageId(index);
    setInputText(messageToEdit.text);
  };

  return (
    <div
      className={`flex flex-col h-screen w-full md:w-3/4 ${
        theme === "light" ? "bg-gray-50 text-gray-900" : "bg-[#131619] text-white"
      } transition-colors duration-500`}
      id="main-content"
    >
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 py-10 overflow-y-auto scrollbar-hide"
          >
            <div className="max-w-5xl w-full text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 md:mb-8 inline-block p-4 rounded-3xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-white/5 backdrop-blur-sm"
              >
                <img src="/logo.png" alt="Medicoz" className="w-14 h-14 md:w-20 md:h-20 object-contain" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className={`font-black text-3xl sm:text-5xl md:text-7xl mb-6 md:mb-8 tracking-tighter ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Welcome to{" "}
                <motion.span 
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="bg-gradient-to-r from-blue-600 via-emerald-400 to-indigo-600 bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-sm inline-block"
                >
                  Medicoz
                </motion.span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto font-medium"
              >
                Your AI-Enhanced Medical Assistant for reliable health information and support.
              </motion.p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`p-8 rounded-2xl border ${
                      theme === "light"
                        ? "bg-white shadow-xl border-gray-100"
                        : "bg-[#1b1c21] border-gray-800"
                    } text-left group transition-all cursor-default overflow-hidden relative`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <p className="text-lg leading-relaxed">{feature.text}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-base md:text-lg text-gray-500 font-medium italic"
              >
                "Empowering healthcare through clinical intelligence."
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col relative overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-8 scrollbar-hide">
              <div className="space-y-8 max-w-4xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      } group`}
                    >
                      {message.sender === "bot" && (
                        <div className="w-10 h-10 mr-3 hidden sm:flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-blue-500/20">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                        message.sender === "user" ? "items-end" : "items-start"
                      }`}>
                        <div
                          className={`relative rounded-2xl p-4 sm:p-5 shadow-sm ${
                            message.sender === "user"
                              ? theme === "light"
                                ? "bg-blue-600 text-white"
                                : "bg-blue-600 text-white"
                              : theme === "light"
                              ? "bg-white border border-gray-100 text-gray-800"
                              : "bg-[#1b1c21] border border-gray-800 text-white"
                          } ${
                            message.sender === "user" 
                              ? "rounded-tr-none" 
                              : "rounded-tl-none"
                          } transition-all duration-300 hover:shadow-md`}
                        >
                          {message.isTyping ? (
                            <div className="flex space-x-1.5 px-2 py-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ y: [0, -6, 0] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                  }}
                                  className="w-2 h-2 rounded-full bg-blue-400"
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                              {message.text}
                            </div>
                          )}
                        </div>

                        {!message.isTyping && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`flex items-center gap-3 mt-2 px-1 text-[11px] font-medium text-gray-500 ${
                              message.sender === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <span>{message.timestamp}</span>
                            {message.edited && <span className="text-blue-400">Edited</span>}
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                              {message.sender === "bot" ? (
                                <>
                                  <button
                                    onClick={() => handleCopy(message.text)}
                                    className="hover:text-blue-400 transition-colors uppercase tracking-wider"
                                  >
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => handleRegenerateResponse(index)}
                                    className="hover:text-blue-400 transition-colors uppercase tracking-wider flex items-center gap-1"
                                  >
                                    Retake 🔄
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleEditMessage(index)}
                                  className="hover:text-blue-400 transition-colors uppercase tracking-wider flex items-center gap-1"
                                >
                                  Edit <Edit2 size={10} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {message.sender === "user" && (
                        <div className="w-10 h-10 ml-3 hidden sm:flex items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-700">
                          <User className={`w-6 h-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`border-t ${
          theme === "light" ? "bg-white border-gray-100" : "bg-[#131619] border-gray-800"
        } px-4 py-4 md:px-12 md:py-8 sticky bottom-0 z-20`}
      >
        <div className="max-w-4xl mx-auto w-full">
          <div
            className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 ${
              theme === "light"
                ? "bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 shadow-sm"
                : "bg-[#1b1c21] border-gray-800 focus-within:border-blue-500/50 shadow-lg"
            }`}
          >
            <div className="flex items-center pl-3">
              <label
                htmlFor="chat-file"
                className={`p-2 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-all ${
                  isLoading ? "opacity-40 cursor-not-allowed" : "text-gray-400 hover:text-blue-400"
                }`}
              >
                <Paperclip className="w-5 h-5" />
                <input
                  type="file"
                  className="hidden"
                  id="chat-file"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
              </label>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                editingMessageId !== null
                  ? "Correcting your query..."
                  : "How can Medicoz help you today?"
              }
              className={`flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm sm:text-base ${
                theme === "light" ? "text-gray-800" : "text-white"
              } placeholder-gray-500`}
              disabled={isLoading}
            />

            <div className="flex items-center gap-2 pr-1.5">
              {editingMessageId !== null && (
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setInputText("");
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-400 uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className={`p-3 rounded-xl shadow-lg transition-all ${
                  isLoading || !inputText.trim()
                    ? "bg-gray-300 dark:bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 active:shadow-inner"
                }`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-[10px] sm:text-xs text-gray-500 select-none">
              Medicoz provided information based on clinical docs. Verify with a professional.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Loader = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default MainContent;
