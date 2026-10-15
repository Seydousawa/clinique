import React from 'react';
import { X, Archive, AlertTriangle } from 'lucide-react';

/**
 * Composant DeleteModal - Modal de confirmation d'archivage (soft delete)
 * @param {boolean} isOpen - État du modal
 * @param {object} target - Objet cible à archiver (avec id et nom)
 * @param {function} onDelete - Fonction appelée lors de l'archivage
 * @param {function} onClose - Fonction appelée lors de la fermeture
 * @param {boolean} loading - État de chargement pendant l'archivage
 */
export default function DeleteModal({ isOpen, target, onDelete, onClose, loading = false }) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
          padding: '20px 24px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fecaca'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} style={{ color: '#dc3545' }} />
            <h2 style={{ 
              margin: 0, 
              color: '#dc3545', 
              fontSize: '1.25rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Confirmer l'archivage
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'rgba(220, 53, 69, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#dc3545',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            }}
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '2px solid #fecaca',
              animation: 'pulse 2s infinite'
            }}>
              <Archive size={32} color="#dc3545" />
            </div>
            
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#d21919',
              fontSize: '1.125rem',
              fontWeight: 600
            }}>
              Voulez vous vraiment archiver {target?.nom || target?.prenom + ' ' + target?.nom || 'cet élément'} ?
            </h3>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              borderLeft: '4px solid #f59e0b',
              width: '100%'
            }}>
              <p style={{ 
                margin: 0, 
                color: '#4b5563', 
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}>
                <strong style={{ color: '#dc3545' }}>Attention :</strong> L'élément sera déplacé vers les archives et n'apparaîtra plus dans la liste principale.
                Vous pourrez le restaurer depuis la section des archives.
              </p>
            </div>
          </div>

          
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          background: '#f9fafb',
          borderRadius: '0 0 12px 12px'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '2px solid #e5e7eb',
              background: 'white',
              color: '#374151',
              transition: 'all 0.2s',
              minWidth: '120px',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          >
            <span>✕</span>
            Annuler
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              transition: 'all 0.2s',
              minWidth: '140px',
              opacity: loading ? 0.7 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Archivage...
              </>
            ) : (
              <>
                <Archive size={18} />
                Confirmer l'archivage
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 500px;
          position: relative;
          animation: slideUp 0.3s ease-out;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 10;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #dc3545;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .modal-content {
            margin: 10px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-overlay {
            padding: 10px;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}