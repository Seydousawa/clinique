import React from 'react';
import { ScanEye, FilePenLine, Trash2 } from 'lucide-react';

const RendezVousTable = ({ rendezvous, loading, onEdit, onDelete, onDetail, patientsMap }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '15px', color: '#6b7280' }}>Chargement...</p>
      </div>
    );
  }

  if (!rendezvous || rendezvous.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Aucun rendez-vous trouvé
      </div>
    );
  }

  const getStatutDisplay = (statut) => {
    const statutMap = {
      'programme': { label: 'Programmé', color: '#3b82f6', bgColor: '#dbeafe' },
      'confirme':  { label: 'Confirmé',  color: '#059669', bgColor: '#d1fae5' },
      'annule':    { label: 'Annulé',    color: '#dc2626', bgColor: '#fee2e2' },
      'termine':   { label: 'Terminé',   color: '#7c3aed', bgColor: '#ede9fe' }
    };
    return statutMap[statut] || { label: statut, color: '#6b7280', bgColor: '#f3f4f6' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatientFullName = (rdv) => {
    if (rdv.patient_details) {
      const p = rdv.patient_details;
      return `${p.prenom || ''} ${p.nom || ''}`.trim();
    }
    if (rdv.patient_nom && rdv.patient_prenom) return `${rdv.patient_prenom} ${rdv.patient_nom}`;
    if (rdv.patient_nom) return rdv.patient_nom;
    if (patientsMap && rdv.patient && patientsMap[rdv.patient]) {
      const p = patientsMap[rdv.patient];
      return `${p.prenom || ''} ${p.nom || ''}`.trim();
    }
    return `Patient #${rdv.patient}`;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Patient</th>
            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Date et Heure</th>
            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Motif</th>
            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Statut</th>
            <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rendezvous.map((rdv, index) => {
            const statut = getStatutDisplay(rdv.statut);
            const patientFullName = getPatientFullName(rdv);

            return (
              <tr
                key={rdv.id}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                }}
              >
                <td style={{ padding: '15px', color: '#334155', fontWeight: '500' }}>
                  {patientFullName}
                </td>

                <td style={{ padding: '15px', color: '#334155' }}>
                  {formatDate(rdv.date_rdv)}
                </td>

                <td style={{ padding: '15px', color: '#334155' }}>
                  {rdv.motif || 'N/A'}
                </td>

                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: statut.bgColor,
                    color: statut.color
                  }}>
                    {statut.label}
                  </span>
                </td>

                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <div className="action-buttons">

                    <button
                      onClick={() => onDetail(rdv)}
                      className="btn btn-view"
                      title="Voir les détails"
                    >
                      <ScanEye size={13} />
                    </button>

                    <button
                      onClick={() => onEdit(rdv)}
                      className="btn btn-edit"
                      title="Modifier"
                    >
                      <FilePenLine size={13} />
                    </button>

                    <button
                      onClick={() => onDelete(rdv)}
                      className="btn btn-delete"
                      title="Supprimer"
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
  );
};

export default RendezVousTable;