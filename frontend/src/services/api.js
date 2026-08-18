import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Book Endpoints
export const bookApi = {
  getAll: () => api.get('/books').then(res => res.data),
  getById: (id) => api.get(`/books/${id}`).then(res => res.data),
  create: (book) => api.post('/books', book).then(res => res.data),
  update: (id, book) => api.put(`/books/${id}`, book).then(res => res.data),
  delete: (id) => api.delete(`/books/${id}`).then(res => res.data),
  search: (query) => api.get(`/books/search?query=${encodeURIComponent(query)}`).then(res => res.data),
  getLowStock: () => api.get('/books/low-stock').then(res => res.data),
};

// Member Endpoints
export const memberApi = {
  getAll: () => api.get('/members').then(res => res.data),
  getById: (id) => api.get(`/members/${id}`).then(res => res.data),
  create: (member) => api.post('/members', member).then(res => res.data),
  update: (id, member) => api.put(`/members/${id}`, member).then(res => res.data),
  delete: (id) => api.delete(`/members/${id}`).then(res => res.data),
  getJoinedYesterday: () => api.get('/members/joined-yesterday').then(res => res.data),
};

// Borrowing Endpoints
export const borrowingApi = {
  borrowBook: (bookId, memberId, borrowDate) => 
    api.post('/borrowings/borrow', { bookId, memberId, borrowDate }),
  returnBook: (id) => 
    api.put(`/borrowings/${id}/return`).then(res => res.data),
  getByMember: (memberId) => 
    api.get(`/borrowings/member/${memberId}`).then(res => res.data),
};

export default api;
