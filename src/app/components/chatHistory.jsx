// export default function ChatHistory({ theme }) {
//   const chatItems = [
//     {
//       title: "Brainwave AI UI Kit",
//       description: "Write code (HTML, CSS and JS) for a simple...",
//       image: "/placeholder.jpg",
//     },
//     {
//       title: "Welcome page with input",
//       description: "Write code (HTML, CSS and JS) for a simple...",
//     },
//     {
//       title: "Photo retouch",
//       description: "Write code (HTML, CSS and JS) for a simple...",
//       users: 3,
//     },
//   ];

//   const bgColor = theme === "light" ? "bg-white" : "bg-[#1A1D1F]";
//   const textColor = theme === "light" ? "text-gray-900" : "text-white";
//   const borderColor = theme === "light" ? "border-gray-200" : "border-gray-800";

//   return (
//     <div
//       className={`w-80 border-l ${borderColor} p-4 hidden lg:block ${bgColor}`}
//     >
//       <div className="flex items-center justify-between mb-4">
//         <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
//           Chat history
//         </span>
//         <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
//           26/100
//         </span>
//       </div>

//       <div className="space-y-4">
//         {chatItems.map((item, index) => (
//           <div
//             key={index}
//             className={`p-4 rounded-lg ${
//               theme === "light" ? "bg-gray-50" : "bg-[#1E2124]"
//             } cursor-pointer`}
//           >
//             <h3 className={`${textColor} text-sm mb-1`}>{item.title}</h3>
//             <p
//               className={
//                 theme === "light"
//                   ? "text-gray-500 text-xs"
//                   : "text-gray-400 text-xs"
//               }
//             >
//               {item.description}
//             </p>
//             {item.image && (
//               <div className="mt-2">
//                 <img
//                   src={item.image}
//                   alt=""
//                   className="rounded-lg w-full h-32 object-cover"
//                 />
//               </div>
//             )}
//             <div className="mt-2 flex items-center justify-between">
//               <div className="flex -space-x-2">
//                 {[...Array(item.users || 1)].map((_, i) => (
//                   <div
//                     key={i}
//                     className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"
//                   />
//                 ))}
//               </div>
//               <span className="text-xs text-gray-400">Just now</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
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
