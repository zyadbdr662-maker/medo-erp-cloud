import React from "react";
import { LayoutDashboard, Users, Settings, LogOut, RotateCcw } from "lucide-react";
import { NavTab } from "./Sidebar";

interface MobileBottomNavProps {
  activeTab: NavTab | "HOME_HUB";
  setActiveTab: (tab: NavTab | "HOME_HUB") => void;
  onLogout: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: "HOME_HUB", label: "الرئيسية", icon: LayoutDashboard },
    { id: "CUSTOMERS_AR", label: "العملاء", icon: Users },
    { id: "SETTINGS", label: "الإعدادات", icon: Settings },
    { id: "LOGOUT", label: "خروج", icon: LogOut, action: onLogout },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#081220] border-t border-[#1E3A8A]/40 flex justify-around items-center p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => item.action ? item.action() : setActiveTab(item.id as NavTab)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 ${
              isActive ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"
            }`}
            style={{ minWidth: "60px" }}
          >
            <item.icon className="w-7 h-7" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
