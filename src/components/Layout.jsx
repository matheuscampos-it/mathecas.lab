// src/components/Layout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

// Supondo que seu CSS global (index.css ou App.css) já defina as variáveis de cor
// como --night, --pomp-and-power, --white-smoke, --text-secondary, --blue-munsell, etc.

function Layout() {
  const currentYear = new Date().getFullYear();

  const headerStyle = {
    backgroundColor: 'var(--night)', 
    padding: '1.5rem 2rem',
    textAlign: 'center',
    borderBottom: `2px solid var(--pomp-and-power)` 
  };

  const siteTitleStyle = {
    color: 'var(--pomp-and-power)', 
    margin: '0',
    fontSize: '2.5rem',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  const taglineStyle = {
    color: 'var(--text-secondary)',
    margin: '0.5rem 0 0',
    fontSize: '1rem'
  };

  const mainContentStyle = {
    flexGrow: 1, // Para o footer ficar no final da página
    padding: '2rem', // Padding principal do conteúdo
    maxWidth: '1300px', // Mantendo a largura do WorldInNumbersPage
    margin: '0 auto',
    width: '100%'
  };

  const footerStyle = {
    backgroundColor: 'var(--night)',
    padding: '1.5rem 2rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    borderTop: `2px solid var(--pomp-and-power)`,
    marginTop: 'auto' // Garante que o footer fique no final se o conteúdo for pequeno
  };

  return (
    <> {/* O elemento root ou body já deve ter display: flex; flex-direction: column; min-height: 100vh; */}
      <header style={headerStyle}>
        <Link to="/" style={siteTitleStyle}>mathecas.lab</Link>
        <p style={taglineStyle}>
          An interactive playground of experiments & curiosities.
        </p>
        {/* A seção <nav> foi removida daqui */}
      </header>

      <main style={mainContentStyle}>
        <Outlet /> {/* Os componentes de cada rota serão renderizados aqui */}
      </main>

      <footer style={footerStyle}>
        <p>&copy; {currentYear} Matheus Campos. All experiments conducted with care (mostly).</p>
      </footer>
    </>
  );
}

export default Layout;