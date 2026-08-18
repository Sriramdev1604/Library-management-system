import React, { useState, useEffect } from 'react';
import { memberApi, borrowingApi } from '../services/api';
import { Plus, Edit2, Trash2, X, History, User } from 'lucide-react';

function Members({ showToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipDate: '',
  });

  // Borrowings Modal states
  const [selectedMember, setSelectedMember] = useState(null);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberApi.getAll();
      setMembers(data);
    } catch (error) {
      showToast('Error loading library members.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      membershipDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      membershipDate: member.membershipDate || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await memberApi.delete(id);
      showToast('Member deleted successfully!', 'success');
      loadMembers();
    } catch (error) {
      showToast('Failed to delete member.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.membershipDate) {
      showToast('All fields (Name, Email, Phone, Enrollment Date) are required.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      if (editingId) {
        await memberApi.update(editingId, formData);
        showToast('Member details updated successfully!', 'success');
      } else {
        await memberApi.create(formData);
        showToast('Member enrolled successfully!', 'success');
      }
      setIsModalOpen(false);
      loadMembers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error saving member details. Ensure email is unique.';
      showToast(msg, 'error');
    }
  };

  const viewHistory = async (member) => {
    setSelectedMember(member);
    setHistoryLoading(true);
    try {
      const data = await borrowingApi.getByMember(member.id);
      setBorrowingHistory(data);
    } catch (error) {
      showToast('Error fetching member borrowings.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <h1>Enrolled Members</h1>
          <p>Register new patrons, update member records, and track borrowing histories.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Enroll New Member
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="loading-spinner">Loading members database...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No members enrolled in the library yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Enrolled Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#{member.id}</td>
                    <td style={{ fontWeight: '600' }}>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.phone || 'N/A'}</td>
                    <td>{member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ marginRight: '0.5rem', color: 'var(--accent-indigo)' }}
                        onClick={() => viewHistory(member)}
                        title="View Borrowing History"
                      >
                        <History size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => openEditModal(member)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => handleDelete(member.id)}
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

      {/* Enroll/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Member Details' : 'Enroll New Member'}</h2>
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
                <label>Patron Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john.doe@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 555-0199"
                  required
                />
              </div>
              <div className="form-group">
                <label>Enrollment Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.membershipDate}
                  onChange={(e) => setFormData({ ...formData, membershipDate: e.target.value })}
                  required
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
                  {editingId ? 'Save Changes' : 'Enroll Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrowing History Modal */}
      {selectedMember && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} style={{ color: 'var(--accent-indigo)' }} />
                <span>History: {selectedMember.name}</span>
              </h2>
              <button
                className="btn btn-secondary btn-icon"
                style={{ borderRadius: '50%' }}
                onClick={() => setSelectedMember(null)}
              >
                <X size={16} />
              </button>
            </div>

            {historyLoading ? (
              <div className="loading-spinner">Loading borrowings...</div>
            ) : borrowingHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                No borrowing history found for this member.
              </div>
            ) : (
              <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Book ID</th>
                      <th>Borrow Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowingHistory.map((history) => (
                      <tr key={history.id}>
                        <td style={{ fontFamily: 'monospace' }}>Book #{history.bookId}</td>
                        <td>{new Date(history.borrowDate).toLocaleDateString()}</td>
                        <td>
                          {history.returnDate ? new Date(history.returnDate).toLocaleDateString() : '-'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              history.status === 'RETURNED' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            {history.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedMember(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
