import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// === Subjects ===
export const subjectApi = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// === Decks ===
export const deckApi = {
  getBySubject: (subjectId) => api.get(`/subjects/${subjectId}/decks`),
  getById: (id) => api.get(`/decks/${id}`),
  create: (subjectId, data) => api.post(`/subjects/${subjectId}/decks`, data),
  update: (id, data) => api.put(`/decks/${id}`, data),
  delete: (id) => api.delete(`/decks/${id}`),
};

// === Questions ===
export const questionApi = {
  getByDeck: (deckId, page = 0, size = 50) =>
    api.get(`/decks/${deckId}/questions?page=${page}&size=${size}`),
  getById: (id) => api.get(`/questions/${id}`),
  create: (deckId, data) => api.post(`/decks/${deckId}/questions`, data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

// === Test ===
export const testApi = {
  generate: (data) => api.post('/tests/generate', data),
  submit: (data) => api.post('/tests/submit', data),
};

// === History ===
export const historyApi = {
  getAll: (page = 0, size = 20, deckId = null) => {
    let url = `/test-histories?page=${page}&size=${size}`;
    if (deckId) url += `&deckId=${deckId}`;
    return api.get(url);
  },
  delete: (id) => api.delete(`/test-histories/${id}`),
};

// === Import ===
export const importApi = {
  previewText: (deckId, rawText) => api.post(`/decks/${deckId}/import/preview/text`, { rawText }),
  previewExcel: (deckId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/decks/${deckId}/import/preview/excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  commit: (deckId, questions) => api.post(`/decks/${deckId}/import/commit`, questions),
};

export default api;
