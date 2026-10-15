import React from 'react';
import { X, User, Calendar, Phone, Mail, MapPin, Briefcase, Droplets, Shield } from 'lucide-react';

export default function PatientModal({
  isOpen,
  isEditMode,
  patient,
  errors,
  onInputChange,
  onSubmit,
  onClose,
  loading
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content facture-modal" style={{ maxWidth: '800px' }}>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        <div className="modal-header">
          <div className="modal-header-content">
            <User size={24} className="modal-icon" />
            <h2 className="modal-title">
              {isEditMode ? 'Modifier le Patient' : 'Nouveau Patient'}
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
          {/* Section Identité */}
          <div className="form-section">
            <h3 className="section-title">Identité</h3>
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="nom">
                  Nom *
                  <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={patient.nom}
                    onChange={onInputChange}
                    className={`form-input ${errors.nom ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Nom de famille"
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
                  Prénom *
                  <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={patient.prenom}
                    onChange={onInputChange}
                    className={`form-input ${errors.prenom ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Prénom"
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
          </div>

          {/* Section Date et Sexe */}
          <div className="form-section">
            <h3 className="section-title">Informations personnelles</h3>
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="date_naissance">
                  Date de Naissance *
                  <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    id="date_naissance"
                    name="date_naissance"
                    value={patient.date_naissance}
                    onChange={onInputChange}
                    className={`form-input ${errors.date_naissance ? 'error' : ''}`}
                    disabled={loading}
                    aria-invalid={!!errors.date_naissance}
                    aria-describedby={errors.date_naissance ? "date-error" : undefined}
                  />
                </div>
                {errors.date_naissance && (
                  <span id="date-error" className="error-message" role="alert">
                    {errors.date_naissance}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="sexe">
                  Sexe *
                  <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <select
                    id="sexe"
                    name="sexe"
                    value={patient.sexe}
                    onChange={onInputChange}
                    className={`form-select ${errors.sexe ? 'error' : ''}`}
                    disabled={loading}
                    aria-invalid={!!errors.sexe}
                    aria-describedby={errors.sexe ? "sexe-error" : undefined}
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                {errors.sexe && (
                  <span id="sexe-error" className="error-message" role="alert">
                    {errors.sexe}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div className="form-section">
            <h3 className="section-title">Contact</h3>
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="telephone">
                  Téléphone *
                  <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={patient.telephone}
                    onChange={onInputChange}
                    className={`form-input ${errors.telephone ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="+225 XX XX XX XX"
                    aria-invalid={!!errors.telephone}
                    aria-describedby={errors.telephone ? "telephone-error" : undefined}
                  />
                </div>
                {errors.telephone && (
                  <span id="telephone-error" className="error-message" role="alert">
                    {errors.telephone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={patient.email}
                    onChange={onInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="email@exemple.com"
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
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="adresse">
                Adresse *
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <textarea
                  id="adresse"
                  name="adresse"
                  value={patient.adresse}
                  onChange={onInputChange}
                  rows="3"
                  className={`form-textarea ${errors.adresse ? 'error' : ''}`}
                  disabled={loading}
                  placeholder="Adresse complète"
                  aria-invalid={!!errors.adresse}
                  aria-describedby={errors.adresse ? "adresse-error" : undefined}
                />
              </div>
              {errors.adresse && (
                <span id="adresse-error" className="error-message" role="alert">
                  {errors.adresse}
                </span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Informations médicales</h3>
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="profession">Profession</label>
                <div className="input-with-icon">
                  <Briefcase size={18} className="input-icon" />
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={patient.profession}
                    onChange={onInputChange}
                    className="form-input"
                    disabled={loading}
                    placeholder="Profession"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="groupe_sanguin">Groupe Sanguin</label>
                <div className="input-with-icon">
                  <Droplets size={18} className="input-icon" />
                  <select
                    id="groupe_sanguin"
                    name="groupe_sanguin"
                    value={patient.groupe_sanguin}
                    onChange={onInputChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="">Sélectionner</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section Assurance */}
          <div className="form-section">
            <h3 className="section-title">
              <Shield size={18} style={{ marginRight: '8px' }} />
              Informations d'Assurance
            </h3>
            
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="assurance_nom">Nom de l'Assurance</label>
                <div className="input-with-icon">
                  <Shield size={18} className="input-icon" />
                  <input
                    type="text"
                    id="assurance_nom"
                    name="assurance_nom"
                    value={patient.assurance_nom}
                    onChange={onInputChange}
                    className="form-input"
                    disabled={loading}
                    placeholder="Nom de l'assurance"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="taux_couverture">Taux de Couverture (%)</label>
                <div className="input-with-icon">
                  <Shield size={18} className="input-icon" />
                  <input
                    type="number"
                    id="taux_couverture"
                    name="taux_couverture"
                    value={patient.taux_couverture}
                    onChange={onInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`form-input ${errors.taux_couverture ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="0-100"
                    aria-invalid={!!errors.taux_couverture}
                    aria-describedby={errors.taux_couverture ? "taux-error" : undefined}
                  />
                </div>
                {errors.taux_couverture && (
                  <span id="taux-error" className="error-message" role="alert">
                    {errors.taux_couverture}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="assurance_numero">Numéro d'Assurance</label>
              <div className="input-with-icon">
                <Shield size={18} className="input-icon" />
                <input
                  type="text"
                  id="assurance_numero"
                  name="assurance_numero"
                  value={patient.assurance_numero}
                  onChange={onInputChange}
                  className="form-input"
                  disabled={loading}
                  placeholder="Numéro d'assurance"
                />
              </div>
            </div>
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
                <User size={18} />
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}