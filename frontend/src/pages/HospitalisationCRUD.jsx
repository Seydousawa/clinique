import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MessageAlert from '../components/MessageAlert';
import HospitalisationModal from '../components/HospitalisationModal';
import HospitalisationDetailModal from '../components/HospitalisationDetailModal';
import DeleteModal from '../components/DeleteModal';
import RestoreModal from '../components/RestoreModal';
import PermanentDeleteModal from '../components/PermanentDeleteModal';
import HospitalisationTable from '../components/HospitalisationTable';
import PaymentModal from '../components/PaymentModal';
import { Hospital, Plus, Search, Archive, Filter } from 'lucide-react';
import hospitalisationService from '../services/hospitalisationService';
import './HospitalisationCRUD.css';
import { useHeader } from '../components/HeaderContext';

const PATIENTS_API = 'http://127.0.0.1:8000/api/patients/';
const MEDECINS_API = 'http://127.0.0.1:8000/api/medecins/';
const FACTURES_API = 'http://127.0.0.1:8000/api/factures/';

export default function HospitalisationCRUD() {
  const [hospitalisations, setHospitalisations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentHospitalisation, setCurrentHospitalisation] = useState({
    id: null,
    date_admission: '',
    date_sortie: '',
    motif: '',
    chambre: '',
    patient_id: '',
    medecin_id: ''
  });

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader('Gestion des Hospitalisations', Hospital);
  }, [setHeader]);

  const [selectedHospitalisation, setSelectedHospitalisation] = useState(null);
  const [hospitalisationForPayment, setHospitalisationForPayment] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [viewMode, setViewMode] = useState('active');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [viewMode]);

  const enrichHospitalisation = (hosp) => {
    let patientFullName = '';
    let patientPrenom = '';
    let patientNom = '';
    let medecinNom = '';
    let patientObject = null;
    let medecinObject = null;
    let patientId = null;
    let medecinId = null;

    if (hosp.patient) {
      if (typeof hosp.patient === 'object') {
        patientPrenom = hosp.patient.prenom || '';
        patientNom = hosp.patient.nom || '';
        patientFullName = `${patientPrenom} ${patientNom}`.trim();
        patientObject = hosp.patient;
        patientId = hosp.patient.id;
      } else if (typeof hosp.patient === 'number') {
        patientId = hosp.patient;
      } else if (typeof hosp.patient === 'string') {
        const parsedId = parseInt(hosp.patient);
        if (!isNaN(parsedId)) patientId = parsedId;
      }
    }

    if (!patientId && hosp.patient_id) {
      patientId = typeof hosp.patient_id === 'number'
        ? hosp.patient_id
        : parseInt(hosp.patient_id);
    }

    if (hosp.medecin_responsable) {
      if (typeof hosp.medecin_responsable === 'object') {
        const medecinPrenom = hosp.medecin_responsable.prenom || '';
        const medecinNomField = hosp.medecin_responsable.nom || '';
        medecinNom = `Dr. ${medecinPrenom} ${medecinNomField}`.trim();
        medecinObject = hosp.medecin_responsable;
        medecinId = hosp.medecin_responsable.id;
      } else if (typeof hosp.medecin_responsable === 'number') {
        medecinId = hosp.medecin_responsable;
      }
    }

    if (!medecinId && hosp.medecin_id) {
      medecinId = typeof hosp.medecin_id === 'number'
        ? hosp.medecin_id
        : parseInt(hosp.medecin_id);
    }

    return {
      ...hosp,
      patient_nom_complet: patientFullName,
      patient_prenom: patientPrenom,
      patient_nom: patientNom,
      medecin_nom: medecinNom,
      patient: patientObject || hosp.patient,
      medecin_responsable: medecinObject || hosp.medecin_responsable,
      patient_id: patientId,
      medecin_id: medecinId
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      let hospitalisationsData = [];
      if (viewMode === 'active') {
        hospitalisationsData = await hospitalisationService.getAllActive();
      } else if (viewMode === 'archived') {
        hospitalisationsData = await hospitalisationService.getAllArchived();
      } else {
        hospitalisationsData = await hospitalisationService.getAll();
      }

      const [patRes, medRes] = await Promise.all([
        fetch(PATIENTS_API).then(res => {
          if (!res.ok) throw new Error(`Erreur HTTP patients: ${res.status}`);
          return res.json();
        }),
        fetch(MEDECINS_API).then(res => {
          if (!res.ok) throw new Error(`Erreur HTTP médecins: ${res.status}`);
          return res.json();
        })
      ]);

      setPatients(patRes || []);
      setMedecins(medRes || []);

      const map = {};
      (patRes || []).forEach(patient => { map[patient.id] = patient; });
      setPatientsMap(map);

      const enrichedHospData = (hospitalisationsData || []).map(hosp => {
        const enriched = enrichHospitalisation(hosp);
        if (enriched.patient_id && !enriched.patient_nom_complet && map[enriched.patient_id]) {
          const p = map[enriched.patient_id];
          enriched.patient_nom_complet = `${p.prenom} ${p.nom}`.trim();
          enriched.patient_prenom = p.prenom;
          enriched.patient_nom = p.nom;
        }
        return enriched;
      });

      setHospitalisations(enrichedHospData);
    } catch (err) {
      setError(`Erreur lors du chargement des données: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!currentHospitalisation.date_admission) newErrors.date_admission = "La date d'admission est requise";
    if (!currentHospitalisation.motif?.trim()) newErrors.motif = "Le motif est requis";
    if (!currentHospitalisation.chambre?.trim()) newErrors.chambre = "La chambre est requise";
    if (!currentHospitalisation.patient_id) newErrors.patient_id = "Le patient est requis";
    if (!currentHospitalisation.medecin_id) newErrors.medecin_id = "Le médecin est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertDateToDateTime = (dateString) => {
    if (!dateString) return null;
    if (dateString.includes('T')) return dateString;
    return `${dateString}T00:00:00Z`;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const patientId = parseInt(currentHospitalisation.patient_id, 10);
      const medecinId = parseInt(currentHospitalisation.medecin_id, 10);

      if (isNaN(patientId)) { setError('ID du patient invalide'); return; }
      if (isNaN(medecinId)) { setError('ID du médecin invalide'); return; }

      const payload = {
        date_admission: convertDateToDateTime(currentHospitalisation.date_admission),
        motif: currentHospitalisation.motif.trim(),
        chambre: currentHospitalisation.chambre.trim(),
        patient: patientId,
        patient_id: patientId,
        medecin_responsable: medecinId
      };

      if (currentHospitalisation.date_sortie) {
        payload.date_sortie = convertDateToDateTime(currentHospitalisation.date_sortie);
      }

      const responseData = await hospitalisationService.create(payload);
      const enrichedData = enrichHospitalisation(responseData);

      if (enrichedData.patient_id && patientsMap[enrichedData.patient_id]) {
        const p = patientsMap[enrichedData.patient_id];
        enrichedData.patient_nom_complet = `${p.prenom} ${p.nom}`.trim();
      }

      setHospitalisations(prev => [...prev, enrichedData]);
      setMessage('Hospitalisation créée avec succès');
      closeModal();
    } catch (err) {
      if (err.response?.data) {
        const errors = Object.keys(err.response.data).map(key => {
          const value = err.response.data[key];
          return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
        });
        setError(`Erreur ${err.response.status}: ${errors.join(' | ')}`);
      } else {
        setError(err.message || 'Erreur lors de la création');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const patientId = parseInt(currentHospitalisation.patient_id, 10);
      const medecinId = parseInt(currentHospitalisation.medecin_id, 10);

      const payload = {
        date_admission: convertDateToDateTime(currentHospitalisation.date_admission),
        motif: currentHospitalisation.motif.trim(),
        chambre: currentHospitalisation.chambre.trim(),
        patient: patientId,
        patient_id: patientId,
        medecin_responsable: medecinId
      };

      if (currentHospitalisation.date_sortie) {
        payload.date_sortie = convertDateToDateTime(currentHospitalisation.date_sortie);
      }

      const responseData = await hospitalisationService.update(currentHospitalisation.id, payload);
      const enrichedData = enrichHospitalisation(responseData);

      if (enrichedData.patient_id && patientsMap[enrichedData.patient_id]) {
        const p = patientsMap[enrichedData.patient_id];
        enrichedData.patient_nom_complet = `${p.prenom} ${p.nom}`.trim();
      }

      setHospitalisations(prev =>
        prev.map(h => h.id === currentHospitalisation.id ? enrichedData : h)
      );
      setMessage('Hospitalisation modifiée avec succès');
      closeModal();
    } catch (err) {
      if (err.response?.data) {
        const errors = Object.keys(err.response.data).map(key => {
          const value = err.response.data[key];
          return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
        });
        setError(`Erreur ${err.response.status}: ${errors.join(' | ')}`);
      } else {
        setError(err.message || 'Erreur lors de la modification');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const response = await hospitalisationService.archive(deleteTarget.id);
      await fetchAllData();
      setMessage(response.message || 'Hospitalisation archivée avec succès');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      setError('Erreur lors de l\'archivage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const response = await hospitalisationService.restore(restoreTarget.id);
      await fetchAllData();
      setMessage(response.message || 'Hospitalisation restaurée avec succès');
      setIsRestoreModalOpen(false);
      setRestoreTarget(null);
    } catch (err) {
      setError('Erreur lors de la restauration');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setActionLoading(true);
    try {
      await hospitalisationService.permanentDelete(permanentDeleteTarget.id);
      await fetchAllData();
      setMessage('Hospitalisation supprimée définitivement');
      setIsPermanentDeleteModalOpen(false);
      setPermanentDeleteTarget(null);
    } catch (err) {
      setError('Erreur lors de la suppression définitive');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = (hospitalisation) => {
    setHospitalisationForPayment(hospitalisation);
    setIsPaymentModalOpen(true);
  };

  // ✅ CORRIGÉ : met à jour le statut et le bouton après paiement
  const handlePaymentSubmit = async (paymentData) => {
    setPaymentLoading(true);
    try {
      const payload = {
        ...paymentData,
        hospitalisation_id: hospitalisationForPayment.id  // ✅ lien avec l'hospitalisation
      };

      const response = await fetch(FACTURES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
      }

      await response.json();

      // ✅ Mettre à jour l'état local immédiatement
      const now = new Date().toISOString();
      const hospId = hospitalisationForPayment.id;

      setHospitalisations(prev =>
        prev.map(h =>
          h.id === hospId
            ? { ...h, date_sortie: now, is_paid: true }
            : h
        )
      );

      setMessage(`Paiement de ${paymentData.montant} F CFA enregistré avec succès`);
      closePaymentModal();
    } catch (err) {
      setError(`Erreur lors du paiement: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleEdit = (hospitalisation) => {
    closeDetailModal();
    const patientId = hospitalisation.patient_id ||
      (hospitalisation.patient?.id) ||
      (typeof hospitalisation.patient === 'number' ? hospitalisation.patient : '');
    const medecinId = hospitalisation.medecin_id ||
      (hospitalisation.medecin_responsable?.id) ||
      (typeof hospitalisation.medecin_responsable === 'number' ? hospitalisation.medecin_responsable : '');

    setCurrentHospitalisation({
      id: hospitalisation.id,
      date_admission: formatDate(hospitalisation.date_admission),
      date_sortie: formatDate(hospitalisation.date_sortie),
      motif: hospitalisation.motif || '',
      chambre: hospitalisation.chambre || '',
      patient_id: String(patientId || ''),
      medecin_id: String(medecinId || '')
    });
    setIsEditMode(true);
    setErrors({});
    setIsModalOpen(true);
  };

  const openModal = (hosp = null) => {
    if (hosp) {
      setCurrentHospitalisation({
        id: hosp.id,
        date_admission: formatDate(hosp.date_admission),
        date_sortie: formatDate(hosp.date_sortie),
        motif: hosp.motif || '',
        chambre: hosp.chambre || '',
        patient_id: String(hosp.patient_id ? parseInt(hosp.patient_id) : ''),
        medecin_id: String(hosp.medecin_id ? parseInt(hosp.medecin_id) : '')
      });
      setIsEditMode(true);
    } else {
      setCurrentHospitalisation({
        id: null, date_admission: '', date_sortie: '',
        motif: '', chambre: '', patient_id: '', medecin_id: ''
      });
      setIsEditMode(false);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentHospitalisation({
      id: null, date_admission: '', date_sortie: '',
      motif: '', chambre: '', patient_id: '', medecin_id: ''
    });
    setErrors({});
  };

  const openDeleteModal = (hosp) => {
    setDeleteTarget({ id: hosp.id, nom: `${hosp.patient_nom_complet || 'Patient'} - Ch. ${hosp.chambre}`, prenom: '' });
    setIsDeleteModalOpen(true);
  };

  const openRestoreModal = (hosp) => {
    setRestoreTarget({ id: hosp.id, nom: `${hosp.patient_nom_complet || 'Patient'} - Ch. ${hosp.chambre}`, prenom: '' });
    setIsRestoreModalOpen(true);
  };

  const openPermanentDeleteModal = (hosp) => {
    setPermanentDeleteTarget({ id: hosp.id, nom: `${hosp.patient_nom_complet || 'Patient'} - Ch. ${hosp.chambre}`, prenom: '' });
    setIsPermanentDeleteModalOpen(true);
  };

  const openDetailModal = (hosp) => { setSelectedHospitalisation(hosp); setIsDetailModalOpen(true); };
  const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedHospitalisation(null); };
  const closePaymentModal = () => { setIsPaymentModalOpen(false); setHospitalisationForPayment(null); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentHospitalisation(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const filteredHospitalisations = hospitalisations.filter(h => {
    const matchesSearch = searchTerm === '' ||
      h.patient_nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.chambre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.motif?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = !statutFilter ||
      (statutFilter === 'en_cours' && !h.date_sortie && !h.is_deleted) ||
      (statutFilter === 'terminee' && h.date_sortie);
    return matchesSearch && matchesStatut;
  });

  const activeCount = hospitalisations.filter(h => !h.is_deleted && !h.date_sortie).length;
  const archivedCount = hospitalisations.filter(h => h.is_deleted).length;

  return (
    <div className="hospitalisation-container">
      <div className="hospitalisation-content">
        <div className="hospitalisation-main">
          {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
          {error && <MessageAlert message={error} type="error" onClose={() => setError(null)} />}

          <div className="hospitalisation-card">
            <div className="card-header">
              <div className="header-left">
                <h2 className="card-title">Liste des Hospitalisations</h2>
                <span className="count-badge">({filteredHospitalisations.length})</span>
              </div>
              <button onClick={() => openModal()} className="add-button" disabled={loading}>
                <Plus size={16} />
                Nouvelle Hospitalisation
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '15px 20px', borderBottom: '1px solid #e0e0e0', alignItems: 'center' }}>
              <Filter size={18} color="#7f8c8d" />
              <button onClick={() => setViewMode('active')} style={{ padding: '10px 20px', border: viewMode === 'active' ? '2px solid #10b981' : '2px solid #e0e0e0', backgroundColor: viewMode === 'active' ? '#d1fae5' : 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: viewMode === 'active' ? '600' : '400', color: viewMode === 'active' ? '#059669' : '#333', transition: 'all 0.2s', fontSize: '14px' }}>
                <Hospital size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Actives ({activeCount})
              </button>
              <button onClick={() => setViewMode('archived')} style={{ padding: '10px 20px', border: viewMode === 'archived' ? '2px solid #f59e0b' : '2px solid #e0e0e0', backgroundColor: viewMode === 'archived' ? '#fef3c7' : 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: viewMode === 'archived' ? '600' : '400', color: viewMode === 'archived' ? '#d97706' : '#333', transition: 'all 0.2s', fontSize: '14px' }}>
                <Archive size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Archivées ({archivedCount})
              </button>
            </div>

            <div className="filter-section">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Rechercher par patient, chambre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
              </div>
              <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} className="status-filter">
                <option value="">Tous les statuts</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>

            <HospitalisationTable
              hospitalisations={filteredHospitalisations}
              loading={loading}
              onEdit={openModal}
              onDelete={openDeleteModal}
              onDetail={openDetailModal}
              onRestore={openRestoreModal}
              onPermanentDelete={openPermanentDeleteModal}
              onPay={handlePay}
              viewMode={viewMode}
              patientsMap={patientsMap}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <HospitalisationModal
          isOpen={isModalOpen}
          isEditMode={isEditMode}
          hospitalisation={currentHospitalisation}
          errors={errors}
          patients={patients}
          medecins={medecins}
          onInputChange={handleInputChange}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          onClose={closeModal}
          loading={submitLoading}
        />
      )}

      {isDetailModalOpen && selectedHospitalisation && (
        <HospitalisationDetailModal
          isOpen={isDetailModalOpen}
          hospitalisation={selectedHospitalisation}
          onEdit={handleEdit}
          onClose={closeDetailModal}
          medecinMap={'medecinMaps'}
        />
      )}

      {isPaymentModalOpen && hospitalisationForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          onSubmit={handlePaymentSubmit}
          loading={paymentLoading}
          selectedItem={hospitalisationForPayment}
          patientsMap={patientsMap}
          title="Paiement d'Hospitalisation"
          itemLabel="hospitalisation"
          amountFieldName="montant_suggere"
          amountLabel="Montant"
          itemIdField="id"
          patientIdField="patient_id"
          dateField="date_admission"
          descriptionField="motif"
          itemDateLabel="Date d'admission"
          itemDescriptionLabel="Motif d'hospitalisation"
        />
      )}

      <DeleteModal isOpen={isDeleteModalOpen} target={deleteTarget} onDelete={handleArchive} onClose={() => setIsDeleteModalOpen(false)} loading={actionLoading} />
      <RestoreModal isOpen={isRestoreModalOpen} target={restoreTarget} onRestore={handleRestore} onClose={() => setIsRestoreModalOpen(false)} loading={actionLoading} />
      <PermanentDeleteModal isOpen={isPermanentDeleteModalOpen} target={permanentDeleteTarget} onDelete={handlePermanentDelete} onClose={() => setIsPermanentDeleteModalOpen(false)} loading={actionLoading} />
    </div>
  );
}