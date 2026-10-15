

import React, { createContext, useContext, useState, useEffect } from 'react';

const ProduitContext = createContext();

const API_URL = 'http://127.0.0.1:8000/api/produits/';

export function ProduitProvider({ children }) {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les produits au montage
  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setProduits(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un produit dans l'état global
  const updateProduit = (produitId, updatedData) => {
    setProduits(prev =>
      prev.map(p => p.id_produit === produitId ? { ...p, ...updatedData } : p)
    );
  };

  // Ajouter un produit
  const addProduit = (newProduit) => {
    setProduits(prev => [...prev, newProduit]);
  };

  // Supprimer un produit
  const removeProduit = (produitId) => {
    setProduits(prev => prev.filter(p => p.id_produit !== produitId));
  };

  // Rafraîchir les produits depuis le serveur
  const refreshProduits = () => {
    fetchProduits();
  };

  const value = {
    produits,
    loading,
    fetchProduits,
    updateProduit,
    addProduit,
    removeProduit,
    refreshProduits
  };

  return (
    <ProduitContext.Provider value={value}>
      {children}
    </ProduitContext.Provider>
  );
}

// Hook pour utiliser le context
export function useProduits() {
  const context = useContext(ProduitContext);
  if (!context) {
    throw new Error('useProduits doit être utilisé dans ProduitProvider');
  }
  return context;
}