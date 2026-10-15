import React from 'react';
import { X, User, Stethoscope, Mail, BadgeCheck } from 'lucide-react';

/**
 * Composant MedecinModal - Modal pour ajouter/modifier un médecin
 * @param {boolean} isOpen - État du modal
 * @param {boolean} isEditMode - Mode édition ou création
 * @param {object} medecin - Objet médecin actuel
 * @param {object} errors - Objet des erreurs de validation
 * @param {function} onInputChange - Fonction appelée lors du changement d'input
 * @param {function} onSubmit - Fonction appelée lors de la soumission
 * @param {function} onClose - Fonction appelée lors de la fermeture
 * @param {boolean} loading - État du chargement
 */
export default function MedecinModal({
  isOpen,
  isEditMode,
  medecin,
  errors,
  onInputChange,
  onSubmit,
  onClose,
  loading
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div className="modal-content facture-modal">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        <div className="modal-header">
          <div className="modal-header-content">
            <Stethoscope size={24} className="modal-icon" />
            <h2 className="modal-title">
              {isEditMode ? 'Modifier le Médecin' : 'Nouveau Médecin'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Fermer"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Grille pour Nom et Prénom */}
          <div className="form-columns">
            <div className="form-group">
              <label htmlFor="nom">
                Nom 
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={medecin.nom}
                  onChange={onInputChange}
                  placeholder="Nom du médecin"
                  className={`form-input ${errors.nom ? 'error' : ''}`}
                  disabled={loading}
                  aria-invalid={!!errors.nom}
                  aria-describedby={errors.nom ? "nom-error" : undefined}
                />
              </div>
              {errors.nom && (
                <span id="nom-error" className="error-message" role="alert">
                  {errors.nom}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="prenom">
                Prénom 
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={medecin.prenom}
                  onChange={onInputChange}
                  placeholder="Prénom du médecin"
                  className={`form-input ${errors.prenom ? 'error' : ''}`}
                  disabled={loading}
                  aria-invalid={!!errors.prenom}
                  aria-describedby={errors.prenom ? "prenom-error" : undefined}
                />
              </div>
              {errors.prenom && (
                <span id="prenom-error" className="error-message" role="alert">
                  {errors.prenom}
                </span>
              )}
            </div>
          </div>

          {/* Spécialité */}
          <div className="form-group">
            <label htmlFor="specialite">
              Spécialité 
              <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <BadgeCheck size={18} className="input-icon" />
              <input
                type="text"
                id="specialite"
                name="specialite"
                value={medecin.specialite}
                onChange={onInputChange}
                placeholder="Ex: Cardiologie, Généraliste, etc."
                className={`form-input ${errors.specialite ? 'error' : ''}`}
                disabled={loading}
                aria-invalid={!!errors.specialite}
                aria-describedby={errors.specialite ? "specialite-error" : undefined}
              />
            </div>
            {errors.specialite && (
              <span id="specialite-error" className="error-message" role="alert">
                {errors.specialite}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email 
              <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={medecin.email}
                onChange={onInputChange}
                
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={loading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Numéro de téléphone (ajouté pour plus de complétude) */}
          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <div className="input-with-icon">
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="input-icon"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={medecin.telephone || ''}
                onChange={onInputChange}
                
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Disponibilité (optionnel) */}
          <div className="form-group">
            <label htmlFor="disponibilite">Disponibilité</label>
            <textarea
              id="disponibilite"
              name="disponibilite"
              value={medecin.disponibilite || ''}
              onChange={onInputChange}
              rows="2"
              placeholder="Horaires de disponibilité, jours de consultation..."
              className="form-textarea"
              disabled={loading}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="btn btn-cancel"
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            onClick={onSubmit} 
            className="btn btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                {isEditMode ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              <>
                <Stethoscope size={18} />
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}