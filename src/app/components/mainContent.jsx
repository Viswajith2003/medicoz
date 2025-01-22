export default function MainContent({ theme }) {
  const features = [
    {
      icon: "📷",
      title: "Photo editing",
      bgColor: theme === "light" ? "bg-purple-100" : "bg-purple-600",
      iconBg: "bg-purple-200",
    },
    {
      icon: "🎥",
      title: "Video generation",
      bgColor: theme === "light" ? "bg-red-100" : "bg-red-600",
      iconBg: "bg-red-200",
    },
    {
      icon: "🏆",
      title: "Education feedback",
      bgColor: theme === "light" ? "bg-blue-100" : "bg-blue-600",
      iconBg: "bg-blue-200",
    },
    {
      icon: "💻",
      title: "Code generation",
      bgColor: theme === "light" ? "bg-green-100" : "bg-green-600",
      iconBg: "bg-green-200",
    },
    {
      icon: "🎵",
      title: "Audio generation",
      bgColor: theme === "light" ? "bg-amber-100" : "bg-amber-600",
      iconBg: "bg-amber-200",
    },
  ];

  return (
    <div
      className={`flex-1 p-8 ${
        theme === "light" ? "bg-gray-50" : "bg-[#1A1D1F]"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className={`text-4xl font-bold mb-4 ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          Unlock the power of AI
        </h1>
        <p
          className={`mb-8 ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Chat with the smartest AI - Experience the power of AI with us
        </p>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                theme === "light"
                  ? "bg-white shadow-sm hover:shadow"
                  : "bg-[#1E2124] hover:bg-[#23262A]"
              } cursor-pointer`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center`}
                >
                  {feature.icon}
                </div>
                <span
                  className={`ml-4 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  {feature.title}
                </span>
              </div>
              <span
                className={
                  theme === "light" ? "text-gray-400" : "text-gray-400"
                }
              >
                →
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div
            className={`flex items-center p-4 rounded-lg ${
              theme === "light" ? "bg-white shadow-sm" : "bg-[#1E2124]"
            }`}
          >
            <span className="text-gray-400">Ask Brainwave anything</span>
          </div>
        </div>
      </div>
    </div>
  );
}
