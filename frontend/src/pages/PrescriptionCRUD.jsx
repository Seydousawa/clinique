import React, { useState, useEffect } from 'react';
import { Pill, Plus } from 'lucide-react';
import PrescriptionTable from '../components/PrescriptionTable';
import PrescriptionModal from '../components/PrescriptionModal';
import DetailModal from '../components/PrescriptionDetailModal';
import ExamenModal from '../components/ExamenModal';
import PaymentModal from '../components/PaymentModal';
import MessageAlert from '../components/MessageAlert';
import { useHeader } from '../components/HeaderContext';

const API_URL          = 'http://127.0.0.1:8000/api/prescriptions/';
const EXAMENS_API      = 'http://127.0.0.1:8000/api/examens/';
const PRODUITS_API     = 'http://127.0.0.1:8000/api/produits/';
const PATIENTS_API     = 'http://127.0.0.1:8000/api/patients/';
const CONSULTATIONS_API = 'http://127.0.0.1:8000/api/consultations/';
const FACTURES_API     = 'http://127.0.0.1:8000/api/factures/';

export default function PrescriptionCRUD() {
  const [prescriptions,    setPrescriptions]    = useState([]);
  const [examens,          setExamens]          = useState([]);
  const [produits,         setProduits]         = useState([]);
  const [patients,         setPatients]         = useState([]);
  const [consultations,    setConsultations]    = useState([]);
  const [factures,         setFactures]         = useState([]);
  const [patientsMap,      setPatientsMap]      = useState({});
  const [consultationsMap, setConsultationsMap] = useState({});

  const [isModalOpen,          setIsModalOpen]          = useState(false);
  const [showRealModal,        setShowRealModal]        = useState(false);
  const [isExamenModalOpen,    setIsExamenModalOpen]    = useState(false);
  const [isEditMode,           setIsEditMode]           = useState(false);
  const [isDetailModalOpen,    setIsDetailModalOpen]    = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // ── Paiement ──
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoading,     setPaymentLoading]     = useState(false);

  const [currentPrescription, setCurrentPrescription] = useState({
    id: null, type_prescription: 'ordonnance',
    consultation: '', consultation_nom: '',
    patient: '', produit: '', quantite: '1',
    posologie: '', examen_nom: '', instructions: '', notes: ''
  });

  const [currentExamen, setCurrentExamen] = useState({ nom: '', description: '', prix: '' });
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message,       setMessage]       = useState(null);
  const [error,         setError]         = useState(null);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [typeFilter,    setTypeFilter]    = useState('');

  const { setHeader } = useHeader();
  useEffect(() => { setHeader('Gestion des Prescriptions', Pill); }, [setHeader]);
  useEffect(() => { fetchAllData(); }, []);

  // ─── Chargement ────────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [prescRes, examRes, prodRes, patRes, consRes, factRes] = await Promise.all([
        fetch(API_URL),
        fetch(EXAMENS_API),
        fetch(PRODUITS_API),
        fetch(PATIENTS_API),
        fetch(CONSULTATIONS_API),
        fetch(FACTURES_API)
      ]);

      const prescriptionsData = prescRes.ok ? await prescRes.json() : [];
      const examensData       = examRes.ok  ? await examRes.json()  : [];
      const produitsData      = prodRes.ok  ? await prodRes.json()  : [];
      const patientsData      = patRes.ok   ? await patRes.json()   : [];
      const consultationsData = consRes.ok  ? await consRes.json()  : [];
      const facturesData      = factRes.ok  ? await factRes.json()  : [];

      setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
      setExamens(Array.isArray(examensData)             ? examensData       : []);
      setProduits(Array.isArray(produitsData)           ? produitsData      : []);
      setPatients(Array.isArray(patientsData)           ? patientsData      : []);
      setConsultations(Array.isArray(consultationsData) ? consultationsData : []);
      setFactures(Array.isArray(facturesData)           ? facturesData      : []);

      const pMap = {};
      patientsData.forEach(p => { pMap[String(p.id || p.id_patient)] = p; });

      const cMap = {};
      consultationsData.forEach(c => {
        cMap[String(c.id)] = { ...c, patient: String(c.patient) };
      });

      setPatientsMap(pMap);
      setConsultationsMap(cMap);
    } catch (err) {
      console.error('Erreur fetchAllData:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (!currentPrescription.patient)
      newErrors.patient = 'Le patient est requis';

    if (!currentPrescription.consultation &&
      (!currentPrescription.consultation_nom || currentPrescription.consultation_nom.trim() === ''))
      newErrors.consultation = 'Spécifiez une consultation existante ou une description';

    if (currentPrescription.consultation) {
      const exists = consultations.some(c => String(c.id) === String(currentPrescription.consultation));
      if (!exists) {
        newErrors.consultation = 'La consultation sélectionnée n\'existe pas';
      } else {
        const c = consultationsMap[String(currentPrescription.consultation)];
        if (c && String(c.patient) !== String(currentPrescription.patient))
          newErrors.consultation = 'La consultation ne correspond pas au patient sélectionné';
      }
    }

    if (currentPrescription.type_prescription === 'ordonnance') {
      if (!currentPrescription.produit) newErrors.produit = 'Le produit est requis';
      if (!currentPrescription.quantite) newErrors.quantite = 'La quantité est requise';
      else if (isNaN(parseInt(currentPrescription.quantite)) || parseInt(currentPrescription.quantite) <= 0)
        newErrors.quantite = 'La quantité doit être un nombre positif';
    } else if (currentPrescription.type_prescription === 'examen') {
      if (!currentPrescription.examen_nom?.trim()) newErrors.examen_nom = "Le nom de l'examen est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      type_prescription: currentPrescription.type_prescription,
      patient:           parseInt(currentPrescription.patient, 10),
      notes:             currentPrescription.notes || ''
    };
    if (currentPrescription.consultation) {
      payload.consultation     = parseInt(currentPrescription.consultation, 10);
      payload.consultation_nom = '';
    } else {
      payload.consultation     = null;
      payload.consultation_nom = currentPrescription.consultation_nom?.trim() || '';
    }
    if (currentPrescription.type_prescription === 'ordonnance') {
      payload.produit      = parseInt(currentPrescription.produit, 10);
      payload.quantite     = parseInt(currentPrescription.quantite, 10);
      payload.posologie    = currentPrescription.posologie || '';
      payload.examen_nom   = '';
      payload.instructions = '';
    } else {
      payload.examen_nom   = currentPrescription.examen_nom.trim();
      payload.instructions = currentPrescription.instructions || '';
      payload.produit      = null;
      payload.quantite     = null;
      payload.posologie    = '';
    }
    return payload;
  };

  const parseServerError = async (response) => {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (typeof data === 'object') {
        return Object.entries(data)
          .map(([f, e]) => `${f}: ${Array.isArray(e) ? e.join(', ') : e}`)
          .join('; ');
      }
      return data.detail || data.message || JSON.stringify(data);
    } catch { return text || `Erreur HTTP: ${response.status}`; }
  };

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true); setError(null);
    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(buildPayload())
      });
      if (!r.ok) throw new Error(await parseServerError(r));
      await fetchAllData();
      setMessage('Prescription créée avec succès');
      closeModal();
    } catch (err) { setError(`Erreur création: ${err.message}`); }
    finally { setSubmitLoading(false); }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true); setError(null);
    try {
      const r = await fetch(`${API_URL}${currentPrescription.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(buildPayload())
      });
      if (!r.ok) throw new Error(await parseServerError(r));
      await fetchAllData();
      setMessage('Prescription modifiée avec succès');
      closeModal();
    } catch (err) { setError(`Erreur modification: ${err.message}`); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (prescriptionId) => {
    if (!window.confirm('Confirmez-vous la suppression de cette prescription ?')) return;
    try {
      const r = await fetch(`${API_URL}${prescriptionId}/`, { method: 'DELETE' });
      if (!r.ok) throw new Error(`Erreur HTTP: ${r.status}`);
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
      setMessage('Prescription supprimée avec succès');
    } catch (err) { setError('Erreur suppression: ' + err.message); }
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
          prescription_id: pd.item_id,
          // Motif avec ID embarqué pour le fallback de détection
          motif:           `[PRESC-${pd.item_id}] ${pd.motif}`,
          montant:         pd.montant,
          date:            pd.date,
          notes:           pd.notes || ''
        })
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.detail || JSON.stringify(d));
      }
      await fetchAllData();
      setMessage(`Paiement de ${pd.montant} F CFA enregistré avec succès`);
      setIsPaymentModalOpen(false);
      setSelectedPrescription(null);
    } catch (err) { setError(`Erreur paiement: ${err.message}`); }
    finally { setPaymentLoading(false); }
  };

  // ─── Examen ─────────────────────────────────────────────────────────────────
  const handleCreateExamen = async () => {
    if (!currentExamen.nom || !currentExamen.prix) { setError('Le nom et le prix sont requis'); return; }
    try {
      const r = await fetch(EXAMENS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentExamen, prix: parseFloat(currentExamen.prix) })
      });
      if (!r.ok) throw new Error(await parseServerError(r));
      setExamens(prev => [...prev,  r.json()]);
      setMessage('Examen créé avec succès');
      closeExamenModal();
    } catch (err) { setError(`Erreur création: ${err.message}`); }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleConsultationChange = (consultationId) => {
    const c = consultationsMap[String(consultationId)];
    setCurrentPrescription(prev => ({
      ...prev,
      consultation:     consultationId,
      consultation_nom: '',
      patient:          c ? String(c.patient) : prev.patient
    }));
    if (errors.consultation) setErrors(prev => ({ ...prev, consultation: '' }));
    if (errors.patient)      setErrors(prev => ({ ...prev, patient: '' }));
  };

  const handlePatientChange = (patientId) => {
    setCurrentPrescription(prev => ({ ...prev, patient: patientId, consultation: '' }));
    if (errors.patient) setErrors(prev => ({ ...prev, patient: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'consultation') handleConsultationChange(value);
    else if (name === 'patient') handlePatientChange(value);
    else setCurrentPrescription(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleExamenInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentExamen(prev => ({ ...prev, [name]: value }));
  };

  // ─── Modals ─────────────────────────────────────────────────────────────────
  const openModal = (prescription = null) => {
    if (prescription) {
      setCurrentPrescription({
        id:                prescription.id,
        type_prescription: prescription.type_prescription || 'ordonnance',
        patient:           prescription.patient           ? String(prescription.patient)      : '',
        consultation:      prescription.consultation      ? String(prescription.consultation) : '',
        consultation_nom:  prescription.consultation_nom  || '',
        produit:           prescription.produit           ? String(prescription.produit)      : '',
        quantite:          prescription.quantite          ? String(prescription.quantite)     : '',
        posologie:         prescription.posologie         || '',
        examen_nom:        prescription.examen_nom        || '',
        instructions:      prescription.instructions      || '',
        notes:             prescription.notes             || ''
      });
      setIsEditMode(true);
    } else {
      setCurrentPrescription({
        id: null, type_prescription: 'ordonnance',
        consultation: '', consultation_nom: '',
        patient: '', produit: '', quantite: '1',
        posologie: '', examen_nom: '', instructions: '', notes: ''
      });
      setIsEditMode(false);
    }
    setErrors({});
    setIsModalOpen(true);
    setShowRealModal(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setShowRealModal(false);
      setCurrentPrescription({
        id: null, type_prescription: 'ordonnance', consultation: '',
        consultation_nom: '', patient: '', produit: '', quantite: '1',
        posologie: '', examen_nom: '', instructions: '', notes: ''
      });
      setErrors({});
      setSubmitLoading(false);
    }, 300);
  };

  const closeDetailModal  = () => { setIsDetailModalOpen(false);  setSelectedPrescription(null); };
  const closeExamenModal  = () => { setIsExamenModalOpen(false);  setCurrentExamen({ nom: '', description: '', prix: '' }); };
  const closePaymentModal = () => { setIsPaymentModalOpen(false); setSelectedPrescription(null); };

  // ─── Filtre ──────────────────────────────────────────────────────────────────
  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch =
      (p.patient_nom?.toLowerCase()      || '').includes(searchTerm.toLowerCase()) ||
      (p.patient_prenom?.toLowerCase()   || '').includes(searchTerm.toLowerCase()) ||
      (p.produit_nom?.toLowerCase()      || '').includes(searchTerm.toLowerCase()) ||
      (p.examen_nom?.toLowerCase()       || '').includes(searchTerm.toLowerCase()) ||
      (p.consultation_nom?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || p.type_prescription === typeFilter;
    return matchesSearch && matchesType;
  });

  // ─── Rendu ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
      {error   && <MessageAlert message={error}   type="error"   onClose={() => setError(null)}   />}

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
              Liste des Prescriptions
            </h2>
            <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
              {filteredPrescriptions.length}
            </span>
          </div>
          <button
            onClick={() => openModal()}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white', border: 'none', padding: '10px 20px',
              borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
              fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 2px 8px rgba(16,185,129,0.35)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.35)'; }}
          >
            <Plus size={18} />
            Nouvelle Prescription
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <PrescriptionFilterBar
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p>Chargement des prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
              {searchTerm || typeFilter ? 'Aucun résultat' : 'Aucune prescription'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {searchTerm || typeFilter
                ? 'Aucune prescription ne correspond à votre recherche.'
                : "Aucune prescription n'a été enregistrée pour le moment."}
            </p>
          </div>
        ) : (
          <PrescriptionTable
            prescriptions={filteredPrescriptions}
            patientsMap={patientsMap}
            factures={factures}
            onEdit={openModal}
            onDelete={handleDelete}
            onDetail={p => { setSelectedPrescription(p); setIsDetailModalOpen(true); }}
            onPayment={p => { setSelectedPrescription(p); setIsPaymentModalOpen(true); }}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {showRealModal && (
        <PrescriptionModal
          isEditMode={isEditMode}
          prescription={currentPrescription}
          errors={errors}
          patients={patients}
          consultations={consultations}
          produits={produits}
          examens={examens}
          patientsMap={patientsMap}
          consultationsMap={consultationsMap}
          onInputChange={handleInputChange}
          onSubmit={isEditMode ? handleUpdate : handleCreate}
          onClose={closeModal}
          loading={submitLoading}
        />
      )}

      {isDetailModalOpen && selectedPrescription && (
        <DetailModal
          prescription={selectedPrescription}
          patientsMap={patientsMap}
          consultationsMap={consultationsMap}
          produitsMap={{}}
          onClose={closeDetailModal}
        />
      )}

      {isPaymentModalOpen && selectedPrescription && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          onSubmit={handlePayment}
          loading={paymentLoading}
          selectedItem={selectedPrescription}
          patientsMap={patientsMap}
          title="Paiement Prescription"
          itemLabel="prescription"
          amountFieldName="prix"
          amountLabel="Montant"
          defaultAmount="5000"
          itemIdField="id"
          patientIdField="patient"
          dateField="date_prescription"
          descriptionField={
            selectedPrescription?.type_prescription === 'ordonnance'
              ? 'produit_nom'
              : 'examen_nom'
          }
          itemDateLabel="Date prescription"
          itemDescriptionLabel={
            selectedPrescription?.type_prescription === 'ordonnance'
              ? 'Médicament'
              : 'Examen'
          }
        />
      )}

      {isExamenModalOpen && (
        <ExamenModal
          examen={currentExamen}
          onInputChange={handleExamenInputChange}
          onSubmit={handleCreateExamen}
          onClose={closeExamenModal}
        />
      )}

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function PrescriptionFilterBar({ searchTerm, setSearchTerm, typeFilter, setTypeFilter }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '25px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Rechercher par patient, prescription ou consultation..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 10px 10px 40px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#10b981'}
          onBlur={e  => e.target.style.borderColor = '#e0e0e0'}
        />
        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</div>
      </div>
      <select
        value={typeFilter}
        onChange={e => setTypeFilter(e.target.value)}
        style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', cursor: 'pointer', background: 'white' }}
        onFocus={e => e.target.style.borderColor = '#10b981'}
        onBlur={e  => e.target.style.borderColor = '#e0e0e0'}
      >
        <option value="">Tous les types</option>
        <option value="ordonnance">Ordonnances</option>
        <option value="examen">Examens</option>
      </select>
    </div>
  );
}