import React, { useState, useEffect } from 'react';
import { bookApi, memberApi, borrowingApi } from '../services/api';
import { BookOpen, Calendar, RotateCcw, Check } from 'lucide-react';

function Borrowings({ showToast }) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [filterMemberId, setFilterMemberId] = useState('');
  const [filteredBorrowings, setFilteredBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksData, membersData] = await Promise.all([
        bookApi.getAll(),
        memberApi.getAll(),
      ]);
      setBooks(booksData);
      setMembers(membersData);
    } catch (error) {
      showToast('Failed to load books or members lists.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId || !borrowDate) {
      showToast('Please select a book, member, and borrow date.', 'warning');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (borrowDate > todayStr) {
      showToast('Borrow date cannot be in the future.', 'error');
      return;
    }

    try {
      await borrowingApi.borrowBook(Number(selectedBookId), Number(selectedMemberId), borrowDate);
      showToast('Book borrowed successfully!', 'success');
      setSelectedBookId('');
      setSelectedMemberId('');
      setBorrowDate(todayStr);
      loadData(); // refresh book stock
      
      // If we are currently filtering for this member, refresh their list
      if (filterMemberId && Number(filterMemberId) === Number(selectedMemberId)) {
        fetchMemberBorrowings(filterMemberId);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to borrow book. Check book stock.';
      showToast(msg, 'error');
    }
  };

  const fetchMemberBorrowings = async (memberId) => {
    if (!memberId) {
      setFilteredBorrowings([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const data = await borrowingApi.getByMember(memberId);
      setFilteredBorrowings(data);
    } catch (error) {
      showToast('Failed to load member borrowings.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterMemberId(val);
    fetchMemberBorrowings(val);
  };

  const handleReturn = async (borrowingId) => {
    try {
      await borrowingApi.returnBook(borrowingId);
      showToast('Book returned successfully!', 'success');
      loadData(); // refresh book quantities
      fetchMemberBorrowings(filterMemberId); // refresh active lists
    } catch (error) {
      showToast('Failed to return book.', 'error');
    }
  };

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId);
    return book ? book.title : `Book #${bookId}`;
  };

  if (loading) {
    return <div className="loading-spinner">Initializing transaction manager...</div>;
  }

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <h1>Borrow &amp; Return Books</h1>
          <p>Lend books to registered members, process returns, and manage active loans.</p>
        </div>
      </div>

      <div className="borrow-grid" style={{ marginBottom: '2.5rem' }}>
        {/* Issue Book Card */}
        <div className="glass-card">
          <div className="section-title">
            <BookOpen size={20} style={{ color: 'var(--accent-indigo)' }} />
            <span>Issue / Borrow a Book</span>
          </div>

          <form onSubmit={handleBorrow}>
            <div className="form-group">
              <label>Select Patron *</label>
              <select
                className="form-control"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} (#{m.id}) - {m.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Book *</label>
              <select
                className="form-control"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
              >
                <option value="">-- Choose Book --</option>
                {books.map(b => (
                  <option key={b.id} value={b.id} disabled={b.quantity <= 0}>
                    {b.title} ({b.quantity} left) by {b.author}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Borrow Date *</label>
              <input
                type="date"
                className="form-control"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <Calendar size={18} /> Process Loan
            </button>
          </form>
        </div>

        {/* Return Book Section */}
        <div className="glass-card">
          <div className="section-title">
            <RotateCcw size={20} style={{ color: 'var(--accent-purple)' }} />
            <span>Return Book Manager</span>
          </div>

          <div className="form-group">
            <label>Select Patron to view borrowed list</label>
            <select
              className="form-control"
              value={filterMemberId}
              onChange={handleFilterChange}
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (#{m.id})
                </option>
              ))}
            </select>
          </div>

          {filterMemberId && (
            <div style={{ marginTop: '1.5rem' }}>
              {historyLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Querying loans...</div>
              ) : filteredBorrowings.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                  No active or past loans found for this patron.
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Borrowed Date</th>
                        <th style={{ textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBorrowings.map((loan) => (
                        <tr key={loan.id}>
                          <td style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                            {getBookTitle(loan.bookId)}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(loan.borrowDate).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {loan.status === 'RETURNED' ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', gap: '0.2rem', alignItems: 'center' }}>
                                <Check size={10} /> Returned
                              </span>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--warning)', color: 'var(--warning)' }}
                                onClick={() => handleReturn(loan.id)}
                              >
                                Return
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Borrowings;
