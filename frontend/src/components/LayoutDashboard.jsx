import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./SideBar1";
import GlobalHeader from "./Header";
import "./LayoutDashboard.css";
import { useHeader } from "./HeaderContext";

export default function LayoutDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { headerData } = useHeader();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />
      <main className="main-content">
        <GlobalHeader 
          title={headerData.title} 
          icon={headerData.icon}
        />
        <header className="top-bar">
          <div className="header-left">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="menu-toggle"
            >
              ☰
            </button>
          </div>
          <div className="header-right">
            <span className="user-greeting">Bienvenue, {user?.username || "Utilisateur"}</span>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}