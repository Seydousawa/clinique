import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import MedecinTable from '../components/MedecinTable';
import MedecinModal from '../components/MedecinModal';
import DeleteModal from '../components/DeleteModal';
import RestoreModal from '../components/RestoreModal';
import PermanentDeleteModal from '../components/PermanentDeleteModal';
import MessageAlert from '../components/MessageAlert';
import Header from '../components/Header';
import { Users, Plus, User, Mail, Stethoscope, Phone, Archive, Filter } from 'lucide-react';
import './MedecinCRUD.css';
import { useHeader } from '../components/HeaderContext';

const API_URL = 'http://127.0.0.1:8000/api/medecins/';

export default function MedecinCRUD() {
  
  const [medecins, setMedecins] = useState([]);

  // États des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);

  // État du mode édition
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMedecin, setCurrentMedecin] = useState({
    id_medecin: null,
    nom: '',
    prenom: '',
    specialite: '',
    email: '',
    telephone: ''
  });

  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('');
  const [viewMode, setViewMode] = useState('active'); // 'active', 'archived'

  // Cibles pour suppression, restauration et suppression définitive
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Charger les médecins au montage et au changement de viewMode
  useEffect(() => {
    fetchMedecins();
  }, [viewMode]);

  /**
   * Récupère les médecins selon le mode d'affichage
   */
  const fetchMedecins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?status=${viewMode}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      setMedecins(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des médecins');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valide les données du formulaire
   */
  const validateForm = () => {
    const newErrors = {};
    if (!currentMedecin.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!currentMedecin.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!currentMedecin.specialite.trim()) newErrors.specialite = 'La spécialité est requise';
    if (!currentMedecin.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(currentMedecin.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Crée un nouveau médecin
   */
  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMedecin)
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchMedecins();
      setMessage('Médecin ajouté avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Ce médecin existe déjà');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Modifie un médecin existant
   */
  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_URL}${currentMedecin.id_medecin}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMedecin)
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchMedecins();
      setMessage('Médecin mis à jour avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Cet email existe déjà');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Archive un médecin (soft delete)
   */
  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}${deleteTarget.id}/`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      await fetchMedecins();
      setMessage(data.message || `Le médecin ${deleteTarget.nom} a été archivé avec succès`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'archivage du médecin');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Restaure un médecin archivé
   */
  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}${restoreTarget.id}/restore/`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      await fetchMedecins();
      setMessage(data.message || `Le médecin ${restoreTarget.nom} a été restauré avec succès`);
      setIsRestoreModalOpen(false);
      setRestoreTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la restauration du médecin');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Supprime définitivement un médecin (permanent delete)
   */
  const handlePermanentDelete = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}${permanentDeleteTarget.id}/permanent_delete/`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      await fetchMedecins();
      setMessage(`Le médecin ${permanentDeleteTarget.nom} a été définitivement supprimé`);
      setIsPermanentDeleteModalOpen(false);
      setPermanentDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression définitive du médecin');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Ouvre le modal de création/édition
   */
  const openModal = (medecin = null) => {
    if (medecin) {
      setCurrentMedecin(medecin);
      setIsEditMode(true);
    } else {
      setCurrentMedecin({
        id_medecin: null,
        nom: '',
        prenom: '',
        specialite: '',
        email: '',
        telephone: ''
      });
      setIsEditMode(false);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  /**
   * Ferme le modal de création/édition
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMedecin({
      id_medecin: null,
      nom: '',
      prenom: '',
      specialite: '',
      email: '',
      telephone: ''
    });
    setErrors({});
    setSubmitLoading(false);
  };

  /**
   * Ouvre le modal d'archivage
   */
  const openDeleteModal = (medecin) => {
    setDeleteTarget({
      id: medecin.id_medecin,
      nom: `${medecin.prenom} ${medecin.nom}`,
      prenom: medecin.prenom
    });
    setIsDeleteModalOpen(true);
  };

  /**
   * Ouvre le modal de restauration
   */
  const openRestoreModal = (medecin) => {
    setRestoreTarget({
      id: medecin.id_medecin,
      nom: `${medecin.prenom} ${medecin.nom}`,
      prenom: medecin.prenom
    });
    setIsRestoreModalOpen(true);
  };

  /**
   * Ouvre le modal de suppression définitive
   */
  const openPermanentDeleteModal = (medecin) => {
    setPermanentDeleteTarget({
      id: medecin.id_medecin,
      nom: `${medecin.prenom} ${medecin.nom}`,
      prenom: medecin.prenom
    });
    setIsPermanentDeleteModalOpen(true);
  };

  /**
   * Gère le changement des inputs du formulaire
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMedecin(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Récupère les spécialités uniques
  const specialites = [...new Set(medecins.map(m => m.specialite))];

  // Filtre les médecins
  const filteredMedecins = medecins.filter(m => {
    const matchesSearch = m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialite = !specialiteFilter || m.specialite === specialiteFilter;
    return matchesSearch && matchesSpecialite;
  });

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader('Gestion des Médecins', Stethoscope);
  }, [setHeader]);

  // Compteurs pour les badges
  const activeCount = medecins.filter(m => !m.is_deleted).length;
  const archivedCount = medecins.filter(m => m.is_deleted).length;

  return (
    <div className="medecin-container">
      <div className="medecin-content">
        <div className="medecin-main">
          {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
          {error && <MessageAlert message={error} type="error" onClose={() => setError(null)} />}

          <div className="medecin-card">
            <div className="card-header">
              <div className="header-left">
                <h2 className="card-title">Liste des Médecins</h2>
                <span className="count-badge">{filteredMedecins.length}</span>
              </div>
              <button
                onClick={() => openModal()}
                className="add-button"
              >
                <Plus size={18} />
                Nouveau Médecin
              </button>
            </div>

            {/* Filtres de vue (Actifs / Archivés) */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              padding: '15px 20px',
              borderBottom: '1px solid #e0e0e0',
              alignItems: 'center'
            }}>
              <Filter size={18} color="#7f8c8d" />
              <button
                onClick={() => setViewMode('active')}
                style={{
                  padding: '10px 20px',
                  border: viewMode === 'active' ? '2px solid #10b981' : '2px solid #e0e0e0',
                  backgroundColor: viewMode === 'active' ? '#d1fae5' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'active' ? '600' : '400',
                  color: viewMode === 'active' ? '#059669' : '#333',
                  transition: 'all 0.2s',
                  fontSize: '14px'
                }}
              >
                <Users size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Actifs ({activeCount})
              </button>
              <button
                onClick={() => setViewMode('archived')}
                style={{
                  padding: '10px 20px',
                  border: viewMode === 'archived' ? '2px solid #f59e0b' : '2px solid #e0e0e0',
                  backgroundColor: viewMode === 'archived' ? '#fef3c7' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'archived' ? '600' : '400',
                  color: viewMode === 'archived' ? '#d97706' : '#333',
                  transition: 'all 0.2s',
                  fontSize: '14px'
                }}
              >
                <Archive size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Archivés ({archivedCount})
              </button>
            </div>

            {/* Barre de recherche et filtre spécialité */}
            <div className="filter-section">
              <div className="search-box">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un médecin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select 
                value={specialiteFilter} 
                onChange={(e) => setSpecialiteFilter(e.target.value)}
                className="specialite-filter"
              >
                <option value="">Toutes les spécialités</option>
                {specialites.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Tableau */}
            <div className="table-container">
              <MedecinTable
                medecins={filteredMedecins}
                loading={loading}
                onEdit={openModal}
                onDelete={openDeleteModal}
                onRestore={openRestoreModal}
                onPermanentDelete={openPermanentDeleteModal}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création/édition */}
      <MedecinModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        medecin={currentMedecin}
        errors={errors}
        onInputChange={handleInputChange}
        onSubmit={isEditMode ? handleUpdate : handleCreate}
        onClose={closeModal}
        loading={submitLoading}
      />

      {/* Modal d'archivage */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        target={deleteTarget}
        onDelete={handleArchive}
        onClose={() => setIsDeleteModalOpen(false)}
        loading={actionLoading}
      />

      {/* Modal de restauration */}
      <RestoreModal
        isOpen={isRestoreModalOpen}
        target={restoreTarget}
        onRestore={handleRestore}
        onClose={() => setIsRestoreModalOpen(false)}
        loading={actionLoading}
      />

      {/* Modal de suppression définitive */}
      <PermanentDeleteModal
        isOpen={isPermanentDeleteModalOpen}
        target={permanentDeleteTarget}
        onDelete={handlePermanentDelete}
        onClose={() => setIsPermanentDeleteModalOpen(false)}
        loading={actionLoading}
      />
    </div>
  );
}