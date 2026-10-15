import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Bed, User, Stethoscope, FileText, Search, ChevronDown } from 'lucide-react';

const HospitalisationModal = ({
  isOpen,
  isEditMode,
  hospitalisation,
  errors,
  patients,
  medecins,
  onInputChange,
  onSubmit,
  onClose,
  loading
}) => {
  const [showRealModal, setShowRealModal] = useState(false);

  // ── Recherche Patient ─────────────────────────────────────────────────────
  const [patientSearch,   setPatientSearch]   = useState('');
  const [showPatientDrop, setShowPatientDrop] = useState(false);
  const [patientSelected, setPatientSelected] = useState(false);
  const patientRef = useRef(null);

  // ── Recherche Médecin ─────────────────────────────────────────────────────
  const [medecinSearch,   setMedecinSearch]   = useState('');
  const [showMedecinDrop, setShowMedecinDrop] = useState(false);
  const [medecinSelected, setMedecinSelected] = useState(false);
  const medecinRef = useRef(null);

  // ── Animation ouverture/fermeture ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !showRealModal)       setShowRealModal(true);
    else if (!isOpen && showRealModal)  setTimeout(() => setShowRealModal(false), 300);
  }, [isOpen, showRealModal]);

  // ── Init Patient (mode édition) ───────────────────────────────────────────
  useEffect(() => {
    if (!hospitalisation.patient_id) { setPatientSearch(''); setPatientSelected(false); return; }
    const id    = parseInt(hospitalisation.patient_id, 10);
    const found = patients.find(p => Number(p.id || p.pk) === id);
    if (found) { setPatientSearch(`${found.prenom} ${found.nom}`); setPatientSelected(true); }
  }, [hospitalisation.patient_id, patients]);

  // ── Init Médecin (mode édition) ───────────────────────────────────────────
  useEffect(() => {
    if (!hospitalisation.medecin_id) { setMedecinSearch(''); setMedecinSelected(false); return; }
    const id    = parseInt(hospitalisation.medecin_id, 10);
    const found = medecins.find(m => Number(m.id || m.id_medecin || m.pk) === id);
    if (found) { setMedecinSearch(`Dr. ${found.prenom} ${found.nom}`); setMedecinSelected(true); }
  }, [hospitalisation.medecin_id, medecins]);

  // ── Clic extérieur ────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (patientRef.current && !patientRef.current.contains(e.target)) setShowPatientDrop(false);
      if (medecinRef.current && !medecinRef.current.contains(e.target)) setShowMedecinDrop(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // ── Listes filtrées ───────────────────────────────────────────────────────
  const filteredPatients = React.useMemo(() => {
    if (!Array.isArray(patients)) return [];
    if (patientSelected || !patientSearch.trim()) return patients;
    const s = patientSearch.toLowerCase();
    return patients.filter(p => `${p.prenom} ${p.nom}`.toLowerCase().includes(s));
  }, [patients, patientSearch, patientSelected]);

  const filteredMedecins = React.useMemo(() => {
    if (!Array.isArray(medecins)) return [];
    if (medecinSelected || !medecinSearch.trim()) return medecins;
    const s = medecinSearch.toLowerCase();
    return medecins.filter(m => `${m.prenom} ${m.nom}`.toLowerCase().includes(s));
  }, [medecins, medecinSearch, medecinSelected]);

  // ── Sélection Patient ─────────────────────────────────────────────────────
  const selectPatient = (p) => {
    const id = p.id || p.pk;
    setPatientSearch(`${p.prenom} ${p.nom}`);
    setPatientSelected(true);
    setShowPatientDrop(false);
    onInputChange({ target: { name: 'patient_id', value: String(id) } });
  };
  const clearPatient = (e) => {
    e.stopPropagation();
    setPatientSearch(''); setPatientSelected(false); setShowPatientDrop(true);
    onInputChange({ target: { name: 'patient_id', value: '' } });
  };

  // ── Sélection Médecin ─────────────────────────────────────────────────────
  const selectMedecin = (m) => {
    const id = m.id || m.id_medecin || m.pk;
    setMedecinSearch(`Dr. ${m.prenom} ${m.nom}`);
    setMedecinSelected(true);
    setShowMedecinDrop(false);
    onInputChange({ target: { name: 'medecin_id', value: String(id) } });
  };
  const clearMedecin = (e) => {
    e.stopPropagation();
    setMedecinSearch(''); setMedecinSelected(false); setShowMedecinDrop(true);
    onInputChange({ target: { name: 'medecin_id', value: '' } });
  };

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(); };

  if (!isOpen && !showRealModal) return null;

  // ── Styles dropdown ───────────────────────────────────────────────────────
  const dropStyle = {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
    background: 'white', border: '2px solid #10b981', borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 200,
    overflowY: 'auto', zIndex: 9999,
  };
  const dropItemStyle = {
    padding: '10px 14px', cursor: 'pointer', fontSize: 14,
    fontWeight: 500, color: '#1e293b', borderBottom: '1px solid #f1f5f9',
  };
  const emptyDropStyle = {
    ...dropStyle, padding: '12px 14px', color: '#94a3b8', fontSize: 13, fontWeight: 500,
  };
  const iconsStyle = {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    display: 'flex', gap: 4, alignItems: 'center', color: '#94a3b8',
  };

  return (
    <div className="modal-overlay hospitalisation-modal-overlay" onClick={onClose}>
      <div className="facture-modal hospitalisation-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header hospitalisation-modal-header">
          <div className="modal-header-content">
            <Bed size={24} className="modal-icon" />
            <h2 className="modal-title">
              {isEditMode ? 'Modifier l\'Hospitalisation' : 'Nouvelle Hospitalisation'}
            </h2>
          </div>
          <button onClick={onClose} className="close-button" aria-label="Fermer" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body hospitalisation-modal-body">
          {loading && (
            <div className="loading-overlay hospitalisation-loading-overlay">
              <div className="loading-spinner hospitalisation-loading-spinner" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="hospitalisation-form">
            <div className="hospitalisation-form-grid">

              {/* ── Patient ── */}
              <div className="form-group hospitalisation-form-group" ref={patientRef}>
                <label className="hospitalisation-form-label">
                  <User size={16} /> Patient <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setPatientSelected(false);
                      setShowPatientDrop(true);
                      onInputChange({ target: { name: 'patient_id', value: '' } });
                    }}
                    onFocus={() => setShowPatientDrop(true)}
                    placeholder="Tapez ou cliquez pour rechercher..."
                    autoComplete="off"
                    disabled={loading}
                    className={`form-input hospitalisation-form-input ${errors.patient_id ? 'error' : ''}`}
                    style={{ paddingRight: 72 }}
                  />
                  <div style={iconsStyle}>
                    {patientSearch && (
                      <X size={14} style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseDown={clearPatient} />
                    )}
                    <Search size={15} style={{ pointerEvents: 'none' }} />
                    <ChevronDown size={15} style={{ pointerEvents: 'none' }} />
                  </div>

                  {showPatientDrop && filteredPatients.length > 0 && (
                    <div style={dropStyle}>
                      {filteredPatients.map(p => {
                        const id = p.id || p.pk;
                        return (
                          <div key={id} style={dropItemStyle}
                            onMouseDown={(e) => { e.preventDefault(); selectPatient(p); }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            {p.prenom} {p.nom}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {showPatientDrop && filteredPatients.length === 0 && (
                    <div style={emptyDropStyle}>
                      {patients.length === 0 ? 'Aucun patient dans la base' : 'Aucun résultat'}
                    </div>
                  )}
                </div>
                {errors.patient_id && (
                  <span className="error-message hospitalisation-error-message">{errors.patient_id}</span>
                )}
                {hospitalisation.patient_id && !errors.patient_id && (
                  <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    ✓ Patient sélectionné
                  </span>
                )}
              </div>

              {/* ── Médecin ── */}
              <div className="form-group hospitalisation-form-group" ref={medecinRef}>
                <label className="hospitalisation-form-label">
                  <Stethoscope size={16} /> Médecin <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={medecinSearch}
                    onChange={(e) => {
                      setMedecinSearch(e.target.value);
                      setMedecinSelected(false);
                      setShowMedecinDrop(true);
                      onInputChange({ target: { name: 'medecin_id', value: '' } });
                    }}
                    onFocus={() => setShowMedecinDrop(true)}
                    placeholder="Tapez ou cliquez pour rechercher..."
                    autoComplete="off"
                    disabled={loading}
                    className={`form-input hospitalisation-form-input ${errors.medecin_id ? 'error' : ''}`}
                    style={{ paddingRight: 72 }}
                  />
                  <div style={iconsStyle}>
                    {medecinSearch && (
                      <X size={14} style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseDown={clearMedecin} />
                    )}
                    <Search size={15} style={{ pointerEvents: 'none' }} />
                    <ChevronDown size={15} style={{ pointerEvents: 'none' }} />
                  </div>

                  {showMedecinDrop && filteredMedecins.length > 0 && (
                    <div style={dropStyle}>
                      {filteredMedecins.map(m => {
                        const id = m.id || m.id_medecin || m.pk;
                        return (
                          <div key={id} style={dropItemStyle}
                            onMouseDown={(e) => { e.preventDefault(); selectMedecin(m); }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            Dr. {m.prenom} {m.nom}
                            {m.specialite && (
                              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
                                — {m.specialite}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {showMedecinDrop && filteredMedecins.length === 0 && (
                    <div style={emptyDropStyle}>
                      {medecins.length === 0 ? 'Aucun médecin dans la base' : 'Aucun résultat'}
                    </div>
                  )}
                </div>
                {errors.medecin_id && (
                  <span className="error-message hospitalisation-error-message">{errors.medecin_id}</span>
                )}
                {hospitalisation.medecin_id && !errors.medecin_id && (
                  <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    ✓ Médecin sélectionné
                  </span>
                )}
              </div>

              {/* ── Date admission ── */}
              <div className="form-group hospitalisation-form-group">
                <label htmlFor="date_admission" className="hospitalisation-form-label">
                  <Calendar size={16} /> Date d'admission <span className="required-star">*</span>
                </label>
                <div className="input-with-icon hospitalisation-input-with-icon">
                  <input
                    type="date" id="date_admission" name="date_admission"
                    value={hospitalisation.date_admission} onChange={onInputChange}
                    className={`form-input hospitalisation-form-input ${errors.date_admission ? 'error' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.date_admission && (
                  <span className="error-message hospitalisation-error-message">{errors.date_admission}</span>
                )}
              </div>

              {/* ── Date sortie ── */}
              <div className="form-group hospitalisation-form-group">
                <label htmlFor="date_sortie" className="hospitalisation-form-label">
                  <Calendar size={16} /> Date de sortie
                </label>
                <div className="input-with-icon hospitalisation-input-with-icon">
                  <input
                    type="date" id="date_sortie" name="date_sortie"
                    value={hospitalisation.date_sortie} onChange={onInputChange}
                    className={`form-input hospitalisation-form-input ${errors.date_sortie ? 'error' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.date_sortie && (
                  <span className="error-message hospitalisation-error-message">{errors.date_sortie}</span>
                )}
              </div>

              {/* ── Chambre ── */}
              <div className="form-group hospitalisation-form-group">
                <label htmlFor="chambre" className="hospitalisation-form-label">
                  <Bed size={16} /> Chambre <span className="required-star">*</span>
                </label>
                <div className="input-with-icon hospitalisation-input-with-icon">
                  <input
                    type="text" id="chambre" name="chambre"
                    value={hospitalisation.chambre} onChange={onInputChange}
                    placeholder="Numéro de chambre"
                    className={`form-input hospitalisation-form-input ${errors.chambre ? 'error' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.chambre && (
                  <span className="error-message hospitalisation-error-message">{errors.chambre}</span>
                )}
              </div>

              {/* ── Motif ── */}
              <div className="form-group hospitalisation-form-group full-width">
                <label htmlFor="motif" className="hospitalisation-form-label">
                  <FileText size={16} /> Motif <span className="required-star">*</span>
                </label>
                <div className="input-with-icon hospitalisation-input-with-icon">
                  <textarea
                    id="motif" name="motif"
                    value={hospitalisation.motif} onChange={onInputChange}
                    placeholder="Motif de l'hospitalisation" rows={3}
                    className={`form-textarea hospitalisation-form-textarea ${errors.motif ? 'error' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.motif && (
                  <span className="error-message hospitalisation-error-message">{errors.motif}</span>
                )}
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="modal-footer hospitalisation-modal-footer">
              <button type="button" onClick={onClose}
                className="btn btn-cancel hospitalisation-btn-cancel" disabled={loading}>
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="btn btn-primary hospitalisation-btn-primary">
                {loading ? (
                  <><div className="spinner-small hospitalisation-spinner-small" />
                  {isEditMode ? 'Modification...' : 'Création...'}</>
                ) : (
                  isEditMode ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalisationModal;