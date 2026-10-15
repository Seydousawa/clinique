import React from 'react';
import { X, Calendar, User, Stethoscope, FileText, Edit2, Clock, AlertCircle, CheckCircle, XCircle, Clock3 } from 'lucide-react';

export default function RendezVousDetailModal({ 
  isOpen, 
  rendezvous, 
  patientData,
  medecinData,
  onEdit, 
  onClose 
}) {
  if (!isOpen || !rendezvous) return null;

  const getStatutStyle = (statut) => {
    const styles = {
      'programme': { 
        backgroundColor: '#fff3cd', 
        color: '#856404', 
        label: 'Programmé',
        icon: <Clock3 size={16} />
      },
      'confirme': { 
        backgroundColor: '#d1ecf1', 
        color: '#0c5460', 
        label: 'Confirmé',
        icon: <CheckCircle size={16} />
      },
      'termine': { 
        backgroundColor: '#d4edda', 
        color: '#155724', 
        label: 'Terminé',
        icon: <CheckCircle size={16} />
      },
      'annule': { 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        label: 'Annulé',
        icon: <XCircle size={16} />
      }
    };
    return styles[statut] || styles['programme'];
  };

  const statutStyle = getStatutStyle(rendezvous.statut);
  const formattedDate = new Date(rendezvous.date_rdv);

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content facture-modal">
        <div className="modal-header">
          <div className="modal-header-content">
            <Calendar size={24} className="modal-icon" />
            <h2 className="modal-title">
              Détails du Rendez-vous #{rendezvous.id}
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

        <div className="modal-body">

          {/* Date et Heure avec mise en évidence - AFFICHÉ EN PREMIER */}
          <div className="facture-info-card highlight-card" style={{ marginBottom: '32px' }}>
            <h4>
              <Clock size={20} />
              Date et Heure du Rendez-vous
            </h4>
            
            <div className="date-time-display">
              <div className="date-display">
                <div className="date-day">
                  {formattedDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
                </div>
                <div className="date-full">
                  {formattedDate.toLocaleDateString('fr-FR', { 
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="time-display">
                <div className="time-icon">🕐</div>
                <div className="time-value">
                  {formattedDate.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid - Patient et Médecin - AFFICHÉ APRÈS */}
          <div className="info-grid" style={{ marginBottom: '32px' }}>
            {/* Patient Card */}
            <div className="facture-info-card">
              <h4>
                <User size={20} />
                Informations Patient
              </h4>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nom Complet</span>
                  <span className="info-value">
                    {patientData ? `${patientData.prenom} ${patientData.nom}` : rendezvous.patient_nom || `Patient #${rendezvous.patient}`}
                  </span>
                </div>
                
                {patientData && patientData.date_naissance && (
                  <div className="info-item">
                    <span className="info-label">Date de Naissance</span>
                    <span className="info-value">
                      {new Date(patientData.date_naissance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                
                {patientData && patientData.tel && (
                  <div className="info-item">
                    <span className="info-label">Téléphone</span>
                    <span className="info-value">
                      {patientData.tel}
                    </span>
                  </div>
                )}
                
                {patientData && patientData.email && (
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">
                      {patientData.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Médecin Card */}
            <div className="facture-info-card">
              <h4>
                <Stethoscope size={20} />
                Informations Médecin
              </h4>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nom Complet</span>
                  <span className="info-value">
                    Dr. {medecinData ? `${medecinData.prenom} ${medecinData.nom}` : rendezvous.medecin_nom || `Médecin #${rendezvous.medecin}`}
                  </span>
                </div>
                
                {medecinData && medecinData.specialite && (
                  <div className="info-item">
                    <span className="info-label">Spécialité</span>
                    <span className="info-value">
                      {medecinData.specialite}
                    </span>
                  </div>
                )}
                
                {medecinData && medecinData.numero_ordre && (
                  <div className="info-item">
                    <span className="info-label">N° d'Ordre</span>
                    <span className="info-value">
                      {medecinData.numero_ordre}
                    </span>
                  </div>
                )}
                
                {medecinData && medecinData.telephone && (
                  <div className="info-item">
                    <span className="info-label">Téléphone</span>
                    <span className="info-value">
                      {medecinData.telephone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="statut">Statut du Rendez-vous</label>
              <div 
                className="statut-badge-display"
                style={{
                  background: statutStyle.backgroundColor,
                  color: statutStyle.color,
                  border: `1px solid ${statutStyle.color}20`
                }}
              >
                <span className="statut-icon">
                  {statutStyle.icon}
                </span>
                <span className="statut-label">
                  {statutStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* Motif */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="motif">Motif du Rendez-vous</label>
              <div className="motif-display">
                <div className="motif-content">
                  {rendezvous.motif}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {rendezvous.notes && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="notes">
                  <FileText size={16} style={{ marginRight: '8px' }} />
                  Notes
                </label>
                <div className="notes-display">
                  <div className="notes-content">
                    {rendezvous.notes}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="btn btn-cancel"
          >
            Fermer
          </button>
          <button 
            onClick={() => onEdit(rendezvous)} 
            className="btn btn-primary"
          >
            <Edit2 size={18} />
            Modifier le Rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
}