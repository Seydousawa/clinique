import React from 'react';
import { X, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * Composant PermanentDeleteModal - Modal de confirmation de suppression définitive
 * @param {boolean} isOpen - État du modal
 * @param {object} target - Objet cible à supprimer définitivement (avec id et nom)
 * @param {function} onDelete - Fonction appelée lors de la suppression définitive
 * @param {function} onClose - Fonction appelée lors de la fermeture
 * @param {boolean} loading - État de chargement pendant la suppression
 */
export default function PermanentDeleteModal({ isOpen, target, onDelete, onClose, loading = false }) {
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
      <div className="modal-content" style={{ 
        maxWidth: '420px',
        width: '95%',
        border: '2px solid #dc2626'
      }}>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          padding: '16px 20px',
          borderRadius: '10px 10px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fca5a5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
            <h2 style={{ 
              margin: 0, 
              color: '#dc2626', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚠️ SUPPRESSION DÉFINITIVE
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px',
              color: '#dc2626',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.5 : 1,
              width: '28px',
              height: '28px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            }}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '2px solid #fca5a5',
              animation: 'pulse-danger 1.5s infinite'
            }}>
              <Trash2 size={24} color="#dc2626" />
            </div>
            
            {/* Alerte de danger */}
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              width: '100%'
            }}>
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#991b1b', 
                  fontWeight: '600', 
                  margin: '0 0 6px 0',
                  lineHeight: 1.3
                }}>
                  ⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !
                </p>
              </div>
            </div>
            
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: '#1f2937',
              fontSize: '1rem',
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              Voulez-vous vraiment supprimer <strong>DÉFINITIVEMENT</strong>{' '}
              <strong style={{ color: '#dc2626' }}>
                {target?.nom || target?.designation || 'cet élément'}
              </strong> ?
            </h3>
            
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#666', 
              lineHeight: 1.4,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Cette action supprimera définitivement toutes les données associées à ce médecin de la base de données.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          background: '#f9fafb',
          borderRadius: '0 0 10px 10px'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              color: '#374151',
              transition: 'all 0.2s',
              minWidth: '100px',
              opacity: loading ? 0.5 : 1,
              height: '36px'
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
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: 'none',
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              color: 'white',
              transition: 'all 0.2s',
              minWidth: '160px',
              opacity: loading ? 0.7 : 1,
              position: 'relative',
              overflow: 'hidden',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
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
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Supprimer définitivement
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
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 10px;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 420px;
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
          border-radius: 10px;
          z-index: 10;
        }

        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #dc2626;
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
            transform: translateY(15px);
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

        @keyframes pulse-danger {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .modal-content {
            width: 95%;
            max-width: 350px;
          }
          
          .modal-footer {
            flex-direction: column;
            gap: 8px;
          }
          
          button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}