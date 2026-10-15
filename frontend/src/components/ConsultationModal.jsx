import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export default function ConsultationModal({
  isEditMode,
  consultation,
  errors,
  patients,
  medecins,
  onInputChange,
  onSubmit,
  onClose,
  loading
}) {
  const [patientSearch,       setPatientSearch]       = useState('');
  const [medecinSearch,       setMedecinSearch]       = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showMedecinDropdown, setShowMedecinDropdown] = useState(false);
  const [patientSelected,     setPatientSelected]     = useState(false);
  const [medecinSelected,     setMedecinSelected]     = useState(false);

  const patientRef = useRef(null);
  const medecinRef = useRef(null);

 
  const validPatients = React.useMemo(() =>
    Array.isArray(patients) ? patients.filter(p => p && p.id != null) : [],
  [patients]);

  const validMedecins = React.useMemo(() =>
    Array.isArray(medecins) ? medecins.filter(m => m && m.id != null) : [],
  [medecins]);

  
  const filteredPatients = React.useMemo(() => {
    if (patientSelected || !patientSearch.trim()) return validPatients;
    const s = patientSearch.toLowerCase();
    return validPatients.filter(p => `${p.prenom} ${p.nom}`.toLowerCase().includes(s));
  }, [validPatients, patientSearch, patientSelected]);

  const filteredMedecins = React.useMemo(() => {
    if (medecinSelected || !medecinSearch.trim()) return validMedecins;
    const s = medecinSearch.toLowerCase();
    return validMedecins.filter(m => `${m.prenom} ${m.nom}`.toLowerCase().includes(s));
  }, [validMedecins, medecinSearch, medecinSelected]);

  useEffect(() => {
    const fn = (e) => {
      if (patientRef.current && !patientRef.current.contains(e.target)) setShowPatientDropdown(false);
      if (medecinRef.current && !medecinRef.current.contains(e.target)) setShowMedecinDropdown(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (!consultation.patient) {
      setPatientSearch(''); setPatientSelected(false); return;
    }
    // Priorité 1 : nom complet déjà fourni
    if (consultation.patient_nom_complet) {
      setPatientSearch(consultation.patient_nom_complet);
      setPatientSelected(true); return;
    }
    // Priorité 2 : chercher par ID
    const pid   = parseInt(consultation.patient, 10);
    const found = validPatients.find(p => Number(p.id) === pid);
    if (found) { setPatientSearch(`${found.prenom} ${found.nom}`); setPatientSelected(true); }
    else        { setPatientSearch(''); setPatientSelected(false); }
  }, [consultation.patient, consultation.patient_nom_complet, validPatients]);

  // ── Init Médecin ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!consultation.medecin) {
      setMedecinSearch(''); setMedecinSelected(false); return;
    }
    // Priorité 1 : nom complet déjà fourni
    if (consultation.medecin_nom_complet && consultation.medecin_nom_complet !== 'Non assigné') {
      setMedecinSearch(consultation.medecin_nom_complet);
      setMedecinSelected(true); return;
    }
    // Priorité 2 : chercher par ID dans la liste
    const mid   = parseInt(consultation.medecin, 10);
    const found = validMedecins.find(m => Number(m.id) === mid);
    if (found) { setMedecinSearch(`Dr. ${found.prenom} ${found.nom}`); setMedecinSelected(true); }
    else        { setMedecinSearch(''); setMedecinSelected(false); }
  }, [consultation.medecin, consultation.medecin_nom_complet, validMedecins]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const selectPatient = (p) => {
    setPatientSearch(`${p.prenom} ${p.nom}`);
    setPatientSelected(true);
    setShowPatientDropdown(false);
    onInputChange({ target: { name: 'patient', value: String(p.id) } });
  };

  const selectMedecin = (m) => {
    setMedecinSearch(`Dr. ${m.prenom} ${m.nom}`);
    setMedecinSelected(true);
    setShowMedecinDropdown(false);
    onInputChange({ target: { name: 'medecin', value: String(m.id) } });
  };

  const clearPatient = (e) => {
    e.stopPropagation();
    setPatientSearch(''); setPatientSelected(false); setShowPatientDropdown(true);
    onInputChange({ target: { name: 'patient', value: '' } });
  };

  const clearMedecin = (e) => {
    e.stopPropagation();
    setMedecinSearch(''); setMedecinSelected(false); setShowMedecinDropdown(true);
    onInputChange({ target: { name: 'medecin', value: '' } });
  };

  const onPatientType = (e) => {
    setPatientSearch(e.target.value);
    setPatientSelected(false);
    setShowPatientDropdown(true);
    onInputChange({ target: { name: 'patient', value: '' } });
  };

  const onMedecinType = (e) => {
    setMedecinSearch(e.target.value);
    setMedecinSelected(false);
    setShowMedecinDropdown(true);
    onInputChange({ target: { name: 'medecin', value: '' } });
  };

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(); };

  // ── Styles ───────────────────────────────────────────────────────────────
  const dropStyle = {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
    background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: 220, overflowY: 'auto', zIndex: 9999,
  };
  const itemStyle = {
    padding: '10px 14px', cursor: 'pointer', fontSize: 14,
    fontWeight: 500, color: '#1e293b', borderBottom: '1px solid #f1f5f9',
  };
  const emptyStyle = { ...dropStyle, padding: '10px 14px', color: '#64748b', fontSize: 14 };
  const iconStyle  = {
    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
    display: 'flex', gap: 4, alignItems: 'center', color: '#94a3b8',
  };

  return (
    <div className="modal-overlay consultation-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="facture-modal consultation-modal">

        {/* Header */}
        <div className="modal-header consultation-modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Modifier la Consultation' : 'Nouvelle Consultation'}
          </h2>
          <button onClick={onClose} className="close-button" disabled={loading}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>×</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body consultation-modal-body">
          <form onSubmit={handleSubmit}>
            {loading && (
              <div className="loading-overlay consultation-loading-overlay">
                <div className="loading-spinner consultation-loading-spinner" />
              </div>
            )}

            <div className="consultation-form-grid">

              {/* ── Patient ── */}
              <div className="form-group consultation-form-group" ref={patientRef}>
                <label className="consultation-form-label">
                  Patient <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={patientSearch} onChange={onPatientType}
                    onFocus={() => setShowPatientDropdown(true)}
                    placeholder="Tapez ou cliquez pour rechercher..."
                    autoComplete="off"
                    className={`form-input consultation-form-input ${errors.patient ? 'error' : ''}`}
                    disabled={loading} style={{ paddingRight: 72 }} />
                  <div style={iconStyle}>
                    {patientSearch && <X size={15} style={{ cursor: 'pointer' }} onClick={clearPatient} />}
                    <Search size={15} style={{ pointerEvents: 'none' }} />
                    <ChevronDown size={15} style={{ pointerEvents: 'none' }} />
                  </div>

                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div style={dropStyle}>
                      {filteredPatients.map(p => (
                        <div key={p.id} style={itemStyle}
                          onMouseDown={e => { e.preventDefault(); selectPatient(p); }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          {p.prenom} {p.nom}
                        </div>
                      ))}
                    </div>
                  )}
                  {showPatientDropdown && filteredPatients.length === 0 && (
                    <div style={emptyStyle}>
                      {validPatients.length === 0 ? 'Aucun patient dans la base' : 'Aucun résultat'}
                    </div>
                  )}
                </div>
                {errors.patient && <span className="error-message consultation-error-message">{errors.patient}</span>}
                {consultation.patient && !errors.patient && (
                  <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'block' }}>
                    ✓ Patient sélectionné (ID : {consultation.patient})
                  </span>
                )}
              </div>

              {/* ── Médecin ── */}
              <div className="form-group consultation-form-group" ref={medecinRef}>
                <label className="consultation-form-label">
                  Médecin <span className="required-star">*</span>
                </label>

                

                <div style={{ position: 'relative' }}>
                  <input type="text" value={medecinSearch} onChange={onMedecinType}
                    onFocus={() => setShowMedecinDropdown(true)}
                    placeholder="Tapez ou cliquez pour rechercher..."
                    autoComplete="off"
                    className={`form-input consultation-form-input ${errors.medecin ? 'error' : ''}`}
                    disabled={loading} style={{ paddingRight: 72 }} />
                  <div style={iconStyle}>
                    {medecinSearch && <X size={15} style={{ cursor: 'pointer' }} onClick={clearMedecin} />}
                    <Search size={15} style={{ pointerEvents: 'none' }} />
                    <ChevronDown size={15} style={{ pointerEvents: 'none' }} />
                  </div>

                  {showMedecinDropdown && filteredMedecins.length > 0 && (
                    <div style={dropStyle}>
                      {filteredMedecins.map(m => (
                        <div key={m.id} style={itemStyle}
                          onMouseDown={e => { e.preventDefault(); selectMedecin(m); }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          Dr. {m.prenom} {m.nom}
                        </div>
                      ))}
                    </div>
                  )}
                  {showMedecinDropdown && filteredMedecins.length === 0 && (
                    <div style={emptyStyle}>
                      {validMedecins.length === 0
                        ? '⚠️ Aucun médecin chargé — vérifiez l\'API'
                        : 'Aucun médecin trouvé'}
                    </div>
                  )}
                </div>

                {errors.medecin && <span className="error-message consultation-error-message">{errors.medecin}</span>}
                {consultation.medecin && !isNaN(parseInt(consultation.medecin)) && !errors.medecin && (
                  <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'block' }}>
                    ✓ Médecin sélectionné (ID : {consultation.medecin})
                  </span>
                )}
              </div>

              {/* ── Date ── */}
              <div className="form-group consultation-form-group">
                <label className="consultation-form-label">
                  Date <span className="required-star">*</span>
                </label>
                <input type="date" name="date_consultation"
                  value={consultation.date_consultation} onChange={onInputChange}
                  className={`form-input consultation-form-input ${errors.date_consultation ? 'error' : ''}`}
                  disabled={loading} />
                {errors.date_consultation && <span className="error-message consultation-error-message">{errors.date_consultation}</span>}
              </div>
            </div>

            {/* Symptômes */}
            <div className="form-group consultation-form-group">
              <label className="consultation-form-label">Symptômes <span className="required-star">*</span></label>
              <textarea name="symptome" value={consultation.symptome} onChange={onInputChange}
                rows={3} placeholder="Décrivez les symptômes..."
                className={`form-textarea consultation-form-textarea ${errors.symptome ? 'error' : ''}`}
                disabled={loading} />
              {errors.symptome && <span className="error-message consultation-error-message">{errors.symptome}</span>}
            </div>

            {/* Diagnostic */}
            <div className="form-group consultation-form-group">
              <label className="consultation-form-label">Diagnostic <span className="required-star">*</span></label>
              <textarea name="diagnostic" value={consultation.diagnostic} onChange={onInputChange}
                rows={3} placeholder="Indiquez le diagnostic..."
                className={`form-textarea consultation-form-textarea ${errors.diagnostic ? 'error' : ''}`}
                disabled={loading} />
              {errors.diagnostic && <span className="error-message consultation-error-message">{errors.diagnostic}</span>}
            </div>

            {/* Observation */}
            <div className="form-group consultation-form-group">
              <label className="consultation-form-label">Observation</label>
              <input type="text" name="observation" value={consultation.observation}
                onChange={onInputChange} placeholder="Observations complémentaires..."
                className="form-input consultation-form-input" disabled={loading} />
            </div>

            {/* Traitement */}
            <div className="form-group consultation-form-group">
              <label className="consultation-form-label">Traitement</label>
              <textarea name="traitement" value={consultation.traitement} onChange={onInputChange}
                rows={3} placeholder="Prescription du traitement..."
                className="form-textarea consultation-form-textarea" disabled={loading} />
            </div>

            {/* Boutons */}
            <div className="modal-footer consultation-modal-footer">
              <button type="button" onClick={onClose}
                className="btn btn-cancel consultation-btn-cancel" disabled={loading}>
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="btn btn-primary consultation-btn-primary">
                {loading
                  ? <><div className="spinner-small" />{isEditMode ? 'Modification...' : 'Création...'}</>
                  : (isEditMode ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}