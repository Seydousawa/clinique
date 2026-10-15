import React from 'react';
import {
  Eye, Edit3, Trash2, Archive, RotateCcw,
  Calendar, User, Bed, Activity, CreditCard, FileText, CheckCircle
} from 'lucide-react';

export default function HospitalisationTable({
  hospitalisations = [],
  loading = false,
  onEdit,
  onDelete,
  onDetail,
  onRestore,
  onPermanentDelete,
  onPay,
  viewMode = 'active',
  patientsMap = {}
}) {

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const getPatientName = (hosp) => {
    if (hosp.patient_nom_complet?.trim()) return hosp.patient_nom_complet;
    if (hosp.patient_prenom || hosp.patient_nom) {
      const name = `${hosp.patient_prenom || ''} ${hosp.patient_nom || ''}`.trim();
      if (name) return name;
    }
    if (hosp.patient && typeof hosp.patient === 'object') {
      const name = `${hosp.patient.prenom || ''} ${hosp.patient.nom || ''}`.trim();
      if (name) return name;
    }
    if (hosp.patient_id && patientsMap[hosp.patient_id]) {
      const p = patientsMap[hosp.patient_id];
      return `${p.prenom || ''} ${p.nom || ''}`.trim();
    }
    return `Patient #${hosp.patient || hosp.patient_id || 'inconnu'}`;
  };

  const getChambreNumber = (hosp) => {
    if (hosp.chambre && typeof hosp.chambre === 'object') return hosp.chambre.numero;
    return hosp.chambre || 'N/A';
  };

  const getStatusBadge = (hosp) => {
    if (hosp.is_deleted) {
      return { text: 'Archivée', bgColor: '#fef3c7', textColor: '#92400e', borderColor: '#fde68a' };
    }
    if (hosp.date_sortie || hosp.is_paid) {
      return { text: 'Terminée', bgColor: '#fef3c7', textColor: '#92400e', borderColor: '#fde68a' };
    }
    return { text: 'En cours', bgColor: '#d1fae5', textColor: '#065f46', borderColor: '#a7f3d0' };
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // ✅ Détermine si l'hospitalisation est payée
  const isPaid = (hosp) => hosp.is_paid || !!hosp.date_sortie;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Chargement des hospitalisations...</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      {hospitalisations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {viewMode === 'archived' ? (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Archive size={32} color="#f59e0b" />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Aucune hospitalisation archivée</p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Les hospitalisations archivées apparaîtront ici</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bed size={32} color="#3b82f6" />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Aucune hospitalisation enregistrée</p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Commencez par ajouter une nouvelle hospitalisation</p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>#</th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} />Patient</div>
              </th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Bed size={14} />Chambre</div>
              </th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} />Admission</div>
              </th>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} />Statut</div>
              </th>
              {viewMode !== 'archived' && (
                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '140px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={14} />Paiement</div>
                </th>
              )}
              {viewMode === 'archived' && (
                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date d'archivage</th>
              )}
              <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitalisations.map((hosp, index) => {
              const status = getStatusBadge(hosp);
              const paid = isPaid(hosp);

              return (
                <tr key={hosp.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'all 0.2s ease', borderBottom: '1px solid #f1f5f9' }}>

                  {/* # */}
                  <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{index + 1}</span>
                  </td>

                  {/* Patient */}
                  <td style={{ padding: '15px 20px', fontSize: '14px', color: '#475569' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{getPatientName(hosp)}</span>
                      <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={12} />
                        {truncateText(hosp.motif || 'Aucun motif spécifié')}
                      </span>
                      {hosp.is_deleted && (
                        <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', display: 'inline-block', width: 'fit-content' }}>
                          <Archive size={11} style={{ marginRight: '5px', verticalAlign: 'middle' }} />ARCHIVÉ
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Chambre */}
                  <td style={{ padding: '15px 20px', fontSize: '14px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bed size={14} color="#0ea5e9" />
                      <span style={{ backgroundColor: '#f0f9ff', color: '#0284c7', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>
                        Chambre {getChambreNumber(hosp)}
                      </span>
                    </div>
                  </td>

                  {/* Admission */}
                  <td style={{ padding: '15px 20px', fontSize: '14px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="#64748b" />
                      {formatDate(hosp.date_admission)}
                    </div>
                    {hosp.date_sortie && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />Sortie: {formatDate(hosp.date_sortie)}
                      </div>
                    )}
                  </td>

                  {/* Statut */}
                  <td style={{ padding: '15px 20px', fontSize: '14px', color: '#475569' }}>
                    <span style={{ backgroundColor: status.bgColor, color: status.textColor, padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', border: `1px solid ${status.borderColor}` }}>
                      {status.text}
                    </span>
                  </td>

                  {/* ✅ Colonne Paiement */}
                  {viewMode !== 'archived' && (
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: '#475569' }}>
                      {paid ? (
                        // ✅ Bouton "Payé" désactivé
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={16} color="#10b981" />
                          <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: '1px solid #a7f3d0' }}>
                            Payé
                          </span>
                        </div>
                      ) : (
                        // ✅ Bouton "Facturer" cliquable
                        <button
                          onClick={() => onPay?.(hosp)}
                          style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '12px', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          title="Facturer l'hospitalisation"
                        >
                          <CreditCard size={14} />
                          Facturer
                        </button>
                      )}
                    </td>
                  )}

                  {/* Date archivage */}
                  {viewMode === 'archived' && (
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="#64748b" />
                        {hosp.deleted_at
                          ? new Date(hosp.deleted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </div>
                    </td>
                  )}

                  {/* Actions */}
                  <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                      {!hosp.is_deleted ? (
                        <>
                          <button onClick={() => onDetail?.(hosp)} style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }} title="Voir détails"
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; e.currentTarget.style.color = '#0ea5e9'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}>
                            <Eye size={16} />
                          </button>
                          <button onClick={() => onEdit?.(hosp)} style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }} title="Modifier"
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; e.currentTarget.style.color = '#0284c7'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.color = '#0ea5e9'; }}>
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => onDelete?.(hosp)} style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }} title="Archiver"
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}>
                            <Archive size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => onRestore?.(hosp)} style={{ backgroundColor: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '12px' }} title="Restaurer"
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}>
                            <RotateCcw size={14} /><span>Restaurer</span>
                          </button>
                          <button onClick={() => onPermanentDelete?.(hosp)} style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '12px' }} title="Supprimer définitivement"
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}>
                            <Trash2 size={14} /><span>Supprimer</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}