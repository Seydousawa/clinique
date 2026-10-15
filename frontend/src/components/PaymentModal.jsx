import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, X, CheckCircle } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  selectedItem = null,
  patientsMap = {},
  title = "Paiement",
  itemLabel = "élément",
  amountFieldName = "montant",
  amountLabel = "Montant",
  defaultAmount = "5000",
  itemIdField = "id",
  patientIdField = "patient",
  dateField = "date",
  descriptionField = "motif",
  itemDateLabel = "Date",
  itemDescriptionLabel = "Description"
}) => {
  const [paymentData, setPaymentData] = useState({
    montant: defaultAmount,
    motif: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const calculateSuggestedAmount = () => {
    if (!selectedItem) return defaultAmount;
    const description = (selectedItem[descriptionField] || '').toLowerCase();
    if (description.includes('urgence'))  return '15000';
    if (description.includes('controle')) return '5000';
    if (description.includes('suivi'))    return '7000';
    if (description.includes('examen'))   return '10000';
    return '8000';
  };

  useEffect(() => {
    if (selectedItem && isOpen) {
      const suggestedAmount = calculateSuggestedAmount();
      const defaultMotif = `Paiement ${itemLabel}: ${selectedItem[descriptionField] || ''}`;

      setPaymentData({
        patient_id: selectedItem[patientIdField],
        montant:    selectedItem[amountFieldName] || suggestedAmount,
        motif:      defaultMotif,
        date:       new Date().toISOString().split('T')[0],
        notes:      `Paiement ${itemLabel}: ${selectedItem[descriptionField] || ''}`
      });
      setErrors({});
    }
  }, [selectedItem, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!paymentData.montant || parseFloat(paymentData.montant) <= 0)
      newErrors.montant = 'Le montant doit être positif';
    if (!paymentData.motif || paymentData.motif.trim() === '')
      newErrors.motif = 'Le motif est obligatoire';
    if (!paymentData.patient_id)
      newErrors.patient_id = 'Le patient est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date();
    const selectedDate = new Date(paymentData.date);
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const payload = {
      patient_id: paymentData.patient_id,
      item_id:    selectedItem[itemIdField],   // ID générique (consultation ou prescription)
      motif:      paymentData.motif,
      montant:    parseFloat(paymentData.montant),
      date:       selectedDate.toISOString(),
      notes:      paymentData.notes || ''
    };

    onSubmit(payload);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAmountSuggestion = (amount) => {
    setPaymentData(prev => ({ ...prev, montant: amount }));
    if (errors.montant) setErrors(prev => ({ ...prev, montant: '' }));
  };

  if (!isOpen || !selectedItem) return null;

  const patient = patientsMap[selectedItem[patientIdField]];
  const patientName = patient
    ? `${patient.prenom} ${patient.nom}`
    : `Patient #${selectedItem[patientIdField]}`;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content payment-modal">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Traitement du paiement...</p>
          </div>
        )}

        {/* ── En-tête ── */}
        <div className="modal-header">
          <div className="modal-header-content">
            <CreditCard size={24} className="modal-icon" />
            <h2 className="modal-title">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="close-button"
            disabled={loading}
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* ── Résumé de l'élément ── */}
          <div className="payment-summary">
            <h4>
              <FileText size={20} />
              {itemLabel} à payer
            </h4>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Patient</span>
                <span className="info-value">{patientName}</span>
              </div>

              <div className="info-item">
                <span className="info-label">{itemDateLabel}</span>
                <span className="info-value">
                  {formatDate(selectedItem[dateField])}
                </span>
              </div>

              <div className="info-item full-width">
                <span className="info-label">{itemDescriptionLabel}</span>
                <span className="info-value">{selectedItem[descriptionField]}</span>
              </div>

              {selectedItem[amountFieldName] && (
                <div className="info-item highlight">
                  <span className="info-label">{amountLabel} suggéré</span>
                  <span className="info-value amount-total">
                    {selectedItem[amountFieldName]} F CFA
                  </span>
                </div>
              )}
            </div>
          </div>

          
          <div className="form-section">
        
            <div className="form-group">
              <label htmlFor="montant">
                Montant (F CFA) <span className="required-star">*</span>
              </label>
              <div className="amount-input-group">
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    id="montant"
                    name="montant"
                    value={paymentData.montant}
                    onChange={handleInputChange}
                    min="0"
                    className={`form-input ${errors.montant ? 'error' : ''}`}
                    aria-invalid={!!errors.montant}
                    aria-describedby={errors.montant ? 'montant-error' : undefined}
                  />
                  <span className="currency">F CFA</span>
                </div>

                <div className="amount-suggestions">
                  {['3000', '5000', '10000'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSuggestion(amt)}
                      className={`amount-btn ${paymentData.montant === amt ? 'active' : ''}`}
                      aria-label={`${amt} F CFA`}
                    >
                      {parseInt(amt).toLocaleString('fr-FR')} F
                    </button>
                  ))}
                </div>
              </div>
              {errors.montant && (
                <span id="montant-error" className="error-message" role="alert">
                  {errors.montant}
                </span>
              )}
            </div>

            {/* Motif */}
            <div className="form-group">
              <label htmlFor="motif">
                Motif du paiement <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="motif"
                name="motif"
                value={paymentData.motif}
                onChange={handleInputChange}
                className={`form-input ${errors.motif ? 'error' : ''}`}
                placeholder="Motif du paiement"
                aria-invalid={!!errors.motif}
                aria-describedby={errors.motif ? 'motif-error' : undefined}
              />
              {errors.motif && (
                <span id="motif-error" className="error-message" role="alert">
                  {errors.motif}
                </span>
              )}
            </div>

            {/* Date */}
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="date">Date de paiement</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={paymentData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <input type="hidden" name="patient_id" value={paymentData.patient_id || ''} />
            </div>
          </div>

          {/* ── Récapitulatif ── */}
          <div className="recap-section">
            <h4>Récapitulatif</h4>
            <div className="recap-grid">
              <div className="recap-item">
                <span className="recap-label">Montant à payer</span>
                <span className="recap-value payment-amount">
                  {paymentData.montant
                    ? parseFloat(paymentData.montant).toLocaleString('fr-FR')
                    : '0'} F CFA
                </span>
              </div>
              <div className="recap-item">
                <span className="recap-label">Date de paiement</span>
                <span className="recap-value">
                  {paymentData.date
                    ? new Date(paymentData.date).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pied de modal ── */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-cancel"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading || !paymentData.montant || !paymentData.motif}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Payer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;