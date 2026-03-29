"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, X, Check, Loader, User, Phone, Stethoscope, Briefcase } from "lucide-react";

export default function AdminDoctorManagement({ apiBaseUrl, getToken }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    whatsapp: "",
    experience: "",
    bio: "",
    image: "",
    availableDays: [],
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/admin/doctors`);
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        specialty: doctor.specialty,
        whatsapp: doctor.whatsapp,
        experience: doctor.experience || "",
        bio: doctor.bio || "",
        image: doctor.image || "",
        availableDays: doctor.availableDays || [],
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: "",
        specialty: "",
        whatsapp: "",
        experience: "",
        bio: "",
        image: "",
        availableDays: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getToken();
    try {
      if (editingDoctor) {
        await axios.put(`${apiBaseUrl}/admin/doctors/${editingDoctor._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiBaseUrl}/admin/doctors`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchDoctors();
      handleCloseModal();
    } catch (err) {
      alert("Error saving doctor: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete Dr. ${name}?`)) return;
    const token = getToken();
    try {
      await axios.delete(`${apiBaseUrl}/admin/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(doctors.filter((d) => d._id !== id));
    } catch (err) {
      alert("Failed to delete doctor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1b1c21] p-6 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold">Doctor Management</h2>
          <p className="text-gray-400 text-sm">Add or edit doctors available on the platform</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#80d758] hover:bg-[#6dc046] text-black font-bold py-2 px-4 rounded-xl transition-all"
        >
          <Plus size={20} />
          Add New Doctor
        </button>
      </div>

      {loading && !isModalOpen ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-[#80d758]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-[#1b1c21] border border-gray-800 rounded-3xl p-6 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {doc.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(doc)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-blue-400 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id, doc.name)}
                    className="p-2 bg-gray-800 hover:bg-red-900/30 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold">Dr. {doc.name}</h3>
              <p className="text-[#80d758] text-sm font-medium mb-3">{doc.specialty}</p>

              <div className="space-y-2 mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-gray-500" />
                  <span>{doc.experience || "N/A Experience"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-500" />
                  <span>{doc.whatsapp}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 line-clamp-2">{doc.bio || "No bio available."}</p>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full py-20 bg-[#1b1c21] border border-gray-800 border-dashed rounded-3xl text-center text-gray-500">
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>No doctors added yet. Click "Add New Doctor" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b1c21] border border-gray-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold">{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0d0e11] border border-gray-800 rounded-xl p-3 text-white focus:border-[#80d758] outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Stethoscope size={14} /> Specialty
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-[#0d0e11] border border-gray-800 rounded-xl p-3 text-white focus:border-[#80d758] outline-none transition-all"
                    placeholder="e.g. Cardiologist"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Phone size={14} /> WhatsApp Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-[#0d0e11] border border-gray-800 rounded-xl p-3 text-white focus:border-[#80d758] outline-none transition-all"
                    placeholder="e.g. +919072906576"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Briefcase size={14} /> Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-[#0d0e11] border border-gray-800 rounded-xl p-3 text-white focus:border-[#80d758] outline-none transition-all"
                    placeholder="e.g. 10 years"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Bio / About</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-[#0d0e11] border border-gray-800 rounded-xl p-3 text-white focus:border-[#80d758] outline-none transition-all resize-none"
                  placeholder="Tell us about the doctor..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-[#80d758] hover:bg-[#6dc046] text-black font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#80d758]/20"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <Check size={20} />}
                  {editingDoctor ? "Update Doctor" : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
