import React from 'react';
import { Edit2, Trash2, Eye, AlertCircle, ShoppingCart } from 'lucide-react';

export default function DistributionTable({
  distributions = [],
  loading = false,
  onEdit,
  onDelete,
  onDetail,
  onAddToCart
}) {
  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280' }}>Chargement...</p>
      </div>
    );
  }

  if (distributions.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <p>Aucune distribution trouvée</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151'
              }}>Produit</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151'
              }}>Quantité</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151'
              }}>Date</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151'
              }}>Montant</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151'
              }}>Panier</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {distributions.map((distribution, index) => (
              <tr
                key={distribution.id}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                  fontSize: '14px'
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1f2937' }}>
                  {distribution.designation}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '12px',
                    display: 'inline-block'
                  }}>
                    {distribution.quantite_distribuee}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                  {distribution.date_distribution}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#059669' }}>
                  {distribution.prix_total ? `${parseInt(distribution.prix_total).toLocaleString()} FCFA` : '-'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => onAddToCart?.(distribution.produit_id)}
                    title="Ajouter au panier"
                    style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    <ShoppingCart size={14} /> Panier
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => onDetail?.(distribution)}
                      title="Voir détails"
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <Eye size={14} />
                    </button>
                    
                    <button
                      onClick={() => onEdit?.(distribution)}
                      title="Modifier"
                      style={{
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #dcfce7',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete?.(distribution.id)}
                      title="Supprimer"
                      style={{
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fee2e2',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}