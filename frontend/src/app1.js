import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LayoutDashboard from "./components/LayoutDashboard";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { HeaderProvider } from "./components/HeaderContext";
import MedecinCRUD from "./pages/MedecinCRUD";
import PatientCRUD from "./pages/PatientCRUD";
import HospitalisationCRUD from "./pages/HospitalisationCRUD";
import PersonnelCRUD from "./pages/PersonnelCRUD";
import ConsultationCRUD from "./pages/ConsultationCRUD";
import PrescriptionCRUD from "./pages/PrescriptionCRUD";
import RendezVousCRUD from "./pages/RendezVousCRUD";
import PaymentInterface from "./pages/ListePaiement";
import DistributionCRUD from "./pages/DistributionCRUD";
import CommandeStockCRUD from "./pages/CommandeStockCRUD";

// Composant pour protéger les routes
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    console.log('🔍 Vérification authentification...');
    console.log('Token:', token);
    console.log('User:', storedUser);

    // ✅ AUTHENTIFICATION TROUVÉE
    if (token && storedUser) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
        console.log('✅ Utilisateur authentifié → Dashboard');
      } catch (err) {
        console.error('❌ Erreur parsing user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } else {
      // ❌ PAS D'AUTHENTIFICATION
      console.log('❌ Pas d\'authentification → Login');
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('✅ Connexion réussie:', userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    console.log('🔓 Déconnexion...');
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        ⏳ Chargement...
      </div>
    );
  }

  return (
    <HeaderProvider>
      <Routes>
       
        <Route
          path="/login"
          element={
            // ✅ Si authentifié → redirige au Dashboard
            // ❌ Si pas authentifié → affiche Login
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          }
        />

        {/* ============================================ */}
        {/* Routes Protégées - NÉCESSITE AUTHENTIFICATION */}
        {/* ============================================ */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <LayoutDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Gestion */}
          <Route path="users" element={<Users />} />
          <Route path="patients" element={<PatientCRUD />} />
          <Route path="medecins" element={<MedecinCRUD />} />
          <Route path="personnels" element={<PersonnelCRUD />} />

          {/* Consultations & Rendez-vous */}
          <Route path="consultations" element={<ConsultationCRUD />} />
          <Route path="prescriptions" element={<PrescriptionCRUD />} />
          <Route path="rendez-vous" element={<RendezVousCRUD />} />

          {/* Hospitalisations & Paiements */}
          <Route path="hospitalisations" element={<HospitalisationCRUD />} />
          <Route path="paiements" element={<PaymentInterface />} />

          {/* Stock & Produits */}
          <Route path="stock" element={<CommandeStockCRUD />} />
          <Route path="produits" element={<DistributionCRUD />} />

          {/* Paramètres */}
          <Route path="settings" element={<Settings />} />
        </Route>

       
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </HeaderProvider>
  );
}