import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Stethoscope, FileText, Clock } from 'lucide-react';

export default function RendezVousModal({
  isOpen,
  isEditMode,
  rendezvous,
  errors,
  patients = [],
  medecins = [],
  onInputChange,
  onSubmit,
  onClose,
  loading
}) {
  const [patientSearch, setPatientSearch] = useState('');
  const [medecinSearch, setMedecinSearch] = useState('');

  // Initialiser les valeurs de recherche quand le modal s'ouvre
  useEffect(() => {
    if (rendezvous.patient) {
      if (typeof rendezvous.patient === 'number' || !isNaN(rendezvous.patient)) {
        const patient = patients.find(p => p.id === parseInt(rendezvous.patient));
        if (patient) setPatientSearch(`${patient.prenom} ${patient.nom}`);
      } else {
        setPatientSearch(rendezvous.patient);
      }
    }

    if (rendezvous.medecin) {
      if (typeof rendezvous.medecin === 'number' || !isNaN(rendezvous.medecin)) {
        const medecin = medecins.find(m => m.id === parseInt(rendezvous.medecin) || m.id_medecin === parseInt(rendezvous.medecin));
        if (medecin) setMedecinSearch(`Dr. ${medecin.prenom} ${medecin.nom}`);
      } else {
        setMedecinSearch(rendezvous.medecin);
      }
    }
  }, [rendezvous.patient, rendezvous.medecin, patients, medecins, isOpen]);

  const handlePatientChange = (e) => {
    const value = e.target.value;
    setPatientSearch(value);

    const cleanValue = value.toLowerCase().trim();
    const matchedPatient = patients.find(
      (p) => `${p.prenom} ${p.nom}`.toLowerCase().trim() === cleanValue
    );

    onInputChange({
      target: {
        name: 'patient',
        value: matchedPatient ? matchedPatient.id : ''
      }
    });
  };

  const handleMedecinChange = (e) => {
    const value = e.target.value;
    setMedecinSearch(value);

    // Nettoyer le "Dr. " au début et les espaces
    const cleanValue = value.replace(/^Dr\.\s*/i, '').toLowerCase().trim();
    const matchedMedecin = medecins.find(
      (m) => `${m.prenom} ${m.nom}`.toLowerCase().trim() === cleanValue
    );

    onInputChange({
      target: {
        name: 'medecin',
        value: matchedMedecin ? (matchedMedecin.id || matchedMedecin.id_medecin) : ''
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content facture-modal">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        <div className="modal-header">
          <div className="modal-header-content">
            <Calendar size={24} className="modal-icon" />
            <h2 className="modal-title">
              {isEditMode ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Fermer"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Grille pour Patient et Médecin */}
          <div className="form-columns">
            <div className="form-group">
              <label htmlFor="patient">
                Patient *
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="patient"
                  name="patient"
                  value={patientSearch}
                  onChange={handlePatientChange}
                  placeholder="Nom complet du patient"
                  list="patients-list"
                  className={`form-input ${errors.patient ? 'error' : ''}`}
                  disabled={loading}
                  aria-invalid={!!errors.patient}
                  aria-describedby={errors.patient ? "patient-error" : undefined}
                />
              </div>
              <datalist id="patients-list">
                {patients.map(p => (
                  <option key={p.id} value={`${p.prenom} ${p.nom}`}>
                    {p.prenom} {p.nom}
                  </option>
                ))}
              </datalist>
              {errors.patient && (
                <span id="patient-error" className="error-message" role="alert">
                  {errors.patient}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="medecin">
                Médecin *
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <Stethoscope size={18} className="input-icon" />
                <input
                  type="text"
                  id="medecin"
                  name="medecin"
                  value={medecinSearch}
                  onChange={handleMedecinChange}
                  placeholder="Nom complet du médecin"
                  list="medecins-list"
                  className={`form-input ${errors.medecin ? 'error' : ''}`}
                  disabled={loading}
                  aria-invalid={!!errors.medecin}
                  aria-describedby={errors.medecin ? "medecin-error" : undefined}
                />
              </div>
              <datalist id="medecins-list">
                {medecins.map(m => (
                  <option key={m.id || m.id_medecin} value={`Dr. ${m.prenom} ${m.nom}`}>
                    Dr. {m.prenom} {m.nom}
                  </option>
                ))}
              </datalist>
              {errors.medecin && (
                <span id="medecin-error" className="error-message" role="alert">
                  {errors.medecin}
                </span>
              )}
            </div>
          </div>

          {/* Date et Heure */}
          <div className="form-group">
            <label htmlFor="date_rdv">
              Date et Heure *
              <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Clock size={18} className="input-icon" />
              <input
                type="datetime-local"
                id="date_rdv"
                name="date_rdv"
                value={rendezvous.date_rdv}
                onChange={onInputChange}
                className={`form-input ${errors.date_rdv ? 'error' : ''}`}
                disabled={loading}
                aria-invalid={!!errors.date_rdv}
                aria-describedby={errors.date_rdv ? "date-error" : undefined}
              />
            </div>
            {errors.date_rdv && (
              <span id="date-error" className="error-message" role="alert">
                {errors.date_rdv}
              </span>
            )}
          </div>

          {/* Motif */}
          <div className="form-group">
            <label htmlFor="motif">
              Motif *
              <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <FileText size={18} className="input-icon" />
              <textarea
                id="motif"
                name="motif"
                value={rendezvous.motif}
                onChange={onInputChange}
                rows="3"
                placeholder="Décrire le motif du rendez-vous..."
                className={`form-textarea ${errors.motif ? 'error' : ''}`}
                disabled={loading}
                aria-invalid={!!errors.motif}
                aria-describedby={errors.motif ? "motif-error" : undefined}
              />
            </div>
            {errors.motif && (
              <span id="motif-error" className="error-message" role="alert">
                {errors.motif}
              </span>
            )}
          </div>

          {/* Statut */}
          <div className="form-group">
            <label htmlFor="statut">
              Statut *
              <span className="required-star">*</span>
            </label>
            <select
              id="statut"
              name="statut"
              value={rendezvous.statut}
              onChange={onInputChange}
              className={`form-select ${errors.statut ? 'error' : ''}`}
              disabled={loading}
              aria-invalid={!!errors.statut}
              aria-describedby={errors.statut ? "statut-error" : undefined}
            >
              <option value="programme">Programmé</option>
              <option value="confirme">Confirmé</option>
              <option value="annule">Annulé</option>
              <option value="termine">Terminé</option>
            </select>
            {errors.statut && (
              <span id="statut-error" className="error-message" role="alert">
                {errors.statut}
              </span>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={rendezvous.notes}
              onChange={onInputChange}
              rows="3"
              placeholder="Notes supplémentaires..."
              className="form-textarea"
              disabled={loading}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="btn btn-cancel"
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            onClick={onSubmit} 
            className="btn btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                {isEditMode ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              <>
                <Calendar size={18} />
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}