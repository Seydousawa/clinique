import React, { useState, useRef, useEffect } from 'react';
import { X, Package, User, Hash, AlertCircle, Search, ChevronDown } from 'lucide-react';

export default function CommandeModal({
  isOpen,
  isEditMode,
  formData,
  errors,
  produits,
  onInputChange,
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
    return produits.find(p => p.id_produit == produitId);
  };

  const montant = formData.produit && formData.quantite
    ? (getProduitInfo(formData.produit)?.prix || 0) * parseInt(formData.quantite)
    : 0;

  const produitSelectionne = getProduitInfo(formData.produit);

  /* Initialiser le texte en mode édition */
  useEffect(() => {
    if (isOpen && formData.produit) {
      const p = getProduitInfo(formData.produit);
      if (p) setSearchText(p.designation);
    }
    if (!isOpen) setSearchText('');
  }, [isOpen, formData.produit]);

  /* Filtrer selon la saisie */
  const filtered = searchText.trim()
    ? produits.filter(p =>
        p.designation.toLowerCase().includes(searchText.toLowerCase())
      )
    : produits;

  /* Fermer en cliquant ailleurs */
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
    /* Vider le produit sélectionné si on retape */
    onInputChange({ target: { name: 'produit', value: '' } });
  };

  const handleSelectProduit = (produit) => {
    setSearchText(produit.designation);
    setIsDropdownOpen(false);
    setHighlighted(-1);
    onInputChange({ target: { name: 'produit', value: produit.id_produit } });
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
        @keyframes commande-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes commande-slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes commande-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes commande-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        .commande-overlay {
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
          animation: commande-fadeIn 0.3s ease;
        }

        .commande-modal {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: commande-slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        .commande-header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .commande-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .commande-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .commande-close-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .commande-close-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.35);
          transform: rotate(90deg);
        }

        .commande-close-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .commande-body {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .commande-body::-webkit-scrollbar { width: 6px; }
        .commande-body::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .commande-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .commande-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .commande-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .commande-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .commande-required { color: #ef4444; font-size: 16px; }

        .commande-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .commande-input-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
          z-index: 1;
        }

        .commande-chevron {
          position: absolute;
          right: 13px;
          color: #9ca3af;
          pointer-events: none;
          transition: transform 0.2s ease;
        }

        .commande-chevron.open { transform: rotate(180deg); }

        /* ── Combobox ── */
        .commande-combobox {
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

        .commande-combobox:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
        }

        .commande-combobox.error { border-color: #ef4444; animation: commande-shake 0.4s ease; }
        .commande-combobox:disabled { opacity: 0.6; cursor: not-allowed; background: #f9fafb; }

        /* ── Dropdown ── */
        .commande-dropdown {
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

        .commande-dropdown::-webkit-scrollbar { width: 5px; }
        .commande-dropdown::-webkit-scrollbar-thumb { background: #a7f3d0; border-radius: 3px; }

        .commande-dropdown-empty {
          padding: 14px 16px;
          color: #6b7280;
          font-size: 13px;
          text-align: center;
          font-style: italic;
        }

        .commande-dropdown-item {
          padding: 11px 16px;
          cursor: pointer;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .commande-dropdown-item:last-child { border-bottom: none; }

        .commande-dropdown-item:hover,
        .commande-dropdown-item.highlighted { background: #f0fdf4; }

        .commande-dropdown-item .item-name {
          font-weight: 600;
          color: #1f2937;
        }

        .commande-dropdown-item .item-meta {
          font-size: 11px;
          color: #6b7280;
          display: flex;
          gap: 10px;
        }

        /* ── Badges ── */
        .commande-produit-badge {
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

        .commande-hint {
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 4px;
          font-style: italic;
        }

        .commande-input,
        .commande-select {
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

        .commande-input:focus,
        .commande-select:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
        }

        .commande-input.error { border-color: #ef4444; animation: commande-shake 0.4s ease; }

        .commande-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
          cursor: pointer;
        }

        .commande-select:disabled,
        .commande-input:disabled { opacity: 0.6; cursor: not-allowed; background: #f9fafb; }

        .commande-error-msg {
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .commande-montant-card {
          padding: 20px 24px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 16px;
          border: 2px solid #6ee7b7;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.12);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .commande-montant-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .commande-montant-label {
          font-weight: 600;
          font-size: 14px;
          color: #047857;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .commande-montant-value {
          font-weight: 800;
          font-size: 22px;
          color: #10b981;
          font-family: 'SF Mono', Monaco, monospace;
        }

        .commande-montant-detail {
          font-size: 12px;
          color: #059669;
          text-align: right;
          opacity: 0.85;
        }

        .commande-info-box {
          padding: 12px 16px;
          background: #f0f9ff;
          border-radius: 10px;
          border: 1px solid #bfdbfe;
          font-size: 12px;
          color: #0c4a6e;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
        }

        .commande-footer {
          background: white;
          padding: 24px 32px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .commande-btn-cancel {
          padding: 13px 28px;
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

        .commande-btn-cancel:hover:not(:disabled) {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .commande-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

        .commande-btn-submit {
          padding: 13px 28px;
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

        .commande-btn-submit::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s ease;
        }

        .commande-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }

        .commande-btn-submit:hover:not(:disabled)::before { left: 100%; }

        .commande-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .commande-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: commande-spin 0.8s linear infinite;
        }

        @media (max-width: 640px) {
          .commande-header { padding: 20px 24px; }
          .commande-body { padding: 24px 20px; }
          .commande-footer { padding: 20px; flex-direction: column; }
          .commande-btn-cancel,
          .commande-btn-submit { width: 100%; justify-content: center; }
          .commande-header h2 { font-size: 17px; }
        }
      `}</style>

      <div
        className="commande-overlay"
        onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      >
        <div className="commande-modal">

          {/* ── Header ── */}
          <div className="commande-header">
            <div className="commande-header-left">
              <Package size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              <h2>{isEditMode ? 'Modifier la commande' : 'Commander des produits'}</h2>
            </div>
            <button
              className="commande-close-btn"
              onClick={onClose}
              disabled={loading}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="commande-body">

            {/* ── Produit — Combobox ── */}
            <div className="commande-form-group">
              <label className="commande-label">
                <Package size={15} />
                Produit à commander
                <span className="commande-required">*</span>
              </label>

              <div className="commande-input-wrap" style={{ position: 'relative' }}>
                <Search size={15} className="commande-input-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchText}
                  onChange={handleSearchChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="Rechercher ou saisir un produit..."
                  className={`commande-combobox${errors.produit ? ' error' : ''}`}
                  autoComplete="off"
                />
                <ChevronDown
                  size={15}
                  className={`commande-chevron${isDropdownOpen ? ' open' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { if (!loading) setIsDropdownOpen(o => !o); }}
                />

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="commande-dropdown" ref={dropdownRef}>
                    {filtered.length === 0 ? (
                      <div className="commande-dropdown-empty">
                        Aucun produit trouvé — la valeur saisie sera utilisée
                      </div>
                    ) : (
                      filtered.map((p, i) => (
                        <div
                          key={p.id_produit}
                          className={`commande-dropdown-item${highlighted === i ? ' highlighted' : ''}`}
                          onMouseDown={() => handleSelectProduit(p)}
                          onMouseEnter={() => setHighlighted(i)}
                        >
                          <span className="item-name">{p.designation}</span>
                          <span className="item-meta">
                            <span> Stock : {p.quantite_stock}</span>
                            <span> {p.prix?.toLocaleString('fr-FR')} FCFA/unité</span>
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {errors.produit && (
                <span className="commande-error-msg">
                  <AlertCircle size={12} /> {errors.produit}
                </span>
              )}

              {/* Badge si produit trouvé dans la liste */}
              {produitSelectionne && (
                <div className="commande-produit-badge">
                  ✅ <strong>{produitSelectionne.designation}</strong> sélectionné — stock actuel : {produitSelectionne.quantite_stock}
                </div>
              )}

              {/* Hint si saisie libre */}
              {searchText && !produitSelectionne && (
                <span className="commande-hint">
                  ✏️ Produit saisi manuellement : <strong style={{ color: '#374151' }}>« {searchText} »</strong>
                </span>
              )}
            </div>

            {/* Quantité */}
            <div className="commande-form-group">
              <label className="commande-label">
                <Hash size={15} />
                Quantité à commander
                <span className="commande-required">*</span>
              </label>
              <div className="commande-input-wrap">
                <Hash size={15} className="commande-input-icon" />
                <input
                  type="number"
                  name="quantite"
                  value={formData.quantite}
                  onChange={onInputChange}
                  disabled={loading}
                  placeholder="Ex : 50"
                  min="1"
                  className={`commande-input${errors.quantite ? ' error' : ''}`}
                />
              </div>
              {errors.quantite && (
                <span className="commande-error-msg">
                  <AlertCircle size={12} /> {errors.quantite}
                </span>
              )}
            </div>

            {/* Montant calculé */}
            {montant > 0 && (
              <div className="commande-montant-card">
                <div className="commande-montant-row">
                  <span className="commande-montant-label"> Montant total</span>
                  <span className="commande-montant-value">{montant.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="commande-montant-detail">
                  {formData.quantite} × {getProduitInfo(formData.produit)?.prix?.toLocaleString('fr-FR')} FCFA/unité
                </div>
              </div>
            )}

            {/* Fournisseur */}
            <div className="commande-form-group">
              <label className="commande-label">
                <User size={15} />
                Fournisseur
                <span className="commande-required">*</span>
              </label>
              <div className="commande-input-wrap">
                <User size={15} className="commande-input-icon" />
                <input
                  type="text"
                  name="fournisseur"
                  value={formData.fournisseur}
                  onChange={onInputChange}
                  disabled={loading}
                  placeholder="Nom du fournisseur"
                  className={`commande-input${errors.fournisseur ? ' error' : ''}`}
                />
              </div>
              {errors.fournisseur && (
                <span className="commande-error-msg">
                  <AlertCircle size={12} /> {errors.fournisseur}
                </span>
              )}
            </div>

            {/* Statut */}
            <div className="commande-form-group">
              <label className="commande-label">Statut de la commande</label>
              <div className="commande-input-wrap">
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={onInputChange}
                  disabled={loading}
                  className="commande-select"
                  style={{ paddingLeft: '16px' }}
                >
                  <option value="en_attente">En attente (pas encore commandée)</option>
                  <option value="commande">Commandée (auprès du fournisseur)</option>
                  <option value="recu">Reçue (en stock)</option>
                </select>
              </div>
            </div>

            {/* Info */}
            <div className="commande-info-box">
              ℹ️ Une fois la commande reçue, la quantité sera automatiquement ajoutée au stock disponible pour la distribution.
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="commande-footer">
            <button className="commande-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button className="commande-btn-submit" onClick={onSubmit} disabled={loading}>
              {loading
                ? <><div className="commande-spinner" /> Chargement...</>
                : isEditMode ? ' Modifier' : ' Commander'
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
}