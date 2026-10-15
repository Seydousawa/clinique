import React from 'react';
import { User, Phone, Mail, Stethoscope, X } from 'lucide-react';

export default function ConsultationDetailModal({ consultation, patientsMap, medecinsMap, onClose }) {
  const patient = patientsMap[consultation.patient];
  const medecin = medecinsMap[consultation.medecin];

  return (
    <div className="modal-overlay consultation-detail-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="facture-modal consultation-detail-modal">
        {/* Header */}
        <div className="modal-header consultation-detail-modal-header">
          <div className="modal-header-content">
            <Stethoscope size={24} className="modal-icon" />
            <h2 className="modal-title">
              Détails de la Consultation
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body consultation-detail-modal-body">
          <div className="consultation-detail-content">
            {/* Informations Patient */}
            <div className="consultation-detail-section">
              <h4 className="consultation-detail-section-title">
                <User size={18} />
                Informations Patient
              </h4>
              <div className="consultation-detail-info-grid">
                <div className="consultation-detail-info-item">
                  <span className="consultation-detail-label">
                    Nom complet:
                  </span>
                  <span className="consultation-detail-value">
                    {patient ? `${patient.prenom} ${patient.nom}` : `Patient #${consultation.patient}`}
                  </span>
                </div>
                {patient && patient.telephone && (
                  <div className="consultation-detail-info-item">
                    <span className="consultation-detail-label">
                      <Phone size={14} />
                      Téléphone:
                    </span>
                    <span className="consultation-detail-value">
                      {patient.telephone}
                    </span>
                  </div>
                )}
                {patient && patient.email && (
                  <div className="consultation-detail-info-item">
                    <span className="consultation-detail-label">
                      <Mail size={14} />
                      Email:
                    </span>
                    <span className="consultation-detail-value">
                      {patient.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Informations Médecin */}
            <div className="consultation-detail-section">
              <h4 className="consultation-detail-section-title">
                <Stethoscope size={18} />
                Médecin Traitant
              </h4>
              <div className="consultation-detail-info-grid">
                <div className="consultation-detail-info-item">
                  <span className="consultation-detail-label">
                    Nom:
                  </span>
                  <span className="consultation-detail-value">
                    {medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : `Médecin #${consultation.medecin}`}
                  </span>
                </div>
                {medecin && medecin.specialite && (
                  <div className="consultation-detail-info-item">
                    <span className="consultation-detail-label">
                      Spécialité:
                    </span>
                    <span className="consultation-detail-value">
                      {medecin.specialite}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Date de Consultation */}
            <div className="consultation-detail-section">
              <h4 className="consultation-detail-section-title">
                Date de Consultation
              </h4>
              <div className="consultation-detail-date-box">
                {new Date(consultation.date_consultation).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Symptômes */}
            <div className="consultation-detail-section">
              <h4 className="consultation-detail-section-title">
                Symptômes
              </h4>
              <div className="consultation-detail-text-box">
                {consultation.symptome || 'Aucun symptôme renseigné'}
              </div>
            </div>

            {/* Diagnostic */}
            <div className="consultation-detail-section">
              <h4 className="consultation-detail-section-title">
                Diagnostic
              </h4>
              <div className="consultation-detail-text-box">
                {consultation.diagnostic || 'Aucun diagnostic renseigné'}
              </div>
            </div>

            {/* Observation */}
            {consultation.observation && (
              <div className="consultation-detail-section">
                <h4 className="consultation-detail-section-title">
                  Observation
                </h4>
                <div className="consultation-detail-text-box">
                  {consultation.observation}
                </div>
              </div>
            )}

            {/* Traitement */}
            {consultation.traitement && (
              <div className="consultation-detail-section">
                <h4 className="consultation-detail-section-title">
                  Traitement
                </h4>
                <div className="consultation-detail-text-box">
                  {consultation.traitement}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="consultation-detail-footer">
            <button
              onClick={onClose}
              className="btn btn-primary consultation-detail-close-btn"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}