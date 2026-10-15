// components/PersonnelTabs.jsx
import React from 'react';
import { Users, Archive } from 'lucide-react';

const PersonnelTabs = ({ viewMode, setViewMode }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      marginBottom: '25px',
      borderBottom: '2px solid #e2e8f0',
      paddingBottom: '10px'
    }}>
      <button
        onClick={() => setViewMode('active')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          border: 'none',
          background: viewMode === 'active' ? '#10b981' : 'transparent',
          color: viewMode === 'active' ? 'white' : '#6b7280',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          borderBottom: viewMode === 'active' ? '3px solid #059669' : 'none'
        }}
      >
        <Users size={18} />
        Personnels Actifs
      </button>
      
      <button
        onClick={() => setViewMode('archived')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          border: 'none',
          background: viewMode === 'archived' ? '#f59e0b' : 'transparent',
          color: viewMode === 'archived' ? 'white' : '#6b7280',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          borderBottom: viewMode === 'archived' ? '3px solid #d97706' : 'none'
        }}
      >
        <Archive size={18} />
        Personnels Archivés
      </button>
    </div>
  );
};

export default PersonnelTabs;