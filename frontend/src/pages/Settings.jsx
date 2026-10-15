import React, { useState, useEffect } from 'react';

import MessageAlert from '../components/MessageAlert';
import PatientFilterBar from '../components/PatientFilterBar';
import PatientTable from '../components/PatientTable';
import PatientModal from '../components/PatientModal';
import PatientDetailModal from '../components/PatientDetailModal';
import DeleteModal from '../components/DeleteModal';
import Header from '../components/Header';
import { Users, Plus } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/patients/';


export default function PatientCRUD() {
  // État des données
  const [patients, setPatients] = useState([]);

  // État des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  // État des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [sexeFilter, setSexeFilter] = useState('');

  // État des suppressions
  const [deleteTarget, setDeleteTarget] = useState(null);

  // État des formulaires
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Charger les patients au montage
  useEffect(() => {
    fetchPatients();
  }, []);

  
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valide les données du formulaire
   */
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

  /**
   * Crée un nouveau patient
   */
  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPatient)
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchPatients();
      setMessage('Patient ajouté avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la création du patient');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Modifie un patient existant
   */
  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_URL}${currentPatient.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPatient)
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchPatients();
      setMessage('Patient modifié avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la modification du patient');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Supprime un patient
   */
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}${deleteTarget.id}/`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      await fetchPatients();
      setMessage('Patient supprimé avec succès');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression du patient');
    }
  };

  /**
   * Ouvre le modal de création/édition
   */
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

  /**
   * Ferme le modal de création/édition
   */
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

  /**
   * Ouvre le modal de suppression
   */
  const openDeleteModal = (patient) => {
    setDeleteTarget({
      id: patient.id,
      nom: `${patient.nom} ${patient.prenom}`
    });
    setIsDeleteModalOpen(true);
  };

  /**
   * Ouvre le modal de détails
   */
  const openDetailModal = (patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  /**
   * Ferme le modal de détails
   */
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPatient(null);
  };

  /**
   * Gère le changement des inputs du formulaire
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPatient(prev => ({ 
      ...prev, 
      [name]: name === 'taux_couverture' ? parseFloat(value) || 0 : value 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /**
   * Filtre les patients
   */
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSexe = !sexeFilter || p.sexe === sexeFilter;
    return matchesSearch && matchesSexe;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
     
      {/* Main Content */}
      <div style={{ flex: 1 }}>
        
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
                Liste des Patients ({filteredPatients.length})
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
                Nouveau Patient
              </button>
            </div>

            {/* Filters */}
            <PatientFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sexeFilter={sexeFilter}
              setSexeFilter={setSexeFilter}
            />

            {/* Table */}
            <PatientTable
              patients={filteredPatients}
              loading={loading}
              onEdit={openModal}
              onDelete={openDeleteModal}
              onDetail={openDetailModal}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
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
        onEdit={(patient) => {
          closeDetailModal();
          openModal(patient);
        }}
        onClose={closeDetailModal}
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