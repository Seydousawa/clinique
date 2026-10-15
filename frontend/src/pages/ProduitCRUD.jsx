import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import MessageAlert from '../components/MessageAlert';
import './ProduitCRUD.css';
import DeleteModal from '../components/DeleteModal';

const API_URL = 'http://127.0.0.1:8000/api/produits/';


export default function ProduitCRUD() {
  // État des données
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // État du modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    id_produit: '',
    designation: '',
    prix: '',
    quantite: '',
    quantite_stock: '',
    stock_minimum: '',
    date_expiration: '',
    actif: true
  });
  
  const [errors, setErrors] = useState({});

  // Charger les produits au montage
  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setProduits(Array.isArray(data) ? data : []);
      } else {
        setError('Erreur lors du chargement des produits');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id_produit.trim()) newErrors.id_produit = 'L\'ID du produit est requis';
    if (!formData.designation.trim()) newErrors.designation = 'La désignation est requise';
    if (!formData.prix || isNaN(formData.prix)) newErrors.prix = 'Le prix est requis et doit être un nombre';
    if (!formData.quantite || isNaN(formData.quantite)) newErrors.quantite = 'La quantité est requise';
    if (!formData.quantite_stock || isNaN(formData.quantite_stock)) newErrors.quantite_stock = 'La quantité en stock est requise';
    if (!formData.stock_minimum || isNaN(formData.stock_minimum)) newErrors.stock_minimum = 'Le stock minimum est requis';
    if (!formData.date_expiration) newErrors.date_expiration = 'La date d\'expiration est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddProduit = () => {
    setFormData({
      id_produit: '',
      designation: '',
      prix: '',
      quantite: '',
      quantite_stock: '',
      stock_minimum: '',
      date_expiration: '',
      actif: true
    });
    setIsEditMode(false);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEditProduit = (produit) => {
    setFormData({
      id_produit: produit.id_produit,
      designation: produit.designation,
      prix: produit.prix,
      quantite: produit.quantite,
      quantite_stock: produit.quantite_stock,
      stock_minimum: produit.stock_minimum,
      date_expiration: produit.date_expiration,
      actif: produit.actif
    });
    setSelectedProduit(produit);
    setIsEditMode(true);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCreateProduit = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const payload = {
        id_produit: parseInt(formData.id_produit),
        designation: formData.designation,
        prix: parseInt(formData.prix),
        quantite: parseInt(formData.quantite),
        quantite_stock: parseInt(formData.quantite_stock),
        stock_minimum: parseInt(formData.stock_minimum),
        date_expiration: formData.date_expiration,
        actif: formData.actif
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || JSON.stringify(responseData));
      }

      console.log('✅ Produit créé:', responseData);
      setProduits(prev => [...prev, responseData]);
      setMessage('Produit créé avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur création:', err);
      setError(`Erreur lors de la création: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateProduit = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const payload = {
        id_produit: parseInt(formData.id_produit),
        designation: formData.designation,
        prix: parseInt(formData.prix),
        quantite: parseInt(formData.quantite),
        quantite_stock: parseInt(formData.quantite_stock),
        stock_minimum: parseInt(formData.stock_minimum),
        date_expiration: formData.date_expiration,
        actif: formData.actif
      };

      const response = await fetch(`${API_URL}${selectedProduit.id_produit}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || JSON.stringify(responseData));
      }

      console.log('✅ Produit modifié:', responseData);
      setProduits(prev =>
        prev.map(p => p.id_produit === selectedProduit.id_produit ? responseData : p)
      );
      setMessage('Produit modifié avec succès');
      closeModal();
    } catch (err) {
      console.error('Erreur modification:', err);
      setError(`Erreur lors de la modification: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduit = async (id) => {
    if (!window.confirm('Confirmez-vous la suppression de ce produit ?')) return;

    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      console.log('✅ Produit supprimé');
      setProduits(prev => prev.filter(p => p.id_produit !== id));
      setMessage('Produit supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError('Erreur lors de la suppression');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      id_produit: '',
      designation: '',
      prix: '',
      quantite: '',
      quantite_stock: '',
      stock_minimum: '',
      date_expiration: '',
      actif: true
    });
    setErrors({});
  };

  const isStockInsuffisant = (produit) => {
    return produit.quantite_stock <= produit.stock_minimum;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

  return (
    <div className="produit-container">
      {message && (
        <MessageAlert
          message={message}
          type="success"
          onClose={() => setMessage(null)}
        />
      )}
      {error && (
        <MessageAlert
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      <div className="produit-card">
        <div className="card-header">
          <div className="header-left">
            <h2 className="card-title">Gestion des Produits</h2>
            <span className="count-badge">{produits.length}</span>
          </div>
          <button onClick={handleAddProduit} className="add-button">
            <Plus size={18} />
            Ajouter un Produit
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement des produits...</div>
        ) : produits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>Aucun produit</h3>
            <p>Aucun produit n'a été enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="produits-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Désignation</th>
                  <th>Prix</th>
                  <th>Quantité</th>
                  <th>Stock</th>
                  <th>Min</th>
                  <th>Expiration</th>
                  <th>État</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((produit, index) => (
                  <tr key={produit.id_produit} className="table-row">
                    <td className="row-number">{index + 1}</td>
                    <td className="designation-cell">{produit.designation}</td>
                    <td className="price-cell">{formatPrice(produit.prix)}</td>
                    <td className="quantity-cell">{produit.quantite}</td>
                    <td className={`stock-cell ${isStockInsuffisant(produit) ? 'low-stock' : ''}`}>
                      {produit.quantite_stock}
                    </td>
                    <td className="min-cell">{produit.stock_minimum}</td>
                    <td className="date-cell">{formatDate(produit.date_expiration)}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${produit.actif ? 'active' : 'inactive'}`}>
                        {produit.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditProduit(produit)}
                          className="btn btn-edit"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduit(produit.id_produit)}
                          className="btn btn-delete"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                {isEditMode ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
              </h3>
              <button onClick={closeModal} className="close-button">×</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="id_produit">ID Produit *</label>
                  <input
                    type="number"
                    id="id_produit"
                    name="id_produit"
                    value={formData.id_produit}
                    onChange={handleInputChange}
                    placeholder="Ex: 1"
                    className={errors.id_produit ? 'input-error' : ''}
                    disabled={isEditMode}
                  />
                  {errors.id_produit && <span className="error-text">{errors.id_produit}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="designation">Désignation *</label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Ex: Amoxicilline 500mg"
                    className={errors.designation ? 'input-error' : ''}
                  />
                  {errors.designation && <span className="error-text">{errors.designation}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="prix">Prix (FCFA) *</label>
                  <input
                    type="number"
                    id="prix"
                    name="prix"
                    value={formData.prix}
                    onChange={handleInputChange}
                    placeholder="Ex: 1500"
                    className={errors.prix ? 'input-error' : ''}
                  />
                  {errors.prix && <span className="error-text">{errors.prix}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="quantite"> Quantité *</label>
                  <input
                    type="number"
                    id="quantite"
                    name="quantite"
                    value={formData.quantite}
                    onChange={handleInputChange}
                    placeholder="Ex: 100"
                    className={errors.quantite ? 'input-error' : ''}
                  />
                  {errors.quantite && <span className="error-text">{errors.quantite}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="quantite_stock">Quantité en Stock *</label>
                  <input
                    type="number"
                    id="quantite_stock"
                    name="quantite_stock"
                    value={formData.quantite_stock}
                    onChange={handleInputChange}
                    placeholder="Ex: 50"
                    className={errors.quantite_stock ? 'input-error' : ''}
                  />
                  {errors.quantite_stock && <span className="error-text">{errors.quantite_stock}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="stock_minimum">Stock Minimum *</label>
                  <input
                    type="number"
                    id="stock_minimum"
                    name="stock_minimum"
                    value={formData.stock_minimum}
                    onChange={handleInputChange}
                    placeholder="Ex: 10"
                    className={errors.stock_minimum ? 'input-error' : ''}
                  />
                  {errors.stock_minimum && <span className="error-text">{errors.stock_minimum}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="date_expiration">Date d'Expiration *</label>
                  <input
                    type="date"
                    id="date_expiration"
                    name="date_expiration"
                    value={formData.date_expiration}
                    onChange={handleInputChange}
                    className={errors.date_expiration ? 'input-error' : ''}
                  />
                  {errors.date_expiration && <span className="error-text">{errors.date_expiration}</span>}
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor="actif">
                    <input
                      type="checkbox"
                      id="actif"
                      name="actif"
                      checked={formData.actif}
                      onChange={handleInputChange}
                    />
                    Produit Actif
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-cancel">
                Annuler
              </button>
              <button
                onClick={isEditMode ? handleUpdateProduit : handleCreateProduit}
                disabled={submitLoading}
                className="btn btn-submit"
              >
                {submitLoading ? 'Traitement...' : isEditMode ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
        
      )}

      <style jsx>{`
      
        .produit-container {
          padding: 20px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .produit-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .count-badge {
          background: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .add-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .add-button:hover {
          background: #059669;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .produits-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .produits-table th {
          background: #f8fafc;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .produits-table td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .table-row:hover {
          background-color: #f8fafc;
        }

        .row-number {
          font-weight: 500;
          color: #6b7280;
          text-align: center;
        }

        .price-cell {
          color: #10b981;
          font-weight: 600;
        }

        .stock-cell {
          font-weight: 500;
        }

        .stock-cell.low-stock {
          color: #ef4444;
          background: #fef2f2;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .status-cell {
          text-align: center;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .actions-cell {
          text-align: center;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .btn {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-edit {
          background: #f0fdf4;
          color: #10b981;
        }

        .btn-edit:hover {
          background: #10b981;
          color: white;
        }

        .btn-delete {
          background: #fef2f2;
          color: #ef4444;
        }

        .btn-delete:hover {
          background: #ef4444;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.checkbox-group {
          grid-column: 1 / -1;
          flex-direction: row;
          align-items: center;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .form-group input {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-group input.input-error {
          border-color: #ef4444;
        }

        .form-group input:disabled {
          background: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
        }

        .form-group.checkbox-group input {
          width: auto;
          margin-right: 8px;
        }

        .error-text {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-cancel {
          background: #e2e8f0;
          color: #374151;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-cancel:hover {
          background: #cbd5e1;
        }

        .btn-submit {
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          background: #059669;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }

          .produits-table th,
          .produits-table td {
            padding: 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
