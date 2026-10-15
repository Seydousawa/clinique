import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Stethoscope, Home, Bed, Clock, Phone, Mail, MapPin, Droplets, Edit2, FileText, Shield } from 'lucide-react';

export default function HospitalisationDetailModal({
  isOpen,
  hospitalisation,
  onEdit,
  onClose
}) {
  const [showRealModal, setShowRealModal] = useState(false);
  const [medecinData, setMedecinData] = useState(null);

  useEffect(() => {
    if (isOpen && !showRealModal) {
      setShowRealModal(true);
      console.log('🔍 Hospitalisation reçue dans le modal:', hospitalisation);
    } else if (!isOpen && showRealModal) {
      setTimeout(() => setShowRealModal(false), 300);
    }
  }, [isOpen]);

  if (!isOpen && !showRealModal) return null;

  // ===== DÉBOGAGE COMPLET =====
 
      // Vérifier les champs spécifiques
      if (hospitalisation.medecin_responsable) {
        console.log('6. Médécin responsable détail:', {
          estObject: typeof hospitalisation.medecin_responsable === 'object',
          estString: typeof hospitalisation.medecin_responsable === 'string',
          valeur: hospitalisation.medecin_responsable
        });
      }
      
  // ===== RÉCUPÉRER LE NOM DU PATIENT =====
  const getPatientName = () => {
    // 1. Nom complet enrichi
    if (hospitalisation.patient_nom_complet && hospitalisation.patient_nom_complet.trim() !== '') {
      return hospitalisation.patient_nom_complet;
    }
    
    // 2. Champs séparés
    if (hospitalisation.patient_prenom || hospitalisation.patient_nom) {
      return `${hospitalisation.patient_prenom || ''} ${hospitalisation.patient_nom || ''}`.trim();
    }
    
    // 3. Objet patient
    if (hospitalisation.patient && typeof hospitalisation.patient === 'object') {
      return `${hospitalisation.patient.prenom || ''} ${hospitalisation.patient.nom || ''}`.trim();
    }
    
    // 4. String patient
    if (typeof hospitalisation.patient === 'string') {
      return hospitalisation.patient;
    }
    
    return 'Patient inconnu';
  };

  // ===== RÉCUPÉRER LE NOM DU MÉDECIN =====
  const getMedecinName = () => {
    console.log('🔍 getMedecinName - Recherche nom médecin...');
    
    // 1. Vérifier medecin_nom (enrichi)
    if (hospitalisation.medecin_nom && hospitalisation.medecin_nom !== 'Médecin non assigné') {
      console.log('✅ Nom trouvé dans medecin_nom:', hospitalisation.medecin_nom);
      return hospitalisation.medecin_nom;
    }
    
    // 2. Vérifier medecin_responsable comme objet
    if (hospitalisation.medecin_responsable && typeof hospitalisation.medecin_responsable === 'object') {
      console.log('🔄 medecin_responsable est un objet:', hospitalisation.medecin_responsable);
      
      if (hospitalisation.medecin_responsable.nom || hospitalisation.medecin_responsable.prenom) {
        const nom = hospitalisation.medecin_responsable.nom || '';
        const prenom = hospitalisation.medecin_responsable.prenom || '';
        const fullName = `Dr. ${prenom} ${nom}`.trim();
        console.log('✅ Nom construit depuis objet:', fullName);
        return fullName;
      }
    }
    
    // 3. Vérifier medecin_responsable comme string
    if (typeof hospitalisation.medecin_responsable === 'string' && hospitalisation.medecin_responsable.trim() !== '') {
      console.log('✅ Nom depuis string:', hospitalisation.medecin_responsable);
      
      // Ajouter "Dr." si pas déjà présent
      if (!hospitalisation.medecin_responsable.includes('Dr.') && 
          !hospitalisation.medecin_responsable.includes('Dr ')) {
        return `Dr. ${hospitalisation.medecin_responsable}`;
      }
      return hospitalisation.medecin_responsable;
    }
    
    // 4. Vérifier medecin_id seul
    if (hospitalisation.medecin_id) {
      console.log('ℹ️ Médécin ID trouvé:', hospitalisation.medecin_id);
      return `Dr. ${hospitalisation.medecin_responsable}`;
    }
    
    console.log('❌ Aucune info médecin trouvée');
    return 'Médecin non spécifié';
  };

  // ===== RÉCUPÉRER LA SPÉCIALITÉ =====
  const getMedecinSpecialite = () => {
    // 1. Depuis medecin_specialite
    if (hospitalisation.medecin_specialite && hospitalisation.medecin_specialite.trim() !== '') {
      return hospitalisation.medecin_specialite;
    }
    
    // 2. Depuis l'objet medecin_responsable
    if (hospitalisation.medecin_responsable && 
        typeof hospitalisation.medecin_responsable === 'object' &&
        hospitalisation.medecin_responsable.specialite) {
      return hospitalisation.medecin_responsable.specialite;
    }
    
    return 'Non spécifiée';
  };

  // ===== RÉCUPÉRER LE NUMÉRO D'ORDRE =====
  const getMedecinNumeroOrdre = () => {
    if (hospitalisation.medecin_responsable && 
        typeof hospitalisation.medecin_responsable === 'object') {
      return hospitalisation.medecin_responsable.numero_ordre || '';
    }
    return '';
  };

  // ===== RÉCUPÉRER LE TÉLÉPHONE =====
  const getMedecinTelephone = () => {
    if (hospitalisation.medecin_responsable && 
        typeof hospitalisation.medecin_responsable === 'object') {
      return hospitalisation.medecin_responsable.telephone || '';
    }
    return '';
  };

  // ===== CALCULER LA DURÉE DU SÉJOUR =====
  const calculateDuration = () => {
    if (!hospitalisation.date_admission) return 'Non calculable';
    
    const admission = new Date(hospitalisation.date_admission);
    const sortie = hospitalisation.date_sortie ? new Date(hospitalisation.date_sortie) : new Date();
    
    const diffMs = sortie - admission;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''} ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
    return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  };

  // ===== FORMATER LES DATES =====
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const patientName = getPatientName();
  const medecinName = getMedecinName();
  const medecinSpecialite = getMedecinSpecialite();
  const medecinNumeroOrdre = getMedecinNumeroOrdre();
  const medecinTelephone = getMedecinTelephone();

  // Récupérer les infos du patient
  const patientInfo = hospitalisation.patient && typeof hospitalisation.patient === 'object' 
    ? hospitalisation.patient 
    : null;

  // Styles pour les badges de statut
  const getStatutStyle = () => {
    if (hospitalisation.is_deleted) {
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        label: 'Archivée',
        icon: '📁'
      };
    }
    if (hospitalisation.date_sortie) {
      return {
        backgroundColor: '#d4edda',
        color: '#155724',
        label: 'Terminée',
        icon: '✅'
      };
    } else {
      return {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        label: 'En cours',
        icon: '🏥'
      };
    }
  };

  const statutStyle = getStatutStyle();

  return (
    <div 
      className={`modal-overlay ${!isOpen ? 'closing' : ''}`} 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-content facture-modal ${!isOpen ? 'closing' : ''}`}>
        <div className="modal-header">
          <div className="modal-header-content">
            <Bed size={24} className="modal-icon" />
            <div>
              <h2 className="modal-title">
                Détails de l'Hospitalisation
              </h2>
              <p className="modal-subtitle">ID: #{hospitalisation.id}</p>
            </div>
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
          {/* Section Patient */}
          <div className="detail-section">
            <h3 className="section-title">
              <User size={20} />
              Patient
            </h3>
            <div className="info-grid">
              <div className="info-item highlight">
                <span className="info-label">Nom complet</span>
                <span className="info-value">{patientName}</span>
              </div>
              {hospitalisation.patient_id && (
                <div className="info-item">
                  <span className="info-label">ID Patient</span>
                  <span className="info-value">#{hospitalisation.patient_id}</span>
                </div>
              )}
              {patientInfo?.date_naissance && (
                <div className="info-item">
                  <span className="info-label">Date de naissance</span>
                  <span className="info-value">{formatDate(patientInfo.date_naissance)}</span>
                </div>
              )}
              {patientInfo?.sexe && (
                <div className="info-item">
                  <span className="info-label">Sexe</span>
                  <span className="info-value">{patientInfo.sexe}</span>
                </div>
              )}
              {patientInfo?.groupe_sanguin && (
                <div className="info-item">
                  <span className="info-label">Groupe sanguin</span>
                  <span className="info-value">
                    <Droplets size={16} style={{ marginRight: '6px' }} />
                    {patientInfo.groupe_sanguin}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section Médecin */}
          <div className="detail-section">
            <h3 className="section-title">
              <Stethoscope size={20} />
              Médecin responsable
            </h3>
            <div className="info-grid">
              <div className="info-item highlight">
                <span className="info-label">Nom complet</span>
                <span className="info-value">{medecinName}</span>
              </div>
              {medecinSpecialite && medecinSpecialite !== 'Non spécifiée' && (
                <div className="info-item">
                  <span className="info-label">Spécialité</span>
                  <span className="info-value">{medecinSpecialite}</span>
                </div>
              )}
              {medecinNumeroOrdre && (
                <div className="info-item">
                  <span className="info-label">N° d'ordre</span>
                  <span className="info-value">{medecinNumeroOrdre}</span>
                </div>
              )}
              {medecinTelephone && (
                <div className="info-item">
                  <span className="info-label">Téléphone</span>
                  <span className="info-value">{medecinTelephone}</span>
                </div>
              )}
              {hospitalisation.medecin_id && (
                <div className="info-item">
                  <span className="info-label">ID Médecin</span>
                  <span className="info-value">#{hospitalisation.medecin_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section Hospitalisation */}
          <div className="detail-section">
            <h3 className="section-title">
              <Calendar size={20} />
              Hospitalisation
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Date d'admission</span>
                <span className="info-value highlight">{formatDateTime(hospitalisation.date_admission)}</span>
              </div>
              {hospitalisation.date_sortie && (
                <div className="info-item">
                  <span className="info-label">Date de sortie</span>
                  <span className="info-value highlight">{formatDateTime(hospitalisation.date_sortie)}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Durée du séjour</span>
                <span className="info-value highlight">{calculateDuration()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chambre</span>
                <span className="info-value badge-chambre">Chambre {hospitalisation.chambre || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section Motif */}
          <div className="detail-section">
            <h3 className="section-title">
              <FileText size={20} />
              Motif
            </h3>
            <div className="motif-display">
              <p>{hospitalisation.motif || 'Non spécifié'}</p>
            </div>
          </div>

          {/* Section Notes */}
          {hospitalisation.notes && (
            <div className="detail-section">
              <h3 className="section-title">
                <FileText size={20} />
                Notes supplémentaires
              </h3>
              <div className="notes-display">
                <p>{hospitalisation.notes}</p>
              </div>
            </div>
          )}

          {/* Section Contact */}
          {patientInfo && (patientInfo.telephone || patientInfo.email || patientInfo.adresse) && (
            <div className="detail-section">
              <h3 className="section-title">
                <Phone size={20} />
                Contact du patient
              </h3>
              <div className="info-grid">
                {patientInfo.telephone && (
                  <div className="info-item">
                    <Phone size={16} style={{ marginRight: '8px' }} />
                    <span className="info-value">{patientInfo.telephone}</span>
                  </div>
                )}
                {patientInfo.email && (
                  <div className="info-item">
                    <Mail size={16} style={{ marginRight: '8px' }} />
                    <span className="info-value">{patientInfo.email}</span>
                  </div>
                )}
                {patientInfo.adresse && (
                  <div className="info-item full-width">
                    <MapPin size={16} style={{ marginRight: '8px' }} />
                    <span className="info-value">{patientInfo.adresse}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Statut */}
          <div className="detail-section">
            <h3 className="section-title">
              <Shield size={20} />
              Statut
            </h3>
            <div className="status-display">
              <div 
                className="status-badge"
                style={{
                  backgroundColor: statutStyle.backgroundColor,
                  color: statutStyle.color,
                  border: `1px solid ${statutStyle.color}`
                }}
              >
                {statutStyle.icon} {statutStyle.label}
              </div>
              {hospitalisation.is_deleted && hospitalisation.deleted_at && (
                <div className="deleted-info">
                  <span className="info-label">Date d'archivage:</span>
                  <span className="info-value">{formatDateTime(hospitalisation.deleted_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="btn btn-cancel"
          >
            Fermer
          </button>
          {!hospitalisation.is_deleted && (
            <button 
              onClick={() => onEdit(hospitalisation)} 
              className="btn btn-primary"
            >
              <Edit2 size={18} />
              Modifier
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(5px);
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-overlay.closing {
          animation: fadeOut 0.3s ease-in;
        }
        
        .modal-content.facture-modal {
          background: white;
          border-radius: 12px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-width: 800px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease-out;
        }
        
        .modal-content.facture-modal.closing {
          animation: slideDown 0.3s ease-in;
        }
        
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(to right, #f8fafc, #f1f5f9);
        }
        
        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .modal-icon {
          color: #3b82f6;
          background: #dbeafe;
          padding: 8px;
          border-radius: 8px;
        }
        
        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        
        .modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }
        
        .close-button {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-button:hover {
          background: #f1f5f9;
          color: #475569;
        }
        
        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          background: #f8fafc;
        }
        
        .detail-section {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1e293b;
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-item.full-width {
          grid-column: 1 / -1;
        }
        
        .info-item.highlight {
          background: #f0f9ff;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #bae6fd;
        }
        
        .info-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-weight: 500;
          color: #1e293b;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .badge-chambre {
          background: #f0f9ff;
          color: #0284c7;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
          border: 1px solid #bae6fd;
        }
        
        .motif-display {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          line-height: 1.6;
          color: #334155;
        }
        
        .notes-display {
          background: #fff7ed;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #fed7aa;
          line-height: 1.6;
          color: #7c2d12;
        }
        
        .status-display {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .deleted-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 14px;
          min-width: 100px;
        }
        
        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        
        .btn-cancel:hover {
          background: #e2e8f0;
          color: #334155;
        }
        
        .btn-primary {
          background: linear-gradient(to right, #3b82f6, #2563eb);
          color: white;
          border: none;
        }
        
        .btn-primary:hover {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(30px);
          }
        }
        
        @media (max-width: 768px) {
          .modal-content.facture-modal {
            max-width: 95%;
            margin: 10px;
          }
          
          .modal-body {
            padding: 16px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .status-display {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .modal-footer {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}