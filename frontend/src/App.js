import React, { useState, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Books from './components/Books';
import Members from './components/Members';
import Borrowings from './components/Borrowings';
import { Library, LayoutDashboard, BookOpen, Users, CalendarClock, AlertCircle, CheckCircle2, Info } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard showToast={showToast} />;
      case 'books':
        return <Books showToast={showToast} />;
      case 'members':
        return <Members showToast={showToast} />;
      case 'borrowings':
        return <Borrowings showToast={showToast} />;
      default:
        return <Dashboard showToast={showToast} />;
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Library size={28} style={{ color: 'var(--accent-indigo)' }} />
          <span>Libraria</span>
        </div>
        <nav>
          <ul className="sidebar-menu">
            <li
              className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </li>
            <li
              className={`menu-item ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              <BookOpen size={20} />
              <span>Books</span>
            </li>
            <li
              className={`menu-item ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <Users size={20} />
              <span>Members</span>
            </li>
            <li
              className={`menu-item ${activeTab === 'borrowings' ? 'active' : ''}`}
              onClick={() => setActiveTab('borrowings')}
            >
              <CalendarClock size={20} />
              <span>Borrow/Return</span>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main viewport */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
