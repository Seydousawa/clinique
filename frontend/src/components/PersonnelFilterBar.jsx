import React from 'react';
import { Search } from 'lucide-react';

export default function PersonnelFilterBar({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter
}) {
  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'MEDECIN', label: 'Médecin' },
    { value: 'CAISSIER', label: 'Caissier(ière)' },
     { value: 'SECRETAIRE', label: 'Secrétaire' },
    { value: 'PHARMACIEN', label: 'Pharmacien' }
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
          placeholder="Rechercher par nom, email, téléphone..."
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

      {/* Filtre par rôle */}
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
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
        {roleOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}