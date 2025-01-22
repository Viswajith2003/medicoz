import { BsSend } from "react-icons/bs";
import { LuPaperclip } from "react-icons/lu";
export default function MainContent({ theme }) {
  const features = [
    "Ask Medical Questions: Get instant, reliable answers.",
    "Personalized Health Advice: Tailored to your needs.",
    "Manage Appointments & Medication: Stay on track effortlessly.",
  ];

  return (
    <div
      className={`flex-1 pt-40 rounded-tr-none rounded-br-none  mb-5 mt-5  rounded-lg ${
        theme === "light" ? "bg-gray-50" : "bg-[#232726]"
      }`}
    >
      <div className=" text-center">
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
        <div className="box flex gap-4 mx-12 mt-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-[#373b3d] p-2 rounded-xl">
              <p>{feature}</p>
            </div>
          ))}
        </div>
        <p className={`mb-6 text-gray-300 mt-16`}>
          "Let's make healthcare simple, smart, and accessible."
        </p>

        <div
          className={`type flex items-center  mx-6 mt-[190px] ${
            theme === "light"
              ? "bg-white border-[#1b1c21]"
              : "bg-[#1b1c21] border-gray-700"
          } p-3 rounded-lg`}
        >
          <input
            type="text"
            placeholder="Ask any thing you want...?"
            className="flex-1 bg-transparent border-none pl-2 outline-none dark:text-white"
          />
          <button className="p-2  rounded-lg">
            <LuPaperclip
              className="text-gray-500 hover:text-gray-300"
              size={20}
            />
          </button>
          <button className="p-2  rounded-lg">
            <BsSend className="text-gray-500 hover:text-gray-300" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
