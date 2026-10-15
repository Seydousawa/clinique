import React from 'react';
import { Trash2, Check, AlertCircle, Clock, Truck, FilePenLine } from 'lucide-react';

export default function CommandeTable({
  commandes = [],
  produits = [],
  loading = false,
  onEdit,
  onDelete,
  onRecevoir
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

  if (commandes.length === 0) {
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
        <p>Aucune commande trouvée</p>
      </div>
    );
  }

  /* Même logique que le modal */
  const getProduitInfo = (produitId) => {
    return produits.find(p => p.id_produit == produitId);
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_attente':
        return { bg: '#fef3c7', color: '#92400e', text: 'En attente', icon: Clock };
      case 'commande':
        return { bg: '#f0fdf4', color: '#15803d', text: 'Commandée', icon: Truck };
      case 'recu':
        return { bg: '#d1fae5', color: '#065f46', text: 'Reçue', icon: Check };
      default:
        return { bg: '#f3f4f6', color: '#374151', text: statut, icon: Clock };
    }
  };

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
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Produit</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Fournisseur</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Quantité</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Prix unitaire</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Montant total</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Statut</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((commande, index) => {
              /* Exactement comme le modal :
                 getProduitInfo(commande.produit)?.prix * commande.quantite */
              const produit     = getProduitInfo(commande.produit);
              const prixUnit    = produit?.prix || 0;
              const quantite    = commande.quantite || 0;
              const montant     = prixUnit * quantite;
              const nomProduit  = produit?.designation || commande.nom_produit || `Produit #${commande.produit}`;

              const statutInfo = getStatutColor(commande.statut);
              const StatutIcon = statutInfo.icon;

              return (
                <tr
                  key={commande.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                    fontSize: '14px'
                  }}
                >
                  {/* Produit */}
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1f2937' }}>
                    {nomProduit}
                  </td>

                  {/* Fournisseur */}
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                    {commande.fournisseur || '—'}
                  </td>

                  {/* Quantité */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      backgroundColor: '#ecfdf5',
                      color: '#047857',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '12px',
                      display: 'inline-block'
                    }}>
                      {quantite}
                    </span>
                  </td>

                  {/* Prix unitaire */}
                  <td style={{ padding: '12px 16px', color: '#374151', fontWeight: '500' }}>
                    {prixUnit > 0
                      ? `${prixUnit.toLocaleString()} FCFA`
                      : <span style={{ color: '#d1d5db', fontStyle: 'italic', fontSize: '12px' }}>—</span>
                    }
                  </td>

                  {/* Montant total — même calcul que le modal */}
                  <td style={{ padding: '12px 16px' }}>
                    {montant > 0
                      ? (
                        <span style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>
                          {montant.toLocaleString()} FCFA
                        </span>
                      )
                      : <span style={{ color: '#d1d5db', fontStyle: 'italic', fontSize: '12px' }}>—</span>
                    }
                  </td>

                  {/* Statut */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{
                      backgroundColor: statutInfo.bg,
                      color: statutInfo.color,
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <StatutIcon size={14} />
                      {statutInfo.text}
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                    {commande.date_commande
                      ? new Date(commande.date_commande).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>

                      {commande.statut !== 'recu' && (
                        <button
                          onClick={() => onRecevoir?.(commande.id)}
                          title="Marquer comme reçue"
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#059669',
                            border: 'none',
                            width: '28px', height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.12)'; }}
                          onMouseOut={e =>  { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = '#059669'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <Check size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => onEdit?.(commande)}
                        title="Modifier"
                        style={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: '#d97706',
                          border: 'none',
                          width: '28px', height: '28px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.12)'; }}
                        onMouseOut={e =>  { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; e.currentTarget.style.color = '#d97706'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <FilePenLine size={13} />
                      </button>

                      <button
                        onClick={() => onDelete?.(commande.id)}
                        title="Supprimer"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: 'none',
                          width: '28px', height: '28px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.12)'; }}
                        onMouseOut={e =>  { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <Trash2 size={13} />
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}