import React from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Archive, 
  RotateCcw, 
  FileText,
  Calendar,
  User,
  Stethoscope,
  Activity,
  CreditCard,
  CheckCircle
} from 'lucide-react';

export default function ConsultationTable({ 
  consultations = [], 
  patientsMap = {}, 
  medecinsMap = {},
  loading = false,
  onEdit, 
  onDelete, 
  onDetail,
  onRestore,
  onPermanentDelete,
  onPayment,
  viewMode = 'active',
  factures = []
}) {

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getPatientName = (consultation) => {
    if (consultation.patient_nom_complet) return consultation.patient_nom_complet;
    if (consultation.patient_prenom && consultation.patient_nom)
      return `${consultation.patient_prenom} ${consultation.patient_nom}`;
    if (consultation.patient && typeof consultation.patient === 'object') {
      const p = consultation.patient;
      if (p.prenom || p.nom) return `${p.prenom ?? ''} ${p.nom ?? ''}`.trim();
    }
    const pid = consultation.patient;
    if (!pid) return 'Patient inconnu';
    const patient = patientsMap[String(pid)] || patientsMap[Number(pid)];
    if (patient) return `${patient.prenom ?? ''} ${patient.nom ?? ''}`.trim();
    return `Patient #${pid}`;
  };

  const getMedecinName = (consultation) => {
    if (consultation.medecin_nom_complet) return consultation.medecin_nom_complet;
    if (consultation.medecin_prenom && consultation.medecin_nom)
      return `Dr. ${consultation.medecin_prenom} ${consultation.medecin_nom}`;
    if (consultation.medecin && typeof consultation.medecin === 'object') {
      const m = consultation.medecin;
      if (m.prenom || m.nom) return `Dr. ${m.prenom ?? ''} ${m.nom ?? ''}`.trim();
    }
    const mid = consultation.medecin;
    if (mid === null || mid === undefined || mid === '') return 'Non assigné';
    const medecin = medecinsMap[String(mid)] || medecinsMap[Number(mid)];
    if (medecin) {
      const nom = `Dr. ${medecin.prenom ?? ''} ${medecin.nom ?? ''}`.trim();
      return nom === 'Dr.' ? 'Non assigné' : nom;
    }
    return 'Non assigné';
  };

  const hasFactureForConsultation = (consultation) => {
    if (!factures || factures.length === 0) return false;
    const cid   = String(consultation.id);
    const patId = String(consultation.patient);
    return factures.some(f => {
      // Correspondance directe par ID
      if (String(f.consultation_id) === cid) return true;
      if (String(f.consultation)    === cid) return true;
      // Tag embarqué dans le motif [CONSULT-ID]
      if (f.motif && f.motif.includes(`[CONSULT-${cid}]`)) return true;
      // Fallback : même patient + motif contient l'ID
      if ((String(f.patient_id) === patId || String(f.patient) === patId)
          && f.motif && f.motif.includes(cid)) return true;
      return false;
    });
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'Non renseigné';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

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
          Chargement des consultations...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px', 
        color: '#94a3b8',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
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
                  Aucune consultation archivée
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Les consultations archivées apparaîtront ici
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
                <FileText size={32} color="#3b82f6" />
              </div>
              <div>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Aucune consultation enregistrée
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Commencez par ajouter une nouvelle consultation
                </p>
              </div>
            </>
          )}
        </div>
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
            <th style={{
              padding: '15px 20px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: '60px'
            }}>#</th>
            <th style={{
              padding: '15px 20px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                Patient
              </div>
            </th>
            <th style={{
              padding: '15px 20px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={14} />
                Médecin
              </div>
            </th>
            <th style={{
              padding: '15px 20px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                Date
              </div>
            </th>
            <th style={{
              padding: '15px 20px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} />
                Diagnostic
              </div>
            </th>
            <th style={{
              padding: '15px 20px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: '150px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} />
                Paiement
              </div>
            </th>
            
            {viewMode === 'archived' && (
              <th style={{
                padding: '15px 20px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Date d'archivage</th>
            )}
            <th style={{
              padding: '15px 20px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: '140px'
            }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {consultations.map((consultation, index) => {
            const patientName = getPatientName(consultation);
            const medecinName = getMedecinName(consultation);
            const hasFacture = hasFactureForConsultation(consultation);
            
            return (
              <tr 
                key={consultation.id || index} 
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  borderBottom: '1px solid #f1f5f9'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                }}
              >
                <td style={{ 
                  padding: '15px 20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  <span style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {index + 1}
                  </span>
                </td>

                <td style={{ 
                  padding: '15px 20px',
                  fontSize: '14px',
                  color: '#475569'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      {patientName}
                    </span>
                    {consultation.is_deleted && (
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: 'fit-content'
                      }}>
                        <Archive size={11} />
                        ARCHIVÉ
                      </span>
                    )}
                  </div>
                </td>

                <td style={{ 
                  padding: '15px 20px',
                  fontSize: '14px',
                  color: '#475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope 
                      size={14} 
                      color={medecinName === 'Non assigné' ? '#dc2626' : '#0ea5e9'} 
                    />
                    <span style={{
                      backgroundColor: medecinName === 'Non assigné' ? '#fef2f2' : '#f0f9ff',
                      color: medecinName === 'Non assigné' ? '#dc2626' : '#0284c7',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {medecinName}
                    </span>
                  </div>
                </td>

                <td style={{ 
                  padding: '15px 20px',
                  fontSize: '14px',
                  color: '#475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#64748b" />
                    {formatDate(consultation.date_consultation)}
                  </div>
                </td>

                <td style={{ 
                  padding: '15px 20px',
                  fontSize: '14px',
                  color: '#475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} color="#64748b" />
                    <span style={{ 
                      maxWidth: '200px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }} title={consultation.diagnostic || 'Non renseigné'}>
                      {truncateText(consultation.diagnostic)}
                    </span>
                  </div>
                </td>

                {/* ✅ COLONNE PAIEMENT — affiche "Payé" si facture existante, sinon bouton Facturer */}
                <td style={{ padding: '15px 20px' }}>
                  {hasFacture ? (
                    <span style={{
                      backgroundColor: '#f0fdf4',
                      color: '#10b981',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <CheckCircle size={14} />
                      Payé
                    </span>
                  ) : viewMode === 'active' && !consultation.is_deleted ? (
                    <button
                      onClick={() => onPayment?.(consultation)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Créer une facture"
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#059669';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <CreditCard size={14} />
                      Facturer
                    </button>
                  ) : (
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}>
                      Non applicable
                    </span>
                  )}
                </td>

                {viewMode === 'archived' && (
                  <td style={{ 
                    padding: '15px 20px',
                    fontSize: '14px',
                    color: '#475569'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="#64748b" />
                      {consultation.deleted_at 
                        ? formatDate(consultation.deleted_at)
                        : '-'
                      }
                    </div>
                  </td>
                )}

                <td style={{ 
                  padding: '15px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    justifyContent: 'center', 
                    flexWrap: 'nowrap'
                  }}>
                    {!consultation.is_deleted ? (
                      <>
                        <button
                          onClick={() => onDetail?.(consultation)}
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
                        
                        <button
                          onClick={() => onEdit?.(consultation)}
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
                          title="Modifier"
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
                        
                        <button
                          onClick={() => onDelete?.(consultation)}
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
                        <button
                          onClick={() => onRestore?.(consultation)}
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

                        <button
                          onClick={() => onPermanentDelete?.(consultation)}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}