"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, LogIn, Lock, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_BASE_URL = "http://localhost:7000";

  // Check if already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password,
      });

      if (response.data.isAdmin) {
        localStorage.setItem("adminToken", response.data.token);
        setIsAdmin(true);
        setMessage({ type: "success", text: "Logged in successfully!" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Please select a file first" });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Processing PDF and uploading to Pinecone... this may take a few minutes." });

    const formData = new FormData();
    formData.append("pdf", file);

    const token = localStorage.getItem("adminToken");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/upload-medical-data`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({ type: "success", text: response.data.message });
      setFile(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Upload failed. Please check the backend logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#131619] flex items-center justify-center p-4">
        <div className="bg-[#1b1c21] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#80d758] rounded-full flex items-center justify-center mb-4">
              <Lock className="text-black" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-gray-400 mt-2">MediCoz Management Console</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d0e11] border border-gray-800 rounded-lg p-3 text-white focus:border-[#80d758] focus:outline-none transition-colors"
                  placeholder="admin@medicoz.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d0e11] border border-gray-800 rounded-lg p-3 text-white focus:border-[#80d758] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-green-900/30 text-green-400 border border-green-800'}`}>
                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#80d758] hover:bg-[#6dc046] text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" /> : <LogIn size={20} />}
              <span>Sign In as Admin</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131619] text-white">
      <header className="bg-[#1b1c21] border-b border-gray-800 p-4 md:p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">MediCoz Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition-colors border border-gray-800 px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#1b1c21] p-8 rounded-2xl border border-gray-800 flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-2">Welcome Back, Admin</h2>
            <p className="text-gray-400">
              Upload New Medical PDF data here to increase the AI chatbot knowledge base.
            </p>
          </div>
          <div className="bg-[#1b1c21] p-8 rounded-2xl border border-gray-800 flex items-center justify-around">
            <div className="text-center">
              <p className="text-gray-400 text-sm">System Status</p>
              <p className="text-[#80d758] font-bold text-lg">Online</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Vector DB</p>
              <p className="text-[#80d758] font-bold text-lg">Connected</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1b1c21] rounded-3xl border border-gray-800 overflow-hidden">
          <div className="bg-[#222425] p-6 border-b border-gray-800">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Upload size={20} className="text-[#80d758]" />
              Data Ingestion Console
            </h3>
          </div>

          <div className="p-8">
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl p-12 hover:border-[#80d758] transition-colors relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${file ? 'bg-[#80d758] text-black' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                    <Upload size={32} />
                  </div>
                  <h4 className="text-lg font-medium mb-1">
                    {file ? file.name : "Choose a PDF file or drag it here"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Maximum file size: 50MB (PDF Only)
                  </p>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl flex gap-3 ${
                  message.type === 'error' ? 'bg-red-900/20 border border-red-800/50 text-red-200' : 
                  message.type === 'info' ? 'bg-blue-900/20 border border-blue-800/50 text-blue-200' :
                  'bg-green-900/20 border border-green-800/50 text-green-200'
                }`}>
                  <div className="mt-0.5">
                    {message.type === 'error' ? <AlertCircle size={20} /> :
                     message.type === 'info' ? <Loader className="animate-spin" size={20} /> :
                     <CheckCircle size={20} />}
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-4 bg-[#80d758] hover:bg-[#6dc046] text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-500/10 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader className="animate-spin" /> : <Upload size={22} />}
                <span>Process & Upload Medical Map</span>
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-800">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Instructions</h4>
                <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
                    <li>Ensure the PDF content is in text format (not scanned images).</li>
                    <li>Avoid uploading Very Large PDFs (Split them if &gt; 100 pages for better accuracy).</li>
                    <li>The AI knowledge will be updated instantly across all client interfaces.</li>
                </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
