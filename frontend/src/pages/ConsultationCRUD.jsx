import React, { useState, useEffect } from 'react';
import ConsultationTable from '../components/ConsultationTable';
import ConsultationModal from '../components/ConsultationModal';
import DetailModal from '../components/ConsultationDetailModal';
import DeleteModal from '../components/DeleteModal';
import RestoreModal from '../components/RestoreModal';
import PermanentDeleteModal from '../components/PermanentDeleteModal';
import PaymentModal from '../components/PaymentModal';
import MessageAlert from '../components/MessageAlert';
import { ClipboardList, Plus, Archive, Filter, Search } from 'lucide-react';
import consultationService from '../services/consultationService';
import './ConsultationCRUD.css';
import { useHeader } from '../components/HeaderContext';

const PATIENTS_API = 'http://127.0.0.1:8000/api/patients/';
const MEDECINS_API = 'http://127.0.0.1:8000/api/medecins/';
const FACTURES_API = 'http://127.0.0.1:8000/api/factures/';

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data    && Array.isArray(data.data))    return data.data;
  return [];
}

export default function ConsultationCRUD() {
  const [consultations, setConsultations] = useState([]);
  const [patients,      setPatients]      = useState([]);
  const [medecins,      setMedecins]      = useState([]);
  const [patientsMap,   setPatientsMap]   = useState({});
  const [medecinsMap,   setMedecinsMap]   = useState({});
  const [factures,      setFactures]      = useState([]);

  const [showRealModal,              setShowRealModal]              = useState(false);
  const [isEditMode,                 setIsEditMode]                 = useState(false);
  const [isDetailModalOpen,          setIsDetailModalOpen]          = useState(false);
  const [isDeleteModalOpen,          setIsDeleteModalOpen]          = useState(false);
  const [isRestoreModalOpen,         setIsRestoreModalOpen]         = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [selectedConsultation,       setSelectedConsultation]       = useState(null);
  const [isPaymentModalOpen,         setIsPaymentModalOpen]         = useState(false);
  const [paymentLoading,             setPaymentLoading]             = useState(false);

  const emptyForm = {
    id: null, patient: '', medecin: '',
    patient_nom_complet: '', medecin_nom_complet: '',
    date_consultation: '', symptome: '', diagnostic: '',
    observation: '', traitement: '',
  };
  const [currentConsultation, setCurrentConsultation] = useState(emptyForm);
  const [viewMode,   setViewMode]   = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget,          setDeleteTarget]          = useState(null);
  const [restoreTarget,         setRestoreTarget]         = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message,       setMessage]       = useState(null);
  const [error,         setError]         = useState(null);

  const { setHeader } = useHeader();
  useEffect(() => { setHeader('Gestion des Consultations', ClipboardList); }, [setHeader]);
  useEffect(() => { fetchAllData(); }, [viewMode]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      
      let patientsData = [];
      try {
        const r = await fetch(PATIENTS_API);
        if (r.ok) { patientsData = extractArray(await r.json()); }
        else { console.error('❌ Patients HTTP', r.status); }
      } catch(e) { console.error('❌ Patients fetch:', e.message); }

      // ── 2. Médecins ──────────────────────────────────────────────────────
      let medecinsData = [];
      const medUrls = [
        MEDECINS_API,
        MEDECINS_API + '?include_deleted=false',
        MEDECINS_API + '?all=true',
      ];
      for (const url of medUrls) {
        try {
          const r = await fetch(url);
          if (r.ok) {
            const raw = await r.json();
            const arr = extractArray(raw);
            if (arr.length > 0) { medecinsData = arr; break; }
          }
        } catch(e) { console.error('❌ Médecins fetch:', e.message); }
      }

      // ── 3. Factures ──────────────────────────────────────────────────────
      let facturesData = [];
      try {
        const r = await fetch(FACTURES_API);
        if (r.ok) { facturesData = extractArray(await r.json()); }
      } catch(e) { console.error('❌ Factures fetch:', e.message); }

      // ── 4. Maps ──────────────────────────────────────────────────────────
      const buildMap = (arr) => {
        const map = {};
        arr.forEach(item => {
          if (!item) return;
          const id = item.id ?? item.pk;
          if (id == null) return;
          map[id]         = item;
          map[String(id)] = item;
          map[Number(id)] = item;
        });
        return map;
      };
      const newPatientsMap = buildMap(patientsData);
      let   newMedecinsMap = buildMap(medecinsData);

      // ── 5. Consultations ─────────────────────────────────────────────────
      let raw = [];
      if (viewMode === 'active')        raw = await consultationService.getAllActive();
      else if (viewMode === 'archived') raw = await consultationService.getAllArchived();
      else                              raw = await consultationService.getAll();
      let consultationsData = extractArray(raw);

      // ── 6. Fallback médecins depuis les consultations ────────────────────
      if (medecinsData.length === 0) {
        const seen = {};
        consultationsData.forEach(c => {
          const mid = c.medecin;
          const nom = c.medecin_nom_complet;
          if (mid && nom && nom !== 'Non assigné' && !seen[mid]) {
            const clean  = nom.replace(/^Dr\.\s*/i, '');
            const parts  = clean.trim().split(/\s+/);
            const prenom = parts[0] || '';
            const nomF   = parts.slice(1).join(' ') || '';
            seen[mid] = { id: mid, prenom, nom: nomF };
          }
        });
        medecinsData   = Object.values(seen);
        newMedecinsMap = buildMap(medecinsData);
      }

      // ── 7. Enrichir les consultations ────────────────────────────────────
      consultationsData = consultationsData.map(c => {
        const r = { ...c };

        if (!r.patient_nom_complet && r.patient) {
          const p = newPatientsMap[r.patient];
          if (p) r.patient_nom_complet = `${p.prenom} ${p.nom}`.trim();
        }
        if (!r.patient && r.patient_nom_complet) {
          const found = patientsData.find(p => `${p.prenom} ${p.nom}` === r.patient_nom_complet);
          if (found) r.patient = found.id;
        }

        if (!r.medecin_nom_complet && r.medecin) {
          const m = newMedecinsMap[r.medecin];
          if (m) r.medecin_nom_complet = `Dr. ${m.prenom} ${m.nom}`.trim();
        }
        if (!r.medecin && r.medecin_nom_complet && r.medecin_nom_complet !== 'Non assigné') {
          const found = medecinsData.find(m =>
            `Dr. ${m.prenom} ${m.nom}` === r.medecin_nom_complet ||
            `${m.prenom} ${m.nom}`     === r.medecin_nom_complet.replace(/^Dr\.\s*/i, '')
          );
          if (found) r.medecin = found.id;
        }

        return r;
      });

      setPatients(patientsData);
      setMedecins(medecinsData);
      setFactures(facturesData);
      setPatientsMap(newPatientsMap);
      setMedecinsMap(newMedecinsMap);
      setConsultations(consultationsData);

    } catch(err) {
      console.error('❌ fetchAllData:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!currentConsultation.patient)
      e.patient = 'Le patient est requis';
    else if (isNaN(parseInt(currentConsultation.patient, 10)))
      e.patient = 'Sélectionnez un patient dans la liste';

    if (!currentConsultation.medecin)
      e.medecin = 'Le médecin est requis';
    else if (isNaN(parseInt(currentConsultation.medecin, 10)))
      e.medecin = 'Sélectionnez un médecin dans la liste';

    if (!currentConsultation.date_consultation) e.date_consultation = 'La date est requise';
    if (!currentConsultation.symptome?.trim())  e.symptome  = 'Les symptômes sont requis';
    else if (currentConsultation.symptome.trim().length < 3) e.symptome = 'Minimum 3 caractères';
    if (!currentConsultation.diagnostic?.trim()) e.diagnostic = 'Le diagnostic est requis';
    else if (currentConsultation.diagnostic.trim().length < 3) e.diagnostic = 'Minimum 3 caractères';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    patient:           parseInt(currentConsultation.patient, 10),
    medecin:           parseInt(currentConsultation.medecin, 10) || null,
    date_consultation: currentConsultation.date_consultation,
    symptome:          currentConsultation.symptome.trim(),
    diagnostic:        currentConsultation.diagnostic.trim(),
    observation:       currentConsultation.observation?.trim() || '',
    traitement:        currentConsultation.traitement?.trim()  || '',
  });

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true); setError(null);
    try {
      await consultationService.create(buildPayload());
      await fetchAllData();
      setMessage('Consultation créée avec succès');
      closeModal();
    } catch(err) { setError(`Erreur création: ${err.message}`); }
    finally { setSubmitLoading(false); }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true); setError(null);
    try {
      await consultationService.update(currentConsultation.id, buildPayload());
      await fetchAllData();
      setMessage('Consultation modifiée avec succès');
      closeModal();
    } catch(err) { setError(`Erreur modification: ${err.message}`); }
    finally { setSubmitLoading(false); }
  };

  // ─── Ouverture modal ────────────────────────────────────────────────────────
  const openModal = (consultation = null) => {
    if (consultation) {
      let patientId = '';
      if (typeof consultation.patient === 'object' && consultation.patient?.id)
        patientId = String(consultation.patient.id);
      else if (consultation.patient)
        patientId = String(consultation.patient);
      if (!patientId && consultation.patient_nom_complet) {
        const f = patients.find(p => `${p.prenom} ${p.nom}` === consultation.patient_nom_complet);
        if (f) patientId = String(f.id);
      }

      let medecinId = '';
      if (typeof consultation.medecin === 'object' && consultation.medecin?.id)
        medecinId = String(consultation.medecin.id);
      else if (consultation.medecin)
        medecinId = String(consultation.medecin);
      if (!medecinId && consultation.medecin_nom_complet && consultation.medecin_nom_complet !== 'Non assigné') {
        const f = medecins.find(m =>
          `Dr. ${m.prenom} ${m.nom}` === consultation.medecin_nom_complet ||
          `${m.prenom} ${m.nom}`     === consultation.medecin_nom_complet.replace(/^Dr\.\s*/i, '')
        );
        if (f) medecinId = String(f.id);
      }

      setCurrentConsultation({
        id:                  consultation.id,
        patient:             patientId,
        medecin:             medecinId,
        patient_nom_complet: consultation.patient_nom_complet || '',
        medecin_nom_complet: consultation.medecin_nom_complet || '',
        date_consultation:   consultation.date_consultation   || '',
        symptome:            consultation.symptome            || '',
        diagnostic:          consultation.diagnostic          || '',
        observation:         consultation.observation         || '',
        traitement:          consultation.traitement          || '',
      });
      setIsEditMode(true);
    } else {
      setCurrentConsultation(emptyForm);
      setIsEditMode(false);
    }
    setErrors({});
    setShowRealModal(true);
  };

  const closeModal = () => {
    setShowRealModal(false);
    setCurrentConsultation(emptyForm);
    setErrors({});
    setSubmitLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentConsultation(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ─── Paiement ───────────────────────────────────────────────────────────────
  const handlePayment = async (pd) => {
    setPaymentLoading(true); setError(null);
    try {
      const r = await fetch(FACTURES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id:      pd.patient_id,
          consultation_id: pd.item_id,
          // Motif avec ID embarqué pour le fallback de détection
          motif:           `[CONSULT-${pd.item_id}] ${pd.motif}`,
          montant:         pd.montant,
          date:            pd.date,
          notes:           pd.notes || '',
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.detail || JSON.stringify(d));
      }
      await fetchAllData();
      setMessage(`Paiement de ${pd.montant} F CFA enregistré avec succès`);
      setIsPaymentModalOpen(false);
      setSelectedConsultation(null);
    } catch(err) {
      setError(`Erreur paiement: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // ─── Actions secondaires ────────────────────────────────────────────────────
  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const r = await consultationService.archive(deleteTarget.id);
      await fetchAllData(); setMessage(r.message || 'Archivée');
      setIsDeleteModalOpen(false); setDeleteTarget(null);
    } catch { setError('Erreur archivage'); } finally { setActionLoading(false); }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const r = await consultationService.restore(restoreTarget.id);
      await fetchAllData(); setMessage(r.message || 'Restaurée');
      setIsRestoreModalOpen(false); setRestoreTarget(null);
    } catch { setError('Erreur restauration'); } finally { setActionLoading(false); }
  };

  const handlePermanentDelete = async () => {
    setActionLoading(true);
    try {
      await consultationService.permanentDelete(permanentDeleteTarget.id);
      await fetchAllData(); setMessage('Supprimée définitivement');
      setIsPermanentDeleteModalOpen(false); setPermanentDeleteTarget(null);
    } catch { setError('Erreur suppression'); } finally { setActionLoading(false); }
  };

  const getPatientName = (c) => {
    if (c.patient_nom_complet) return c.patient_nom_complet;
    const id = c.patient?.id ?? c.patient;
    const p  = id ? (patientsMap[id] || patientsMap[String(id)]) : null;
    return p ? `${p.prenom} ${p.nom}` : 'Patient inconnu';
  };

  const filteredConsultations = React.useMemo(() => {
    if (!Array.isArray(consultations)) return [];
    const s = searchTerm.toLowerCase().trim();
    if (!s) return consultations;
    return consultations.filter(c => {
      if (!c) return false;
      return (
        (c.patient_nom_complet || '').toLowerCase().includes(s) ||
        (c.medecin_nom_complet || '').toLowerCase().includes(s) ||
        (c.diagnostic  || '').toLowerCase().includes(s) ||
        (c.symptome    || '').toLowerCase().includes(s) ||
        (c.observation || '').toLowerCase().includes(s)
      );
    });
  }, [consultations, searchTerm]);

  const activeCount   = consultations.filter(c => !c.is_deleted).length;
  const archivedCount = consultations.filter(c =>  c.is_deleted).length;

  return (
    <div className="consultation-container">
      <div className="consultation-content">
        <div className="consultation-main">
          {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
          {error   && <MessageAlert message={error}   type="error"   onClose={() => setError(null)}   />}

          <div className="consultation-card">
            <div className="card-header">
              <div className="header-left">
                <h2 className="card-title">Liste des Consultations</h2>
                <span className="count-badge">{filteredConsultations.length}</span>
              </div>
              <button onClick={() => openModal()} className="add-button">
                <Plus size={18} /> Nouvelle Consultation
              </button>
            </div>

            <div className="filter-bar-simple">
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Rechercher..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} className="search-input" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="clear-search-btn">×</button>}
              </div>
            </div>

            <div className="view-filter-bar">
              <Filter size={18} color="#7f8c8d" />
              <button onClick={() => setViewMode('active')}
                className={`view-filter-btn ${viewMode === 'active' ? 'active' : ''}`}>
                <ClipboardList size={16} /> Actives ({activeCount})
              </button>
              <button onClick={() => setViewMode('archived')}
                className={`view-filter-btn ${viewMode === 'archived' ? 'active' : ''}`}>
                <Archive size={16} /> Archivées ({archivedCount})
              </button>
            </div>

            <ConsultationTable
              consultations={filteredConsultations}
              patientsMap={patientsMap}
              medecinsMap={medecinsMap}
              loading={loading}
              onEdit={openModal}
              onDelete={c => { setDeleteTarget({ id: c.id, nom: getPatientName(c), prenom: '' }); setIsDeleteModalOpen(true); }}
              onDetail={c => { setSelectedConsultation(c); setIsDetailModalOpen(true); }}
              onRestore={c => { setRestoreTarget({ id: c.id, nom: getPatientName(c), prenom: '' }); setIsRestoreModalOpen(true); }}
              onPermanentDelete={c => { setPermanentDeleteTarget({ id: c.id, nom: getPatientName(c), prenom: '' }); setIsPermanentDeleteModalOpen(true); }}
              onPayment={c => { setSelectedConsultation(c); setIsPaymentModalOpen(true); }}
              viewMode={viewMode}
              factures={factures}
            />
          </div>
        </div>
      </div>

      {showRealModal && (
        <ConsultationModal
          isEditMode={isEditMode}
          consultation={currentConsultation}
          errors={errors}
          patients={patients}
          medecins={medecins}
          onInputChange={handleInputChange}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          onClose={closeModal}
          loading={submitLoading}
        />
      )}

      {isDetailModalOpen && selectedConsultation && (
        <DetailModal
          consultation={selectedConsultation}
          patientsMap={patientsMap}
          medecinsMap={medecinsMap}
          onClose={() => { setIsDetailModalOpen(false); setSelectedConsultation(null); }}
        />
      )}

      {isPaymentModalOpen && selectedConsultation && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => { setIsPaymentModalOpen(false); setSelectedConsultation(null); }}
          onSubmit={handlePayment}
          loading={paymentLoading}
          selectedItem={selectedConsultation}
          patientsMap={patientsMap}
          title="Paiement Consultation"
          itemLabel="consultation"
          amountFieldName="montant"
          amountLabel="Montant"
          defaultAmount="5000"
          itemIdField="id"
          patientIdField="patient"
          dateField="date_consultation"
          descriptionField="diagnostic"
          itemDateLabel="Date Consultation"
          itemDescriptionLabel="Diagnostic"
        />
      )}

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