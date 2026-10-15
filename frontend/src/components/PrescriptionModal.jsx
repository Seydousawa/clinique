import React, { useState, useEffect, useRef } from 'react';
import { X, User, Pill, FlaskConical, ClipboardList, FileText, Search, ChevronDown } from 'lucide-react';

export default function PrescriptionModal({
  isEditMode,
  prescription,
  errors,
  patients,
  consultations,
  produits,
  examens,
  patientsMap,
  consultationsMap,
  onInputChange,
  onSubmit,
  onClose,
  loading
}) {
  // ── Recherche Patient ──────────────────────────────────────────────────────
  const [patientSearch,       setPatientSearch]       = useState('');
  const [showPatientDrop,     setShowPatientDrop]     = useState(false);
  const [patientSelected,     setPatientSelected]     = useState(false);
  const patientRef = useRef(null);

  // ── Recherche Médicament ───────────────────────────────────────────────────
  const [produitSearch,       setProduitSearch]       = useState('');
  const [showProduitDrop,     setShowProduitDrop]     = useState(false);
  const [produitSelected,     setProduitSelected]     = useState(false);
  const produitRef = useRef(null);

  const isOrdonnance = prescription.type_prescription === 'ordonnance';
  const isExamen     = prescription.type_prescription === 'examen';

  const filteredConsultations = prescription.patient
    ? consultations.filter(c => String(c.patient) === String(prescription.patient))
    : [];

  // ── Init Patient (mode édition) ──────────────────────────────────────────
  useEffect(() => {
    if (!prescription.patient) { setPatientSearch(''); setPatientSelected(false); return; }
    const id    = parseInt(prescription.patient, 10);
    const found = patients.find(p => Number(p.id || p.id_patient) === id);
    if (found) { setPatientSearch(`${found.prenom} ${found.nom}`); setPatientSelected(true); }
    else if (prescription.patient_nom_complet) {
      setPatientSearch(prescription.patient_nom_complet); setPatientSelected(true);
    }
  }, [prescription.patient, patients]);

  // ── Init Médicament (mode édition) ────────────────────────────────────────
  useEffect(() => {
    if (!prescription.produit) { setProduitSearch(''); setProduitSelected(false); return; }
    const id    = parseInt(prescription.produit, 10);
    const found = produits.find(p => Number(p.id_produit || p.id) === id);
    if (found) { setProduitSearch(found.designation); setProduitSelected(true); }
    else if (prescription.produit_nom) {
      setProduitSearch(prescription.produit_nom); setProduitSelected(true);
    }
  }, [prescription.produit, produits]);

  // ── Clic extérieur ────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (patientRef.current && !patientRef.current.contains(e.target)) setShowPatientDrop(false);
      if (produitRef.current && !produitRef.current.contains(e.target)) setShowProduitDrop(false);
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

  const filteredProduits = React.useMemo(() => {
    if (!Array.isArray(produits)) return [];
    if (produitSelected || !produitSearch.trim()) return produits;
    const s = produitSearch.toLowerCase();
    return produits.filter(p => (p.designation || '').toLowerCase().includes(s));
  }, [produits, produitSearch, produitSelected]);

  // ── Sélection Patient ─────────────────────────────────────────────────────
  const selectPatient = (p) => {
    const id = p.id || p.id_patient;
    setPatientSearch(`${p.prenom} ${p.nom}`);
    setPatientSelected(true);
    setShowPatientDrop(false);
    onInputChange({ target: { name: 'patient', value: String(id) } });
  };
  const clearPatient = (e) => {
    e.stopPropagation();
    setPatientSearch(''); setPatientSelected(false); setShowPatientDrop(true);
    onInputChange({ target: { name: 'patient', value: '' } });
    onInputChange({ target: { name: 'consultation', value: '' } });
  };

  // ── Sélection Médicament ──────────────────────────────────────────────────
  const selectProduit = (p) => {
    const id = p.id_produit || p.id;
    setProduitSearch(p.designation);
    setProduitSelected(true);
    setShowProduitDrop(false);
    onInputChange({ target: { name: 'produit', value: String(id) } });
  };
  const clearProduit = (e) => {
    e.stopPropagation();
    setProduitSearch(''); setProduitSelected(false); setShowProduitDrop(true);
    onInputChange({ target: { name: 'produit', value: '' } });
  };

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(); };

  // ── Styles partagés dropdown ──────────────────────────────────────────────
  const dropStyle = {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
    background: 'white', border: '2px solid #10b981', borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 200,
    overflowY: 'auto', zIndex: 9999,
  };
  const dropItemStyle = {
    padding: '10px 14px', cursor: 'pointer', fontSize: 14,
    fontWeight: 500, color: '#1e293b', borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s',
  };
  const emptyDropStyle = {
    ...dropStyle, padding: '12px 14px',
    color: '#94a3b8', fontSize: 13, fontWeight: 500,
  };
  const inputWrapStyle = { position: 'relative' };
  const iconsStyle = {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    display: 'flex', gap: 4, alignItems: 'center', color: '#94a3b8', pointerEvents: 'none',
  };
  const clearBtnStyle = {
    pointerEvents: 'all', cursor: 'pointer', color: '#94a3b8',
    background: 'none', border: 'none', padding: 0,
    display: 'flex', alignItems: 'center',
  };

  return (
    <>
      <style>{`
        @keyframes presc-backdropIn { from{opacity:0} to{opacity:1} }
        @keyframes presc-slideUp {
          from { opacity:0; transform:translateY(40px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes presc-fadeSection {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes presc-spin { to { transform:rotate(360deg); } }

        .presc-form-overlay {
          position:fixed; inset:0;
          background:rgba(15,23,42,0.6);
          backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
          display:flex; align-items:center; justify-content:center;
          z-index:1000; padding:20px;
          animation:presc-backdropIn 0.22s ease;
        }
        .presc-form-modal {
          background:white; border-radius:20px;
          width:100%; max-width:620px; max-height:92vh; overflow-y:auto;
          box-shadow:0 32px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.08);
          animation:presc-slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .presc-form-modal::-webkit-scrollbar{width:5px}
        .presc-form-modal::-webkit-scrollbar-track{background:#f1f5f9}
        .presc-form-modal::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}

        .presc-form-header {
          background:linear-gradient(135deg,#10b981 0%,#059669 100%);
          padding:22px 28px; border-radius:20px 20px 0 0;
          display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:10;
        }
        .presc-form-header-icon {
          background:rgba(255,255,255,0.18); padding:10px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
        }
        .presc-form-close {
          background:rgba(255,255,255,0.18); border:none; color:white;
          width:38px; height:38px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.22s; flex-shrink:0;
        }
        .presc-form-close:hover:not(:disabled){background:rgba(255,255,255,0.32);transform:rotate(90deg) scale(1.1);}
        .presc-form-close:disabled{opacity:0.4;cursor:not-allowed;}

        .presc-type-tabs{display:flex;gap:10px;padding:22px 28px 0;animation:presc-fadeSection 0.3s ease both;}
        .presc-type-tab {
          flex:1; padding:12px 16px; border:2px solid #e5e7eb; border-radius:12px;
          background:white; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          font-size:14px; font-weight:600; color:#6b7280; transition:all 0.22s;
        }
        .presc-type-tab:hover:not(.active){border-color:#a7f3d0;background:#f0fdf4;color:#059669;}
        .presc-type-tab.active{
          border-color:#10b981;
          background:linear-gradient(135deg,#f0fdf4,#dcfce7);
          color:#059669; box-shadow:0 2px 8px rgba(16,185,129,0.18);
        }

        .presc-form-body{padding:20px 28px 28px;display:flex;flex-direction:column;gap:18px;}

        .presc-form-section{
          background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px;
          padding:18px 20px; animation:presc-fadeSection 0.3s ease both;
        }
        .presc-form-section-title{
          display:flex; align-items:center; gap:8px;
          font-size:12px; font-weight:700; color:#64748b;
          text-transform:uppercase; letter-spacing:0.6px; margin:0 0 14px 0;
        }
        .presc-form-field{display:flex;flex-direction:column;gap:6px;}
        .presc-form-field+.presc-form-field{margin-top:14px;}
        .presc-form-label{font-size:13px;font-weight:600;color:#374151;display:flex;align-items:center;gap:6px;}
        .presc-form-label .req{color:#ef4444;}

        .presc-form-input,.presc-form-select,.presc-form-textarea{
          width:100%; padding:10px 40px 10px 14px;
          border:2px solid #e5e7eb; border-radius:10px;
          font-size:14px; color:#1e293b; background:white; outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
          box-sizing:border-box; font-family:inherit;
        }
        .presc-form-select{
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 12px center;
          padding-right:36px; cursor:pointer;
        }
        .presc-form-textarea{resize:vertical;min-height:80px;padding:10px 14px;}
        .presc-form-input:focus,.presc-form-select:focus,.presc-form-textarea:focus{
          border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.12);
        }
        .presc-form-input.has-error,.presc-form-select.has-error{border-color:#ef4444;}
        .presc-form-input.has-error:focus,.presc-form-select.has-error:focus{
          box-shadow:0 0 0 3px rgba(239,68,68,0.12);
        }
        .presc-form-input:disabled,.presc-form-select:disabled,.presc-form-textarea:disabled{
          background:#f1f5f9;cursor:not-allowed;color:#94a3b8;
        }
        .presc-form-error{font-size:12px;color:#ef4444;font-weight:500;display:flex;align-items:center;gap:4px;}
        .presc-form-hint{font-size:12px;color:#94a3b8;font-weight:500;}

        .presc-form-footer{
          padding:16px 28px; background:#f8fafc;
          border-top:1px solid #e2e8f0; border-radius:0 0 20px 20px;
          display:flex; justify-content:flex-end; gap:10px;
          position:sticky; bottom:0;
        }
        .presc-btn-cancel{
          padding:10px 22px; border:2px solid #e5e7eb; border-radius:10px;
          background:white; color:#374151; font-size:14px; font-weight:600;
          cursor:pointer; transition:all 0.2s;
        }
        .presc-btn-cancel:hover:not(:disabled){background:#f1f5f9;border-color:#94a3b8;}
        .presc-btn-cancel:disabled{opacity:0.5;cursor:not-allowed;}
        .presc-btn-submit{
          padding:10px 26px; border:none; border-radius:10px;
          background:linear-gradient(135deg,#10b981 0%,#059669 100%);
          color:white; font-size:14px; font-weight:700;
          cursor:pointer; transition:all 0.2s;
          display:flex; align-items:center; gap:8px;
          box-shadow:0 2px 10px rgba(16,185,129,0.3);
        }
        .presc-btn-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px rgba(16,185,129,0.4);}
        .presc-btn-submit:disabled{background:#9ca3af;cursor:not-allowed;box-shadow:none;transform:none;}
        .presc-spinner{
          width:16px;height:16px;
          border:2px solid rgba(255,255,255,0.3); border-top-color:white;
          border-radius:50%; animation:presc-spin 0.8s linear infinite;
        }

        /* Dropdown items scroll */
        .presc-drop-list::-webkit-scrollbar{width:4px}
        .presc-drop-list::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px}

        /* Confirmation badge sélection */
        .presc-selected-badge{
          font-size:11px; color:#10b981; font-weight:600;
          display:flex; align-items:center; gap:4px; margin-top:2px;
        }
      `}</style>

      <div className="presc-form-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="presc-form-modal">

          {/* ── Header ── */}
          <div className="presc-form-header">
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div className="presc-form-header-icon">
                {isOrdonnance ? <Pill size={22} color="white" /> : <FlaskConical size={22} color="white" />}
              </div>
              <div>
                <h2 style={{ margin:0, color:'white', fontSize:18, fontWeight:700 }}>
                  {isEditMode ? 'Modifier la prescription' : 'Nouvelle prescription'}
                </h2>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:2 }}>
                  {isEditMode ? `Prescription #${prescription.id}` : 'Remplissez les informations ci-dessous'}
                </div>
              </div>
            </div>
            <button className="presc-form-close" onClick={onClose} disabled={loading}>
              <X size={18} />
            </button>
          </div>

          {/* ── Tabs type ── */}
          <div className="presc-type-tabs">
            <button type="button"
              className={`presc-type-tab ${isOrdonnance ? 'active' : ''}`}
              onClick={() => onInputChange({ target:{ name:'type_prescription', value:'ordonnance' }})}
              disabled={loading}>
              <Pill size={16} /> Ordonnance
            </button>
            <button type="button"
              className={`presc-type-tab ${isExamen ? 'active' : ''}`}
              onClick={() => onInputChange({ target:{ name:'type_prescription', value:'examen' }})}
              disabled={loading}>
              <FlaskConical size={16} /> Examen médical
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="presc-form-body">

              {/* ── Section Patient & Consultation ── */}
              <div className="presc-form-section" style={{ animationDelay:'0.05s' }}>
                <div className="presc-form-section-title">
                  <User size={13} color="#10b981" /> Patient & Consultation
                </div>

                {/* Patient — dropdown avec recherche */}
                <div className="presc-form-field" ref={patientRef}>
                  <label className="presc-form-label">
                    Patient <span className="req">*</span>
                  </label>
                  <div style={inputWrapStyle}>
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setPatientSelected(false);
                        setShowPatientDrop(true);
                        onInputChange({ target:{ name:'patient', value:'' }});
                        onInputChange({ target:{ name:'consultation', value:'' }});
                      }}
                      onFocus={() => setShowPatientDrop(true)}
                      placeholder="Tapez ou cliquez pour rechercher..."
                      autoComplete="off"
                      disabled={loading}
                      className={`presc-form-input ${errors.patient ? 'has-error' : ''}`}
                      style={{ paddingRight:72 }}
                    />
                    <div style={iconsStyle}>
                      {patientSearch && (
                        <button style={clearBtnStyle} onMouseDown={clearPatient}>
                          <X size={14} />
                        </button>
                      )}
                      <Search size={15} />
                      <ChevronDown size={15} />
                    </div>

                    {/* Dropdown */}
                    {showPatientDrop && filteredPatients.length > 0 && (
                      <div style={dropStyle} className="presc-drop-list">
                        {filteredPatients.map(p => {
                          const id = p.id || p.id_patient;
                          return (
                            <div key={id} style={dropItemStyle}
                              onMouseDown={(e) => { e.preventDefault(); selectPatient(p); }}
                              onMouseEnter={e => e.currentTarget.style.background='#f0fdf4'}
                              onMouseLeave={e => e.currentTarget.style.background='white'}>
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
                  {errors.patient && <span className="presc-form-error">⚠ {errors.patient}</span>}
                  {prescription.patient && !errors.patient && (
                    <span className="presc-selected-badge">✓ Patient sélectionné</span>
                  )}
                </div>

                {/* Consultation */}
                <div className="presc-form-field">
                  <label className="presc-form-label"><ClipboardList size={13} /> Consultation liée</label>
                  <select
                    name="consultation"
                    value={String(prescription.consultation || '')}
                    onChange={onInputChange}
                    disabled={loading || !prescription.patient}
                    className={`presc-form-select ${errors.consultation ? 'has-error' : ''}`}
                    style={{ padding:'10px 36px 10px 14px' }}
                  >
                    <option value="">— Sélectionner une consultation —</option>
                    {filteredConsultations.map(c => (
                      <option key={c.id} value={String(c.id)}>
                        {c.date_consultation} — {c.symptome || c.diagnostic || 'Sans motif'}
                      </option>
                    ))}
                  </select>
                  {!prescription.patient && <span className="presc-form-hint">💡 Sélectionnez d'abord un patient</span>}
                  {prescription.patient && filteredConsultations.length === 0 && (
                    <span style={{ fontSize:12, color:'#f59e0b', fontWeight:500 }}>⚠ Aucune consultation pour ce patient</span>
                  )}
                  {errors.consultation && <span className="presc-form-error">⚠ {errors.consultation}</span>}
                </div>

                {/* Description libre */}
                <div className="presc-form-field">
                  <label className="presc-form-label"><FileText size={13} /> Ou description libre</label>
                  <input
                    type="text" name="consultation_nom"
                    value={prescription.consultation_nom} onChange={onInputChange}
                    disabled={loading || !!prescription.consultation}
                    placeholder="Ex: Consultation du 05/02/2026 pour douleur abdominale"
                    className="presc-form-input"
                    style={{ paddingRight:14 }}
                  />
                </div>
              </div>

              {/* ── Section Ordonnance ── */}
              {isOrdonnance && (
                <div className="presc-form-section" style={{ animationDelay:'0.10s', borderColor:'#a7f3d0' }}>
                  <div className="presc-form-section-title">
                    <Pill size={13} color="#10b981" /> Médicament prescrit
                  </div>

                  {/* Médicament — dropdown avec recherche */}
                  <div className="presc-form-field" ref={produitRef}>
                    <label className="presc-form-label">Médicament <span className="req">*</span></label>
                    <div style={inputWrapStyle}>
                      <input
                        type="text"
                        value={produitSearch}
                        onChange={(e) => {
                          setProduitSearch(e.target.value);
                          setProduitSelected(false);
                          setShowProduitDrop(true);
                          onInputChange({ target:{ name:'produit', value:'' }});
                        }}
                        onFocus={() => setShowProduitDrop(true)}
                        placeholder="Tapez ou cliquez pour rechercher..."
                        autoComplete="off"
                        disabled={loading}
                        className={`presc-form-input ${errors.produit ? 'has-error' : ''}`}
                        style={{ paddingRight:72 }}
                      />
                      <div style={iconsStyle}>
                        {produitSearch && (
                          <button style={clearBtnStyle} onMouseDown={clearProduit}>
                            <X size={14} />
                          </button>
                        )}
                        <Search size={15} />
                        <ChevronDown size={15} />
                      </div>

                      {showProduitDrop && filteredProduits.length > 0 && (
                        <div style={dropStyle} className="presc-drop-list">
                          {filteredProduits.map(p => {
                            const id = p.id_produit || p.id;
                            return (
                              <div key={id} style={dropItemStyle}
                                onMouseDown={(e) => { e.preventDefault(); selectProduit(p); }}
                                onMouseEnter={e => e.currentTarget.style.background='#f0fdf4'}
                                onMouseLeave={e => e.currentTarget.style.background='white'}>
                                {p.designation}
                                {p.prix_unitaire && (
                                  <span style={{ fontSize:12, color:'#64748b', marginLeft:8 }}>
                                    — {p.prix_unitaire} F CFA
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {showProduitDrop && filteredProduits.length === 0 && (
                        <div style={emptyDropStyle}>
                          {produits.length === 0 ? 'Aucun médicament dans la base' : 'Aucun résultat'}
                        </div>
                      )}
                    </div>
                    {errors.produit && <span className="presc-form-error">⚠ {errors.produit}</span>}
                    {prescription.produit && !errors.produit && (
                      <span className="presc-selected-badge">✓ Médicament sélectionné</span>
                    )}
                  </div>

                  <div className="presc-form-field">
                    <label className="presc-form-label">Quantité <span className="req">*</span></label>
                    <input type="number" name="quantite" min="1"
                      value={prescription.quantite} onChange={onInputChange}
                      disabled={loading} placeholder="Ex: 2"
                      className={`presc-form-input ${errors.quantite ? 'has-error' : ''}`}
                      style={{ paddingRight:14 }} />
                    {errors.quantite && <span className="presc-form-error">⚠ {errors.quantite}</span>}
                  </div>

                  <div className="presc-form-field">
                    <label className="presc-form-label">Posologie / Instructions</label>
                    <textarea name="posologie" rows={3}
                      value={prescription.posologie} onChange={onInputChange}
                      disabled={loading}
                      placeholder="Ex: 1 comprimé 3 fois par jour après les repas"
                      className="presc-form-textarea" />
                  </div>
                </div>
              )}

              {/* ── Section Examen ── */}
              {isExamen && (
                <div className="presc-form-section" style={{ animationDelay:'0.10s', borderColor:'#fde68a' }}>
                  <div className="presc-form-section-title">
                    <FlaskConical size={13} color="#f59e0b" /> Examen médical
                  </div>

                  <div className="presc-form-field">
                    <label className="presc-form-label">Nom de l'examen <span className="req">*</span></label>
                    <input type="text" name="examen_nom"
                      value={prescription.examen_nom} onChange={onInputChange}
                      disabled={loading}
                      placeholder="Ex: Scanner thoracique, Échographie abdominale..."
                      className={`presc-form-input ${errors.examen_nom ? 'has-error' : ''}`}
                      style={{ paddingRight:14 }} />
                    {errors.examen_nom && <span className="presc-form-error">⚠ {errors.examen_nom}</span>}
                  </div>

                  <div className="presc-form-field">
                    <label className="presc-form-label">Instructions pour l'examen</label>
                    <textarea name="instructions" rows={3}
                      value={prescription.instructions} onChange={onInputChange}
                      disabled={loading} placeholder="Ex: À jeun depuis 12h..."
                      className="presc-form-textarea" />
                  </div>
                </div>
              )}

              {/* ── Section Notes ── */}
              <div className="presc-form-section" style={{ animationDelay:'0.15s' }}>
                <div className="presc-form-section-title">
                  <FileText size={13} color="#64748b" /> Notes supplémentaires
                </div>
                <div className="presc-form-field">
                  <textarea name="notes" rows={2}
                    value={prescription.notes} onChange={onInputChange}
                    disabled={loading} placeholder="Informations complémentaires..."
                    className="presc-form-textarea" />
                </div>
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="presc-form-footer">
              <button type="button" className="presc-btn-cancel" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="presc-btn-submit" disabled={loading}>
                {loading
                  ? <><div className="presc-spinner" /> Enregistrement...</>
                  : (isEditMode ? '💾 Modifier' : '✅ Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}