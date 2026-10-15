import React from 'react';
import { Eye, Edit, Trash2, CreditCard, CheckCircle } from 'lucide-react';

export default function PrescriptionTable({ prescriptions, patientsMap, factures = [], onEdit, onDelete, onDetail, onPayment }) {
  const getPatientName = (prescription) => {
    if (prescription.patient_prenom && prescription.patient_nom) {
      return `${prescription.patient_prenom} ${prescription.patient_nom}`;
    }
    const patient = patientsMap[prescription.patient];
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  };

  const hasFacture = (prescription) => {
    if (!factures || factures.length === 0) return false;
    const pid   = String(prescription.id);
    const patId = String(prescription.patient);
    return factures.some(f => {
      // Correspondance directe par ID de prescription
      if (String(f.prescription_id) === pid) return true;
      if (String(f.prescription)    === pid) return true;
      // Fallback : motif contient le tag [PRESC-ID]
      if (f.motif && f.motif.includes(`[PRESC-${pid}]`)) return true;
      // Fallback large : même patient + motif contient l'ID
      if ((String(f.patient_id) === patId || String(f.patient) === patId)
          && f.motif && f.motif.includes(pid)) return true;
      return false;
    });
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Patient</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Détails</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Paiement</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription, index) => {
            const paid = hasFacture(prescription);
            return (
              <tr key={prescription.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <td style={tdStyle}>{index + 1}</td>

                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '600', fontSize: '16px', flexShrink: 0
                    }}>
                      {getPatientName(prescription).charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>{getPatientName(prescription)}</span>
                  </div>
                </td>

                <td style={tdStyle}>
                  <span style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                    background: prescription.type_prescription === 'ordonnance' ? '#eff6ff' : '#f3e8ff',
                    color: prescription.type_prescription === 'ordonnance' ? '#3b82f6' : '#9333ea'
                  }}>
                    {prescription.type_prescription === 'ordonnance' ? 'Ordonnance' : 'Examen'}
                  </span>
                </td>

                <td style={{ ...tdStyle, color: '#64748b' }}>
                  {prescription.type_prescription === 'ordonnance'
                    ? `${prescription.produit_nom} (${prescription.quantite})`
                    : prescription.examen_nom}
                </td>

                <td style={{ ...tdStyle, color: '#64748b', fontWeight: '500' }}>
                  {new Date(prescription.date_prescription).toLocaleDateString('fr-FR')}
                </td>

                {/* ── Colonne Paiement ── */}
                <td style={tdStyle}>
                  {paid ? (
                    <span style={{
                      backgroundColor: '#f0fdf4', color: '#10b981',
                      padding: '6px 14px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: '600',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <CheckCircle size={14} />
                      Payé
                    </span>
                  ) : (
                    <button
                      onClick={() => onPayment?.(prescription)}
                      style={{
                        background: '#10b981', color: 'white', border: 'none',
                        padding: '7px 12px', borderRadius: '8px', fontSize: '12px',
                        fontWeight: '500', display: 'inline-flex', alignItems: 'center',
                        gap: '6px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      title="Facturer cette prescription"
                      onMouseOver={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <CreditCard size={14} />
                      Facturer
                    </button>
                  )}
                </td>

                {/* ── Actions ── */}
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => onDetail(prescription)} style={btnStyle('#eff6ff', '#3b82f6')} title="Voir les détails">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => onEdit(prescription)} style={btnStyle('#f0fdf4', '#10b981')} title="Modifier">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(prescription.id)} style={btnStyle('#fef2f2', '#ef4444')} title="Supprimer">
                      <Trash2 size={16} />
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
}

const thStyle = {
  background: '#f8fafc', padding: '16px', textAlign: 'left',
  fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0'
};

const tdStyle = { padding: '16px', color: '#6b7280', fontWeight: '500' };

const btnStyle = (bg, color) => ({
  padding: '8px', border: 'none', borderRadius: '8px',
  cursor: 'pointer', background: bg, color,
  display: 'flex', alignItems: 'center', transition: 'opacity 0.2s'
});