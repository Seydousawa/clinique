import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Check } from 'lucide-react';

export default function ExamenModal({ 
  isOpen, 
  onClose, 
  onSave, 
  patients = [],
  consultations = [],
  selectedConsultation = null,
  selectedPatient = null,
  examenToEdit = null
}) {
  const [formData, setFormData] = useState({
    type_examen: '',
    description: '',
    date_prescription: new Date().toISOString().split('T')[0],
    date_realisation: '',
    resultat: '',
    statut: 'prescrit',
    patient: '',
    consultation: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialiser les données si on édite un examen existant
  useEffect(() => {
    if (examenToEdit) {
      setFormData({
        type_examen: examenToEdit.type_examen || '',
        description: examenToEdit.description || '',
        date_prescription: examenToEdit.date_prescription 
          ? new Date(examenToEdit.date_prescription).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        date_realisation: examenToEdit.date_realisation 
          ? new Date(examenToEdit.date_realisation).toISOString().split('T')[0]
          : '',
        resultat: examenToEdit.resultat || '',
        statut: examenToEdit.statut || 'prescrit',
        patient: examenToEdit.patient?.id || examenToEdit.patient || '',
        consultation: examenToEdit.consultation?.id || examenToEdit.consultation || ''
      });
    } else if (selectedConsultation || selectedPatient) {
      // Si une consultation ou un patient est sélectionné, pré-remplir
      const initialData = {
        type_examen: '',
        description: '',
        date_prescription: new Date().toISOString().split('T')[0],
        date_realisation: '',
        resultat: '',
        statut: 'prescrit',
        patient: selectedPatient || '',
        consultation: selectedConsultation || ''
      };
      setFormData(initialData);
    }
  }, [examenToEdit, selectedConsultation, selectedPatient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.type_examen.trim()) {
      newErrors.type_examen = 'Le type d\'examen est requis';
    }
    
    if (!formData.patient) {
      newErrors.patient = 'Le patient est requis';
    }
    
    if (formData.date_realisation && formData.date_prescription) {
      const datePrescription = new Date(formData.date_prescription);
      const dateRealisation = new Date(formData.date_realisation);
      
      if (dateRealisation < datePrescription) {
        newErrors.date_realisation = 'La date de réalisation ne peut pas être antérieure à la date de prescription';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparer les données pour l'envoi
      const examenData = {
        ...formData,
        // Convertir les dates en format ISO
        date_prescription: formData.date_prescription 
          ? new Date(formData.date_prescription).toISOString()
          : null,
        date_realisation: formData.date_realisation 
          ? new Date(formData.date_realisation).toISOString()
          : null
      };
      
      await onSave(examenData);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type_examen: '',
      description: '',
      date_prescription: new Date().toISOString().split('T')[0],
      date_realisation: '',
      resultat: '',
      statut: 'prescrit',
      patient: '',
      consultation: ''
    });
    setErrors({});
    setSaveSuccess(false);
    onClose();
  };

  // Options pour le statut
  const statutOptions = [
    { value: 'prescrit', label: 'Prescrit', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'en_cours', label: 'En cours', color: 'bg-blue-100 text-blue-800' },
    { value: 'realise', label: 'Réalisé', color: 'bg-green-100 text-green-800' },
    { value: 'annule', label: 'Annulé', color: 'bg-red-100 text-red-800' }
  ];

  // Options de type d'examen prédéfinies
  const typeExamenOptions = [
    'Analyse sanguine',
    'Radiographie',
    'Échographie',
    'IRM',
    'Scanner',
    'ECG',
    'Endoscopie',
    'Biopsie',
    'Test urinaire',
    'Examen neurologique',
    'Autre'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {examenToEdit ? 'Modifier l\'examen' : 'Nouvel examen médical'}
                </h3>
                <p className="text-sm text-gray-500">
                  Remplissez les informations de l'examen médical
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {errors.submit && (
                <div className="p-4 rounded-lg bg-red-50">
                  <div className="flex">
                    <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {errors.submit}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Type d'examen */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Type d'examen *
                  </label>
                  <div className="space-y-2">
                    <select
                      name="type_examen"
                      value={formData.type_examen}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.type_examen ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionnez un type d'examen</option>
                      {typeExamenOptions.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {formData.type_examen === 'Autre' && (
                      <input
                        type="text"
                        name="type_examen_custom"
                        placeholder="Précisez le type d'examen"
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.type_examen_custom || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          type_examen: e.target.value
                        }))}
                      />
                    )}
                    {errors.type_examen && (
                      <p className="text-sm text-red-600">{errors.type_examen}</p>
                    )}
                  </div>
                </div>

                {/* Statut */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Statut *
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {statutOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange('statut', option.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                          formData.statut === option.value
                            ? `${option.color} ring-2 ring-offset-1 ring-opacity-50`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Patient *
                  </label>
                  <select
                    name="patient"
                    value={formData.patient}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.patient ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!!selectedPatient}
                  >
                    <option value="">Sélectionnez un patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.prenom} {patient.nom} - {patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : ''}
                      </option>
                    ))}
                  </select>
                  {errors.patient && (
                    <p className="text-sm text-red-600">{errors.patient}</p>
                  )}
                </div>

                {/* Consultation (optionnel) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Consultation (optionnel)
                  </label>
                  <select
                    name="consultation"
                    value={formData.consultation}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!selectedConsultation}
                  >
                    <option value="">Sélectionnez une consultation</option>
                    {consultations.map((consultation) => (
                      <option key={consultation.id} value={consultation.id}>
                        Consultation du {consultation.date_consultation ? new Date(consultation.date_consultation).toLocaleDateString('fr-FR') : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date de prescription */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date de prescription *
                  </label>
                  <input
                    type="date"
                    name="date_prescription"
                    value={formData.date_prescription}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date de réalisation */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date de réalisation (si réalisé)
                  </label>
                  <input
                    type="date"
                    name="date_realisation"
                    value={formData.date_realisation}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.date_realisation ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.date_realisation && (
                    <p className="text-sm text-red-600">{errors.date_realisation}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrivez l'examen à réaliser, les instructions particulières, etc."
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Résultat (si réalisé) */}
              {formData.statut === 'realise' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Résultat de l'examen
                  </label>
                  <textarea
                    name="resultat"
                    value={formData.resultat}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Résultats de l'examen, observations, conclusions..."
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Aperçu du statut */}
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Aperçu</h4>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    statutOptions.find(s => s.value === formData.statut)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {statutOptions.find(s => s.value === formData.statut)?.label || 'Prescrit'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{formData.type_examen || 'Type d\'examen'}</span>
                    {formData.date_prescription && (
                      <> • Prescrit le {new Date(formData.date_prescription).toLocaleDateString('fr-FR')}</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col px-6 py-4 space-y-3 border-t border-gray-200 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting || saveSuccess
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {examenToEdit ? 'Modification...' : 'Création...'}
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {examenToEdit ? 'Modifié !' : 'Créé !'}
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    {examenToEdit ? 'Modifier l\'examen' : 'Créer l\'examen'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-enter {
          animation: fadeIn 0.3s ease-out;
        }
        
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-yellow-50 { background-color: #fffbeb; }
        .bg-green-50 { background-color: #f0fdf4; }
        .bg-red-50 { background-color: #fef2f2; }
        .bg-gray-50 { background-color: #f9fafb; }
        
        .bg-yellow-100 { background-color: #fef3c7; }
        .bg-blue-100 { background-color: #dbeafe; }
        .bg-green-100 { background-color: #d1fae5; }
        .bg-red-100 { background-color: #fee2e2; }
        
        .text-yellow-800 { color: #92400e; }
        .text-blue-800 { color: #1e40af; }
        .text-green-800 { color: #065f46; }
        .text-red-800 { color: #991b1b; }
      `}</style>
    </div>
  );
}