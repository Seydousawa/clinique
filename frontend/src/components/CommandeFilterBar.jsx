import React from 'react';
import { Search } from 'lucide-react';

export default function CommandeFilterBar({
  searchTerm,
  setSearchTerm,
  statutFilter,
  setStatutFilter
}) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      {/* Barre de recherche */}
      <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
        <Search size={18} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af'
        }} />
        <input
          type="text"
          placeholder="Rechercher produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '50%',
            padding: '10px 12px 10px 40px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        />
      </div>

      {/* Filtre statut */}
      <select
        value={statutFilter}
        onChange={(e) => setStatutFilter(e.target.value)}
        style={{
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: 'white'
        }}
      >
        <option value="">Tous statuts</option>
        <option value="en_attente">En attente</option>
        <option value="commande">Commandée</option>
        <option value="recu">Reçue</option>
      </select>
    </div>
  );
}