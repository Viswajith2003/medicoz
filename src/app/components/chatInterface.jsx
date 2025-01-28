import { useState } from "react";
import { Send, Paperclip } from "lucide-react";

const ChatInterface = ({ theme }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "user" }]);
      setNewMessage("");
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I'm your medical assistant. How can I help you today?",
            sender: "ai",
          },
        ]);
      }, 1000);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <div
      className={`flex-1 flex flex-col mt-5 mb-5 rounded-l-lg  ${
        theme === "light" ? "bg-gray-50" : "bg-[#131619]"
      }`}
    >
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-[70%] ${
                message.sender === "user"
                  ? "bg-[#80d758] text-black"
                  : theme === "light"
                  ? "bg-gray-200"
                  : "bg-[#1b1c21] text-white"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4">
        <div
          className={`flex items-center p-3 rounded-lg ${
            theme === "light"
              ? "bg-white border-[#1b1c21]"
              : "bg-[#1b1c21] border-gray-700"
          }`}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent border-none pl-2 outline-none dark:text-white"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="chat-file"
          />
          <label htmlFor="chat-file" className="p-2 rounded-lg cursor-pointer">
            <Paperclip className="w-5 h-5 text-gray-500 hover:text-gray-300" />
          </label>
          <button onClick={handleSendMessage} className="p-2 rounded-lg">
            <Send className="w-5 h-5 text-gray-500 hover:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
