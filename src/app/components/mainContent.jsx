export default function MainContent() {
  const features = [
    { icon: "📷", title: "Photo editing", color: "bg-purple-600" },
    { icon: "🎥", title: "Video generation", color: "bg-red-600" },
    { icon: "🏆", title: "Education feedback", color: "bg-blue-600" },
    { icon: "💻", title: "Code generation", color: "bg-green-600" },
    { icon: "🎵", title: "Audio generation", color: "bg-amber-600" },
  ];

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">
          Unlock the power of AI
        </h1>
        <p className="text-gray-400 mb-8">
          Chat with the smartest AI - Experience the power of AI with us
        </p>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-[#1E2124] hover:bg-[#23262A] cursor-pointer"
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}
                >
                  {feature.icon}
                </div>
                <span className="ml-4 text-white">{feature.title}</span>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex items-center p-4 rounded-lg bg-[#1E2124]">
            <span className="text-gray-400">Ask Brainwave anything</span>
          </div>
        </div>
      </div>
    </div>
  );
}
