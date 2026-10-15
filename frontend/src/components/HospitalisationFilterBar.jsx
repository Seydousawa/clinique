import React from 'react';
import { Search } from 'lucide-react';

/**
 * Composant HospitalisationFilterBar - Barre de filtrage pour les hospitalisations
 * @param {string} searchTerm - Terme de recherche actuel
 * @param {function} setSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {string} statutFilter - Statut sélectionné
 * @param {function} setStatutFilter - Fonction pour mettre à jour le filtre de statut
 */
export default function HospitalisationFilterBar({
  searchTerm,
  setSearchTerm,
  statutFilter,
  setStatutFilter
}) {
  const statutOptions = [
    { value: 'en_cours', label: 'En cours' },
    { value: 'terminee', label: 'Terminée' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
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
          placeholder="Rechercher par patient, médecin, chambre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '70%',
            padding: '10px 10px 10px 40px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#10b981'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </div>

      {/* Filtre par statut */}
      <select
        value={statutFilter}
        onChange={(e) => setStatutFilter(e.target.value)}
        style={{
          padding: '10px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border 0.3s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#10b981'}
        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
      >
        <option value="">Tous les statuts</option>
        {statutOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}