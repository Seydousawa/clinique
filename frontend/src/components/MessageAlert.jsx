import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Composant d'affichage des messages de succès/erreur
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de message ('success' ou 'error')
 * @param {function} onClose - Fonction appelée lors de la fermeture
 * @param {number} autoCloseDelay - Délai en millisecondes avant fermeture automatique (par défaut: 4000ms)
 */
export default function MessageAlert({ 
  message, 
  type = 'success', 
  onClose, 
  autoCloseDelay = 4000 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? '#d4edda' : '#f8d7da';
  const borderColor = isSuccess ? '#c3e6cb' : '#f5c6cb';
  const textColor = isSuccess ? '#155724' : '#721c24';
  const IconComponent = isSuccess ? CheckCircle : AlertCircle;

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 300); // Attendre la fin de l'animation
      return () => clearTimeout(timer);
    }

    if (!isHovered) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isHovered, onClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible && !message) return null;

  return (
    <div 
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        animation: isVisible ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-out forwards',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease-out',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        color: textColor,
        flex: 1 
      }}>
        <IconComponent size={20} />
        <span>{message}</span>
      </div>
      <button 
        onClick={handleClose} 
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: textColor,
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Fermer le message"
      >
        <X size={20} />
      </button>
    </div>
  );
}