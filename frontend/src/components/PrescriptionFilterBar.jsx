import React from 'react';
import { Search } from 'lucide-react';

export default function PrescriptionFilterBar({
  searchTerm,
  setSearchTerm,
  patientFilter,
  setPatientFilter,
  produitFilter,
  setProduitFilter,
  patients = [],
  produits = []
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
      {/* Recherche */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#999'
        }} />
        <input
          type="text"
          placeholder="Rechercher une prescription..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 10px 10px 40px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border 0.3s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#10b981'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </div>

      {/* Filtre par patient */}
      <select
        value={patientFilter}
        onChange={(e) => setPatientFilter(e.target.value)}
        style={{
          padding: '10px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border 0.3s',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => e.target.style.borderColor = '#10b981'}
        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
      >
        <option value="">Tous les patients</option>
        {patients.map(p => (
          <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
        ))}
      </select>

      {/* Filtre par produit */}
      <select
        value={produitFilter}
        onChange={(e) => setProduitFilter(e.target.value)}
        style={{
          padding: '10px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border 0.3s',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => e.target.style.borderColor = '#10b981'}
        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
      >
        <option value="">Tous les produits</option>
        {produits.map(p => (
          <option key={p.id} value={p.id}>{p.designation}</option>
        ))}
      </select>
    </div>
  );
}