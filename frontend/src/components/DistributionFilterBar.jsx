import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function DistributionFilterBar({
  searchTerm,
  setSearchTerm,
  destinationFilter,
  setDestinationFilter,
  destinations,
  produits
}) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
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

      {/* Filtre destination */}
      

      {/* Affichage des produits avec prix et montant total */}
      
          
        </div>
      )}
   
 
