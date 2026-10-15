// services/consultationService.js

const BASE_URL = 'http://127.0.0.1:8000/api/consultations';

const consultationService = {

  getAllActive: async () => {
    const r = await fetch(`${BASE_URL}/`);
    if (!r.ok) throw new Error(`Erreur ${r.status}`);
    return r.json();
  },

  getAllArchived: async () => {
    const r = await fetch(`${BASE_URL}/archived/`);
    if (!r.ok) throw new Error(`Erreur ${r.status}`);
    return r.json();
  },

  getAll: async () => {
    const r = await fetch(`${BASE_URL}/?include_deleted=true`);
    if (!r.ok) throw new Error(`Erreur ${r.status}`);
    return r.json();
  },

  create: async (payload) => {
    const r = await fetch(`${BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(JSON.stringify(err));
    }
    return r.json();
  },

  update: async (id, payload) => {
    const r = await fetch(`${BASE_URL}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(JSON.stringify(err));
    }
    return r.json();
  },

  archive: async (id) => {
    const r = await fetch(`${BASE_URL}/${id}/archive/`, { method: 'POST' });
    if (!r.ok) throw new Error(`Erreur ${r.status}`);
    return r.json();
  },

  restore: async (id) => {
    const r = await fetch(`${BASE_URL}/${id}/restore/`, { method: 'POST' });
    if (!r.ok) throw new Error(`Erreur ${r.status}`);
    return r.json();
  },

  permanentDelete: async (id) => {
    const r = await fetch(`${BASE_URL}/${id}/`, { method: 'DELETE' });
    if (!r.ok) throw new Error(`Erreur ${r.status}`);
    return r.status === 204 ? null : r.json();
  },
};

export default consultationService;