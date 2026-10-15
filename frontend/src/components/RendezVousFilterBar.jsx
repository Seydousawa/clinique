import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

export default function RendezVousFilterBar({
  patientFilter,
  setPatientFilter,
  medecinFilter,
  setMedecinFilter,
  statutFilter,
  setStatutFilter,
  rendezVous = [],
  patients = [],
  medecins = []
}) {
  const [patientSearch, setPatientSearch] = useState('');

  // Filtrer les rendez-vous en fonction des critères
  const handlePatientSearch = (value) => {
    setPatientSearch(value);
    
    if (!value.trim()) {
      setPatientFilter('');
      return;
    }

    const lowerValue = value.toLowerCase();
    
    // Chercher le patient qui correspond à la recherche
    const foundPatient = patients.find(patient => {
      const fullName = `${patient.nom} ${patient.prenom}`.toLowerCase();
      return fullName.includes(lowerValue);
    });

    // Si un patient est trouvé, mettre à jour le filtre avec son ID
    if (foundPatient) {
      setPatientFilter(foundPatient.id.toString());
    } else {
      setPatientFilter('');
    }
  };

  // Récupérer le nom du patient sélectionné
  const selectedPatientName = useMemo(() => {
    if (!patientFilter) return '';
    const patient = patients.find(p => p.id.toString() === patientFilter.toString());
    return patient ? `${patient.nom} ${patient.prenom}` : '';
  }, [patientFilter, patients]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
      {/* Recherche par nom du patient */}
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
          placeholder="Rechercher par nom du patient..."
          value={patientSearch || selectedPatientName}
          onChange={(e) => handlePatientSearch(e.target.value)}
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

    

      {/* Espace vide pour maintenir la grille */}
      <div></div>
    </div>
  );
}