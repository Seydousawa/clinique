import React, { useState, useEffect } from 'react';
import PersonnelTable from '../components/PersonnelTable';
import PersonnelModal from '../components/PersonnelModal';
import DeleteModal from '../components/DeleteModal';
import RestoreModal from '../components/RestoreModal';
import PermanentDeleteModal from '../components/PermanentDeleteModal';
import MessageAlert from '../components/MessageAlert';
import { Users, Plus, Archive, Filter } from 'lucide-react';
import personnelService from '../services/personnelService';
import './PersonnelCRUD.css'; 
import { useHeader } from '../components/HeaderContext';

export default function PersonnelCRUD() {
  
  const [personnels, setPersonnels] = useState([]);

  // États des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);

  // État du mode édition
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPersonnel, setCurrentPersonnel] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    username: '',
    password: '',
    role: '',
    statut: 'actif'
  });

  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
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

  // Charger les personnels au montage et au changement de viewMode
  useEffect(() => {
    fetchPersonnels();
  }, [viewMode]);

  /**
   * Récupère les personnels selon le mode d'affichage
   */
  const fetchPersonnels = async () => {
    setLoading(true);
    try {
      let data;
      if (viewMode === 'active') {
        data = await personnelService.getAllActive();
      } else if (viewMode === 'archived') {
        data = await personnelService.getAllArchived();
      } else {
        data = await personnelService.getAll();
      }
      setPersonnels(data);
      console.log('Personnels chargés:', data);
    } catch (err) {
      console.error('Erreur de chargement:', err);
      setError('Erreur lors du chargement des personnels: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ouvre le modal de création/édition
   */
  const openModal = (personnel = null) => {
    console.log('Ouverture du modal pour:', personnel);
    
    if (personnel) {
      // Mode édition - transformer la structure des données
      setCurrentPersonnel({
        id: personnel.id,
        nom: personnel.nom || personnel.user?.nom || '',
        prenom: personnel.prenom || personnel.user?.prenom || '',
        email: personnel.email || personnel.user?.email || '',
        telephone: personnel.telephone || personnel.user?.telephone || '',
        username: personnel.username || personnel.user?.username || '',
        password: '', // Toujours vide en mode édition
        role: personnel.role || personnel.user?.role || '',
        statut: personnel.is_active !== false ? 'actif' : 'inactif'
      });
      setIsEditMode(true);
    } else {
      // Mode création - initialiser avec des valeurs vides
      setCurrentPersonnel({
        id: null,
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        username: '',
        password: '',
        role: '',
        statut: 'actif'
      });
      setIsEditMode(false);
    }
    setErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  /**
   * Ferme le modal de création/édition
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPersonnel({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      username: '',
      password: '',
      role: '',
      statut: 'actif'
    });
    setErrors({});
    setError(null);
    setSubmitLoading(false);
  };

  /**
   * Gère la soumission du formulaire (création ou modification)
   */
  const handleSubmitPersonnel = async (e) => {
    // Le e vient du modal, mais contient formData dans e.formData
    const formData = e.formData || currentPersonnel;
    
    console.log('Soumission du formulaire avec données:', formData);
    console.log('Mode édition:', isEditMode);
    
    setSubmitLoading(true);
    setErrors({});
    setError(null);
    setMessage(null);

    try {
      // Valider les champs requis
      const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'username', 'role'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
      }

      // Pour la création, vérifier le mot de passe
      if (!isEditMode && !formData.password?.trim()) {
        throw new Error('Le mot de passe est requis pour créer un nouveau personnel');
      }

      // Préparer les données au format JSON pour Django
      const dataToSend = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        username: formData.username.trim(),
        role: formData.role,
        is_active: formData.statut === 'actif'
      };

      // Ajouter le mot de passe seulement si fourni
      if (formData.password && formData.password.trim()) {
        dataToSend.password = formData.password.trim();
      }

      console.log('Données à envoyer à l\'API:', dataToSend);

      let response;
      if (isEditMode && formData.id) {
        // Mode édition
        response = await personnelService.update(formData.id, dataToSend);
        setMessage('Personnel mis à jour avec succès');
      } else {
        // Mode création
        response = await personnelService.create(dataToSend);
        setMessage('Personnel créé avec succès');
      }

      console.log('Réponse du serveur:', response);
      
      // Rafraîchir la liste
      await fetchPersonnels();
      
      // Fermer le modal
      closeModal();
      
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        const formattedErrors = {};
        
        // Gestion des erreurs Django
        if (typeof backendErrors === 'object') {
          Object.keys(backendErrors).forEach(key => {
            if (Array.isArray(backendErrors[key])) {
              formattedErrors[key] = backendErrors[key].join(', ');
            } else if (typeof backendErrors[key] === 'string') {
              formattedErrors[key] = backendErrors[key];
            } else if (backendErrors[key] && backendErrors[key].length > 0) {
              // Pour les tableaux simples
              formattedErrors[key] = backendErrors[key][0];
            }
          });
        }
        
        // Si l'erreur contient un message de détail
        if (backendErrors.detail) {
          formattedErrors.general = backendErrors.detail;
        }
        
        setErrors(formattedErrors);
        
        // Afficher le message d'erreur principal
        const firstError = formattedErrors.general || 
                          formattedErrors.nom || 
                          formattedErrors.prenom ||
                          formattedErrors.email || 
                          formattedErrors.username ||
                          formattedErrors.password ||
                          formattedErrors.role ||
                          'Erreur lors de la sauvegarde du personnel';
        setError(firstError);
      } else {
        setError(err.message || 'Erreur lors de la sauvegarde du personnel');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPersonnel(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ s'il y en a une
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Archive un personnel (soft delete)
   */
  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const response = await personnelService.archive(deleteTarget.id);
      await fetchPersonnels();
      setMessage(response.message || response.detail || `Le personnel ${deleteTarget.nom} a été archivé avec succès`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Erreur lors de l\'archivage du personnel');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const response = await personnelService.restore(restoreTarget.id);
      await fetchPersonnels();
      setMessage(response.message || response.detail || `Le personnel ${restoreTarget.nom} a été restauré avec succès`);
      setIsRestoreModalOpen(false);
      setRestoreTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la restauration du personnel');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Supprime définitivement un personnel (permanent delete)
   */
  const handlePermanentDelete = async () => {
    setActionLoading(true);
    try {
      const response = await personnelService.permanentDelete(permanentDeleteTarget.id);
      await fetchPersonnels();
      setMessage(response.message || response.detail || `Le personnel ${permanentDeleteTarget.nom} a été définitivement supprimé`);
      setIsPermanentDeleteModalOpen(false);
      setPermanentDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la suppression définitive du personnel');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Ouvre le modal d'archivage
   */
  const openDeleteModal = (personnel) => {
    const fullName = `${personnel.prenom || personnel.user?.prenom || ''} ${personnel.nom || personnel.user?.nom || ''}`.trim();
    setDeleteTarget({
      id: personnel.id,
      nom: fullName || 'Inconnu',
      prenom: personnel.prenom || personnel.user?.prenom || ''
    });
    setIsDeleteModalOpen(true);
  };

  /**
   * Ouvre le modal de restauration
   */
  const openRestoreModal = (personnel) => {
    const fullName = `${personnel.prenom || personnel.user?.prenom || ''} ${personnel.nom || personnel.user?.nom || ''}`.trim();
    setRestoreTarget({
      id: personnel.id,
      nom: fullName || 'Inconnu',
      prenom: personnel.prenom || personnel.user?.prenom || ''
    });
    setIsRestoreModalOpen(true);
  };

  /**
   * Ouvre le modal de suppression définitive
   */
  const openPermanentDeleteModal = (personnel) => {
    const fullName = `${personnel.prenom || personnel.user?.prenom || ''} ${personnel.nom || personnel.user?.nom || ''}`.trim();
    setPermanentDeleteTarget({
      id: personnel.id,
      nom: fullName || 'Inconnu',
      prenom: personnel.prenom || personnel.user?.prenom || ''
    });
    setIsPermanentDeleteModalOpen(true);
  };

  // Récupère les rôles uniques pour le filtre
  const roles = [...new Set(personnels
    .map(p => p.role || p.user?.role)
    .filter(Boolean)
    .map(role => {
      // Formater les noms de rôle pour l'affichage
      if (role === 'administrateur') return 'Administrateur';
      if (role === 'medecin') return 'Médecin';
      if (role === 'secretaire') return 'Secrétaire';
      if (role === 'pharmacien') return 'Pharmacien';
      return role;
    }))];

  // Filtre les personnels
  const filteredPersonnels = personnels.filter(p => {
    const user = p;
    const nom = user.nom || user.user?.nom || '';
    const prenom = user.prenom || user.user?.prenom || '';
    const email = user.email || user.user?.email || '';
    const role = user.role || user.user?.role || '';
    
    const fullName = `${prenom} ${nom}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      fullName.includes(searchLower) ||
      nom.toLowerCase().includes(searchLower) ||
      prenom.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      role.toLowerCase().includes(searchLower);
    
    const currentRole = role;
    const formattedRole = currentRole === 'administrateur' ? 'Administrateur' :
                         currentRole === 'medecin' ? 'Médecin' :
                         currentRole === 'secretaire' ? 'Secrétaire' :
                         currentRole === 'pharmacien' ? 'Pharmacien' : currentRole;
    
    const matchesRole = !roleFilter || formattedRole === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader('Gestion du Personnel', Users);
  }, [setHeader]);

  // Compteurs pour les badges
  const activeCount = personnels.filter(p => p.is_active !== false && !p.is_deleted).length;
  const archivedCount = personnels.filter(p => p.is_deleted).length;

  return (
    <div className="personnel-container">
      <div className="personnel-content">
        <div className="personnel-main">
          {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
          {error && <MessageAlert message={error} type="error" onClose={() => setError(null)} />}

          <div className="personnel-card">
            <div className="card-header">
              <div className="header-left">
                <h2 className="card-title">Liste du Personnel</h2>
                <span className="count-badge">{filteredPersonnels.length}</span>
              </div>
              <button
                onClick={() => openModal()}
                className="add-button"
              >
                <Plus size={18} />
                Nouveau Personnel
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

            {/* Barre de recherche et filtre rôle */}
            <div className="filter-section">
              <div className="search-box">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un personnel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="role-filter"
              >
                <option value="">Tous les rôles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Tableau */}
            <div className="table-container">
              <PersonnelTable
                personnels={filteredPersonnels}
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
      {isModalOpen && (
        <PersonnelModal
          isOpen={isModalOpen}
          isEditMode={isEditMode}
          personnel={currentPersonnel}
          errors={errors}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitPersonnel}
          onClose={closeModal}
          loading={submitLoading}
        />
      )}

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