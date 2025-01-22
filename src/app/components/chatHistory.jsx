
export default function ChatHistory({ theme }) {
  const chatItems = [
    {
      title: "Brainwave AI UI Kit",
      description: "Write code (HTML, CSS and JS) for a simple...",
    },
    {
      title: "Welcome page with input",
      description: "Write code (HTML, CSS and JS) for a simple...",
    },
    {
      title: "Photo retouch",
      description: "Write code (HTML, CSS and JS) for a simple...",
    },
  ];

  return (
    <div
      className={`w-80 border-l ${
        theme === "light" ? "border-gray-200 bg-white" : "border-gray-800"
      } p-4 hidden lg:block`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
          Chat history
        </span>
        <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
          26/100
        </span>
      </div>

      <div className="space-y-4">
        {chatItems.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg cursor-pointer ${
              theme === "light"
                ? "bg-gray-50 hover:bg-gray-100"
                : "bg-[#1E2124] hover:bg-[#23262A]"
            }`}
          >
            <h3
              className={
                theme === "light"
                  ? "text-gray-900 text-sm mb-1"
                  : "text-white text-sm mb-1"
              }
            >
              {item.title}
            </h3>
            <p
              className={`text-xs ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
