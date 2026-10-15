import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MessageAlert from '../components/MessageAlert';
import RendezVousFilterBar from '../components/RendezVousFilterBar';
import RendezVousModal from '../components/RendezVousModal';
import RendezVousDetailModal from '../components/RendezVousDetailModal';
import DeleteModal from '../components/DeleteModal';
import { Calendar, Plus, Eye, Edit3, Trash2, CreditCard, FileText, X, CheckCircle } from 'lucide-react';
import './style.css';
import { useHeader } from '../components/HeaderContext';

const API_URL      = 'http://127.0.0.1:8000/api/rendezvous/';
const PATIENTS_API = 'http://127.0.0.1:8000/api/patients/';
const MEDECINS_API = 'http://127.0.0.1:8000/api/medecins/';
const FACTURES_API = 'http://127.0.0.1:8000/api/factures/';

export default function RendezVousCRUD() {
  const [rendezvous,   setRendezVous]   = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [medecins,     setMedecins]     = useState([]);
  const [patientsMap,  setPatientsMap]  = useState({});
  const [medecinsMap,  setMedecinsMap]  = useState({});
  // ✅ factures globales chargées au démarrage
  const [factures,     setFactures]     = useState([]);

  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [isDeleteModalOpen,  setIsDeleteModalOpen]  = useState(false);
  const [isDetailModalOpen,  setIsDetailModalOpen]  = useState(false);
  const [isFactureModalOpen, setIsFactureModalOpen] = useState(false);
  const [isFactureDetailOpen,setIsFactureDetailOpen]= useState(false);

  const [isEditMode,          setIsEditMode]          = useState(false);
  const [currentRendezVous,   setCurrentRendezVous]   = useState({
    id: null, patient: '', medecin: '',
    date_rdv: '', motif: '', statut: 'programme', notes: ''
  });

  const [selectedRendezVous, setSelectedRendezVous] = useState(null);
  const [patientData,        setPatientData]        = useState(null);
  const [medecinData,        setMedecinData]        = useState(null);
  const [selectedFacture,    setSelectedFacture]    = useState(null);

  const [factureData, setFactureData] = useState({
    patient_id: '', motif: '', montant: '',
    date: new Date().toISOString().split('T')[0], notes: ''
  });

  const [searchTerm,    setSearchTerm]    = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [medecinFilter, setMedecinFilter] = useState('');
  const [statutFilter,  setStatutFilter]  = useState('');
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message,       setMessage]       = useState(null);
  const [error,         setError]         = useState(null);

  const { setHeader } = useHeader();
  useEffect(() => { setHeader('Gestion des Rendez-vous', Calendar); }, [setHeader]);
  useEffect(() => { fetchAllData(); }, []);

  // ─── Chargement global (inclut les factures) ────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [rdvRes, patRes, medRes, factRes] = await Promise.all([
        fetch(API_URL),
        fetch(PATIENTS_API),
        fetch(MEDECINS_API),
        fetch(FACTURES_API)          // ✅ chargement global des factures
      ]);

      if (rdvRes.ok)  setRendezVous(extractArray(await rdvRes.json()));
      if (factRes.ok) setFactures(extractArray(await factRes.json()));

      if (patRes.ok) {
        const data = extractArray(await patRes.json());
        setPatients(data);
        const m = {};
        data.forEach(p => { m[p.id] = p; });
        setPatientsMap(m);
      }

      if (medRes.ok) {
        const data = extractArray(await medRes.json());
        setMedecins(data);
        const m = {};
        data.forEach(med => { m[med.id] = med; });
        setMedecinsMap(m);
      }
    } catch (err) {
      setError(`Erreur lors du chargement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const extractArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    if (data?.data)    return data.data;
    return [];
  };

  // ✅ Détection fiable : tag [RDV-ID] en priorité, fallback patient+motif
  const hasFactureForRdv = (rdv) => {
    if (!factures || factures.length === 0) return false;
    const rdvId = String(rdv.id);
    const patId = String(rdv.patient);
    return factures.some(f => {
      if (f.motif && f.motif.includes(`[RDV-${rdvId}]`)) return true;
      if (String(f.rendezvous_id) === rdvId) return true;
      if (String(f.rendezvous)    === rdvId) return true;
      // Fallback : même patient + motif contient le motif du RDV
      if ((String(f.patient_id) === patId || String(f.patient) === patId)
          && f.motif && rdv.motif && f.motif.includes(rdv.motif)) return true;
      return false;
    });
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!currentRendezVous.patient)        e.patient  = 'Le patient est requis';
    if (!currentRendezVous.medecin)        e.medecin  = 'Le médecin est requis';
    if (!currentRendezVous.date_rdv)       e.date_rdv = "La date et l'heure sont requises";
    if (!currentRendezVous.motif?.trim())  e.motif    = 'Le motif est requis';
    if (!currentRendezVous.statut)         e.statut   = 'Le statut est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateFactureForm = () => {
    const e = {};
    if (!factureData.motif?.trim())                        e.motif   = 'Le motif est requis';
    if (!factureData.montant || parseFloat(factureData.montant) <= 0) e.montant = 'Le montant doit être positif';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── CRUD RDV ───────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true); setError(null);
    try {
      const r = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRendezVous)
      });
      if (!r.ok) throw new Error(`Erreur HTTP: ${r.status}`);
      await fetchAllData();
      setMessage('Rendez-vous créé avec succès');
      closeModal();
    } catch { setError('Un rendez-vous existe déjà à cette date'); }
    finally { setSubmitLoading(false); }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true); setError(null);
    try {
      const r = await fetch(`${API_URL}${currentRendezVous.id}/`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRendezVous)
      });
      if (!r.ok) throw new Error(`Erreur HTTP: ${r.status}`);
      await fetchAllData();
      setMessage('Rendez-vous modifié avec succès');
      closeModal();
    } catch (err) { setError(`Erreur modification: ${err.message}`); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async () => {
    try {
      const r = await fetch(`${API_URL}${deleteTarget.id}/`, { method: 'DELETE' });
      if (!r.ok) throw new Error(`Erreur HTTP: ${r.status}`);
      await fetchAllData();
      setMessage('Rendez-vous supprimé avec succès');
      setIsDeleteModalOpen(false); setDeleteTarget(null);
    } catch (err) { setError(`Erreur suppression: ${err.message}`); }
  };

  // ─── Paiement ───────────────────────────────────────────────────────────────
  const handleCreateFacture = async () => {
    if (!validateFactureForm()) return;
    setSubmitLoading(true); setError(null);
    try {
      const rdvId = selectedRendezVous?.id;
      const r = await fetch(FACTURES_API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id:    factureData.patient_id,
          rendezvous_id: rdvId,
          // ✅ Tag [RDV-ID] embarqué dans le motif pour détection fiable
          motif:         `[RDV-${rdvId}] ${factureData.motif}`,
          montant:       parseFloat(factureData.montant),
          date:          factureData.date,
          notes:         factureData.notes || ''
        })
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.detail || `Erreur HTTP: ${r.status}`);
      }

      // Mettre le RDV en "terminé"
      if (rdvId) {
        await fetch(`${API_URL}${rdvId}/`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: 'termine' })
        });
      }

      await fetchAllData();
      setMessage(`Paiement de ${factureData.montant} F CFA enregistré avec succès`);
      closeFactureModal();
    } catch (err) { setError(`Erreur paiement: ${err.message}`); }
    finally { setSubmitLoading(false); }
  };

  // ─── Modals ─────────────────────────────────────────────────────────────────
  const openModal = (rdv = null) => {
    if (rdv) {
      const date = new Date(rdv.date_rdv);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      setCurrentRendezVous({
        id: rdv.id, patient: rdv.patient || '', medecin: rdv.medecin || '',
        date_rdv: localDate, motif: rdv.motif || '',
        statut: rdv.statut || 'programme', notes: rdv.notes || ''
      });
      setIsEditMode(true);
    } else {
      setCurrentRendezVous({ id: null, patient: '', medecin: '', date_rdv: '', motif: '', statut: 'programme', notes: '' });
      setIsEditMode(false);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRendezVous({ id: null, patient: '', medecin: '', date_rdv: '', motif: '', statut: 'programme', notes: '' });
    setErrors({}); setSubmitLoading(false);
  };

  const openDeleteModal = (rdv) => {
    const p = patientsMap[rdv.patient];
    const nom = p ? `${p.prenom} ${p.nom}`.trim() : `Patient #${rdv.patient}`;
    setDeleteTarget({ id: rdv.id, nom: `${nom} - ${new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}` });
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = async (rdv) => {
    setSelectedRendezVous(rdv);
    try {
      const [patRes, medRes] = await Promise.all([
        fetch(`${PATIENTS_API}${rdv.patient}/`).catch(() => null),
        fetch(`${MEDECINS_API}${rdv.medecin}/`).catch(() => null)
      ]);
      if (patRes?.ok) setPatientData(await patRes.json());
      if (medRes?.ok) setMedecinData(await medRes.json());
    } catch {}
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRendezVous(null); setPatientData(null); setMedecinData(null);
  };

  const openFactureModal = (rdv) => {
    setSelectedRendezVous(rdv);
    setFactureData({
      patient_id: rdv.patient,
      motif:      `Rendez-vous: ${rdv.motif}`,
      montant:    calculateSuggestedAmount(rdv.motif),
      date:       new Date().toISOString().split('T')[0],
      notes:      `Rendez-vous du ${new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}`
    });
    document.body.style.overflow = 'hidden';
    setIsFactureModalOpen(true);
    setErrors({});
  };

  const closeFactureModal = () => {
    setIsFactureModalOpen(false); setSelectedRendezVous(null);
    setFactureData({ patient_id: '', motif: '', montant: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setErrors({}); setSubmitLoading(false);
    document.body.style.overflow = 'auto';
  };

  const calculateSuggestedAmount = (motif) => {
    const m = (motif || '').toLowerCase();
    if (m.includes('urgence'))     return '10000';
    if (m.includes('examen'))      return '8000';
    if (m.includes('consultation'))return '5000';
    if (m.includes('suivi'))       return '3000';
    return '5000';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRendezVous(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFactureInputChange = (e) => {
    const { name, value } = e.target;
    setFactureData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ─── Filtrage ────────────────────────────────────────────────────────────────
  const filteredRendezVous = React.useMemo(() => {
    if (!Array.isArray(rendezvous)) return [];
    return rendezvous.filter(rdv => {
      if (!rdv) return false;
      const matchesSearch  = (rdv.motif || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPatient = !patientFilter || rdv.patient === parseInt(patientFilter);
      const matchesMedecin = !medecinFilter || rdv.medecin === parseInt(medecinFilter);
      const matchesStatut  = !statutFilter  || rdv.statut  === statutFilter;
      return matchesSearch && matchesPatient && matchesMedecin && matchesStatut;
    });
  }, [rendezvous, searchTerm, patientFilter, medecinFilter, statutFilter]);

  const getStatusStyles = (statut) => ({
    programme: { background: '#fff3cd', color: '#856404' },
    confirme:  { background: '#d1ecf1', color: '#0c5460' },
    annule:    { background: '#f8d7da', color: '#721c24' },
    termine:   { background: '#d4edda', color: '#155724' }
  }[statut] || { background: '#fff3cd', color: '#856404' });

  // ─── Rendu ───────────────────────────────────────────────────────────────────
  return (
    <div className="rendezvous-container">
      <div className="rendezvous-content">
        <div className="rendezvous-main">
          {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
          {error   && <MessageAlert message={error}   type="error"   onClose={() => setError(null)}   />}

          <div className="rendezvous-card">
            <div className="card-header">
              <div className="header-left">
                <h2 className="card-title">Liste des Rendez-vous</h2>
                <span className="count-badge">{filteredRendezVous.length}</span>
              </div>
              <button onClick={() => openModal()} className="add-button">
                <Plus size={18} /> Nouveau Rendez-vous
              </button>
            </div>

            <RendezVousFilterBar
              searchTerm={searchTerm}       setSearchTerm={setSearchTerm}
              patientFilter={patientFilter} setPatientFilter={setPatientFilter}
              medecinFilter={medecinFilter} setMedecinFilter={setMedecinFilter}
              statutFilter={statutFilter}   setStatutFilter={setStatutFilter}
              patients={patients}           medecins={medecins}
            />

            <div className="table-container">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Chargement des rendez-vous...</p>
                </div>
              ) : filteredRendezVous.length > 0 ? (
                <table className="rendezvous-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Patient</th>
                      <th style={{ width: '120px' }}>Date</th>
                      <th>Motif</th>
                      <th style={{ width: '100px' }}>Statut</th>
                      <th style={{ width: '150px' }}>Paiement</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRendezVous.map((rdv, index) => {
                      const patient     = patientsMap[rdv.patient];
                      const statusStyle = getStatusStyles(rdv.statut);
                      const paid        = hasFactureForRdv(rdv);

                      return (
                        <tr key={rdv.id} className="table-row">
                          <td className="row-number">{index + 1}</td>

                          <td>
                            <span className="patient-name">
                              {patient
                                ? `${patient.prenom} ${patient.nom}`
                                : `Patient #${rdv.patient}`}
                            </span>
                          </td>

                          <td>
                            <div className="date-info">
                              {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}
                            </div>
                          </td>

                          <td>
                            <div className="motif-info">{rdv.motif}</div>
                          </td>

                          <td>
                            <div className="status-badge" style={{ background: statusStyle.background, color: statusStyle.color }}>
                              {rdv.statut.charAt(0).toUpperCase() + rdv.statut.slice(1)}
                            </div>
                          </td>

                          {/* ✅ Colonne Paiement */}
                          <td>
                            <div className="facture-cell">
                              {paid ? (
                                <span style={{
                                  backgroundColor: '#f0fdf4', color: '#10b981',
                                  padding: '6px 14px', borderRadius: '8px',
                                  fontSize: '12px', fontWeight: '600',
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  border: '1px solid #bbf7d0'
                                }}>
                                  <CheckCircle size={14} />
                                  Payé
                                </span>
                              ) : (
                                <button
                                  onClick={() => openFactureModal(rdv)}
                                  className="btn btn-facture"
                                  disabled={rdv.statut === 'annule'}
                                  title="Créer une facture"
                                >
                                  <CreditCard size={14} />
                                  Payer
                                </button>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                              <button onClick={() => openDetailModal(rdv)} title="Voir les détails"
                                style={{ padding: '5px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                                <Eye size={13} />
                              </button>
                              <button onClick={() => openModal(rdv)} title="Modifier"
                                style={{ padding: '5px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                                <Edit3 size={13} />
                              </button>
                              <button onClick={() => openDeleteModal(rdv)} title="Supprimer"
                                style={{ padding: '5px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <Calendar size={48} className="empty-icon" />
                  <p>Aucun rendez-vous trouvé</p>
                  <button onClick={() => openModal()} className="empty-button">
                    <Plus size={16} /> Planifier le premier rendez-vous
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <RendezVousModal
        isOpen={isModalOpen} isEditMode={isEditMode}
        rendezvous={currentRendezVous} errors={errors}
        patients={patients} medecins={medecins}
        onInputChange={handleInputChange}
        onSubmit={isEditMode ? handleUpdate : handleCreate}
        onClose={closeModal} loading={submitLoading}
      />

      <RendezVousDetailModal
        isOpen={isDetailModalOpen} rendezvous={selectedRendezVous}
        patientData={patientData} medecinData={medecinData}
        onEdit={rdv => { closeDetailModal(); openModal(rdv); }}
        onClose={closeDetailModal}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen} target={deleteTarget}
        onDelete={handleDelete} onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* ── Modal Paiement ── */}
      {isFactureModalOpen && selectedRendezVous && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeFactureModal(); }}>
          <div className="modal-content facture-modal">
            {submitLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Traitement du paiement...</p>
              </div>
            )}

            <div className="modal-header">
              <div className="modal-header-content">
                <CreditCard size={24} className="modal-icon" />
                <h2 className="modal-title">Paiement Rendez-vous</h2>
              </div>
              <button onClick={closeFactureModal} className="close-button" aria-label="Fermer">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Résumé RDV */}
              <div className="facture-info-card">
                <h4><FileText size={20} /> Rendez-vous à facturer</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Patient</span>
                    <span className="info-value">
                      {patientsMap[selectedRendezVous.patient]
                        ? `${patientsMap[selectedRendezVous.patient].prenom} ${patientsMap[selectedRendezVous.patient].nom}`
                        : `Patient #${selectedRendezVous.patient}`}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date RDV</span>
                    <span className="info-value">
                      {new Date(selectedRendezVous.date_rdv).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Motif</span>
                    <span className="info-value">{selectedRendezVous.motif}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                {/* Montant */}
                <div className="form-group">
                  <label htmlFor="montant">Montant (F CFA) <span className="required-star">*</span></label>
                  <div className="amount-input-group">
                    <div className="amount-input-wrapper">
                      <input
                        type="number" id="montant" name="montant"
                        value={factureData.montant} onChange={handleFactureInputChange}
                        min="0" placeholder="0"
                        className={`form-input amount-input ${errors.montant ? 'error' : ''}`}
                      />
                      <span className="currency">F CFA</span>
                    </div>
                    <div className="amount-suggestions">
                      {['3000', '5000', '10000'].map(amt => (
                        <button key={amt} type="button"
                          onClick={() => setFactureData(prev => ({ ...prev, montant: amt }))}
                          className={`amount-btn ${factureData.montant === amt ? 'active' : ''}`}
                        >
                          {parseInt(amt).toLocaleString('fr-FR')} F
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.montant && <span className="error-message">{errors.montant}</span>}
                </div>

                {/* Motif */}
                <div className="form-group">
                  <label htmlFor="motif">Motif de la facture <span className="required-star">*</span></label>
                  <input
                    type="text" id="motif" name="motif"
                    value={factureData.motif} onChange={handleFactureInputChange}
                    className={`form-input ${errors.motif ? 'error' : ''}`}
                    placeholder="Motif de la facture"
                  />
                  {errors.motif && <span className="error-message">{errors.motif}</span>}
                </div>

                {/* Date */}
                <div className="form-columns">
                  <div className="form-group">
                    <label htmlFor="date">Date de paiement</label>
                    <input
                      type="date" id="date" name="date"
                      value={factureData.date} onChange={handleFactureInputChange}
                      className="form-input"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="paymentMethod">Méthode de paiement</label>
                    <select
                      id="paymentMethod" name="paymentMethod"
                      value={factureData.paymentMethod || 'especes'}
                      onChange={handleFactureInputChange}
                      className="form-select"
                    >
                      <option value="especes">💰 Espèces</option>
                      <option value="carte_bancaire">💳 Carte bancaire</option>
                      <option value="mobile_money">📱 Mobile Money</option>
                      <option value="virement">🏦 Virement</option>
                      <option value="cheque">📄 Chèque</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="recap-section">
                <h4>Récapitulatif</h4>
                <div className="recap-grid">
                  <div className="recap-item">
                    <span className="recap-label">Montant à payer</span>
                    <span className="recap-value payment-amount">
                      {factureData.montant
                        ? parseFloat(factureData.montant).toLocaleString('fr-FR')
                        : '0'} F CFA
                    </span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Date</span>
                    <span className="recap-value">
                      {factureData.date
                        ? new Date(factureData.date).toLocaleDateString('fr-FR')
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeFactureModal} className="btn btn-cancel" disabled={submitLoading}>
                Annuler
              </button>
              <button
                onClick={handleCreateFacture}
                className="btn btn-primary"
                disabled={submitLoading || !factureData.montant || !factureData.motif}
              >
                {submitLoading ? (
                  <><div className="spinner-small"></div> Traitement...</>
                ) : (
                  <><CheckCircle size={18} /> Payer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal détail facture ── */}
      {isFactureDetailOpen && selectedFacture && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setIsFactureDetailOpen(false); setSelectedFacture(null); } }}>
          <div className="modal-content facture-detail-modal">
            <div className="modal-header">
              <div className="modal-header-content">
                <FileText size={24} className="modal-icon" />
                <h2 className="modal-title">Détail facture #{selectedFacture.id}</h2>
              </div>
              <button onClick={() => { setIsFactureDetailOpen(false); setSelectedFacture(null); }} className="close-button">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="facture-detail-card">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Patient</span>
                    <span className="detail-value">{selectedFacture.patient_prenom} {selectedFacture.patient_nom}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {new Date(selectedFacture.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Motif</span>
                    <span className="detail-value">{selectedFacture.motif}</span>
                  </div>
                  <div className="detail-item highlight">
                    <span className="detail-label">Montant</span>
                    <span className="detail-value amount-highlight">{selectedFacture.montant} F CFA</span>
                  </div>
                  {selectedFacture.notes && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Notes</span>
                      <span className="detail-value notes">{selectedFacture.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setIsFactureDetailOpen(false); setSelectedFacture(null); }} className="btn btn-primary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}