import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Search, Printer, Trash2, Download, RefreshCw,
  Calendar, CreditCard, X, DollarSign, Archive, Filter,
  TrendingUp, Wallet
} from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import RestoreModal from '../components/RestoreModal';
import PermanentDeleteModal from '../components/PermanentDeleteModal';
import MessageAlert from '../components/MessageAlert';
import factureService from '../services/factureService';
import './FacturesPage.css';
import { useHeader } from '../components/HeaderContext';

const FacturesPage = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);

  const [statistics, setStatistics] = useState({
    total_montant: 0,
    nombre_factures: 0,
    montant_moyen: 0
  });

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader('Paiements', DollarSign);
  }, [setHeader]);

  useEffect(() => {
    fetchData();
    fetchStatistics();
  }, [viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data;
      if (viewMode === 'active') {
        data = await factureService.getAllActive();
      } else if (viewMode === 'archived') {
        data = await factureService.getAllArchived();
      }
      setFactures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await factureService.getStatistics(viewMode);
      setStatistics(stats);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const filteredFactures = factures.filter(facture => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      facture.motif?.toLowerCase().includes(searchLower) ||
      facture.patient_nom?.toLowerCase().includes(searchLower) ||
      facture.patient_prenom?.toLowerCase().includes(searchLower) ||
      facture.id?.toString().includes(searchLower) ||
      facture.montant?.toString().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Patient', 'Date', 'Motif', 'Montant (F CFA)', 'Notes', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...filteredFactures.map(f => [
        f.id,
        `"${f.patient_prenom} ${f.patient_nom}"`,
        new Date(f.date).toLocaleDateString('fr-FR'),
        `"${f.motif}"`,
        f.montant,
        `"${f.notes || ''}"`,
        f.is_deleted ? 'Archivé' : 'Actif'
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const response = await factureService.archive(deleteTarget.id);
      await fetchData();
      await fetchStatistics();
      setMessage(response.message || 'Paiement archivé avec succès');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      setError('Erreur lors de l\'archivage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const response = await factureService.restore(restoreTarget.id);
      await fetchData();
      await fetchStatistics();
      setMessage(response.message || 'Paiement restauré avec succès');
      setIsRestoreModalOpen(false);
      setRestoreTarget(null);
    } catch (error) {
      setError('Erreur lors de la restauration');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setActionLoading(true);
    try {
      await factureService.permanentDelete(permanentDeleteTarget.id);
      await fetchData();
      await fetchStatistics();
      setMessage('Paiement supprimé définitivement');
      setIsPermanentDeleteModalOpen(false);
      setPermanentDeleteTarget(null);
    } catch (error) {
      setError('Erreur lors de la suppression définitive');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (facture) => {
    setDeleteTarget({
      id: facture.id,
      nom: `${facture.patient_prenom} ${facture.patient_nom} - ${formatAmount(facture.montant)}`,
      prenom: ''
    });
    setIsDeleteModalOpen(true);
  };

  const openRestoreModal = (facture) => {
    setRestoreTarget({
      id: facture.id,
      nom: `${facture.patient_prenom} ${facture.patient_nom} - ${formatAmount(facture.montant)}`,
      prenom: ''
    });
    setIsRestoreModalOpen(true);
  };

  const openPermanentDeleteModal = (facture) => {
    setPermanentDeleteTarget({
      id: facture.id,
      nom: `${facture.patient_prenom} ${facture.patient_nom} - ${formatAmount(facture.montant)}`,
      prenom: ''
    });
    setIsPermanentDeleteModalOpen(true);
  };

  const openDetailModal = (facture) => {
    setSelectedFacture(facture);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedFacture(null);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Paiement #${selectedFacture.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
            .title { font-size: 28px; margin-bottom: 5px; color: #10b981; }
            .info-item { margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px; }
            .info-label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
            .info-value { font-size: 16px; color: #333; }
            .amount-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
            .amount { font-size: 32px; fontWeight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">REÇU DE PAIEMENT</h1>
            <p>Paiement N° ${selectedFacture.id}</p>
          </div>
          <div class="info-item">
            <span class="info-label">👤 Patient</span>
            <div class="info-value">${selectedFacture.patient_prenom} ${selectedFacture.patient_nom}</div>
          </div>
          <div class="info-item">
            <span class="info-label">📅 Date</span>
            <div class="info-value">${new Date(selectedFacture.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div class="info-item">
            <span class="info-label">📋 Motif</span>
            <div class="info-value">${selectedFacture.motif}</div>
          </div>
          ${selectedFacture.notes ? `<div class="info-item"><span class="info-label">📝 Notes</span><div class="info-value">${selectedFacture.notes}</div></div>` : ''}
          <div class="amount-box">
            <div style="font-size: 14px; margin-bottom: 10px;">MONTANT PAYÉ</div>
            <div class="amount">${parseFloat(selectedFacture.montant).toLocaleString('fr-FR')} F CFA</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return parseFloat(amount).toLocaleString('fr-FR') + ' F CFA';
  };

  const activeCount = factures.filter(f => !f.is_deleted).length;
  const archivedCount = factures.filter(f => f.is_deleted).length;

  return (
    <div className="factures-page">
      {message && <MessageAlert message={message} type="success" onClose={() => setMessage(null)} />}
      {error && <MessageAlert message={error} type="error" onClose={() => setError(null)} />}

      

      <div style={{ display: 'flex', gap: '10px', padding: '15px 20px', background: 'white', borderRadius: '12px', marginBottom: '20px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
        <Filter size={18} color="#7f8c8d" />
        <button onClick={() => setViewMode('active')} style={{ padding: '10px 20px', border: viewMode === 'active' ? '2px solid #10b981' : '2px solid #e0e0e0', backgroundColor: viewMode === 'active' ? '#d1fae5' : 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: viewMode === 'active' ? '600' : '400', color: viewMode === 'active' ? '#059669' : '#333', transition: 'all 0.2s', fontSize: '14px' }}>
          <DollarSign size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
          Actifs ({activeCount})
        </button>
        <button onClick={() => setViewMode('archived')} style={{ padding: '10px 20px', border: viewMode === 'archived' ? '2px solid #f59e0b' : '2px solid #e0e0e0', backgroundColor: viewMode === 'archived' ? '#fef3c7' : 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: viewMode === 'archived' ? '600' : '400', color: viewMode === 'archived' ? '#d97706' : '#333', transition: 'all 0.2s', fontSize: '14px' }}>
          <Archive size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
          Archivés ({archivedCount})
        </button>
        <button onClick={exportToCSV} style={{ marginLeft: 'auto', padding: '10px 20px', border: '2px solid #6366f1', backgroundColor: '#eef2ff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#4f46e5', transition: 'all 0.2s', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={16} />
          Exporter CSV
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="clear-search">×</button>}
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="spinner"></div><p>Chargement...</p></div>
        ) : filteredFactures.length === 0 ? (
          <div className="empty-state">
            {viewMode === 'archived' ? <><Archive size={48} style={{ opacity: 0.3 }} /><p>Aucun paiement archivé</p></> : <><FileText size={48} style={{ opacity: 0.3 }} /><p>Aucun paiement</p></>}
          </div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Motif</th>
                <th>Montant</th>
                {viewMode === 'archived' && <th>Archivé le</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFactures.map((f, i) => (
                <tr key={f.id} style={{ backgroundColor: f.is_deleted ? (i % 2 === 0 ? '#fff9e6' : '#fffbf0') : 'transparent' }}>
                  <td className="cell-id">{f.id}</td>
                  <td className="cell-patient">
                    <span className="patient-name">
                      {f.patient_prenom} {f.patient_nom}
                      {f.is_deleted && <span style={{ marginLeft: '8px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '500' }}>ARCHIVÉ</span>}
                    </span>
                  </td>
                  <td className="cell-date"><Calendar size={14} style={{ marginRight: '6px' }} />{formatDate(f.date)}</td>
                  <td className="cell-motif">{f.motif}</td>
                  <td className="cell-amount"><CreditCard size={14} style={{ marginRight: '6px' }} />{formatAmount(f.montant)}</td>
                  {viewMode === 'archived' && <td className="cell-date">{f.deleted_at ? new Date(f.deleted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>}
                  <td className="cell-actions">
                    <div className="action-buttons">
                      {!f.is_deleted ? (
                        <>
                          <button onClick={() => openDetailModal(f)} className="btn-icon" title="Imprimer"><Printer size={16} /></button>
                          <button onClick={() => openDeleteModal(f)} className="btn-icon btn-delete" title="Archiver"><Archive size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openRestoreModal(f)} style={{ padding: '6px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#065f46', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={14} />Restaurer</button>
                          <button onClick={() => openPermanentDeleteModal(f)} style={{ padding: '6px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#991b1b', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14} />Supprimer</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDetailModal && selectedFacture && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Paiement #{selectedFacture.id}</h2>
              <button onClick={closeDetailModal} className="close-button"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="simple-details">
                <div className="detail-item"><span className="detail-label">Patient:</span><span>{selectedFacture.patient_prenom} {selectedFacture.patient_nom}</span></div>
                <div className="detail-item"><span className="detail-label">Date:</span><span>{formatDate(selectedFacture.date)}</span></div>
                <div className="detail-item"><span className="detail-label">Motif:</span><span>{selectedFacture.motif}</span></div>
                <div className="detail-item highlight"><span className="detail-label">Montant:</span><span className="amount-highlight">{formatAmount(selectedFacture.montant)}</span></div>
                {selectedFacture.notes && <div className="detail-item"><span className="detail-label">Notes:</span><span>{selectedFacture.notes}</span></div>}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeDetailModal} className="btn btn-secondary">Fermer</button>
              <button onClick={handlePrint} className="btn btn-primary"><Printer size={18} />Imprimer</button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal isOpen={isDeleteModalOpen} target={deleteTarget} onDelete={handleArchive} onClose={() => setIsDeleteModalOpen(false)} loading={actionLoading} />
      <RestoreModal isOpen={isRestoreModalOpen} target={restoreTarget} onRestore={handleRestore} onClose={() => setIsRestoreModalOpen(false)} loading={actionLoading} />
      <PermanentDeleteModal isOpen={isPermanentDeleteModalOpen} target={permanentDeleteTarget} onDelete={handlePermanentDelete} onClose={() => setIsPermanentDeleteModalOpen(false)} loading={actionLoading} />
    </div>
  );
};

export default FacturesPage;