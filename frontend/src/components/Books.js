import React, { useState, useEffect } from 'react';
import { bookApi } from '../services/api';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';

function Books({ showToast }) {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    isbn: '',
    quantity: 1,
    publishedDate: '',
  });

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookApi.getAll();
      setBooks(data);
    } catch (error) {
      showToast('Error loading books.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      loadBooks();
      return;
    }
    try {
      const data = await bookApi.search(query);
      setBooks(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      author: '',
      isbn: '',
      quantity: 1,
      publishedDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingId(book.id);
    setFormData({
      name: book.title,
      author: book.author,
      isbn: book.isbn,
      quantity: book.quantity,
      publishedDate: book.publishedDate || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await bookApi.delete(id);
      showToast('Book deleted successfully!', 'success');
      loadBooks();
    } catch (error) {
      showToast('Failed to delete book.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.author || !formData.isbn) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    if (formData.quantity < 0) {
      showToast('Quantity cannot be negative.', 'error');
      return;
    }

    if (formData.publishedDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (formData.publishedDate > todayStr) {
        showToast('Published date cannot be in the future.', 'error');
        return;
      }
    }

    try {
      if (editingId) {
        await bookApi.update(editingId, formData);
        showToast('Book updated successfully!', 'success');
      } else {
        await bookApi.create(formData);
        showToast('Book added successfully!', 'success');
      }
      setIsModalOpen(false);
      loadBooks();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error saving book details.';
      showToast(msg, 'error');
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <h1>Manage Books</h1>
          <p>Browse, search, add, edit, or remove books from the library catalogue.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add New Book
        </button>
      </div>

      <div className="action-bar glass-card" style={{ padding: '1rem', marginBottom: '2rem' }}>
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <button className="btn btn-secondary" onClick={loadBooks}>
          Refresh List
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="loading-spinner">Loading catalogue...</div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No books found matching the search criteria.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Quantity</th>
                  <th>Published Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td style={{ fontWeight: '600' }}>{book.title}</td>
                    <td>{book.author}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{book.isbn}</td>
                    <td>
                      <span className={`badge ${book.quantity < 5 ? 'badge-danger' : 'badge-success'}`}>
                        {book.quantity} copies
                      </span>
                    </td>
                    <td>{book.publishedDate ? new Date(book.publishedDate).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => openEditModal(book)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => handleDelete(book.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Book Details' : 'Add New Book'}</h2>
              <button
                className="btn btn-secondary btn-icon"
                style={{ borderRadius: '50%' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. The Great Gatsby"
                  required
                />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. F. Scott Fitzgerald"
                  required
                />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  placeholder="e.g. 9780743273565"
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Published Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.publishedDate}
                  onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Details' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
