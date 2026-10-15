import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Key, Shield, UserCircle, Crown, Stethoscope, FileText, Pill } from 'lucide-react';

export default function PersonnelModal({
  isOpen,
  isEditMode,
  personnel,
  errors,
  onInputChange,
  onSubmit,
  onClose,
  loading
}) {
  // Rôles prédéfinis
  const defaultRoles = [
    { id: 'administrateur', nom: 'Administrateur', icon: Crown, color: '#ef4444' },
    { id: 'medecin', nom: 'Médecin', icon: Stethoscope, color: '#10b981' },
    { id: 'secretaire', nom: 'Secrétaire', icon: FileText, color: '#3b82f6' },
    { id: 'pharmacien', nom: 'Pharmacien', icon: Pill, color: '#8b5cf6' }
  ];

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    username: '',
    password: '',
    role: '',
    statut: 'actif'
  });

  useEffect(() => {
    if (personnel) {
      setFormData({
        nom: personnel.nom || '',
        prenom: personnel.prenom || '',
        email: personnel.email || '',
        telephone: personnel.telephone || '',
        username: personnel.username || '',
        password: personnel.password || '',
        role: personnel.role || '',
        statut: personnel.statut || 'actif'
      });
    } else {
     
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        username: '',
        password: '',
        role: '',
        statut: 'actif'
      });
    }
  }, [personnel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Mettre à jour l'état local
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);
    
    // Appeler la fonction parent avec l'événement réel
    if (onInputChange) {
      // Créer un nouvel événement avec les données mises à jour
      const newEvent = {
        target: {
          name,
          value,
          type: e.target.type
        }
      };
      onInputChange(newEvent);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Données du formulaire:', formData);
    
    // Valider les champs requis
    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'username', 'role'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0 && !isEditMode) {
      console.error('Champs manquants:', missingFields);
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation pour la création (mot de passe requis)
    if (!isEditMode && !formData.password?.trim()) {
      console.error('Mot de passe requis en création');
      alert('Le mot de passe est requis pour créer un nouveau personnel');
      return;
    }
    
    
    const submitEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      
      formData: formData
    };
    
    console.log('Soumission avec données:', formData);
    
    if (onSubmit) {
      onSubmit(submitEvent);
    }
  };

  // Gérer la fermeture avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Trouver le rôle actuel pour afficher son icône
  const currentRole = defaultRoles.find(role => role.id === formData.role);
  const RoleIcon = currentRole ? currentRole.icon : Shield;

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
    >
      <div 
        className="modal-content facture-modal" 
        style={{ 
          maxWidth: '600px',
          transform: isOpen ? 'translateY(0)' : 'translateY(-20px)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s ease'
        }}
      >
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div style={{ marginTop: '10px', color: '#10b981', fontWeight: '500' }}>
              {isEditMode ? 'Mise à jour en cours...' : 'Création en cours...'}
            </div>
          </div>
        )}
        
        <div className="modal-header">
          <div className="modal-header-content">
            <User size={24} className="modal-icon" />
            <h2 className="modal-title">
              {isEditMode ? 'Modifier le Personnel' : 'Nouveau Personnel'}
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Nom et Prénom */}
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
                    value={formData.nom}
                    onChange={handleInputChange}
                    className={`form-input ${errors?.nom ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Nom de famille"
                    aria-invalid={!!errors?.nom}
                    aria-describedby={errors?.nom ? "nom-error" : undefined}
                    required
                  />
                </div>
                {errors?.nom && (
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
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className={`form-input ${errors?.prenom ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Prénom"
                    aria-invalid={!!errors?.prenom}
                    aria-describedby={errors?.prenom ? "prenom-error" : undefined}
                    required
                  />
                </div>
                {errors?.prenom && (
                  <span id="prenom-error" className="error-message" role="alert">
                    {errors.prenom}
                  </span>
                )}
              </div>
            </div>

            {/* Email et Téléphone */}
            <div className="form-columns">
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors?.email ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="email@exemple.com"
                    aria-invalid={!!errors?.email}
                    aria-describedby={errors?.email ? "email-error" : undefined}
                    required
                  />
                </div>
                {errors?.email && (
                  <span id="email-error" className="error-message" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telephone">
                  Téléphone 
                  <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className={`form-input ${errors?.telephone ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="+225 XX XX XX XX"
                    aria-invalid={!!errors?.telephone}
                    aria-describedby={errors?.telephone ? "telephone-error" : undefined}
                    required
                  />
                </div>
                {errors?.telephone && (
                  <span id="telephone-error" className="error-message" role="alert">
                    {errors.telephone}
                  </span>
                )}
              </div>
            </div>

            {/* Username et Password */}
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="username">
                  Nom d'utilisateur 
                  <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <UserCircle size={18} className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`form-input ${errors?.username ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Nom d'utilisateur"
                    aria-invalid={!!errors?.username}
                    aria-describedby={errors?.username ? "username-error" : undefined}
                    required
                  />
                </div>
                {errors?.username && (
                  <span id="username-error" className="error-message" role="alert">
                    {errors.username}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Mot de passe {!isEditMode && <span className="required-star">*</span>}
                </label>
                <div className="input-with-icon">
                  <Key size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors?.password ? 'error' : ''}`}
                    disabled={loading}
                    placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                    aria-invalid={!!errors?.password}
                    aria-describedby={errors?.password ? "password-error" : undefined}
                    required={!isEditMode}
                  />
                </div>
                {errors?.password && (
                  <span id="password-error" className="error-message" role="alert">
                    {errors.password}
                  </span>
                )}
                {isEditMode && (
                  <div className="password-hint" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Laissez vide pour conserver le mot de passe actuel
                  </div>
                )}
              </div>
            </div>

            {/* Rôle */}
            <div className="form-group">
              <label htmlFor="role">
                Rôle 
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <RoleIcon size={18} className="input-icon" style={{ 
                  color: currentRole ? currentRole.color : '#9ca3af' 
                }} />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`form-select ${errors?.role ? 'error' : ''}`}
                  disabled={loading}
                  aria-invalid={!!errors?.role}
                  aria-describedby={errors?.role ? "role-error" : undefined}
                  style={{ 
                    width: '100%',
                    cursor: 'pointer',
                    paddingLeft: '40px'
                  }}
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {defaultRoles.map(role => {
                    const RoleIcon = role.icon;
                    return (
                      <option 
                        key={role.id} 
                        value={role.id}
                        style={{ 
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <RoleIcon size={16} style={{ marginRight: '8px', color: role.color }} />
                        {role.nom}
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors?.role && (
                <span id="role-error" className="error-message" role="alert">
                  {errors.role}
                </span>
              )}
              
              {/* Affichage des rôles disponibles */}
              <div style={{ 
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                borderLeft: '4px solid #10b981',
                fontSize: '12px'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '8px',
                  color: '#4b5563'
                }}>
                  {defaultRoles.map(role => (
                    <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: role.color,
                        flexShrink: 0
                      }} />
                      <span style={{ fontWeight: 500 }}>{role.nom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="form-group">
              <label htmlFor="statut">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                className="form-select"
                disabled={loading}
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button"
              onClick={onClose} 
              className="btn btn-cancel"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit"
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
        </form>
      </div>
    </div>
  );
}