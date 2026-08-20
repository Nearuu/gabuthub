import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F141C',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>GabutHub Local Error Handler</h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', maxWidth: '500px', marginBottom: '20px' }}>
            {this.state.error?.toString() || "Terjadi kesalahan kecil saat merender komponen."}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              backgroundColor: '#00E575',
              color: '#000000',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Reset Cache & Segarkan Aplikasi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
