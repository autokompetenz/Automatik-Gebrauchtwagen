import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import AdminSidebar from '../../components/AdminSidebar';
import AdminErrorBoundary from '../../components/AdminErrorBoundary';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin())       return <Navigate to="/dashboard" replace />;

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <button
        type="button"
        className="admin-mobile-menu-btn"
        aria-expanded={sidebarOpen}
        aria-controls="admin-sidebar-nav"
        aria-label="Ouvrir le menu d’administration"
        onClick={() => setSidebarOpen(true)}
      >
        <span aria-hidden>☰</span>
      </button>
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-main">
        <div className="admin-main-inner">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </div>
      </main>
    </div>
  );
}
