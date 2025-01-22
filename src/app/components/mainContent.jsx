export default function MainContent({ theme }) {
  const features = [
    {
      icon: "📷",
      title: "Photo editing",
      bgColor: "bg-purple-100",
      iconBg: "bg-purple-500",
    },
    {
      icon: "🎥",
      title: "Video generation",
      bgColor: "bg-red-100",
      iconBg: "bg-red-500",
    },
    {
      icon: "🏆",
      title: "Education feedback",
      bgColor: "bg-blue-100",
      iconBg: "bg-blue-500",
    },
    {
      icon: "💻",
      title: "Code generation",
      bgColor: "bg-green-100",
      iconBg: "bg-green-500",
    },
    {
      icon: "🎵",
      title: "Audio generation",
      bgColor: "bg-amber-100",
      iconBg: "bg-amber-500",
    },
  ];

  const bgColor = theme === "light" ? "bg-white" : "bg-[#1A1D1F]";
  const textColor = theme === "light" ? "text-gray-900" : "text-white";
  const subTextColor = theme === "light" ? "text-gray-500" : "text-gray-400";

  return (
    <div className={`flex-1 p-8 ${bgColor}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-4xl font-bold ${textColor} mb-4`}>
          Unlock the power of AI
        </h1>
        <p className={`${subTextColor} mb-8`}>
          Chat with the smartest AI - Experience the power of AI with us
        </p>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                theme === "light" ? feature.bgColor : "bg-[#1E2124]"
              } hover:opacity-90 cursor-pointer`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.iconBg}`}
                >
                  {feature.icon}
                </div>
                <span className={`ml-4 ${textColor}`}>{feature.title}</span>
              </div>
              <span className={`${subTextColor}`}>→</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div
            className={`flex items-center p-4 rounded-lg ${
              theme === "light" ? "bg-gray-100" : "bg-[#1E2124]"
            }`}
          >
            <span className={`${subTextColor}`}>Ask Brainwave anything</span>
          </div>
        </div>
      </div>
    </div>
  );
}
