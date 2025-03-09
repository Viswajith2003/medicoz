import React, { useState, useEffect, useRef } from "react";
import { X, Bell, Keyboard, Users, Calendar, Settings, Moon, Volume2, Shield, MessageSquare, Globe } from "lucide-react";

const SettingsModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState("General");
  
  // Sample user data
  const [usersList, setUsersList] = useState([
    {
      id: 1,
      name: "You",
      username: "@ryan",
      avatar: "/avatar-user.png",
      role: "Owner",
    },
    {
      id: 2,
      name: "Mia Park",
      username: "@cutie-mia",
      avatar: "/avatar1.png",
      role: "Editor",
    },
    {
      id: 3,
      name: "Isabella Chen",
      username: "@issa",
      avatar: "/avatar2.png",
      role: "Editor",
    },
    {
      id: 4,
      name: "Andrew Garcia",
      username: "@garcia",
      avatar: "/avatar3.png",
      role: "Viewer",
    },
  ]);
  
  // Settings states
  const [darkMode, setDarkMode] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // All available settings tabs
  const tabs = [
    { id: "General", icon: <Settings size={18} /> },
    { id: "Access", icon: <Users size={18} /> },
    { id: "Notifications", icon: <Bell size={18} />, badge: 2 },
    { id: "Appearance", icon: <Moon size={18} /> },
    { id: "Privacy", icon: <Shield size={18} /> },
    { id: "Audio", icon: <Volume2 size={18} /> },
    { id: "Keyboard", icon: <Keyboard size={18} /> },
    { id: "Chat", icon: <MessageSquare size={18} /> },
    { id: "Calendar", icon: <Calendar size={18} /> }
  ];
  
  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-700'}`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
  
  // Settings section component
  const SettingsSection = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-white font-medium mb-3 pb-2 border-b border-gray-800">{title}</h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
  
  // Setting item component
  const SettingItem = ({ title, description, control }) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white font-medium">{title}</div>
        {description && <div className="text-gray-400 text-sm mt-1">{description}</div>}
      </div>
      {control}
    </div>
  );
  
  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <>
            <SettingsSection title="Basic Settings">
              <SettingItem
                title="Auto-save conversations"
                description="Automatically save chat history"
                control={<ToggleSwitch enabled={autoSave} onChange={setAutoSave} />}
              />
              <SettingItem
                title="Language"
                description="Choose your preferred language"
                control={
                  <select className="bg-gray-700 text-white rounded px-3 py-1 outline-none">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                }
              />
            </SettingsSection>
            
            <SettingsSection title="Medical Data">
              <SettingItem
                title="Data retention"
                description="How long to store medical chat data"
                control={
                  <select className="bg-gray-700 text-white rounded px-3 py-1 outline-none">
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                    <option>Forever</option>
                  </select>
                }
              />
              <SettingItem
                title="Export medical data"
                description="Download your medical chat history"
                control={
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1">
                    Export
                  </button>
                }
              />
            </SettingsSection>
          </>
        );
        
      case "Access":
        return (
          <>
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Invite Users</h4>
              <div className="flex items-center bg-[#292a2d] rounded-lg p-2 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    className="bg-transparent border-none outline-none text-white w-full"
                    placeholder="Add people by email or name..."
                  />
                </div>
                <div className="ml-2 flex items-center">
                  <select className="bg-gray-700 text-white rounded px-2 py-1 outline-none text-sm">
                    <option>Can view</option>
                    <option>Can edit</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm">
                Send Invites
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3 pb-2 border-b border-gray-800">Current Users</h4>
              <div className="space-y-4 mb-4 mt-3">
                {usersList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-500 flex items-center justify-center text-white">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-white text-sm">{user.name}</div>
                        <div className="text-gray-400 text-xs">{user.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <select
                        className={`mr-2 px-2 py-1 rounded-md text-xs ${
                          user.role === "Owner"
                            ? "bg-gray-700 text-white"
                            : user.role === "Editor"
                            ? "bg-blue-900 text-blue-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        <option>{user.role}</option>
                        {user.role !== "Owner" && <option>Editor</option>}
                        {user.role !== "Owner" && <option>Viewer</option>}
                        {user.role !== "Owner" && <option>Remove</option>}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Globe size={18} className="text-blue-400 mr-2" />
                  <span className="text-white">Link sharing</span>
                </div>
                <ToggleSwitch enabled={true} onChange={() => {}} />
              </div>
              <div className="bg-[#292a2d] rounded-lg p-3 flex items-center justify-between">
                <input
                  type="text"
                  value="https://medchat.example.com/share/a1b2c3d4"
                  className="bg-transparent border-none outline-none text-gray-400 text-sm w-full"
                  readOnly
                />
                <button className="bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1 text-sm">
                  Copy
                </button>
              </div>
            </div>
          </>
        );
        
      case "Notifications":
        return (
          <>
            <SettingsSection title="Notification Settings">
              <SettingItem
                title="Sound notifications"
                description="Play sound when new messages arrive"
                control={<ToggleSwitch enabled={notificationSound} onChange={setNotificationSound} />}
              />
              <SettingItem
                title="Email notifications"
                description="Receive email for important updates"
                control={<ToggleSwitch enabled={emailNotifications} onChange={setEmailNotifications} />}
              />
              <SettingItem
                title="Notification frequency"
                description="How often to receive notifications"
                control={
                  <select className="bg-gray-700 text-white rounded px-3 py-1 outline-none">
                    <option>Immediately</option>
                    <option>Hourly digest</option>
                    <option>Daily digest</option>
                  </select>
                }
              />
            </SettingsSection>
            
            <SettingsSection title="Medical Alerts">
              <SettingItem
                title="Prescription reminders"
                description="Get notified about medication schedules"
                control={<ToggleSwitch enabled={true} onChange={() => {}} />}
              />
              <SettingItem
                title="Appointment alerts"
                description="Notifications for upcoming medical appointments"
                control={<ToggleSwitch enabled={true} onChange={() => {}} />}
              />
              <SettingItem
                title="Test results"
                description="Notify when new test results are available"
                control={<ToggleSwitch enabled={true} onChange={() => {}} />}
              />
            </SettingsSection>
          </>
        );
        
      case "Appearance":
        return (
          <SettingsSection title="Display Settings">
            <SettingItem
              title="Dark mode"
              description="Use dark theme throughout the application"
              control={<ToggleSwitch enabled={darkMode} onChange={setDarkMode} />}
            />
            <SettingItem
              title="Font size"
              description="Adjust the text size throughout the app"
              control={
                <select className="bg-gray-700 text-white rounded px-3 py-1 outline-none">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              }
            />
            <SettingItem
              title="Color theme"
              description="Choose accent color for the interface"
              control={
                <div className="flex space-x-2">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500"].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full ${color} ${color === "bg-blue-500" ? "ring-2 ring-white" : ""}`}
                    />
                  ))}
                </div>
              }
            />
          </SettingsSection>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-gray-400 mb-2">Settings for {activeTab}</div>
            <div className="text-gray-600 text-sm">This section is coming soon</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-[#1b1c1f] rounded-xl w-full max-w-3xl overflow-hidden shadow-xl my-6 mx-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h3 className="text-xl font-medium text-white">Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[500px]">
          {/* Sidebar */}
          <div className="w-52 border-r border-gray-800 p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{tab.icon}</span>
                    <span>{tab.id}</span>
                  </div>
                  {tab.badge && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-white mb-4">{activeTab} Settings</h3>
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-800">
          <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 mr-3">
            Cancel
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;