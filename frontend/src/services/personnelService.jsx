import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/personnels/';

const personnelService = {
  // Obtenir tous les personnels actifs
  getAllActive: async () => {
    const response = await axios.get(`${API_URL}?status=active`);
    return response.data;
  },

  // Obtenir tous les personnels archivés
  getAllArchived: async () => {
    const response = await axios.get(`${API_URL}?status=archived`);
    return response.data;
  },

  // Obtenir tous les personnels (actifs + archivés)
  getAll: async () => {
    const response = await axios.get(`${API_URL}?status=all`);
    return response.data;
  },

  // Obtenir un personnel par ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data;
  },

  // Créer un nouveau personnel
  create: async (personnelData) => {
    const response = await axios.post(API_URL, personnelData);
    return response.data;
  },

  // Mettre à jour un personnel
  update: async (id, personnelData) => {
    const response = await axios.put(`${API_URL}${id}/`, personnelData);
    return response.data;
  },

  // Archiver un personnel (soft delete)
  archive: async (id) => {
    const response = await axios.delete(`${API_URL}${id}/`);
    return response.data;
  },

  // Restaurer un personnel archivé
  restore: async (id) => {
    const response = await axios.post(`${API_URL}${id}/restore/`);
    return response.data;
  },

  // Suppression définitive (à utiliser avec précaution)
  permanentDelete: async (id) => {
    const response = await axios.delete(`${API_URL}${id}/permanent_delete/`);
    return response.data;
  }
};

export default personnelService;