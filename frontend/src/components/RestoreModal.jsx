import React from 'react';
import { X, RefreshCw, RotateCcw } from 'lucide-react';

/**
 * Composant RestoreModal - Modal de confirmation de restauration
 * @param {boolean} isOpen - État du modal
 * @param {object} target - Objet cible à restaurer (avec id et nom)
 * @param {function} onRestore - Fonction appelée lors de la restauration
 * @param {function} onClose - Fonction appelée lors de la fermeture
 * @param {boolean} loading - État de chargement pendant la restauration
 */
export default function RestoreModal({ isOpen, target, onRestore, onClose, loading = false }) {
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
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          padding: '20px 24px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #86efac'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RotateCcw size={24} style={{ color: '#059669' }} />
            <h2 style={{ 
              margin: 0, 
              color: '#059669', 
              fontSize: '1.25rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Confirmer la restauration
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'rgba(5, 150, 105, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#059669',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'rgba(5, 150, 105, 0.2)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'rgba(5, 150, 105, 0.1)';
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
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '2px solid #86efac',
              animation: 'pulse 2s infinite'
            }}>
              <RefreshCw size={32} color="#059669" />
            </div>
            
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#1f2937',
              fontSize: '1.125rem',
              fontWeight: 600
            }}>
              Voulez-vous vraiment restaurer{' '}
              <strong style={{ color: '#059669' }}>
                {target?.nom || target?.designation || 'cet élément'}
              </strong> ?
            </h3>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              borderLeft: '4px solid #10b981',
              width: '100%'
            }}>
              <p style={{ 
                margin: 0, 
                color: '#4b5563', 
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}>
                Le médecin sera réactivé et apparaîtra à nouveau dans la liste principale.
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
            onClick={onRestore}
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
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
                Restauration...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Restaurer
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
          justifyContent: center;
          border-radius: 12px;
          z-index: 10;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #10b981;
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
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
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