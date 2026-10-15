import React, { useState, useEffect } from 'react';
import { Plus, Package } from 'lucide-react';
import CommandeFilterBar from '../components/CommandeFilterBar';
import CommandeModal from '../components/CommandeModal';
import CommandeTable from '../components/CommandeTable';
import DeleteModal from '../components/DeleteModal';
import { useHeader } from '../components/HeaderContext';

const COMMANDESTOCK_API = 'http://127.0.0.1:8000/api/commandestocks/';
const PRODUITS_API = 'http://127.0.0.1:8000/api/produits/';
const COMMANDES_STORAGE_KEY = 'commandes-locales';

export default function CommandeStockCRUD() {
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ── État DeleteModal ──
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);   // { id, nom }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    produit: '',
    quantite: '',
    fournisseur: '',
    statut: 'en_attente'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader('Gestion du stock', Package);
  }, [setHeader]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (isInitialized && commandes.length >= 0) {
      saveCommandesToStorage(commandes);
    }
  }, [commandes, isInitialized]);

  const saveCommandesToStorage = (data) => {
    try {
      localStorage.setItem(COMMANDES_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Erreur sauvegarde localStorage:', err);
    }
  };

  const loadCommandesFromStorage = () => {
    try {
      const jsonData = localStorage.getItem(COMMANDES_STORAGE_KEY);
      return jsonData ? JSON.parse(jsonData) : [];
    } catch (err) {
      console.error('Erreur chargement localStorage:', err);
      return [];
    }
  };

  const initializeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedCommandes = loadCommandesFromStorage();
      let produitsData = [];
      try {
        const prodRes = await fetch(PRODUITS_API);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          produitsData = Array.isArray(prodData) ? prodData : prodData.results || [];
        }
      } catch (err) {
        console.warn('API produits indisponible:', err.message);
      }
      setProduits(produitsData);
      setCommandes(storedCommandes);
      setIsInitialized(true);
    } catch (err) {
      console.error('Erreur initialisation:', err);
      setError("Erreur lors de l'initialisation");
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.produit) newErrors.produit = 'Le produit est requis';
    if (!formData.quantite || parseInt(formData.quantite) <= 0) newErrors.quantite = 'Quantité valide requise';
    if (!formData.fournisseur) newErrors.fournisseur = 'Le fournisseur est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCommande = () => {
    if (!validateForm()) return;
    const produitSelectione = produits.find(p => p.id_produit == formData.produit);
    const nomProduit = produitSelectione?.designation || formData.produit;

    if (isEditMode) {
      const updated = commandes.map(c =>
        c.id === editingId ? { ...c, ...formData, nom_produit: nomProduit } : c
      );
      setCommandes(updated);
      setMessage('✏️ Commande modifiée avec succès');
    } else {
      const newCommande = {
        id: Date.now(),
        ...formData,
        nom_produit: nomProduit,
        date_commande: new Date().toISOString().split('T')[0]
      };
      setCommandes([...commandes, newCommande]);
      setMessage('✅ Commande créée avec succès');
    }
    closeModal();
  };

  /* ── Ouvrir le DeleteModal au lieu de window.confirm ── */
  const handleDeleteCommande = (id) => {
    const commande = commandes.find(c => c.id === id);
    if (!commande) return;

    const produit = produits.find(p => p.id_produit == commande.produit);
    const nom = produit?.designation || commande.nom_produit || `Commande #${id}`;

    setDeleteTarget({ id, nom });
    setIsDeleteModalOpen(true);
  };

  /* ── Confirmer la suppression depuis le DeleteModal ── */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    // Simule un léger délai pour l'effet visuel du spinner
    setTimeout(() => {
      const updated = commandes.filter(c => c.id !== deleteTarget.id);
      setCommandes(updated);
      setMessage('🗑️ Commande supprimée');
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    }, 600);
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleRecevoir = async (id) => {
    const commande = commandes.find(c => c.id === id);
    if (!commande) { setError('Commande non trouvée'); return; }

    try {
      const produitResponse = await fetch(`${PRODUITS_API}${commande.produit}/`);
      if (!produitResponse.ok) throw new Error(`Erreur API produit: ${produitResponse.status}`);
      const produit = await produitResponse.json();

      const quantiteCommandee = parseInt(commande.quantite) || 0;
      const nouveauStock = produit.quantite_stock + quantiteCommandee;

      const updateResponse = await fetch(`${PRODUITS_API}${commande.produit}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...produit, quantite_stock: nouveauStock })
      });

      if (updateResponse.ok) {
        setProduits(prev =>
          prev.map(p => p.id_produit === produit.id_produit ? { ...p, quantite_stock: nouveauStock } : p)
        );
        setCommandes(prev =>
          prev.map(c => c.id === id ? { ...c, statut: 'recu' } : c)
        );
        setMessage(`✅ Stock de ${produit.designation} augmenté de ${quantiteCommandee} (Total: ${nouveauStock})`);
        setTimeout(() => initializeData(), 1000);
      } else {
        const errorData = await updateResponse.json();
        throw new Error(`Erreur de mise à jour: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      setError(`❌ Erreur: ${err.message}`);
    }
  };

  const openModal = (commande = null) => {
    if (commande) {
      setFormData({
        produit: commande.produit,
        quantite: commande.quantite,
        fournisseur: commande.fournisseur,
        statut: commande.statut
      });
      setEditingId(commande.id);
      setIsEditMode(true);
    } else {
      setFormData({ produit: '', quantite: '', fournisseur: '', statut: 'en_attente' });
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

  const filteredCommandes = commandes.filter(c => {
    const produit = produits.find(p => p.id_produit === c.produit);
    const matchesSearch = searchTerm === '' ||
      produit?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = !statutFilter || c.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f9ff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>

        {/* Messages */}
        {message && (
          <div style={{
            backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46',
            padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: '500' }}>{message}</span>
            <button onClick={() => setMessage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#065f46' }}>×</button>
          </div>
        )}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d',
            padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: '500' }}>⚠ {error}</span>
            <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#7f1d1d' }}>×</button>
          </div>
        )}

        {/* Bouton nouvelle commande */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => openModal()}
            style={{
              backgroundColor: '#10b981', color: 'white', border: 'none',
              padding: '10px 16px', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
            }}
          >
            <Plus size={18} /> Nouvelle Commande
          </button>
        </div>

        <CommandeFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statutFilter={statutFilter}
          setStatutFilter={setStatutFilter}
        />

        <CommandeTable
          commandes={filteredCommandes}
          produits={produits}
          loading={loading}
          onEdit={openModal}
          onDelete={handleDeleteCommande}
          onRecevoir={handleRecevoir}
        />
      </div>

      {/* Modal commande */}
      <CommandeModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={formData}
        errors={errors}
        produits={produits}
        onInputChange={handleInputChange}
        onSubmit={handleSaveCommande}
        onClose={closeModal}
        loading={loading}
      />

      {/* ── Modal suppression ── */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        target={deleteTarget}
        onDelete={handleConfirmDelete}
        onClose={handleCloseDeleteModal}
        loading={deleteLoading}
      />
    </div>
  );
}