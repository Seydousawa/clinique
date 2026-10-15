import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Check } from 'lucide-react';

const PRODUITS_API = 'http://127.0.0.1:8000/api/produits/';

export default function DistributionInterface() {
  // État des données
  const [produits, setProduits] = useState([]);
  const [distributions, setDistributions] = useState([]);

  // État des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    produit_id: '',
    designation: '',
    quantite_distribuee: '',
    destination: '',
    date_distribution: new Date().toISOString().split('T')[0],
    responsable: '',
    observations: ''
  });

  // État des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');

  // État des messages
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Charger les produits au montage
  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const response = await fetch(PRODUITS_API);
      if (response.ok) {
        const data = await response.json();
        const produitsData = Array.isArray(data) ? data : data.results || [];
        setProduits(produitsData);
        console.log('✅ Produits chargés:', produitsData);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.produit_id) newErrors.produit_id = 'Le produit est requis';
    if (!formData.quantite_distribuee || formData.quantite_distribuee <= 0) {
      newErrors.quantite_distribuee = 'Quantité valide requise';
    }
    if (!formData.destination) newErrors.destination = 'La destination est requise';
    if (!formData.date_distribution) newErrors.date_distribution = 'La date est requise';
    if (!formData.responsable) newErrors.responsable = 'Le responsable est requis';

    // Vérifier le stock
    const produit = produits.find(p => p.id_produit === parseInt(formData.produit_id));
    if (produit && formData.quantite_distribuee > produit.quantite_stock) {
      newErrors.quantite_distribuee = `Stock insuffisant (disponible: ${produit.quantite_stock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDistribution = () => {
    if (!validateForm()) return;

    // Ajouter ou modifier la distribution
    if (isEditMode) {
      setDistributions(distributions.map(d => 
        d.id === editingId ? { ...formData, id: editingId } : d
      ));
      setMessage('Distribution modifiée avec succès');
    } else {
      const newDistribution = {
        id: Date.now(),
        ...formData
      };
      setDistributions([...distributions, newDistribution]);
      setMessage('Distribution créée avec succès');
    }

    closeModal();
  };

  const handleDeleteDistribution = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette distribution ?')) {
      setDistributions(distributions.filter(d => d.id !== id));
      setMessage('Distribution supprimée');
    }
  };

  const handleProduitChange = (e) => {
    const produitId = parseInt(e.target.value);
    const produit = produits.find(p => p.id_produit === produitId);
    
    if (produit) {
      setFormData(prev => ({
        ...prev,
        produit_id: produitId.toString(),
        designation: produit.designation
      }));
    }
  };

  const openModal = (distribution = null) => {
    if (distribution) {
      setFormData(distribution);
      setEditingId(distribution.id);
      setIsEditMode(true);
    } else {
      setFormData({
        produit_id: '',
        designation: '',
        quantite_distribuee: '',
        destination: '',
        date_distribution: new Date().toISOString().split('T')[0],
        responsable: '',
        observations: ''
      });
      setIsEditMode(false);
      setEditingId(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const filteredDistributions = distributions.filter(d => {
    const matchesSearch = searchTerm === '' ||
      d.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.responsable?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDestination = !destinationFilter || d.destination === destinationFilter;

    return matchesSearch && matchesDestination;
  });

  const destinations = [...new Set(distributions.map(d => d.destination))];

  const getProduitInfo = (produitId) => {
    return produits.find(p => p.id_produit === parseInt(produitId));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          📦 Distribution de Produits
        </h1>
        <p style={{ color: '#6b7280' }}>Gérez la distribution des produits et médicaments dans la clinique</p>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>✓ {message}</span>
          <button onClick={() => setMessage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#7f1d1d',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Filtres et bouton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'end'
      }}>
        <input
          type="text"
          placeholder="Rechercher produit, destination, responsable..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <select
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">Toutes destinations</option>
          {destinations.map(dest => (
            <option key={dest} value={dest}>{dest}</option>
          ))}
        </select>

        <button
          onClick={() => openModal()}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <Plus size={18} /> Nouvelle Distribution
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {isEditMode ? 'Modifier Distribution' : 'Nouvelle Distribution'}
            </h2>

            {/* Formulaire */}
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Produit *
                </label>
                <select
                  name="produit_id"
                  value={formData.produit_id}
                  onChange={handleProduitChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.produit_id ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Sélectionner un produit</option>
                  {produits.map(p => (
                    <option key={p.id_produit} value={p.id_produit}>
                      {p.designation} (Stock: {p.quantite_stock} - {p.prix} FCFA)
                    </option>
                  ))}
                </select>
                {errors.produit_id && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.produit_id}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Quantité à distribuer *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    name="quantite_distribuee"
                    value={formData.quantite_distribuee}
                    onChange={handleInputChange}
                    placeholder="Quantité"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.quantite_distribuee ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formData.produit_id && (
                    <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                      Stock disponible: {getProduitInfo(formData.produit_id)?.quantite_stock || 0} unités
                    </span>
                  )}
                </div>
                {errors.quantite_distribuee && (
                  <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.quantite_distribuee}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Destination *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Ex: Pharmacie, Urgences, Chirurgie..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.destination ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.destination && (
                  <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.destination}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Date *
                </label>
                <input
                  type="date"
                  name="date_distribution"
                  value={formData.date_distribution}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.date_distribution ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Responsable *
                </label>
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleInputChange}
                  placeholder="Nom du responsable"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.responsable ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                  Observations
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  placeholder="Observations..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveDistribution}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {isEditMode ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {filteredDistributions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>Aucune distribution trouvée</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Produit</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Quantité</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Destination</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Responsable</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistributions.map((d, i) => (
                  <tr key={d.id} style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: i % 2 === 0 ? '#f9fafb' : 'white',
                    fontSize: '14px'
                  }}>
                    <td style={{ padding: '12px 16px' }}>{d.designation}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        {d.quantite_distribuee}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{d.destination}</td>
                    <td style={{ padding: '12px 16px' }}>{d.responsable}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{d.date_distribution}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openModal(d)}
                          style={{
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #dcfce7',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit2 size={14} /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteDistribution(d.id)}
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fee2e2',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={14} /> Supprimer
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

      {/* Résumé */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{
          backgroundColor: '#ecfdf5',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: '600' }}>Total Distributions</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#047857' }}>
            {filteredDistributions.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>Quantité Distribuée</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
            {filteredDistributions.reduce((sum, d) => sum + parseInt(d.quantite_distribuee || 0), 0)}
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600' }}>Destinations Uniques</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
            {destinations.length}
          </div>
        </div>
      </div>
    </div>
  );
}