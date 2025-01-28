import ChatInterface from "./chatInterface";
import { Send, Paperclip } from "lucide-react";

const MainContent = ({ theme, showChat }) => {
  const features = [
    "Ask Medical Questions: Get instant, reliable answers.",
    "Manage Appointments & Medication: Stay on track effortlessly.",
    "Personalized Health Advice: Tailored to your needs.",
  ];

  return showChat ? (
    <ChatInterface theme={theme} />
  ) : (
    <div
      className={`flex-1 pt-40 rounded-tr-none rounded-br-none mb-5 mt-5 text-center rounded-lg ${
        theme === "light" ? "bg-gray-50" : "bg-[#131619]"
      }`}
    >
      <h1
        className={`font-bold text-[48px] mb-4 ${
          theme === "light" ? "text-gray-900" : "text-white"
        }`}
      >
        Welcome to Medicoz
      </h1>
      <p className="mb-6 text-[22px] text-gray-400">
        "AI Enhanced ChatBot for Medical Assistance"
      </p>

      <div className="p-8 w-5/6 ml-auto mr-auto">
        <div
          className={`flex items-center p-3 rounded-lg  ${
            theme === "light"
              ? "bg-white border-[#1b1c21]"
              : "bg-[#1b1c21] border-gray-700"
          }`}
        >
          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 bg-transparent border-none pl-2 outline-none py-5 dark:text-white"
          />
          <input type="file" className="hidden" id="chat-file" />
          <label htmlFor="chat-file" className="p-2 rounded-lg cursor-pointer">
            <Paperclip className="w-5 h-5 text-gray-500 hover:text-gray-300" />
          </label>
          <button className="p-2 rounded-lg">
            <Send className="w-5 h-5 text-gray-500 hover:text-gray-300" />
          </button>
        </div>
      </div>
      <div className="box flex gap-4 mx-56 mt-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`p-2 rounded-xl w-44 ${
              theme === "light"
                ? "bg-white text-black"
                : "bg-[#222425] text-white"
            }`}
          >
            <p className="text-[12px]">{feature}</p>
          </div>
        ))}
      </div>
      <p className="mb-6 text-gray-300 mt-16">
        "Let's make healthcare simple, smart, and accessible."
      </p>
    </div>
  );
};

export default MainContent;
