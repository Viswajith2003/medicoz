import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Edit2 } from "lucide-react";
import axios from "axios";

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
    "Ask Medical Questions: Get instant, reliable answers.",
    "Manage Appointments & Medication: Stay on track effortlessly.",
    "Personalized Health Advice: Tailored to your needs.",
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
      setMessages([
        ...messages,
        {
          text: `Uploaded file: ${file.name}`,
          sender: "user",
          timestamp: getCurrentTimestamp(),
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
        theme === "light" ? "bg-gray-50" : "bg-[#131619]"
      }`}
      id="main-content"
    >
      {showWelcome ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-12 overflow-y-auto">
          <div className="max-w-6xl w-full">
            <h1
              className={`font-bold text-2xl sm:text-4xl md:text-6xl text-center mb-6 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Welcome to Medicoz
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 text-center mb-8 md:mb-12">
              "AI Enhanced ChatBot for Medical Assistance"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-4 md:p-6 rounded-xl ${
                    theme === "light"
                      ? "bg-white shadow-lg text-black"
                      : "bg-[#222425] text-white"
                  }`}
                >
                  <p className="text-sm sm:text-base md:text-lg">{feature}</p>
                </div>
              ))}
            </div>
            <p className="text-base md:text-lg text-gray-300 text-center">
              "Let's make healthcare simple, smart, and accessible."
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
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
                      <div className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 rounded-full flex items-center justify-center">
                        <img
                          src="/logo.png"
                          alt="M"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </div>
                    )}
                    <div className="flex flex-col max-w-[80%] sm:max-w-[70%]">
                      <div
                        className={`rounded-xl p-3 sm:p-4 ${
                          message.sender === "user"
                            ? theme === "light"
                              ? "bg-[#94a1e7] text-black"
                              : "bg-[#0b3183] text-white"
                            : theme === "light"
                            ? "bg-gray-200 text-black"
                            : "bg-[#222425] text-white"
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400 animate-bounce"></div>
                            <div
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        ) : (
                          <div className="text-sm sm:text-base">
                            {message.text}
                          </div>
                        )}
                      </div>

                      {message.timestamp && (
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                          {message.timestamp}
                          {message.edited && (
                            <span className="ml-1">(edited)</span>
                          )}

                          {message.sender === "bot" && !message.isTyping && (
                            <div className="flex flex-wrap items-center mt-1 space-x-2">
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
                                Regenerate
                                <span className="ml-1">🔄</span>
                              </button>
                            </div>
                          )}

                          {message.sender === "user" && (
                            <div className="flex items-center mt-1 space-x-2">
                              <button
                                onClick={() => handleEditMessage(index)}
                                className="text-xs text-gray-400 hover:text-gray-300 flex items-center"
                              >
                                Edit
                                <Edit2 className="ml-1 w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {message.sender === "user" && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 ml-2 sm:ml-3 rounded-full flex items-center justify-center">
                        <span className="text-white text-base sm:text-lg">
                          👤
                        </span>
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
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-8 py-3 sm:py-6">
          <div
            className={`flex items-center p-2 sm:p-4 rounded-xl ${
              theme === "light" ? "bg-white shadow-md" : "bg-[#1b1c21]"
            }`}
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                editingMessageId !== null
                  ? "Edit your message..."
                  : "Ask anything you want..."
              }
              className="flex-1 bg-transparent border-none outline-none px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base md:text-lg dark:text-white"
              disabled={isLoading}
            />
            <div className="flex items-center gap-1 sm:gap-2">
              {editingMessageId === null && (
                <label
                  htmlFor="chat-file"
                  className={`p-1 sm:p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Paperclip className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  <input
                    type="file"
                    className="hidden"
                    id="chat-file"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
              <button
                onClick={handleSendMessage}
                className={`p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
              {editingMessageId !== null && (
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setInputText("");
                  }}
                  className="p-1 sm:p-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
