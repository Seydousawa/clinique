import React from 'react';
import { Search } from 'lucide-react';

/**

  @param {string} searchTerm 
  @param {function} setSearchTerm
  @param {string} patientFilter 
  @param {function} setPatientFilter 
  @param {string} medecinFilter 
  @param {function} setMedecinFilter 
  @param {array} patients 
  @param {array} medecins 
 */
export default function ConsultationFilterBar({
  searchTerm,
  setSearchTerm,
  patientFilter,
  setPatientFilter,
  medecinFilter,
  setMedecinFilter,
  patients = [],
  medecins = []
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
          placeholder="Rechercher ..."
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
          transition: 'border 0.3s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#10b981'}
        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
      >
        <option value="">Tous les patients</option>
        {patients.map(p => (
          <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
        ))}
      </select>

      {/* Filtre par médecin */}
      <select
        value={medecinFilter}
        onChange={(e) => setMedecinFilter(e.target.value)}
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
        <option value="">Tous les médecins</option>
        {medecins.map(m => (
          <option key={m.id_medecin} value={m.id_medecin}>Dr. {m.prenom} {m.nom}</option>
        ))}
      </select>
    </div>
  );
}