import { useState } from "react";
import { Anchor } from "lucide-react";
import CalendarView from "@/components/calendar-view";
import ChatView from "@/components/chat-view";
import PhotosView from "@/components/photos-view";

type TabType = "calendar" | "chat" | "photos";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("calendar");

  const tabs = [
    { id: "calendar" as const, label: "Events", icon: "calendar-alt" },
    { id: "chat" as const, label: "Tide Talk", icon: "comments" },
    { id: "photos" as const, label: "Memories", icon: "camera" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="https://files.smartsites.parentsquare.com/5437/header_logo_img_26xxd1.png" 
                  alt="Gig Harbor High School Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy">Tides Hub</h1>
                <p className="text-xs text-slate-500">Tides Girls Water Polo</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="hidden md:flex space-x-1 bg-slate-100 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                >
                  <i className={`fas fa-${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-columbia-wave rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">JS</span>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-1 bg-slate-100 rounded-lg p-1 mb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id ? "active" : ""
                }`}
              >
                <i className={`fas fa-${tab.icon}`}></i>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "calendar" && <CalendarView />}
        {activeTab === "chat" && <ChatView />}
        {activeTab === "photos" && <PhotosView />}
      </div>
    </div>
  );
}
