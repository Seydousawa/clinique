import React, { useState, useRef, useEffect } from 'react';
import { X, Package, Hash, Calendar, FileText, AlertCircle, ChevronDown, Search } from 'lucide-react';

export default function DistributionModal({
  isOpen,
  isEditMode,
  formData,
  errors,
  produits,
  onInputChange,
  onProduitChange,
  onQuantiteChange,
  onSubmit,
  onClose,
  loading
}) {
  const [searchText, setSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const getProduitInfo = (produitId) => {
    return produits.find(p => String(p.id_produit) === String(produitId));
  };

  const prixTotal = formData.prix_total || 0;
  const produitSelectionne = getProduitInfo(formData.produit_id);

  /* Initialiser le texte quand on ouvre en mode édition */
  useEffect(() => {
    if (isOpen && formData.produit_id) {
      const p = getProduitInfo(formData.produit_id);
      if (p) setSearchText(p.designation);
    }
    if (!isOpen) setSearchText('');
  }, [isOpen, formData.produit_id]);

  /* Filtrer la liste selon la saisie */
  const filtered = searchText.trim()
    ? produits.filter(p =>
        p.designation.toLowerCase().includes(searchText.toLowerCase())
      )
    : produits;

  /* Fermer le dropdown en cliquant ailleurs */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    setIsDropdownOpen(true);
    setHighlighted(-1);

    /* Si l'utilisateur efface ou saisit manuellement sans choisir dans la liste,
       on transmet quand même la valeur comme produit_id = null + nom libre */
    const syntheticEvent = {
      target: { name: 'produit_id', value: '' }
    };
    onProduitChange(syntheticEvent);
  };

  const handleSelectProduit = (produit) => {
    setSearchText(produit.designation);
    setIsDropdownOpen(false);
    setHighlighted(-1);
    const syntheticEvent = {
      target: { name: 'produit_id', value: produit.id_produit }
    };
    onProduitChange(syntheticEvent);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen) { setIsDropdownOpen(true); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelectProduit(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes distrib-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes distrib-slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes distrib-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes distrib-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        .distrib-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          overflow-y: auto;
          animation: distrib-fadeIn 0.3s ease;
        }

        .distrib-modal {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: distrib-slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255,255,255,0.1) inset;
        }

        .distrib-header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .distrib-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .distrib-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }

        .distrib-close-btn {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          border-radius: 50%;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .distrib-close-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.35);
          transform: rotate(90deg);
        }

        .distrib-close-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .distrib-body {
          padding: 28px 32px;
          overflow-y: auto;
          flex: 1;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .distrib-body::-webkit-scrollbar { width: 6px; }
        .distrib-body::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .distrib-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .distrib-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .distrib-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .distrib-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .distrib-required { color: #ef4444; font-size: 15px; }

        .distrib-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .distrib-input-icon {
          position: absolute;
          left: 13px;
          color: #64748b;
          pointer-events: none;
          z-index: 1;
        }

        .distrib-chevron {
          position: absolute;
          right: 13px;
          color: #9ca3af;
          pointer-events: none;
          transition: transform 0.2s ease;
        }

        .distrib-chevron.open { transform: rotate(180deg); }

        /* ── Combobox ── */
        .distrib-combobox {
          width: 100%;
          padding: 12px 40px 12px 42px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          color: #1f2937;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .distrib-combobox:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
        }

        .distrib-combobox.error { border-color: #ef4444; animation: distrib-shake 0.4s ease; }
        .distrib-combobox:disabled { opacity: 0.6; cursor: not-allowed; background: #f9fafb; }

        /* ── Dropdown list ── */
        .distrib-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: white;
          border: 2px solid #10b981;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(16,185,129,0.15), 0 4px 8px rgba(0,0,0,0.08);
          z-index: 100;
          max-height: 220px;
          overflow-y: auto;
        }

        .distrib-dropdown::-webkit-scrollbar { width: 5px; }
        .distrib-dropdown::-webkit-scrollbar-thumb { background: #a7f3d0; border-radius: 3px; }

        .distrib-dropdown-empty {
          padding: 14px 16px;
          color: #6b7280;
          font-size: 13px;
          text-align: center;
          font-style: italic;
        }

        .distrib-dropdown-item {
          padding: 11px 16px;
          cursor: pointer;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .distrib-dropdown-item:last-child { border-bottom: none; }

        .distrib-dropdown-item:hover,
        .distrib-dropdown-item.highlighted {
          background: #f0fdf4;
        }

        .distrib-dropdown-item .item-name {
          font-weight: 600;
          color: #1f2937;
        }

        .distrib-dropdown-item .item-meta {
          font-size: 11px;
          color: #6b7280;
          display: flex;
          gap: 10px;
        }

        .distrib-dropdown-item .item-meta span {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* ── Badge produit sélectionné ── */
        .distrib-produit-badge {
          padding: 8px 12px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border: 1px solid #6ee7b7;
          border-radius: 8px;
          font-size: 12px;
          color: #047857;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── Hint saisie libre ── */
        .distrib-hint {
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 4px;
          font-style: italic;
        }

        .distrib-input,
        .distrib-select,
        .distrib-textarea {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          color: #1f2937;
          transition: all 0.3s ease;
          box-sizing: border-box;
          appearance: none;
        }

        .distrib-input:focus,
        .distrib-textarea:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
        }

        .distrib-input.error { border-color: #ef4444; animation: distrib-shake 0.4s ease; }

        .distrib-textarea {
          resize: vertical;
          min-height: 90px;
          padding-top: 12px;
        }

        .distrib-input:disabled,
        .distrib-textarea:disabled { opacity: 0.6; cursor: not-allowed; background: #f9fafb; }

        .distrib-error-msg {
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .distrib-montant-card {
          padding: 20px 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 16px;
          border: 2px solid #fcd34d;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .distrib-montant-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .distrib-montant-label {
          font-weight: 600;
          font-size: 14px;
          color: #92400e;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .distrib-montant-value {
          font-weight: 800;
          font-size: 22px;
          color: #b45309;
          font-family: 'SF Mono', Monaco, monospace;
        }

        .distrib-footer {
          background: white;
          padding: 20px 32px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 14px;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .distrib-btn-cancel {
          padding: 12px 26px;
          background: #f1f5f9;
          color: #64748b;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .distrib-btn-cancel:hover:not(:disabled) {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .distrib-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

        .distrib-btn-submit {
          padding: 12px 26px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .distrib-btn-submit::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s ease;
        }

        .distrib-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }

        .distrib-btn-submit:hover:not(:disabled)::before { left: 100%; }

        .distrib-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .distrib-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: distrib-spin 0.8s linear infinite;
        }

        @media (max-width: 640px) {
          .distrib-header { padding: 20px 24px; }
          .distrib-body { padding: 20px; }
          .distrib-footer { padding: 16px 20px; flex-direction: column; }
          .distrib-btn-cancel,
          .distrib-btn-submit { width: 100%; justify-content: center; }
          .distrib-header h2 { font-size: 17px; }
        }
      `}</style>

      <div
        className="distrib-overlay"
        onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      >
        <div className="distrib-modal">

          {/* ── Header ── */}
          <div className="distrib-header">
            <div className="distrib-header-left">
              <Package size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              <h2>{isEditMode ? 'Modifier la distribution' : 'Nouvelle distribution'}</h2>
            </div>
            <button
              className="distrib-close-btn"
              onClick={onClose}
              disabled={loading}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="distrib-body">

            {/* ── Produit / Médicament — Combobox ── */}
            <div className="distrib-form-group">
              <label className="distrib-label">
                <Package size={14} />
                Produit / Médicament
                <span className="distrib-required">*</span>
              </label>

              <div className="distrib-input-wrap" style={{ position: 'relative' }}>
                <Search size={15} className="distrib-input-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchText}
                  onChange={handleSearchChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="Rechercher ou saisir un médicament..."
                  className={`distrib-combobox${errors.produit_id ? ' error' : ''}`}
                  autoComplete="off"
                />
                <ChevronDown
                  size={15}
                  className={`distrib-chevron${isDropdownOpen ? ' open' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { if (!loading) setIsDropdownOpen(o => !o); }}
                />

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="distrib-dropdown" ref={dropdownRef}>
                    {filtered.length === 0 ? (
                      <div className="distrib-dropdown-empty">
                        Aucun produit trouvé — la valeur saisie sera utilisée
                      </div>
                    ) : (
                      filtered.map((p, i) => (
                        <div
                          key={p.id_produit}
                          className={`distrib-dropdown-item${highlighted === i ? ' highlighted' : ''}`}
                          onMouseDown={() => handleSelectProduit(p)}
                          onMouseEnter={() => setHighlighted(i)}
                        >
                          <span className="item-name">{p.designation}</span>
                          <span className="item-meta">
                            <span> Stock : {p.quantite_stock}</span>
                            <span> {p.prix?.toLocaleString('fr-FR')} FCFA</span>
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {errors.produit_id && (
                <span className="distrib-error-msg"><AlertCircle size={12} />{errors.produit_id}</span>
              )}

              {/* Badge si produit trouvé dans la liste */}
              {produitSelectionne && (
                <div className="distrib-produit-badge">
                  ✅ <strong>{produitSelectionne.designation}</strong> — stock disponible : <strong>{produitSelectionne.quantite_stock}</strong> unités
                </div>
              )}

              {/* Hint si saisie libre */}
              {searchText && !produitSelectionne && (
                <span className="distrib-hint">
                  ✏️ Médicament saisi manuellement : <strong style={{ color: '#374151' }}>« {searchText} »</strong>
                </span>
              )}
            </div>

            {/* Quantité */}
            <div className="distrib-form-group">
              <label className="distrib-label">
                <Hash size={14} />
                Quantité
                <span className="distrib-required">*</span>
              </label>
              <div className="distrib-input-wrap">
                <Hash size={15} className="distrib-input-icon" />
                <input
                  type="number"
                  name="quantite_distribuee"
                  value={formData.quantite_distribuee}
                  onChange={onQuantiteChange}
                  disabled={loading}
                  placeholder="Ex : 10"
                  min="1"
                  className={`distrib-input${errors.quantite_distribuee ? ' error' : ''}`}
                />
              </div>
              {errors.quantite_distribuee && (
                <span className="distrib-error-msg"><AlertCircle size={12} />{errors.quantite_distribuee}</span>
              )}
            </div>

            {/* Montant total */}
            {prixTotal > 0 && (
              <div className="distrib-montant-card">
                <div className="distrib-montant-row">
                  <span className="distrib-montant-label">💰 Montant total</span>
                  <span className="distrib-montant-value">{parseInt(prixTotal).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="distrib-form-group">
              <label className="distrib-label">
                <Calendar size={14} />
                Date
                <span className="distrib-required">*</span>
              </label>
              <div className="distrib-input-wrap">
                <Calendar size={15} className="distrib-input-icon" />
                <input
                  type="date"
                  name="date_distribution"
                  value={formData.date_distribution}
                  onChange={onInputChange}
                  disabled={loading}
                  className={`distrib-input${errors.date_distribution ? ' error' : ''}`}
                />
              </div>
              {errors.date_distribution && (
                <span className="distrib-error-msg"><AlertCircle size={12} />{errors.date_distribution}</span>
              )}
            </div>

            {/* Observations */}
            <div className="distrib-form-group">
              <label className="distrib-label">
                <FileText size={14} />
                Observations
              </label>
              <div className="distrib-input-wrap" style={{ alignItems: 'flex-start' }}>
                <FileText size={15} className="distrib-input-icon" style={{ top: '14px' }} />
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={onInputChange}
                  disabled={loading}
                  placeholder="Notes additionnelles..."
                  className="distrib-textarea"
                />
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="distrib-footer">
            <button className="distrib-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button className="distrib-btn-submit" onClick={onSubmit} disabled={loading}>
              {loading
                ? <><div className="distrib-spinner" /> Chargement...</>
                : isEditMode ? '✏️ Modifier' : '📦 Distribuer'
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
}