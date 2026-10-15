import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/patients/';

const patientService = {
  // Obtenir tous les patients actifs
  getAllActive: async () => {
    const response = await axios.get(`${API_URL}?status=active`);
    return response.data;
  },

  // Obtenir tous les patients archivés
  getAllArchived: async () => {
    const response = await axios.get(`${API_URL}?status=archived`);
    return response.data;
  },

  // Obtenir tous les patients (actifs + archivés)
  getAll: async () => {
    const response = await axios.get(`${API_URL}?status=all`);
    return response.data;
  },

  // Obtenir un patient par ID (avec détails complets)
  getById: async (id) => {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data;
  },

  // Obtenir les détails complets d'un patient
  getDetails: async (id) => {
    const response = await axios.get(`${API_URL}${id}/details_complets/`);
    return response.data;
  },

  // Créer un nouveau patient
  create: async (patientData) => {
    const response = await axios.post(API_URL, patientData);
    return response.data;
  },

  // Mettre à jour un patient
  update: async (id, patientData) => {
    const response = await axios.put(`${API_URL}${id}/`, patientData);
    return response.data;
  },

  // Archiver un patient (soft delete)
  archive: async (id) => {
    const response = await axios.delete(`${API_URL}${id}/`);
    return response.data;
  },

  // Restaurer un patient archivé
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

export default patientService;