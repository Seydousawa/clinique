import React from 'react';
import { X, Package, Calendar, Users } from 'lucide-react';

export default function DistributionDetailModal({
  isOpen,
  distribution,
  onClose
}) {
  if (!isOpen || !distribution) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '16px 16px 0 0'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Détails Distribution</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '20px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Produit */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                💊 Produit
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                {distribution.designation}
              </div>
            </div>

            {/* Quantité */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                📦 Quantité
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                {distribution.quantite_distribuee} unités
              </div>
            </div>

            {/* Destination */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                📍 Destination
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                {distribution.destination}
              </div>
            </div>

            {/* Responsable */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                👤 Responsable
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                {distribution.responsable}
              </div>
            </div>

            {/* Date */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                📅 Date
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                {distribution.date_distribution}
              </div>
            </div>

            {/* Montant Total */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                💰 Montant Total
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#059669' }}>
                {distribution.prix_total ? `${parseInt(distribution.prix_total).toLocaleString()} FCFA` : '-'}
              </div>
            </div>

            {/* Observations */}
            {distribution.observations && (
              <div style={{ backgroundColor: '#f3e8ff', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                  📝 Observations
                </div>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  {distribution.observations}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}