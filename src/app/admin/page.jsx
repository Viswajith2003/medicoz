"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Upload, LogIn, Lock, CheckCircle, AlertCircle, Loader, FileText, Trash2, Database, Users } from "lucide-react";
import AdminDoctorManagement from "../components/AdminDoctorManagement";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("knowledge"); // "knowledge" or "doctors"


  // const API_BASE_URL = "http://localhost:7000";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";
  const getToken = () => localStorage.getItem("adminToken");

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("adminToken");
        } else {
          setIsAdmin(true);
        }
      } catch {
        localStorage.removeItem("adminToken");
      }
    }
  }, []);

  const fetchUploadedFiles = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setFilesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch files", err);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUploadedFiles();
  }, [isAdmin, fetchUploadedFiles]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
      if (response.data.isAdmin) {
        localStorage.setItem("adminToken", response.data.token);
        setIsAdmin(true);
        setMessage({ type: "success", text: "Logged in successfully!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
    setUploadedFiles([]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage({ type: "error", text: "Please select a file first" });
    setLoading(true);
    setMessage({ type: "info", text: `Processing "${file.name}"... this may take several minutes for large PDFs.` });
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/upload-medical-data`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${getToken()}` },
        timeout: 30 * 60 * 1000,
      });
      setMessage({ type: "success", text: response.data.message });
      setFile(null);
      fetchUploadedFiles();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Upload failed." });
      if (error.response?.status === 403) setTimeout(handleLogout, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (id, filename) => {
    if (!confirm(`Remove record for "${filename}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/files/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUploadedFiles(prev => prev.filter(f => f._id !== id));
    } catch {
      alert("Failed to delete file record.");
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  // ── Login Screen ──
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
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0d0e11] border border-gray-800 rounded-lg p-3 text-white focus:border-[#80d758] focus:outline-none"
                placeholder="admin@medicoz.com" required />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0d0e11] border border-gray-800 rounded-lg p-3 text-white focus:border-[#80d758] focus:outline-none"
                placeholder="••••••••" required />
            </div>
            {message.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-green-900/30 text-green-400 border border-green-800'}`}>
                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-[#80d758] hover:bg-[#6dc046] text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader className="animate-spin" size={20} /> : <LogIn size={20} />}
              <span>Sign In as Admin</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-[#131619] text-white">
      {/* Header */}
      <header className="bg-[#1b1c21] border-b border-gray-800 p-4 md:p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">MediCoz Admin</h1>
          </div>
          <button onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition-colors border border-gray-800 px-4 py-2 rounded-lg">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1b1c21] p-5 rounded-2xl border border-gray-800 text-center">
            <p className="text-gray-400 text-sm">System Status</p>
            <p className="text-[#80d758] font-bold text-lg mt-1">Online</p>
          </div>
          <div className="bg-[#1b1c21] p-5 rounded-2xl border border-gray-800 text-center">
            <p className="text-gray-400 text-sm">Vector DB</p>
            <p className="text-[#80d758] font-bold text-lg mt-1">Connected</p>
          </div>
          <div className="bg-[#1b1c21] p-5 rounded-2xl border border-gray-800 text-center">
            <p className="text-gray-400 text-sm">Files Uploaded</p>
            <p className="text-white font-bold text-lg mt-1">{uploadedFiles.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 p-1.5 bg-[#1b1c21] border border-gray-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'knowledge' ? 'bg-[#80d758] text-black shadow-lg shadow-[#80d758]/20' : 'text-gray-400 hover:text-white'}`}
          >
            <Database size={18} />
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("doctors")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'doctors' ? 'bg-[#80d758] text-black shadow-lg shadow-[#80d758]/20' : 'text-gray-400 hover:text-white'}`}
          >
            <Users size={18} />
            Doctor Management
          </button>
        </div>

        {activeTab === "knowledge" ? (
          /* Two Column Layout — Knowledge Base */
          <div className="flex gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* LEFT — Upload Form */}
          <div className="flex-1 space-y-6">
            <div className="bg-[#1b1c21] rounded-3xl border border-gray-800 overflow-hidden">
              <div className="bg-[#222425] p-5 border-b border-gray-800">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Upload size={20} className="text-[#80d758]" />
                  Upload Medical PDF
                </h3>
              </div>
              <div className="p-8">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl p-10 hover:border-[#80d758] transition-colors relative group">
                    <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${file ? 'bg-[#80d758] text-black' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                      <Upload size={28} />
                    </div>
                    <h4 className="text-base font-medium mb-1">{file ? file.name : "Choose a PDF or drag it here"}</h4>
                    {file && <p className="text-sm text-gray-500">{formatSize(file.size)}</p>}
                    {!file && <p className="text-sm text-gray-500">Maximum 100MB · PDF only</p>}
                  </div>

                  {message.text && (
                    <div className={`p-4 rounded-xl flex gap-3 ${message.type === 'error' ? 'bg-red-900/20 border border-red-800/50 text-red-200' : message.type === 'info' ? 'bg-blue-900/20 border border-blue-800/50 text-blue-200' : 'bg-green-900/20 border border-green-800/50 text-green-200'}`}>
                      <div className="mt-0.5 shrink-0">
                        {message.type === 'error' ? <AlertCircle size={20} /> : message.type === 'info' ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                      </div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading || !file}
                    className="w-full py-4 bg-[#80d758] hover:bg-[#6dc046] text-black font-bold text-base rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {loading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
                    <span>{loading ? "Processing PDF..." : "Process & Upload to Pinecone"}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#1b1c21] rounded-2xl border border-gray-800 p-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Instructions</h4>
              <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
                <li>Ensure the PDF content is in text format (not scanned images).</li>
                <li>Avoid uploading very large PDFs — split if &gt; 100 pages for better accuracy.</li>
                <li>The AI knowledge base is updated instantly after each upload.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT — Files Sidebar */}
          <div className="w-80 shrink-0 sticky top-24">
            <div className="bg-[#1b1c21] rounded-3xl border border-gray-800 overflow-hidden">
              <div className="bg-[#222425] p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-sm">
                  <Database size={16} className="text-[#80d758]" />
                  Knowledge Base
                </h3>
                <button onClick={fetchUploadedFiles}
                  className="text-xs text-gray-400 hover:text-white transition-colors border border-gray-700 px-2 py-1 rounded-lg">
                  Refresh
                </button>
              </div>

              {/* Scrollable file list */}
              <div className="overflow-y-auto max-h-[calc(100vh-260px)]">
                {filesLoading ? (
                  <div className="flex items-center justify-center py-10 text-gray-500">
                    <Loader className="animate-spin mr-2" size={16} />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  <div className="text-center py-10 px-4 text-gray-500">
                    <FileText size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No files uploaded yet.</p>
                  </div>
                ) : (
                  <ul className="p-3 space-y-2">
                    {uploadedFiles.map((f) => (
                      <li key={f._id}
                        className="flex items-start justify-between bg-[#0d0e11] rounded-xl p-3 border border-gray-800 hover:border-gray-600 transition-colors group">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#80d758]/10 border border-[#80d758]/20 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText size={14} className="text-[#80d758]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate text-white">{f.filename}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{formatSize(f.sizeBytes)}</p>
                            <p className="text-[10px] text-[#80d758]">{f.chunkCount.toLocaleString()} chunks</p>
                            <p className="text-[10px] text-gray-600">{formatDate(f.uploadedAt)}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteFile(f._id, f.filename)}
                          className="ml-1 p-1.5 text-gray-700 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10 shrink-0 opacity-0 group-hover:opacity-100">
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
        ) : (
          /* Doctor Management Section */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminDoctorManagement apiBaseUrl={API_BASE_URL} getToken={getToken} />
          </div>
        )}
      </main>
    </div>
  );
}
