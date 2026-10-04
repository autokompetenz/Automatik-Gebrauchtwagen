import { Component } from 'react';

export default class AdminErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('AdminErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px 24px', minHeight: '50vh', background: 'var(--bg)' }}>
          <h2 style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 12 }}>
            Une erreur est survenue
          </h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
            Rechargez la page ou retournez à la liste des véhicules.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => { window.location.href = '/admin/cars'; }}
          >
            Retour aux véhicules
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
