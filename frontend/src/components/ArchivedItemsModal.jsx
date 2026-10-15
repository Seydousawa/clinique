import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, Trash2, X, Search, Calendar } from 'lucide-react';

/**
 * Composant ArchivedItemsModal - Modal pour visualiser et restaurer les éléments archivés
 * @param {boolean} isOpen - État du modal
 * @param {array} archivedItems - Liste des éléments archivés
 * @param {function} onRestore - Fonction de restauration d'un élément
 * @param {function} onPermanentDelete - Fonction de suppression définitive (optionnelle)
 * @param {function} onClose - Fonction de fermeture du modal
 * @param {string} entityName - Nom de l'entité (ex: "prescription", "patient", etc.)
 */
export default function ArchivedItemsModal({ 
  isOpen, 
  archivedItems = [], 
  onRestore, 
  onPermanentDelete,
  onClose,
  entityName = "élément",
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = archivedItems.filter(item => {
        const searchString = JSON.stringify(item).toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems(archivedItems);
    }
  }, [searchTerm, archivedItems]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getItemDisplayName = (item) => {
    return item.nom || 
           item.designation || 
           (item.prenom && item.nom ? `${item.prenom} ${item.nom}` : null) ||
           item.motif ||
           `${entityName} #${item.id}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 30px',
          borderBottom: '2px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        }}>
          <h5 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '700', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Archive size={26} />
            Archives - {entityName}s
            <span style={{
              background: 'rgba(255,255,255,0.3)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {archivedItems.length}
            </span>
          </h5>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={24} color="white" />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
            <input
              type="text"
              placeholder={`Rechercher dans les archives...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 45px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        {/* Body - Liste des éléments archivés */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px 30px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p>Chargement des archives...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Archive size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
              <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '18px' }}>
                {searchTerm ? 'Aucun résultat' : 'Aucun élément archivé'}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {searchTerm 
                  ? 'Aucun élément ne correspond à votre recherche.'
                  : `Aucun ${entityName} n'a été archivé pour le moment.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: '2px solid #fef3c7',
                    borderRadius: '12px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#fbbf24';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#fef3c7';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: '#92400e'
                      }}>
                        {getItemDisplayName(item)}
                      </h4>
                      
                      {item.deleted_at && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          color: '#b45309',
                          fontSize: '13px',
                          marginBottom: '8px'
                        }}>
                          <Calendar size={14} />
                          <span>Archivé le {formatDate(item.deleted_at)}</span>
                        </div>
                      )}
                      
                      {/* Afficher des détails supplémentaires selon l'entité */}
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#78350f',
                        marginTop: '8px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        {item.type_prescription && (
                          <span>Type: {item.type_prescription}</span>
                        )}
                        {item.telephone && (
                          <span>☎ {item.telephone}</span>
                        )}
                        {item.email && (
                          <span>✉ {item.email}</span>
                        )}
                        {item.prix && (
                          <span>💰 {item.prix} FCFA</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => onRestore(item)}
                        style={{
                          padding: '10px 16px',
                          border: 'none',
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#059669';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#10b981';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <RefreshCw size={14} />
                        Restaurer
                      </button>

                      {onPermanentDelete && (
                        <button
                          onClick={() => onPermanentDelete(item)}
                          style={{
                            padding: '10px 16px',
                            border: 'none',
                            background: '#dc3545',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#bb2d3b';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#dc3545';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '2px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            💡 Les éléments archivés peuvent être restaurés à tout moment
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '2px solid #d1d5db',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
          >
            Fermer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}