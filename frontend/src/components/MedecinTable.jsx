import React from 'react';
import { 
  Edit3, 
  Trash2, 
  Users, 
  Archive, 
  RotateCcw,
  Eye,
  Mail,
  Calendar,
  Stethoscope,
  Award
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
 * Composant MedecinTable - Tableau affichant la liste des médecins
 * @param {array} medecins - Liste des médecins à afficher
 * @param {boolean} loading - État du chargement
 * @param {function} onEdit - Fonction appelée lors de l'édition
 * @param {function} onDelete - Fonction appelée lors de l'archivage
 * @param {function} onRestore - Fonction appelée lors de la restauration
 * @param {function} onPermanentDelete - Fonction appelée lors de la suppression définitive
 * @param {string} viewMode - Mode d'affichage ('active' ou 'archived')
 */
export default function MedecinTable({ 
  medecins, 
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
          Chargement des médecins...
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
            <th style={tableHeaderStyle}>Spécialité</th>
            {viewMode === 'archived' && (
              <th style={tableHeaderStyle}>Date d'archivage</th>
            )}
            <th style={{...tableHeaderStyle, width: '140px', textAlign: 'center'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medecins.length === 0 ? (
            <tr>
              <td colSpan={viewMode === 'archived' ? '5' : '4'} style={{ 
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
                          Aucun médecin archivé
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          Les médecins archivés apparaîtront ici
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
                          Aucun médecin enregistré
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          Commencez par ajouter un nouveau médecin
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            medecins.map((medecin, index) => (
              <tr key={medecin.id_medecin} style={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                transition: 'all 0.2s ease',
                borderBottom: '1px solid #f1f5f9'
              }}>
                {/* Nom Complet */}
                <td style={{ 
                  ...tableCellStyle, 
                  fontWeight: '600', 
                  color: medecin.is_deleted ? '#92400e' : '#1e293b' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '15px' }}>
                      {medecin.nom} {medecin.prenom}
                    </span>
                    {medecin.is_deleted && (
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
                    <span>{medecin.email}</span>
                  </div>
                </td>

                {/* Spécialité */}
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={14} color="#0ea5e9" />
                    <span style={{
                      backgroundColor: '#f0f9ff',
                      color: '#0284c7',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {medecin.specialite}
                    </span>
                  </div>
                </td>

                {/* Date d'archivage (si mode archived) */}
                {viewMode === 'archived' && (
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="#64748b" />
                      {medecin.deleted_at 
                        ? new Date(medecin.deleted_at).toLocaleDateString('fr-FR', {
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
                    {!medecin.is_deleted ? (
                      <>
                        {/* Bouton Voir Détails */}
                        
                        
                        {/* Bouton Éditer */}
                        <button
                          onClick={() => onEdit(medecin)}
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
                          onClick={() => onDelete(medecin)}
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
                          onClick={() => onRestore(medecin)}
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
                          onClick={() => onPermanentDelete(medecin)}
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