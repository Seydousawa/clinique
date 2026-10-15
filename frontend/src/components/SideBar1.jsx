import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  Users, 
  Settings, 
  Menu, 
  X,
  Stethoscope,
  ClipboardList,
  Pill,
  Hospital,
  DollarSign,
  Calendar,
  Package,
  ShoppingCart,
  LogOut
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ isOpen, onToggle, onLogout }) {
  const navigate = useNavigate();

  const menuItems = [
    { path: "/", label: "Accueil", icon: Home, end: true },
    { path: "/medecins", label: "Médecins", icon: Stethoscope },
    { path: "/personnels", label: "Personnel", icon: Users },
    { path: "/patients", label: "Patients", icon: Users },
    { path: "/rendez-vous", label: "Rendez-vous", icon: Calendar },
    { path: "/consultations", label: "Consultations", icon: ClipboardList },
    { path: "/hospitalisations", label: "Hospitalisations", icon: Hospital },
    { path: "/prescriptions", label: "Prescriptions", icon: Pill },
    { path: "/stock", label: "Stock", icon: Package },
    { path: "/produits", label: "Produits", icon: ShoppingCart },
    { path: "/paiements", label: "Paiements", icon: DollarSign },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        {isOpen && <span>🏥 Clinique</span>}
        <button 
          onClick={onToggle} 
          className="sidebar-toggle"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            end={item.end}
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={handleLogout}
          className="logout-button"
          title="Déconnexion"
        >
          <LogOut size={20} />
          {isOpen && <span>Déconnexion</span>}
        </button>
        {isOpen && <p>© 2025 - Gestion Clinique</p>}
      </div>
    </aside>
  );
}