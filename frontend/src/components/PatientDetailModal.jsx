import React from 'react';
import { X, User, Phone, Mail, MapPin, Edit2, Calendar, Droplets, Briefcase, Shield, Heart } from 'lucide-react';

export default function PatientDetailModal({ isOpen, patient, onEdit, onClose }) {
  if (!isOpen || !patient) return null;

  // Fonction pour afficher les données
  const renderValue = (value, defaultValue = 'Non spécifié') => {
    return value !== null && value !== undefined && value !== '' ? value : defaultValue;
  };

  // Calcul de l'âge
  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient.date_naissance);

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content facture-modal" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div className="modal-header-content">
            <User size={24} className="modal-icon" />
            <h2 className="modal-title">
              Détails du Patient #{patient.id_patient || patient.id}
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
          {/* En-tête du patient */}
          <div className="patient-header">
            <div className="patient-avatar">
              {patient.prenom?.charAt(0)}{patient.nom?.charAt(0)}
            </div>
            <div className="patient-info">
              <h3 className="patient-name">
                {renderValue(patient.prenom)} {renderValue(patient.nom)}
              </h3>
              <div className="patient-meta">
                <span className="patient-id">ID: {renderValue(patient.id_patient || patient.id)}</span>
                {age !== null && (
                  <span className="patient-age">• {age} ans</span>
                )}
              </div>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="info-grid" style={{ marginBottom: '32px' }}>
            {/* Informations Personnelles */}
            <div className="facture-info-card">
              <h4>
                <User size={20} />
                Informations Personnelles
              </h4>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Date de Naissance</span>
                  <span className="info-value">
                    {patient.date_naissance 
                      ? new Date(patient.date_naissance).toLocaleDateString('fr-FR')
                      : 'Non spécifié'
                    }
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Sexe</span>
                  <span className="info-value">
                    {patient.sexe === 'M' ? 'Masculin' : patient.sexe === 'F' ? 'Féminin' : 'Non spécifié'}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Profession</span>
                  <span className="info-value">
                    {renderValue(patient.profession)}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Groupe Sanguin</span>
                  <span className="info-value">
                    {patient.groupe_sanguin ? (
                      <span className="blood-group-badge">
                        <Droplets size={14} />
                        {patient.groupe_sanguin}
                      </span>
                    ) : (
                      'Non spécifié'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations de Contact */}
            <div className="facture-info-card">
              <h4>
                <Phone size={20} />
                Informations de Contact
              </h4>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Téléphone</span>
                  <span className="info-value phone-number">
                    {renderValue(patient.telephone)}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value email-address">
                    {renderValue(patient.email)}
                  </span>
                </div>
                
                <div className="info-item full-width">
                  <span className="info-label">Adresse</span>
                  <span className="info-value">
                    {renderValue(patient.adresse)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations d'Assurance */}
          <div className="facture-info-card">
            <h4>
              <Shield size={20} />
              Informations d'Assurance
            </h4>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nom de l'Assurance</span>
                <span className="info-value">
                  {renderValue(patient.assurance_nom)}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Numéro d'Assurance</span>
                <span className="info-value">
                  {renderValue(patient.assurance_numero)}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Taux de Couverture</span>
                <span className="info-value">
                  {patient.taux_couverture ? (
                    <span className="coverage-badge">
                      {patient.taux_couverture}%
                    </span>
                  ) : (
                    'Non spécifié'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Date de création et mise à jour */}
          {patient.date_creation && (
            <div className="metadata-section">
              <div className="metadata-item">
                <Calendar size={14} />
                <span>Créé le: {new Date(patient.date_creation).toLocaleDateString('fr-FR')}</span>
              </div>
              {patient.date_modification && (
                <div className="metadata-item">
                  <Calendar size={14} />
                  <span>Modifié le: {new Date(patient.date_modification).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
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
            onClick={() => onEdit(patient)} 
            className="btn btn-primary"
          >
            <Edit2 size={18} />
            Modifier le Patient
          </button>
        </div>
      </div>
    </div>
  );
}
<style> {('')}</style>