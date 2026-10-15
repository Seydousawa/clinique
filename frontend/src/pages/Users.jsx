import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import MedecinTable from '../components/MedecinTable';
import MedecinModal from '../components/MedecinModal';
import DeleteModal from '../components/DeleteModal';
import MessageAlert from '../components/MessageAlert';
import Header from '../components/Header';
import { Users, Plus } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/medecins/';

/**
 * Page MedecinCRUD - Gestion complète des médecins
 * Fonctionnalités: Créer, Lire, Modifier, Supprimer
 */
export default function MedecinCRUD() {
  // État des données
  const [medecins, setMedecins] = useState([]);

  // État des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // État de l'édition
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMedecin, setCurrentMedecin] = useState({
    id_medecin: null,
    nom: '',
    prenom: '',
    specialite: '',
    email: ''
  });

  // État des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('');

  // État des suppressions
  const [deleteTarget, setDeleteTarget] = useState(null);

  // État des formulaires
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Charger les médecins au montage
  useEffect(() => {
    fetchMedecins();
  }, []);
 <div>
      <Header title="Gestion des Médecins" />
      <h2>Liste des médecins</h2>
    </div>
  /**
   * Récupère la liste de tous les médecins
   */
  const fetchMedecins = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
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
      setError('Erreur lors de la création du médecin');
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
      setMessage('Médecin modifié avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la modification du médecin');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Supprime un médecin
   */
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}${deleteTarget.id}/`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchMedecins();
      setMessage('Médecin supprimé avec succès');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression du médecin');
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
        email: ''
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
      email: ''
    });
    setErrors({});
    setSubmitLoading(false);
  };

  /**
   * Ouvre le modal de suppression
   */
  const openDeleteModal = (medecin) => {
    setDeleteTarget({
      id: medecin.id_medecin,
      nom: `${medecin.nom} ${medecin.prenom}`
    });
    setIsDeleteModalOpen(true);
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      
      {/* Main Content */}
      <div style={{  flex: 1 }}>
       
        {/* Content */}
        <div style={{ padding: '30px' }}>
          {/* Messages */}
          {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
          {error && <MessageAlert message={error} type="error" onClose={() => setError(null)} />}

          {/* Content Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '30px'
          }}>
            {/* Title et Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                Liste des Médecins ({filteredMedecins.length})
              </h5>
              <button
                onClick={() => openModal()}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Plus size={18} />
                Nouveau Médecin
              </button>
            </div>

            {/* Filters */}
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              specialiteFilter={specialiteFilter}
              setSpecialiteFilter={setSpecialiteFilter}
              specialites={specialites}
            />

            {/* Table */}
            <MedecinTable
              medecins={filteredMedecins}
              loading={loading}
              onEdit={openModal}
              onDelete={openDeleteModal}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
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

      <DeleteModal
        isOpen={isDeleteModalOpen}
        target={deleteTarget}
        onDelete={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Styles globaux */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}