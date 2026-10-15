import React from 'react';
import { Search } from 'lucide-react';

/**
 * Composant PatientFilterBar - Barre de filtrage pour les patients
 * @param {string} searchTerm - Terme de recherche actuel
 * @param {function} setSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {string} sexeFilter - Sexe sélectionné
 * @param {function} setSexeFilter - Fonction pour mettre à jour le filtre de sexe
 */
export default function PatientFilterBar({
  searchTerm,
  setSearchTerm,
  sexeFilter,
  setSexeFilter
}) {
  const sexeOptions = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' }
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
          placeholder="Rechercher par nom, prénom, téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '70%',
            padding: '10px 10px 10px 40px',
            border: '2px solid #b8b1b1',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#10b981'}
          onBlur={(e) => e.target.style.borderColor = '#b8b1b1'}
        />
      </div>

      {/* Filtre par sexe */}
      <select
        value={sexeFilter}
        onChange={(e) => setSexeFilter(e.target.value)}
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
        <option value="">Tous les sexes</option>
        {sexeOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}