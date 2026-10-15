import React from 'react';
import { 
  Edit3, 
  Trash2, 
  Users, 
  Archive, 
  RotateCcw,
  Eye,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

const tableHeaderStyle = {
  padding: '15px 20px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tableCellStyle = {
  padding: '15px 20px',
  fontSize: '14px',
  color: '#475569',
  borderBottom: '1px solid #f1f5f9'
};

/**
 * Composant PersonnelTable - Tableau affichant la liste des personnels
 * @param {array} personnels - Liste des personnels à afficher
 * @param {boolean} loading - État du chargement
 * @param {function} onEdit - Fonction appelée lors de l'édition
 * @param {function} onDelete - Fonction appelée lors de l'archivage
 * @param {function} onRestore - Fonction appelée lors de la restauration
 * @param {function} onPermanentDelete - Fonction appelée lors de la suppression définitive
 * @param {string} viewMode - Mode d'affichage ('active' ou 'archived')
 */
export default function PersonnelTable({ 
  personnels, 
  loading, 
  onEdit, 
  onDelete, 
  onRestore, 
  onPermanentDelete,
  viewMode = 'active' 
}) {
  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <p style={{ 
          marginTop: '10px', 
          color: '#64748b',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Chargement des personnels...
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'separate',
        borderSpacing: 0
      }}>
        <thead>
          <tr style={{ 
            backgroundColor: '#f8fafc',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <th style={tableHeaderStyle}>Nom Complet</th>
            <th style={tableHeaderStyle}>Email</th>
            <th style={tableHeaderStyle}>Téléphone</th>
            <th style={tableHeaderStyle}>Rôle</th>
            <th style={tableHeaderStyle}>Statut</th>
            {viewMode === 'archived' && (
              <th style={tableHeaderStyle}>Date d'archivage</th>
            )}
            <th style={{...tableHeaderStyle, width: '140px', textAlign: 'center'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {personnels.length === 0 ? (
            <tr>
              <td colSpan={viewMode === 'archived' ? '6' : '5'} style={{ 
                textAlign: 'center', 
                padding: '60px', 
                color: '#94a3b8',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  {viewMode === 'archived' ? (
                    <>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Archive size={32} color="#f59e0b" />
                      </div>
                      <div>
                        <p style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Aucun personnel archivé
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          Les personnels archivés apparaîtront ici
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Users size={32} color="#3b82f6" />
                      </div>
                      <div>
                        <p style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Aucun personnel enregistré
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          Commencez par ajouter un nouveau personnel
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            personnels.map((personnel, index) => (
              <tr key={personnel.id} style={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                transition: 'all 0.2s ease',
                borderBottom: '1px solid #f1f5f9'
              }}>
                {/* Nom Complet */}
                <td style={{ 
                  ...tableCellStyle, 
                  fontWeight: '600', 
                  color: personnel.is_deleted ? '#92400e' : '#1e293b' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '15px' }}>
                      {personnel.user.nom} {personnel.user.prenom}
                    </span>
                    {personnel.is_deleted && (
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        display: 'inline-block',
                        width: 'fit-content'
                      }}>
                        <Archive size={11} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        ARCHIVÉ
                      </span>
                    )}
                  </div>
                </td>

                {/* Email */}
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="#64748b" />
                    <span>{personnel.user.email}</span>
                  </div>
                </td>

                {/* Téléphone */}
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="#64748b" />
                    <span>{personnel.user.telephone || '-'}</span>
                  </div>
                </td>

                {/* Rôle */}
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={14} color={
                      personnel.user.role === 'Admin' ? '#8b5cf6' :
                      personnel.user.role === 'Manager' ? '#0ea5e9' : '#10b981'
                    } />
                    <span style={{
                      backgroundColor: 
                        personnel.user.role === 'Admin' ? '#f3e8ff' :
                        personnel.user.role === 'Manager' ? '#f0f9ff' : '#f0fdf4',
                      color: 
                        personnel.user.role === 'Admin' ? '#7c3aed' :
                        personnel.user.role === 'Manager' ? '#0284c7' : '#059669',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {personnel.user.role || 'Non défini'}
                    </span>
                  </div>
                </td>

                {/* Statut */}
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {personnel.user.is_active ? (
                      <CheckCircle size={16} color="#10b981" />
                    ) : (
                      <XCircle size={16} color="#ef4444" />
                    )}
                    <span style={{
                      backgroundColor: personnel.user.is_active ? '#d1fae5' : '#fee2e2',
                      color: personnel.user.is_active ? '#065f46' : '#991b1b',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {personnel.user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </td>

                {/* Date d'archivage (si mode archived) */}
                {viewMode === 'archived' && (
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="#64748b" />
                      {personnel.deleted_at 
                        ? new Date(personnel.deleted_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </div>
                  </td>
                )}

                {/* Actions */}
                <td style={{...tableCellStyle, textAlign: 'center'}}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    justifyContent: 'center', 
                    flexWrap: 'nowrap'
                  }}>
                    {!personnel.is_deleted ? (
                      <>
                        {/* Bouton Voir Détails */}
                        <button
                          onClick={() => {}}
                          style={{
                            backgroundColor: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px'
                          }}
                          title="Voir détails"
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e0f2fe';
                            e.currentTarget.style.color = '#0ea5e9';
                            e.currentTarget.style.borderColor = '#bae6fd';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.color = '#64748b';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        
                        {/* Bouton Éditer */}
                        <button
                          onClick={() => onEdit(personnel)}
                          style={{
                            backgroundColor: '#f0f9ff',
                            color: '#0ea5e9',
                            border: '1px solid #bae6fd',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px'
                          }}
                          title="Éditer"
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e0f2fe';
                            e.currentTarget.style.color = '#0284c7';
                            e.currentTarget.style.borderColor = '#7dd3fc';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                            e.currentTarget.style.color = '#0ea5e9';
                            e.currentTarget.style.borderColor = '#bae6fd';
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        {/* Bouton Archiver */}
                        <button
                          onClick={() => onDelete(personnel)}
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px'
                          }}
                          title="Archiver"
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.borderColor = '#fca5a5';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.borderColor = '#fecaca';
                          }}
                        >
                          <Archive size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Bouton Restaurer */}
                        <button
                          onClick={() => onRestore(personnel)}
                          style={{
                            backgroundColor: '#f0fdf4',
                            color: '#10b981',
                            border: '1px solid #bbf7d0',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '500',
                            fontSize: '12px'
                          }}
                          title="Restaurer"
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dcfce7';
                            e.currentTarget.style.color = '#059669';
                            e.currentTarget.style.borderColor = '#86efac';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0fdf4';
                            e.currentTarget.style.color = '#10b981';
                            e.currentTarget.style.borderColor = '#bbf7d0';
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>Restaurer</span>
                        </button>

                        {/* Bouton Supprimer Définitivement */}
                        <button
                          onClick={() => onPermanentDelete(personnel)}
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '500',
                            fontSize: '12px'
                          }}
                          title="Supprimer définitivement"
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.borderColor = '#fca5a5';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.borderColor = '#fecaca';
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Supprimer</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}