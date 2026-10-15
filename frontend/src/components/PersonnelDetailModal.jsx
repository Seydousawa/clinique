import React from 'react';
import { X, User, Phone, Mail, Edit2, Badge, Shield } from 'lucide-react';

export default function PersonnelDetailModal({ isOpen, personnel, roles = [], onEdit, onClose }) {
  if (!isOpen || !personnel) return null;

  // Fonction pour afficher les données
  const renderValue = (value, defaultValue = 'Non spécifié') => {
    return value !== null && value !== undefined && value !== '' ? value : defaultValue;
  };

  // Obtient le nom du rôle
  const getRoleName = (roleId) => {
    if (!roleId) return 'Non assigné';
    const foundRole = roles.find(r => r.id === roleId);
    return foundRole ? foundRole.nom : roleId;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h5 className="modal-title">
            <User size={24} className="title-icon" />
            Détails du Personnel
          </h5>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* En-tête du personnel */}
          <div className="personnel-header">
            <div className="personnel-avatar">
              {(personnel.user?.prenom?.charAt(0) || '?')}{(personnel.user?.nom?.charAt(0) || '?')}
            </div>
            <div className="personnel-info">
              <h4 className="personnel-name">
                {renderValue(personnel.user?.prenom)} {renderValue(personnel.user?.nom)}
              </h4>
              <p className="personnel-id">
                ID: {renderValue(personnel.id)}
              </p>
            </div>
          </div>

          {/* Informations Professionnelles */}
          <div className="info-section">
            <h6 className="section-title">
              <Badge size={16} className="section-icon" />
              Informations Professionnelles
            </h6>
            <div className="info-grid">
              <div className="info-item">
                <label>Rôle:</label>
                <span className="info-value">
                  {personnel.user?.role ? (
                    <span className="role-badge">{getRoleName(personnel.user.role)}</span>
                  ) : (
                    'Non spécifié'
                  )}
                </span>
              </div>
              <div className="info-item">
                <label>Statut:</label>
                <span className="info-value">
                  {personnel.user?.is_active ? (
                    <span className="status-badge active">Actif</span>
                  ) : (
                    <span className="status-badge inactive">Inactif</span>
                  )}
                </span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span className="info-value">
                  {renderValue(personnel.user?.username)}
                </span>
              </div>
            </div>
          </div>

          {/* Informations de Contact */}
          <div className="info-section">
            <h6 className="section-title">
              <Phone size={16} className="section-icon" />
              Informations de Contact
            </h6>
            <div className="info-grid">
              <div className="info-item">
                <label>Téléphone:</label>
                <span className="info-value contact-value">
                  {renderValue(personnel.user?.telephone)}
                </span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span className="info-value contact-value">
                  {renderValue(personnel.user?.email)}
                </span>
              </div>
            </div>
          </div>

          {/* Identifiants */}
          <div className="info-section">
            <h6 className="section-title">
              <Shield size={16} className="section-icon" />
              Identifiants
            </h6>
            <div className="info-grid">
              <div className="info-item">
                <label>ID Personnel:</label>
                <span className="info-value">
                  {renderValue(personnel.id)}
                </span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span className="info-value">
                  {renderValue(personnel.user?.username)}
                </span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="modal-actions">
            <button onClick={onClose} className="btn-secondary">
              Fermer
            </button>
            <button onClick={() => onEdit(personnel)} className="btn-primary">
              <Edit2 size={16} />
              Modifier
            </button>
          </div>
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
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          background: #10b981;
          color: white;
          padding: 20px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-body {
          padding: 24px;
        }

        .personnel-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .personnel-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 20px;
          flex-shrink: 0;
        }

        .personnel-info {
          flex: 1;
        }

        .personnel-name {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .personnel-id {
          margin: 2px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .info-section {
          margin-bottom: 24px;
        }

        .section-title {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item label {
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
        }

        .info-value {
          font-size: 14px;
          color: #1f2937;
          word-break: break-word;
        }

        .contact-value {
          font-family: monospace;
        }

        .role-badge {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #dbeafe;
        }

        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.active {
          background: #f0fdf4;
          color: #059669;
          border: 1px solid #dcfce7;
        }

        .status-badge.inactive {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-primary, .btn-secondary {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #10b981;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #059669;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        @media (max-width: 768px) {
          .modal-container {
            max-height: 95vh;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .personnel-header {
            flex-direction: column;
            text-align: center;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}