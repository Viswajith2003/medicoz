// // pages/index.tsx
// import React, { useState } from 'react';
// import { MessageSquare, Search, Settings, Plus, Share2, ThumbsUp, Copy, RefreshCw, Send } from 'lucide-react';

// interface Message {
//   content: string;
//   sender: 'user' | 'bot';
//   timestamp: string;
// }

// export default function Home() {
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');

//   const handleNewChat = () => {
//     setIsChatOpen(true);
//     setMessages([]);
//   };

//   const handleSendMessage = () => {
//     if (inputMessage.trim()) {
//       const newMessage: Message = {
//         content: inputMessage,
//         sender: 'user',
//         timestamp: 'Just now'
//       };
//       setMessages([...messages, newMessage]);
//       setInputMessage('');
      
//       // Simulate bot response
//       setTimeout(() => {
//         const botResponse: Message = {
//           content: "Hello! I'm here to help. While I'm not a substitute for a doctor, how can I assist you today?",
//           sender: 'bot',
//           timestamp: 'Just now'
//         };
//         setMessages(prev => [...prev, botResponse]);
//       }, 1000);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-900 text-white">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-800 p-4 flex flex-col">
//         <div className="flex items-center mb-8">
//           <div className="bg-green-500 p-2 rounded-lg">
//             <MessageSquare className="h-6 w-6" />
//           </div>
//           <span className="ml-2 text-xl font-bold">MediCoz</span>
//         </div>

//         {/* Sidebar Menu */}
//         <nav className="space-y-4">
//           <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded">
//             <MessageSquare className="h-5 w-5" />
//             <span>Chat</span>
//           </div>
//           <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded">
//             <Search className="h-5 w-5" />
//             <span>Search</span>
//           </div>
//           <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded">
//             <Settings className="h-5 w-5" />
//             <span>Settings</span>
//           </div>
//         </nav>

//         {/* User Profile */}
//         <div className="mt-auto flex items-center p-2">
//           <div className="w-8 h-8 bg-green-500 rounded-full"></div>
//           <span className="ml-2">Ryan Lee</span>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {isChatOpen ? (
//           <div className="flex-1 flex flex-col">
//             {/* Chat Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//               {messages.map((message, index) => (
//                 <div
//                   key={index}
//                   className={`flex ${
//                     message.sender === 'user' ? 'justify-end' : 'justify-start'
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[70%] p-3 rounded-lg ${
//                       message.sender === 'user'
//                         ? 'bg-green-500'
//                         : 'bg-gray-700'
//                     }`}
//                   >
//                     {message.content}
//                     <div className="text-xs text-gray-300 mt-1">
//                       {message.timestamp}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Input Area */}
//             <div className="p-4 border-t border-gray-700">
//               <div className="flex items-center bg-gray-800 rounded-lg p-2">
//                 <input
//                   type="text"
//                   value={inputMessage}
//                   onChange={(e) => setInputMessage(e.target.value)}
//                   placeholder="Ask anything you want..."
//                   className="flex-1 bg-transparent outline-none"
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter') handleSendMessage();
//                   }}
//                 />
//                 <Send
//                   className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white"
//                   onClick={handleSendMessage}
//                 />
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <button
//               onClick={handleNewChat}
//               className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
//             >
//               <Plus className="h-5 w-5" />
//               <span>New chat</span>
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }