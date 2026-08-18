import React, { useState, useEffect } from 'react';
import { bookApi, memberApi } from '../services/api';
import { BookOpen, Users, AlertTriangle, UserCheck, Calendar } from 'lucide-react';

function Dashboard({ showToast }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    lowStockCount: 0,
    joinedYesterdayCount: 0,
  });
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [newMembers, setNewMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [books, members, lowStock, joinedYesterday] = await Promise.all([
          bookApi.getAll(),
          memberApi.getAll(),
          bookApi.getLowStock(),
          memberApi.getJoinedYesterday(),
        ]);

        setStats({
          totalBooks: books.length,
          totalMembers: members.length,
          lowStockCount: lowStock.length,
          joinedYesterdayCount: joinedYesterday.length,
        });

        setLowStockBooks(lowStock);
        setNewMembers(joinedYesterday);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        showToast('Failed to load dashboard metrics.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [showToast]);

  if (loading) {
    return <div className="loading-spinner">Loading dashboard analytics...</div>;
  }

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <h1>Library Analytics</h1>
          <p>Real-time metrics, low stock warnings, and recent member activities.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Total Books</h3>
            <p>{stats.totalBooks}</p>
          </div>
          <div className="stat-icon bg-blue">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Total Members</h3>
            <p>{stats.totalMembers}</p>
          </div>
          <div className="stat-icon bg-purple">
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Low Stock Books</h3>
            <p>{stats.lowStockCount}</p>
          </div>
          <div className="stat-icon bg-orange">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Members Joined Yesterday</h3>
            <p>{stats.joinedYesterdayCount}</p>
          </div>
          <div className="stat-icon bg-pink">
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Low Stock Warnings */}
        <div className="glass-card">
          <div className="section-title">
            <AlertTriangle size={20} className="text-warning" style={{ color: 'var(--warning)' }} />
            <span>Low Stock Warnings (Qty &lt; 5)</span>
          </div>
          <div className="table-container">
            {lowStockBooks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No low stock alerts. All books are well stocked!</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockBooks.map((book) => (
                    <tr key={book.id}>
                      <td style={{ fontWeight: '500' }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        <span className="badge badge-danger">{book.quantity} left</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Members Joined Yesterday */}
        <div className="glass-card">
          <div className="section-title">
            <Calendar size={20} className="text-purple" style={{ color: 'var(--accent-purple)' }} />
            <span>Joined Yesterday</span>
          </div>
          <div className="table-container">
            {newMembers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No new members joined yesterday.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {newMembers.map((member) => (
                    <tr key={member.id}>
                      <td style={{ fontWeight: '500' }}>{member.name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
