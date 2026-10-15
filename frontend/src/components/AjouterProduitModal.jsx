import React, { useState } from 'react';
import { X, Package, Hash, Tag, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AjouterProduitModal({
  isOpen,
  onClose,
  onAddProduct,
  loading = false
}) {
  const [formData, setFormData] = useState({
    designation: '',
    prix: '',
    stock_minimum: '',
    quantite: '0',
    quantite_stock: '0',
    date_expiration: new Date().toISOString().split('T')[0],
    actif: true
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.designation.trim()) newErrors.designation = 'Le nom du produit est requis';
    if (!formData.stock_minimum || isNaN(formData.stock_minimum)) newErrors.stock_minimum = 'Le stock minimum est requis';
    if (!formData.prix || isNaN(formData.prix) || formData.prix <= 0) newErrors.prix = 'Le prix doit être un nombre valide';
    if (!formData.quantite_stock || isNaN(formData.quantite_stock) || formData.quantite_stock < 0) newErrors.quantite_stock = 'La quantité initiale est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const newId = Math.floor(Date.now() / 1000);
    const payload = {
      id_produit: newId,
      designation: formData.designation,
      prix: parseInt(formData.prix),
      quantite: parseInt(formData.quantite),
      quantite_stock: parseInt(formData.quantite_stock),
      stock_minimum: parseInt(formData.stock_minimum),
      date_expiration: formData.date_expiration,
      actif: formData.actif
    };
    onAddProduct(payload);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      designation: '',
      prix: '',
      stock_minimum: '',
      quantite: '0',
      quantite_stock: '0',
      date_expiration: new Date().toISOString().split('T')[0],
      actif: true
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes ajout-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ajout-slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ajout-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ajout-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        .ajout-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          padding: 20px;
          overflow-y: auto;
          animation: ajout-fadeIn 0.3s ease;
        }

        .ajout-modal {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: ajout-slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255,255,255,0.1) inset;
        }

        .ajout-header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .ajout-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ajout-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }

        .ajout-close-btn {
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

        .ajout-close-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.35);
          transform: rotate(90deg);
        }

        .ajout-close-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ajout-body {
          padding: 28px 32px;
          overflow-y: auto;
          flex: 1;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ajout-body::-webkit-scrollbar { width: 6px; }
        .ajout-body::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .ajout-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .ajout-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .ajout-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .ajout-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ajout-form-group.full-width {
          grid-column: 1 / -1;
        }

        .ajout-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .ajout-required { color: #ef4444; font-size: 15px; }

        .ajout-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .ajout-input-icon {
          position: absolute;
          left: 13px;
          color: #64748b;
          pointer-events: none;
          z-index: 1;
        }

        .ajout-input {
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
        }

        .ajout-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
        }

        .ajout-input.error {
          border-color: #ef4444;
          animation: ajout-shake 0.4s ease;
        }

        .ajout-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f9fafb;
        }

        .ajout-hint {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .ajout-error-msg {
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ajout-checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .ajout-checkbox-wrap:hover {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .ajout-checkbox-wrap input[type="checkbox"] {
          width: 16px; height: 16px;
          accent-color: #10b981;
          cursor: pointer;
        }

        .ajout-checkbox-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
        }

        .ajout-footer {
          background: white;
          padding: 20px 32px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 14px;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .ajout-btn-cancel {
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

        .ajout-btn-cancel:hover:not(:disabled) {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .ajout-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

        .ajout-btn-submit {
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

        .ajout-btn-submit::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s ease;
        }

        .ajout-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }

        .ajout-btn-submit:hover:not(:disabled)::before { left: 100%; }

        .ajout-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .ajout-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: ajout-spin 0.8s linear infinite;
        }

        @media (max-width: 640px) {
          .ajout-header { padding: 20px 24px; }
          .ajout-body { padding: 20px; }
          .ajout-form-grid { grid-template-columns: 1fr; }
          .ajout-footer { padding: 16px 20px; flex-direction: column; }
          .ajout-btn-cancel,
          .ajout-btn-submit { width: 100%; justify-content: center; }
          .ajout-header h2 { font-size: 17px; }
        }
      `}</style>

      <div
        className="ajout-overlay"
        onClick={(e) => { if (e.target === e.currentTarget && !loading) handleClose(); }}
      >
        <div className="ajout-modal">

          {/* ── Header ── */}
          <div className="ajout-header">
            <div className="ajout-header-left">
              <Package size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              <h2>Ajouter un Nouveau Produit</h2>
            </div>
            <button
              className="ajout-close-btn"
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="ajout-body">
            <div className="ajout-form-grid">

              {/* Désignation — pleine largeur */}
              <div className="ajout-form-group full-width">
                <label className="ajout-label">
                  <Package size={14} />
                  Nom du Produit
                  <span className="ajout-required">*</span>
                </label>
                <div className="ajout-input-wrap">
                  <Package size={15} className="ajout-input-icon" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Ex : Amoxicilline 500mg"
                    disabled={loading}
                    className={`ajout-input${errors.designation ? ' error' : ''}`}
                  />
                </div>
                {errors.designation && (
                  <span className="ajout-error-msg"><AlertCircle size={12} />{errors.designation}</span>
                )}
              </div>

              {/* Quantité initiale en stock */}
              <div className="ajout-form-group">
                <label className="ajout-label">
                  <Hash size={14} />
                  Quantité initiale en stock
                  <span className="ajout-required">*</span>
                </label>
                <div className="ajout-input-wrap">
                  <Hash size={15} className="ajout-input-icon" />
                  <input
                    type="number"
                    name="quantite_stock"
                    value={formData.quantite_stock}
                    onChange={handleInputChange}
                    placeholder="Ex : 100"
                    disabled={loading}
                    min="0"
                    className={`ajout-input${errors.quantite_stock ? ' error' : ''}`}
                  />
                </div>
                {errors.quantite_stock && (
                  <span className="ajout-error-msg"><AlertCircle size={12} />{errors.quantite_stock}</span>
                )}
                <span className="ajout-hint">Quantité disponible au moment de l'ajout</span>
              </div>

              {/* Stock minimum */}
              <div className="ajout-form-group">
                <label className="ajout-label">
                  <ShieldCheck size={14} />
                  Stock minimum
                  <span className="ajout-required">*</span>
                </label>
                <div className="ajout-input-wrap">
                  <ShieldCheck size={15} className="ajout-input-icon" />
                  <input
                    type="number"
                    name="stock_minimum"
                    value={formData.stock_minimum}
                    onChange={handleInputChange}
                    placeholder="Ex : 10"
                    disabled={loading}
                    min="0"
                    className={`ajout-input${errors.stock_minimum ? ' error' : ''}`}
                  />
                </div>
                {errors.stock_minimum && (
                  <span className="ajout-error-msg"><AlertCircle size={12} />{errors.stock_minimum}</span>
                )}
                <span className="ajout-hint">Seuil d'alerte pour recommander</span>
              </div>

              {/* Prix */}
              <div className="ajout-form-group">
                <label className="ajout-label">
                  <Tag size={14} />
                  Prix (FCFA)
                  <span className="ajout-required">*</span>
                </label>
                <div className="ajout-input-wrap">
                  <Tag size={15} className="ajout-input-icon" />
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleInputChange}
                    placeholder="Ex : 1500"
                    disabled={loading}
                    min="0"
                    className={`ajout-input${errors.prix ? ' error' : ''}`}
                  />
                </div>
                {errors.prix && (
                  <span className="ajout-error-msg"><AlertCircle size={12} />{errors.prix}</span>
                )}
              </div>

              {/* Date d'expiration */}
              <div className="ajout-form-group">
                <label className="ajout-label">
                  <Calendar size={14} />
                  Date d'expiration
                </label>
                <div className="ajout-input-wrap">
                  <Calendar size={15} className="ajout-input-icon" />
                  <input
                    type="date"
                    name="date_expiration"
                    value={formData.date_expiration}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="ajout-input"
                  />
                </div>
              </div>

              {/* Actif */}
              <div className="ajout-form-group full-width">
                <label className="ajout-label">État du produit</label>
                <label className="ajout-checkbox-wrap">
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span className="ajout-checkbox-label">
                    {formData.actif ? '✅ Produit actif' : '❌ Produit inactif'}
                  </span>
                </label>
              </div>

            </div>
          </div>

          {/* ── Footer ── */}
          <div className="ajout-footer">
            <button className="ajout-btn-cancel" onClick={handleClose} disabled={loading}>
              Annuler
            </button>
            <button className="ajout-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><div className="ajout-spinner" /> Ajout en cours...</>
                : ' Ajouter le Produit'
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
}