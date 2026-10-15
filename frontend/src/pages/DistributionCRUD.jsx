import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, ShoppingCart, X, Trash, Edit } from 'lucide-react';
import DistributionFilterBar from '../components/DistributionFilterBar';
import DistributionModal from '../components/DistributionModal';
import DistributionDetailModal from '../components/DistributionDetailModal';
import AjouterProduitModal from '../components/AjouterProduitModal';
import { useHeader } from '../components/HeaderContext';

const PRODUITS_API = 'http://127.0.0.1:8000/api/produits/';
const COMMANDESTOCK_API = 'http://127.0.0.1:8000/api/commandestocks/';

export default function DistributionCRUD() {
  // État des données
  const [produits, setProduits] = useState([]);
  const [commandesStock, setCommandesStock] = useState([]);
  const [distributions, setDistributions] = useState([]);
  
  // État du panier
  const [panier, setPanier] = useState([]);
  const [showPanier, setShowPanier] = useState(false);

  // État des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [isAjouterProduitOpen, setIsAjouterProduitOpen] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    produit_id: '',
    designation: '',
    quantite_distribuee: '',
    date_distribution: new Date().toISOString().split('T')[0],
    prix_total: '',
    observations: ''
  });

  // État des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');

  // État des messages
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Charger les données au montage uniquement
  useEffect(() => {
    loadAllData();
    loadLocalDistributions();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Chargement des données...');
      
      // Charger les produits
      const prodResponse = await fetch(PRODUITS_API);
      if (!prodResponse.ok) throw new Error(`Produits API: ${prodResponse.status}`);
      const prodData = await prodResponse.json();
      const produitsData = Array.isArray(prodData) ? prodData : prodData.results || [];
      setProduits(produitsData);
      console.log('✅ Produits chargés:', produitsData.length);

      // Charger les commandes de stock
      const cmdResponse = await fetch(COMMANDESTOCK_API);
      if (!cmdResponse.ok) throw new Error(`CommandeStock API: ${cmdResponse.status}`);
      const cmdData = await cmdResponse.json();
      const commandesData = Array.isArray(cmdData) ? cmdData : cmdData.results || [];
      setCommandesStock(commandesData);
      console.log('✅ Commandes stock chargées:', commandesData.length);

    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(`Erreur de connexion: ${err.message}. Vérifiez que le serveur Django fonctionne.`);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalDistributions = () => {
    const saved = localStorage.getItem('distributions_produits');
    if (saved) {
      try {
        setDistributions(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement local:', e);
      }
    }
  };

  // ============================================
  // FONCTION : SUPPRIMER UN PRODUIT
  // ============================================

  const handleDeleteProduit = async (produitId) => {
    // Vérifier si le produit est utilisé dans des distributions
    const produitUtilise = distributions.some(d => String(d.produit_id) === String(produitId));
    
    if (produitUtilise) {
      setError('❌ Impossible de supprimer ce produit : il est utilisé dans des distributions.');
      return;
    }

    // Demander confirmation
    const produit = produits.find(p => String(p.id_produit) === String(produitId));
    if (!produit) return;

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le produit "${produit.designation}" ?\n\nCette action est irréversible.`
    );

    if (!confirmDelete) return;

    setDeletingId(produitId);

    try {
      // Supprimer de l'API
      const response = await fetch(`${PRODUITS_API}${produitId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la suppression');
      }

      // Mettre à jour l'état local
      setProduits(prev => prev.filter(p => String(p.id_produit) !== String(produitId)));
      
      // Retirer du panier si présent
      setPanier(prev => prev.filter(item => String(item.produit_id) !== String(produitId)));
      
      setMessage(`✅ Produit "${produit.designation}" supprimé avec succès`);

    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      setError(`❌ Erreur lors de la suppression: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // FONCTIONS POUR LE PANIER
  // ============================================

  // Ajouter un produit au panier
  const ajouterAuPanier = (produitId) => {
    const produit = produits.find(p => String(p.id_produit) === String(produitId));
    if (!produit || produit.quantite_stock <= 0) {
      setMessage('Produit non disponible');
      return;
    }

    setPanier(prev => {
      const produitExistant = prev.find(item => item.produit_id === produitId);
      
      if (produitExistant) {
        // Vérifier si on peut ajouter plus de stock
        if (produitExistant.quantite >= produit.quantite_stock) {
          setMessage(`Stock insuffisant. Maximum: ${produit.quantite_stock}`);
          return prev;
        }
        return prev.map(item =>
          item.produit_id === produitId
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      } else {
        // Nouveau produit dans le panier
        return [...prev, {
          produit_id: produitId,
          quantite: 1,
          designation: produit.designation,
          prix: produit.prix,
          stock_max: produit.quantite_stock
        }];
      }
    });
    
    setShowPanier(true);
    setMessage(`"${produit.designation}" ajouté au panier`);
  };

  // Modifier la quantité d'un produit dans le panier
  const modifierQuantitePanier = (produitId, nouvelleQuantite) => {
    if (nouvelleQuantite < 1) return;
    
    const produit = produits.find(p => String(p.id_produit) === String(produitId));
    if (!produit) return;
    
    if (nouvelleQuantite > produit.quantite_stock) {
      setMessage(`Stock insuffisant. Maximum: ${produit.quantite_stock}`);
      return;
    }

    setPanier(prev =>
      prev.map(item =>
        item.produit_id === produitId
          ? { ...item, quantite: nouvelleQuantite }
          : item
      )
    );
  };

  // Supprimer un produit du panier
  const supprimerDuPanier = (produitId) => {
    setPanier(prev => prev.filter(item => item.produit_id !== produitId));
  };

  // Vider tout le panier
  const viderPanier = () => {
    setPanier([]);
    setMessage('Panier vidé');
  };

  // Valider tout le panier en une fois
  const validerPanier = () => {
    if (panier.length === 0) {
      setMessage('Le panier est vide');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const nouvellesDistributions = panier.map((item, index) => {
      const produit = produits.find(p => String(p.id_produit) === String(item.produit_id));
      
      return {
        id: Date.now() + index,
        produit_id: item.produit_id,
        designation: produit.designation,
        quantite_distribuee: item.quantite,
        date_distribution: today,
        prix_total: (parseFloat(produit.prix) * item.quantite).toFixed(2),
        observations: 'Distribution depuis le panier'
      };
    });

    // Mettre à jour les distributions
    const updatedDistributions = [...distributions, ...nouvellesDistributions];
    setDistributions(updatedDistributions);
    localStorage.setItem('distributions_produits', JSON.stringify(updatedDistributions));

    // Mettre à jour les stocks localement
    const produitsMisAJour = produits.map(p => {
      const itemPanier = panier.find(item => String(item.produit_id) === String(p.id_produit));
      if (itemPanier) {
        const nouveauStock = p.quantite_stock - itemPanier.quantite;
        updateProduitStock(p.id_produit, Math.max(0, nouveauStock));
        return { ...p, quantite_stock: Math.max(0, nouveauStock) };
      }
      return p;
    });
    
    setProduits(produitsMisAJour);
    viderPanier();
    setShowPanier(false);
    setMessage(`✅ ${panier.length} distribution(s) créée(s) avec succès`);
  };

  // ============================================
  // FONCTIONS EXISTANTES
  // ============================================

  const handleAddProductSubmit = async (productData) => {
    setSubmitLoading(true);
    try {
      const response = await fetch(PRODUITS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'ajout du produit');
      }

      const newProduct = await response.json();
      
      setProduits(prevProduits => [...prevProduits, newProduct]);
      setMessage('✅ Produit ajouté avec succès!');
      setIsAjouterProduitOpen(false);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(`❌ Erreur: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getProduitById = (produitId) => {
    return produits.find(p => String(p.id_produit) === String(produitId));
  };

  const getProduitsDisponibles = () => {
    return produits.filter(p => p.quantite_stock > 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.produit_id) newErrors.produit_id = 'Le produit est requis';
    if (!formData.quantite_distribuee || parseInt(formData.quantite_distribuee) <= 0) {
      newErrors.quantite_distribuee = 'Quantité valide requise';
    }
    if (!formData.date_distribution) newErrors.date_distribution = 'La date est requise';

    const produit = getProduitById(formData.produit_id);
    if (produit && parseInt(formData.quantite_distribuee) > parseInt(produit.quantite_stock || 0)) {
      newErrors.quantite_distribuee = `Stock insuffisant (disponible: ${produit.quantite_stock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDistribution = () => {
    if (!validateForm()) return;

    const produit = getProduitById(formData.produit_id);
    
    if (isEditMode) {
      const updated = distributions.map(d => 
        d.id === editingId ? { ...formData, id: editingId } : d
      );
      setDistributions(updated);
      localStorage.setItem('distributions_produits', JSON.stringify(updated));
      setMessage('Distribution modifiée avec succès');
    } else {
      const newDistribution = {
        id: Date.now(),
        ...formData
      };
      const updated = [...distributions, newDistribution];
      setDistributions(updated);
      localStorage.setItem('distributions_produits', JSON.stringify(updated));

      if (produit) {
        const quantiteDistribuee = parseInt(formData.quantite_distribuee);
        const nouveauStock = produit.quantite_stock - quantiteDistribuee;
        
        const produitsUpdated = produits.map(p => 
          p.id_produit === produit.id_produit 
            ? { ...p, quantite_stock: Math.max(0, nouveauStock) }
            : p
        );
        setProduits(produitsUpdated);
        updateProduitStock(produit.id_produit, Math.max(0, nouveauStock));
      }

      setMessage('Distribution créée avec succès');
    }

    closeModal();
  };

  const updateProduitStock = async (produitId, nouveauStock) => {
    try {
      const produit = getProduitById(produitId);
      if (!produit) return;

      await fetch(`${PRODUITS_API}${produitId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...produit,
          quantite_stock: nouveauStock
        })
      });
      console.log('✅ Stock mis à jour sur le serveur');
    } catch (err) {
      console.error('❌ Erreur mise à jour stock:', err);
    }
  };

  const handleDeleteDistribution = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette distribution ?')) {
      const updated = distributions.filter(d => d.id !== id);
      setDistributions(updated);
      localStorage.setItem('distributions_produits', JSON.stringify(updated));
      setMessage('Distribution supprimée');
    }
  };

  const handleProduitChange = (e) => {
    const produitId = e.target.value;
    const produit = getProduitById(produitId);
    
    if (produit) {
      setFormData(prev => ({
        ...prev,
        produit_id: String(produitId),
        designation: produit.designation || '',
        prix_total: ''
      }));
    }
  };

  const handleQuantiteChange = (e) => {
    const quantite = e.target.value;
    const produit = getProduitById(formData.produit_id);
    
    if (produit && quantite) {
      const prixUnitaire = parseInt(produit.prix) || 0;
      const prixTotal = parseInt(quantite) * prixUnitaire;
      
      setFormData(prev => ({
        ...prev,
        quantite_distribuee: quantite,
        prix_total: prixTotal
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        quantite_distribuee: quantite,
        prix_total: ''
      }));
    }
  };

  const openModal = (distribution = null) => {
    loadAllData();
    
    if (distribution) {
      setFormData(distribution);
      setEditingId(distribution.id);
      setIsEditMode(true);
    } else {
      setFormData({
        produit_id: '',
        designation: '',
        quantite_distribuee: '',
        date_distribution: new Date().toISOString().split('T')[0],
        prix_total: '',
        observations: ''
      });
      setIsEditMode(false);
      setEditingId(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const filteredDistributions = distributions.filter(d => {
    const matchesSearch = searchTerm === '' ||
      d.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.date_distribution?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const { setHeader } = useHeader();
  useEffect(() => {
    setHeader('Gestion de Produits', ShoppingCart);
  }, [setHeader]);

  // Calculer le total du panier
  const totalPanier = panier.reduce((total, item) => {
    const produit = produits.find(p => String(p.id_produit) === String(item.produit_id));
    return total + (parseFloat(produit?.prix || 0) * item.quantite);
  }, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f9ff' }}>
      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Messages */}
        {message && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '500' }}>✓ {message}</span>
            <button onClick={() => setMessage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#065f46' }}>×</button>
          </div>
        )}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#7f1d1d',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '500' }}>⚠ {error}</span>
            <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#7f1d1d' }}>×</button>
          </div>
        )}

        {/* Actions Bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => openModal()}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            <Plus size={18} /> Nouvelle Distribution
          </button>

          <button
            onClick={() => setIsAjouterProduitOpen(true)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            <Plus size={18} /> Ajouter un Produit
          </button>

          {/* Bouton Panier */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPanier(!showPanier)}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <ShoppingCart size={18} /> Panier
              {panier.length > 0 && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  {panier.reduce((sum, item) => sum + item.quantite, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Panier (s'affiche quand ouvert) */}
        {showPanier && panier.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>
                <ShoppingCart style={{ marginRight: '10px' }} />
                Mon Panier ({panier.length} produit{panier.length > 1 ? 's' : ''})
              </h3>
              <button
                onClick={() => setShowPanier(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#64748b'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {panier.map((item, index) => {
                const produit = produits.find(p => String(p.id_produit) === String(item.produit_id));
                if (!produit) return null;

                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#1e293b' }}>
                        {produit.designation}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Prix unitaire: {parseFloat(produit.prix || 0).toFixed(2)} F CFA | 
                        Stock disponible: {produit.quantite_stock}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => modifierQuantitePanier(item.produit_id, item.quantite - 1)}
                          disabled={item.quantite <= 1}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            background: 'white',
                            cursor: item.quantite <= 1 ? 'not-allowed' : 'pointer',
                            color: '#374151'
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: '500', minWidth: '30px', textAlign: 'center' }}>
                          {item.quantite}
                        </span>
                        <button
                          onClick={() => modifierQuantitePanier(item.produit_id, item.quantite + 1)}
                          disabled={item.quantite >= produit.quantite_stock}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            background: 'white',
                            cursor: item.quantite >= produit.quantite_stock ? 'not-allowed' : 'pointer',
                            color: '#374151'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '120px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {(parseFloat(produit.prix) * item.quantite).toFixed(2)} F CFA
                        </div>
                      </div>

                      <button
                        onClick={() => supprimerDuPanier(item.produit_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#ef4444',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '20px',
                marginTop: '10px',
                borderTop: '2px solid #e5e7eb'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '18px', color: '#1e293b' }}>
                    Total: {totalPanier.toFixed(2)} F CFA
                  </div>
                  <button
                    onClick={viderPanier}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '14px',
                      padding: '8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash size={14} /> Vider le panier
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowPanier(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Continuer
                  </button>
                  <button
                    onClick={validerPanier}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShoppingCart size={16} /> Valider ({panier.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <DistributionFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          destinationFilter={destinationFilter}
          setDestinationFilter={setDestinationFilter}
          destinations={[...new Set(distributions.map(d => d.destination).filter(Boolean))]}
          produits={produits}
          placeholder="Rechercher un produit..."
        />

        {/* Table des Produits */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginTop: '24px'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>
                Tous les Produits ({produits.length})
              </h3>
            </div>
            <div style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              En stock: {getProduitsDisponibles().length}
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ color: '#6b7280' }}>Chargement des produits...</p>
            </div>
          ) : produits.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>Aucun produit enregistré</p>
              <button
                onClick={() => setIsAjouterProduitOpen(true)}
                style={{
                  marginTop: '16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} /> Ajouter votre premier produit
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#374151'
                    }}>Produit</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#374151'
                    }}>Stock</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#374151'
                    }}>Prix</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#374151'
                    }}>Statut</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#374151',
                      width: '200px'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {produits
                    .filter(produit => 
                      searchTerm === '' ||
                      produit.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      produit.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((produit, index) => (
                      <tr
                        key={produit.id_produit}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                          fontSize: '14px'
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
                            {produit.designation}
                          </div>
                          {produit.description && (
                            <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.4' }}>
                              {produit.description.length > 60 
                                ? `${produit.description.substring(0, 60)}...` 
                                : produit.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            backgroundColor: produit.quantite_stock > 20 ? '#d1fae5' : 
                                            produit.quantite_stock > 5 ? '#fef3c7' : '#fee2e2',
                            color: produit.quantite_stock > 20 ? '#065f46' : 
                                  produit.quantite_stock > 5 ? '#92400e' : '#b91c1c',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Package size={12} /> {produit.quantite_stock} unités
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#059669' }}>
                          {produit.prix ? `${parseFloat(produit.prix).toLocaleString('fr-FR')} FCFA` : 'Gratuit'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            backgroundColor: produit.quantite_stock > 0 ? '#d1fae5' : '#fee2e2',
                            color: produit.quantite_stock > 0 ? '#065f46' : '#b91c1c',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {produit.quantite_stock > 0 ? 'En stock' : 'Rupture'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => ajouterAuPanier(produit.id_produit)}
                              disabled={produit.quantite_stock <= 0}
                              title="Ajouter au panier"
                              style={{
                                backgroundColor: produit.quantite_stock > 0 ? '#8b5cf6' : '#d1d5db',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: produit.quantite_stock > 0 ? 'pointer' : 'not-allowed',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                minWidth: '120px',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (produit.quantite_stock > 0) {
                                  e.currentTarget.style.backgroundColor = '#7c3aed';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (produit.quantite_stock > 0) {
                                  e.currentTarget.style.backgroundColor = '#8b5cf6';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }
                              }}
                            >
                              <ShoppingCart size={16} /> Panier
                            </button>
                            
                            {/* Bouton Supprimer - Style moderne */}
                            <button
                              onClick={() => handleDeleteProduit(produit.id_produit)}
                              disabled={deletingId === produit.id_produit}
                              title="Supprimer ce produit"
                              style={{
                                backgroundColor: deletingId === produit.id_produit ? '#9ca3af' : '#fef2f2',
                                color: deletingId === produit.id_produit ? '#ffffff' : '#dc2626',
                                border: deletingId === produit.id_produit ? 'none' : '1px solid #fecaca',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: deletingId === produit.id_produit ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: '40px',
                                transition: 'all 0.2s',
                                boxShadow: deletingId === produit.id_produit ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                              }}
                              onMouseEnter={(e) => {
                                if (deletingId !== produit.id_produit) {
                                  e.currentTarget.style.backgroundColor = '#fee2e2';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (deletingId !== produit.id_produit) {
                                  e.currentTarget.style.backgroundColor = '#fef2f2';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                }
                              }}
                            >
                              {deletingId === produit.id_produit ? (
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #ffffff',
                                  borderTop: '2px solid transparent',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite'
                                }} />
                              ) : (
                                <>
                                  <Trash size={16} style={{ strokeWidth: 2 }} />
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <DistributionModal
          isOpen={isModalOpen}
          isEditMode={isEditMode}
          formData={formData}
          errors={errors}
          produits={getProduitsDisponibles()}
          onInputChange={handleInputChange}
          onProduitChange={handleProduitChange}
          onQuantiteChange={handleQuantiteChange}
          onSubmit={handleSaveDistribution}
          onClose={closeModal}
          loading={loading}
          key={produits.length}
        />
      )}

      <DistributionDetailModal
        isOpen={isDetailOpen}
        distribution={selectedDistribution}
        onClose={() => setIsDetailOpen(false)}
      />

      <AjouterProduitModal
        isOpen={isAjouterProduitOpen}
        onClose={() => setIsAjouterProduitOpen(false)}
        onAddProduct={handleAddProductSubmit}
        loading={submitLoading}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}