import React from 'react';
import { X, User, Pill, Calendar, ClipboardList, Hash, FlaskConical, FileText } from 'lucide-react';

export default function PrescriptionDetailModal({
  prescription,
  patientsMap,
  produitsMap,
  consultationsMap,
  onClose,
  onEdit
}) {
  if (!prescription) return null;

  const patient = patientsMap
    ? (patientsMap[String(prescription.patient)] || patientsMap[prescription.patient])
    : null;

  const produit = produitsMap
    ? (produitsMap[String(prescription.produit)] || produitsMap[prescription.produit])
    : null;

  const consultation = consultationsMap
    ? (consultationsMap[String(prescription.consultation)] || consultationsMap[prescription.consultation])
    : null;

  const isOrdonnance = prescription.type_prescription === 'ordonnance';
  const isExamen     = prescription.type_prescription === 'examen';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return dateString; }
  };

  const patientNom = patient
    ? `${patient.prenom} ${patient.nom}`
    : (prescription.patient_nom_complet ||
       `${prescription.patient_prenom || ''} ${prescription.patient_nom || ''}`.trim() ||
       `Patient #${prescription.patient}`);

  const patientInitials = patient
    ? `${patient.prenom?.charAt(0) || ''}${patient.nom?.charAt(0) || ''}`
    : (patientNom?.substring(0, 2).toUpperCase() || 'P');

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        @keyframes prescModal-backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes prescModal-slideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes prescModal-fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .presc-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 20px;
          animation: prescModal-backdropIn 0.2s ease;
        }
        .presc-modal-content {
          background: white;
          border-radius: 16px;
          width: 100%; max-width: 720px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1);
          animation: prescModal-slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        .presc-modal-content::-webkit-scrollbar { width: 6px; }
        .presc-modal-content::-webkit-scrollbar-track { background: #f1f5f9; }
        .presc-modal-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

        .presc-modal-header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 24px 28px;
          border-radius: 16px 16px 0 0;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .presc-modal-close {
          background: rgba(255,255,255,0.2);
          border: none; color: white;
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          font-size: 20px; line-height: 1;
        }
        .presc-modal-close:hover { background: rgba(255,255,255,0.35); transform: rotate(90deg); }

        .presc-patient-header {
          display: flex; align-items: center; gap: 20px;
          padding: 24px 28px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
        }
        .presc-patient-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 22px; font-weight: 700;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          flex-shrink: 0;
        }

        .presc-section {
          padding: 20px 28px;
          border-bottom: 1px solid #f1f5f9;
          animation: prescModal-fadeIn 0.3s ease both;
        }
        .presc-section:last-of-type { border-bottom: none; }
        .presc-section:nth-child(2) { animation-delay: 0.05s; }
        .presc-section:nth-child(3) { animation-delay: 0.10s; }
        .presc-section:nth-child(4) { animation-delay: 0.15s; }
        .presc-section:nth-child(5) { animation-delay: 0.20s; }

        .presc-section-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 15px; font-weight: 700; color: #1e293b;
          margin: 0 0 16px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #f1f5f9;
        }
        .presc-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .presc-info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          transition: all 0.2s;
        }
        .presc-info-card:hover {
          background: #f0f9ff;
          border-color: #bae6fd;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .presc-info-card.full-width { grid-column: 1 / -1; }
        .presc-info-label {
          font-size: 11px; color: #64748b;
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .presc-info-value {
          font-size: 14px; color: #1e293b; font-weight: 600;
        }

        .presc-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 13px; font-weight: 600;
        }
        .presc-badge-green  { background: #dcfce7; color: #166534; }
        .presc-badge-blue   { background: #dbeafe; color: #1d4ed8; }
        .presc-badge-orange { background: #fff7ed; color: #c2410c; }
        .presc-badge-qty    { background: #dcfce7; color: #166534; padding: 4px 14px; }

        .presc-modal-footer {
          padding: 16px 28px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-radius: 0 0 16px 16px;
          display: flex; justify-content: flex-end; gap: 12px;
        }
        .presc-btn-cancel {
          padding: 10px 24px; border: 1px solid #d1d5db;
          background: white; border-radius: 8px; cursor: pointer;
          font-weight: 600; color: #374151; font-size: 14px;
          transition: all 0.2s;
        }
        .presc-btn-cancel:hover { background: #f3f4f6; border-color: #9ca3af; }
        .presc-btn-edit {
          padding: 10px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white; border: none; border-radius: 8px;
          cursor: pointer; font-weight: 600; font-size: 14px;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }
        .presc-btn-edit:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
      `}</style>

      {/* ── Overlay ── */}
      <div className="presc-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="presc-modal-content">

          {/* ── Header ── */}
          <div className="presc-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px' }}>
                <Pill size={22} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'white' }}>
                  Détails de la Prescription
                </h3>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                  #{prescription.id} · {isOrdonnance ? 'Ordonnance' : isExamen ? 'Examen médical' : prescription.type_prescription}
                </div>
              </div>
            </div>
            <button className="presc-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* ── Patient header ── */}
          <div className="presc-patient-header">
            <div className="presc-patient-avatar">{patientInitials}</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{patientNom}</div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span className="presc-badge presc-badge-green">
                  {isOrdonnance ? <Pill size={13} /> : <FlaskConical size={13} />}
                  {isOrdonnance ? 'Ordonnance' : isExamen ? 'Examen' : prescription.type_prescription}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  {formatDate(prescription.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Section : Infos prescription ── */}
          <div className="presc-section">
            <h4 className="presc-section-title">
              <Hash size={16} color="#10b981" /> Informations Prescription
            </h4>
            <div className="presc-info-grid">
              <div className="presc-info-card">
                <div className="presc-info-label">Type</div>
                <div className="presc-info-value">
                  {isOrdonnance ? '🩺 Ordonnance' : isExamen ? '🔬 Examen médical' : prescription.type_prescription}
                </div>
              </div>
              <div className="presc-info-card">
                <div className="presc-info-label">Date de création</div>
                <div className="presc-info-value" style={{ fontSize: 13 }}>{formatDate(prescription.created_at)}</div>
              </div>
              {prescription.notes && (
                <div className="presc-info-card full-width">
                  <div className="presc-info-label">Notes</div>
                  <div style={{ fontSize: 14, color: '#475569', fontWeight: 400, lineHeight: 1.6 }}>{prescription.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Section : Patient ── */}
          <div className="presc-section">
            <h4 className="presc-section-title">
              <User size={16} color="#0ea5e9" /> Informations Patient
            </h4>
            <div className="presc-info-grid">
              <div className="presc-info-card">
                <div className="presc-info-label">Nom Complet</div>
                <div className="presc-info-value">{patientNom}</div>
              </div>
              {patient?.telephone && (
                <div className="presc-info-card">
                  <div className="presc-info-label">Téléphone</div>
                  <div className="presc-info-value">{patient.telephone}</div>
                </div>
              )}
              {patient?.email && (
                <div className="presc-info-card">
                  <div className="presc-info-label">Email</div>
                  <div style={{ fontSize: 13, color: '#0ea5e9', fontWeight: 600 }}>{patient.email}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Section : Ordonnance (médicament) ── */}
          {isOrdonnance && (
            <div className="presc-section">
              <h4 className="presc-section-title">
                <Pill size={16} color="#f59e0b" /> Médicament Prescrit
              </h4>
              <div className="presc-info-grid">
                <div className="presc-info-card full-width">
                  <div className="presc-info-label">Désignation</div>
                  <div className="presc-info-value" style={{ color: '#92400e' }}>
                    {produit?.designation || prescription.produit_nom || `Produit #${prescription.produit}`}
                  </div>
                </div>
                <div className="presc-info-card">
                  <div className="presc-info-label">Quantité</div>
                  <div>
                    <span className="presc-badge presc-badge-qty">x{prescription.quantite ?? 'N/A'}</span>
                  </div>
                </div>
                {produit?.prix_unitaire && (
                  <div className="presc-info-card">
                    <div className="presc-info-label">Prix Unitaire</div>
                    <div className="presc-info-value">{produit.prix_unitaire} F CFA</div>
                  </div>
                )}
                {prescription.posologie && (
                  <div className="presc-info-card full-width">
                    <div className="presc-info-label">Posologie</div>
                    <div style={{ fontSize: 14, color: '#475569', fontWeight: 400, lineHeight: 1.6 }}>{prescription.posologie}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Section : Examen ── */}
          {isExamen && (
            <div className="presc-section">
              <h4 className="presc-section-title">
                <FlaskConical size={16} color="#f59e0b" /> Examen Médical
              </h4>
              <div className="presc-info-grid">
                <div className="presc-info-card full-width">
                  <div className="presc-info-label">Nom de l'examen</div>
                  <div className="presc-info-value" style={{ color: '#92400e' }}>{prescription.examen_nom || 'N/A'}</div>
                </div>
                {prescription.instructions && (
                  <div className="presc-info-card full-width">
                    <div className="presc-info-label">Instructions</div>
                    <div style={{ fontSize: 14, color: '#475569', fontWeight: 400, lineHeight: 1.6 }}>{prescription.instructions}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Section : Consultation liée ── */}
          <div className="presc-section">
            <h4 className="presc-section-title">
              <ClipboardList size={16} color="#16a34a" /> Consultation Liée
            </h4>
            {consultation ? (
              <div className="presc-info-grid">
                <div className="presc-info-card">
                  <div className="presc-info-label">Date</div>
                  <div className="presc-info-value" style={{ fontSize: 13 }}>
                    {formatDate(consultation.date_consultation)}
                  </div>
                </div>
                <div className="presc-info-card">
                  <div className="presc-info-label">Symptôme / Motif</div>
                  <div className="presc-info-value">{consultation.symptome || consultation.motif || 'N/A'}</div>
                </div>
                {consultation.diagnostic && (
                  <div className="presc-info-card full-width">
                    <div className="presc-info-label">Diagnostic</div>
                    <div style={{ fontSize: 14, color: '#475569', fontWeight: 400, lineHeight: 1.6 }}>{consultation.diagnostic}</div>
                  </div>
                )}
              </div>
            ) : prescription.consultation_nom ? (
              <div className="presc-info-card">
                <div className="presc-info-label">Description</div>
                <div className="presc-info-value">{prescription.consultation_nom}</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
                <FileText size={24} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px' }} />
                Aucune consultation liée
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="presc-modal-footer">
            <button className="presc-btn-cancel" onClick={onClose}>Fermer</button>
            {onEdit && (
              <button className="presc-btn-edit" onClick={() => { onEdit(prescription); onClose(); }}>
                ✏️ Modifier
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}