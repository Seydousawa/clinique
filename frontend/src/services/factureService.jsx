import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/factures/';

const factureService = {
  // Obtenir toutes les factures actives
  getAllActive: async () => {
    const response = await axios.get(`${API_URL}?status=active`);
    return response.data;
  },

  // Obtenir toutes les factures archivées
  getAllArchived: async () => {
    const response = await axios.get(`${API_URL}?status=archived`);
    return response.data;
  },

  // Obtenir toutes les factures (actives + archivées)
  getAll: async () => {
    const response = await axios.get(`${API_URL}?status=all`);
    return response.data;
  },

  // Obtenir une facture par ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data;
  },

  // Créer une nouvelle facture
  create: async (factureData) => {
    const response = await axios.post(API_URL, factureData);
    return response.data;
  },

  // Mettre à jour une facture
  update: async (id, factureData) => {
    const response = await axios.put(`${API_URL}${id}/`, factureData);
    return response.data;
  },

  // Archiver une facture (soft delete)
  archive: async (id) => {
    const response = await axios.delete(`${API_URL}${id}/`);
    return response.data;
  },

  // Restaurer une facture archivée
  restore: async (id) => {
    const response = await axios.post(`${API_URL}${id}/restore/`);
    return response.data;
  },

  // Suppression définitive (à utiliser avec précaution)
  permanentDelete: async (id) => {
    const response = await axios.delete(`${API_URL}${id}/permanent_delete/`);
    return response.data;
  },

  // Obtenir les statistiques
  getStatistics: async (status = 'active') => {
    const response = await axios.get(`${API_URL}statistics/?status=${status}`);
    return response.data;
  }
};

export default factureService;