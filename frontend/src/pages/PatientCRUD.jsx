import React, { useState, useEffect } from 'react';
import MessageAlert from '../components/MessageAlert';
import PatientFilterBar from '../components/PatientFilterBar';
import PatientTable from '../components/PatientTable';
import PatientModal from '../components/PatientModal';
import PatientDetailModal from '../components/PatientDetailModal';
import DeleteModal from '../components/DeleteModal';
import RestoreModal from '../components/RestoreModal';
import PermanentDeleteModal from '../components/PermanentDeleteModal';
import Header from '../components/Header';
import { Users, Plus, Eye, Phone, MapPin, Loader, Archive, Filter } from 'lucide-react';
import patientService from '../services/patientService';
import './PatientCRUD.css';
import { useHeader } from '../components/HeaderContext';

export default function PatientCRUD() {
  // État des données
  const [patients, setPatients] = useState([]);

  // État des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // État de l'édition
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({
    id: null,
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    telephone: '',
    email: '',
    adresse: '',
    profession: '',
    groupe_sanguin: '',
    assurance_nom: '',
    assurance_numero: '',
    taux_couverture: 0
  });

  // État des détails
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [sexeFilter, setSexeFilter] = useState('');
  const [viewMode, setViewMode] = useState('active'); // 'active', 'archived'

  // Cibles pour suppression, restauration et suppression définitive
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);

  // État des formulaires
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Charger les patients au montage et au changement de viewMode
  useEffect(() => {
    fetchPatients();
  }, [viewMode]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let data;
      if (viewMode === 'active') {
        data = await patientService.getAllActive();
      } else if (viewMode === 'archived') {
        data = await patientService.getAllArchived();
      } else {
        data = await patientService.getAll();
      }
      setPatients(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les données complètes d'un patient
  const fetchPatientDetails = async (patientId) => {
    try {
      const data = await patientService.getDetails(patientId);
      return data;
    } catch (err) {
      console.error('Erreur:', err);
      throw err;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!currentPatient.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!currentPatient.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!currentPatient.date_naissance) newErrors.date_naissance = 'La date de naissance est requise';
    if (!currentPatient.sexe) newErrors.sexe = 'Le sexe est requis';
    if (!currentPatient.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!currentPatient.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
    
    if (currentPatient.email && !/\S+@\S+\.\S+/.test(currentPatient.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (currentPatient.taux_couverture < 0 || currentPatient.taux_couverture > 100) {
      newErrors.taux_couverture = 'Le taux doit être entre 0 et 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      await patientService.create(currentPatient);
      await fetchPatients();
      setMessage('Patient ajouté avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Ce patient existe déjà');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      await patientService.update(currentPatient.id, currentPatient);
      await fetchPatients();
      setMessage('Patient modifié avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Veuillez modifier les informations du patient');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const response = await patientService.archive(deleteTarget.id);
      await fetchPatients();
      setMessage(response.message || `Le patient ${deleteTarget.nom} a été archivé avec succès`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'archivage du patient');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const response = await patientService.restore(restoreTarget.id);
      await fetchPatients();
      setMessage(response.message || `Le patient ${restoreTarget.nom} a été restauré avec succès`);
      setIsRestoreModalOpen(false);
      setRestoreTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la restauration du patient');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setActionLoading(true);
    try {
      await patientService.permanentDelete(permanentDeleteTarget.id);
      await fetchPatients();
      setMessage(`Le patient ${permanentDeleteTarget.nom} a été définitivement supprimé`);
      setIsPermanentDeleteModalOpen(false);
      setPermanentDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression définitive du patient');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (patient = null) => {
    if (patient) {
      setCurrentPatient({
        ...patient,
        date_naissance: patient.date_naissance ? patient.date_naissance.split('T')[0] : ''
      });
      setIsEditMode(true);
    } else {
      setCurrentPatient({
        id: null,
        nom: '',
        prenom: '',
        date_naissance: '',
        sexe: '',
        telephone: '',
        email: '',
        adresse: '',
        profession: '',
        groupe_sanguin: '',
        assurance_nom: '',
        assurance_numero: '',
        taux_couverture: 0
      });
      setIsEditMode(false);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPatient({
      id: null,
      nom: '',
      prenom: '',
      date_naissance: '',
      sexe: '',
      telephone: '',
      email: '',
      adresse: '',
      profession: '',
      groupe_sanguin: '',
      assurance_nom: '',
      assurance_numero: '',
      taux_couverture: 0
    });
    setErrors({});
    setSubmitLoading(false);
  };

  const openDeleteModal = (patient) => {
    setDeleteTarget({
      id: patient.id,
      nom: `${patient.prenom} ${patient.nom}`,
      prenom: patient.prenom
    });
    setIsDeleteModalOpen(true);
  };

  const openRestoreModal = (patient) => {
    setRestoreTarget({
      id: patient.id,
      nom: `${patient.prenom} ${patient.nom}`,
      prenom: patient.prenom
    });
    setIsRestoreModalOpen(true);
  };

  const openPermanentDeleteModal = (patient) => {
    setPermanentDeleteTarget({
      id: patient.id,
      nom: `${patient.prenom} ${patient.nom}`,
      prenom: patient.prenom
    });
    setIsPermanentDeleteModalOpen(true);
  };

  const openDetailModal = async (patient) => {
    try {
      setSelectedPatient(patient);
      setIsDetailModalOpen(true);
      setDetailLoading(true);
      
      const completePatientData = await fetchPatientDetails(patient.id);
      setSelectedPatient(completePatientData);
      
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      setError('Erreur lors du chargement des détails complets du patient');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPatient(null);
    setDetailLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPatient(prev => ({ 
      ...prev, 
      [name]: name === 'taux_couverture' ? parseFloat(value) || 0 : value 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSexe = !sexeFilter || p.sexe === sexeFilter;
    return matchesSearch && matchesSexe;
  });

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader('Gestion de Patients', Users);
  }, [setHeader]);

  // Compteurs pour les badges
  const activeCount = patients.filter(p => !p.is_deleted).length;
  const archivedCount = patients.filter(p => p.is_deleted).length;

  return (
    <div className="patient-container">
      <div className="patient-content">
        <div className="patient-main">
          {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
          {error && <MessageAlert message={error} type="error" onClose={() => setError(null)} />}

          <div className="patient-card">
            <div className="card-header">
              <div className="header-left">
                <h2 className="card-title">Liste des Patients</h2>
                <span className="count-badge">{filteredPatients.length}</span>
              </div>
              <button
                onClick={() => openModal()}
                className="add-button"
              >
                <Plus size={18} />
                Nouveau Patient
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

            <PatientFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sexeFilter={sexeFilter}
              setSexeFilter={setSexeFilter}
            />

            <div className="table-container">
              <PatientTable
                patients={filteredPatients}
                loading={loading}
                onEdit={openModal}
                onDelete={openDeleteModal}
                onDetail={openDetailModal}
                onRestore={openRestoreModal}
                onPermanentDelete={openPermanentDeleteModal}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      </div>

      <PatientModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        patient={currentPatient}
        errors={errors}
        onInputChange={handleInputChange}
        onSubmit={isEditMode ? handleUpdate : handleCreate}
        onClose={closeModal}
        loading={submitLoading}
      />

      <PatientDetailModal
        isOpen={isDetailModalOpen}
        patient={selectedPatient}
        loading={detailLoading}
        onEdit={(patient) => {
          closeDetailModal();
          openModal(patient);
        }}
        onClose={closeDetailModal}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        target={deleteTarget}
        onDelete={handleArchive}
        onClose={() => setIsDeleteModalOpen(false)}
        loading={actionLoading}
      />

      <RestoreModal
        isOpen={isRestoreModalOpen}
        target={restoreTarget}
        onRestore={handleRestore}
        onClose={() => setIsRestoreModalOpen(false)}
        loading={actionLoading}
      />

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