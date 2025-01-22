export default function ChatHistory() {
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
    <div className="w-80 border-l border-gray-800 p-4 hidden lg:block">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400">Chat history</span>
        <span className="text-gray-400">26/100</span>
      </div>

      <div className="space-y-4">
        {chatItems.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-[#1E2124] cursor-pointer"
          >
            <h3 className="text-white text-sm mb-1">{item.title}</h3>
            <p className="text-gray-400 text-xs">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
