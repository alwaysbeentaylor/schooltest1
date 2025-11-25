// Simple Error Boundary to catch crashes (like the White Screen)
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1 style={{ color: '#dc2626' }}>Er is iets misgegaan.</h1>
          <p>Controleer de console voor meer details.</p>
          <pre style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', overflow: 'auto', textAlign: 'left', maxWidth: '800px', margin: '20px auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#1f2937', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Pagina Herladen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);