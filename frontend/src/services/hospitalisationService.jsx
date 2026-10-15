import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/hospitalisations/';

const hospitalisationService = {
  // Obtenir toutes les hospitalisations actives
  getAllActive: async () => {
    console.log('🌐 Service: Récupération des hospitalisations actives');
    try {
      const response = await axios.get(`${API_URL}?status=active`);
      console.log('✅ Service: Hospitalisations actives reçues:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Service getAllActive - Erreur:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  // Obtenir toutes les hospitalisations archivées
  getAllArchived: async () => {
    console.log('🌐 Service: Récupération des hospitalisations archivées');
    try {
      const response = await axios.get(`${API_URL}?status=archived`);
      console.log('✅ Service: Hospitalisations archivées reçues:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Service getAllArchived - Erreur:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  // Obtenir toutes les hospitalisations (actives + archivées)
  getAll: async () => {
    console.log('🌐 Service: Récupération de toutes les hospitalisations');
    try {
      const response = await axios.get(`${API_URL}?status=all`);
      console.log('✅ Service: Données reçues:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Service getAll - Erreur:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  // Obtenir une hospitalisation par ID
  getById: async (id) => {
    console.log('🌐 Service: Récupération de l\'hospitalisation ID:', id);
    try {
      const response = await axios.get(`${API_URL}${id}/`);
      console.log('✅ Service: Hospitalisation reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Service getById - Erreur:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  // Créer une nouvelle hospitalisation
  create: async (hospitalisationData) => {
    console.log('🌐 ========================================');
    console.log('🌐 Service CREATE: Début de la requête');
    console.log('🌐 URL:', API_URL);
    console.log('🌐 Méthode: POST');
    console.log('🌐 ========================================');
    console.log('📤 Données envoyées au backend:');
    console.log(JSON.stringify(hospitalisationData, null, 2));
    console.log('🌐 ========================================');
    
    try {
      const response = await axios.post(API_URL, hospitalisationData);
      
      console.log('✅ ========================================');
      console.log('✅ Service CREATE: Succès !');
      console.log('✅ Status:', response.status);
      console.log('✅ Status Text:', response.statusText);
      console.log('✅ Données reçues:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('✅ ========================================');
      
      return response.data;
    } catch (error) {
      console.error('❌ ========================================');
      console.error('❌ Service CREATE: ERREUR !');
      console.error('❌ ========================================');
      console.error('Type d\'erreur:', error.constructor.name);
      console.error('Message:', error.message);
      
      if (error.response) {
        console.error('📊 RÉPONSE HTTP COMPLÈTE:');
        console.error('  - Status:', error.response.status);
        console.error('  - Status Text:', error.response.statusText);
        console.error('  - Headers:', error.response.headers);
        console.error('  - Config URL:', error.config?.url);
        console.error('  - Config Method:', error.config?.method);
        console.error('  - Config Data:', error.config?.data);
        
        console.error('📋 DONNÉES D\'ERREUR DU SERVEUR:');
        console.error(JSON.stringify(error.response.data, null, 2));
        
        // Parser les erreurs de validation Django si présentes
        if (error.response.data && typeof error.response.data === 'object') {
          console.error('🔍 DÉTAIL DES ERREURS PAR CHAMP:');
          Object.keys(error.response.data).forEach(key => {
            console.error(`  ❌ Champ "${key}":`, error.response.data[key]);
          });
        }
      } else if (error.request) {
        console.error('📡 REQUÊTE ENVOYÉE MAIS PAS DE RÉPONSE:');
        console.error('Request:', error.request);
        console.error('');
        console.error('💡 VÉRIFICATIONS À FAIRE:');
        console.error('  1. Le backend Django est-il démarré ? (python manage.py runserver)');
        console.error('  2. L\'URL est-elle correcte ?', API_URL);
        console.error('  3. Y a-t-il un problème de CORS ?');
      } else {
        console.error('⚙️ ERREUR DE CONFIGURATION:');
        console.error('Message:', error.message);
      }
      
      console.error('❌ ========================================');
      throw error;
    }
  },

  // Mettre à jour une hospitalisation
  update: async (id, hospitalisationData) => {
    console.log('🌐 ========================================');
    console.log('🌐 Service UPDATE: Début de la requête');
    console.log('🌐 URL:', `${API_URL}${id}/`);
    console.log('🌐 Méthode: PUT');
    console.log('🌐 ID à modifier:', id);
    console.log('🌐 ========================================');
    console.log('📤 Données envoyées au backend:');
    console.log(JSON.stringify(hospitalisationData, null, 2));
    console.log('🌐 ========================================');
    
    try {
      const response = await axios.put(`${API_URL}${id}/`, hospitalisationData);
      
      console.log('✅ ========================================');
      console.log('✅ Service UPDATE: Succès !');
      console.log('✅ Status:', response.status);
      console.log('✅ Données reçues:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('✅ ========================================');
      
      return response.data;
    } catch (error) {
      console.error('❌ ========================================');
      console.error('❌ Service UPDATE: ERREUR !');
      console.error('❌ ========================================');
      
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📋 Erreur:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data && typeof error.response.data === 'object') {
          console.error('🔍 DÉTAIL DES ERREURS PAR CHAMP:');
          Object.keys(error.response.data).forEach(key => {
            console.error(`  ❌ Champ "${key}":`, error.response.data[key]);
          });
        }
      }
      
      console.error('❌ ========================================');
      throw error;
    }
  },

  // Archiver une hospitalisation (soft delete)
  archive: async (id) => {
    console.log('🌐 Service: Archivage de l\'hospitalisation ID:', id);
    try {
      const response = await axios.delete(`${API_URL}${id}/`);
      console.log('✅ Service: Hospitalisation archivée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Service archive - Erreur:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  },

  // Restaurer une hospitalisation archivée
  restore: async (id) => {
    console.log('🌐 Service: Restauration de l\'hospitalisation ID:', id);
    try {
      const response = await axios.post(`${API_URL}${id}/restore/`);
      console.log('✅ Service: Hospitalisation restaurée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Service restore - Erreur:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  },

  // Suppression définitive (à utiliser avec précaution)
  permanentDelete: async (id) => {
    console.log('🌐 Service: Suppression définitive de l\'hospitalisation ID:', id);
    try {
      const response = await axios.delete(`${API_URL}${id}/permanent_delete/`);
      console.log('✅ Service: Hospitalisation supprimée définitivement');
      return response.data;
    } catch (error) {
      console.error('❌ Service permanentDelete - Erreur:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  }
};

export default hospitalisationService;