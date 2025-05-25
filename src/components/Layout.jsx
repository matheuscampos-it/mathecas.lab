// src/components/Layout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Layout() {
  const currentYear = new Date().getFullYear();

  const headerStyle = {
    // backgroundColor: 'var(--elements-background)', // Roxo como fundo do header
    backgroundColor: 'var(--night)', // Ou manter o fundo do header igual ao body e usar bordas
    padding: '1.5rem 2rem',
    textAlign: 'center',
    borderBottom: `2px solid var(--pomp-and-power)` // Borda roxa
  };

  const siteTitleStyle = {
    // color: 'var(--white-smoke)', // Texto branco sobre o fundo roxo
    color: 'var(--pomp-and-power)', // Título roxo sobre fundo --night
    margin: '0',
    fontSize: '2.5rem',
    textDecoration: 'none',
    fontWeight: 'bold', // Título mais destacado
  };

  const taglineStyle = {
    color: 'var(--text-secondary)',
    margin: '0.5rem 0 0',
    fontSize: '1rem'
  };

  const navLinkStyle = {
    margin: '0 0.75rem', // Espaçamento entre links
    color: 'var(--blue-munsell)', // Links da navegação
    fontWeight: '500',
    fontSize: '1.1rem'
  };
  
  const navLinkHoverStyle = { // Você precisaria de JS para hover em inline styles ou usar classes CSS
      // Para hover, é melhor usar classes CSS. Por agora, a tag <a> global cuidará disso.
  };


  const mainContentStyle = {
    flexGrow: 1,
    padding: '2rem',
    maxWidth: '1024px', // Um pouco mais de largura
    margin: '0 auto',
    width: '100%'
  };

  const footerStyle = {
    // backgroundColor: 'var(--elements-background)',
    backgroundColor: 'var(--night)',
    padding: '1.5rem 2rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    borderTop: `2px solid var(--pomp-and-power)`, // Borda roxa
    marginTop: 'auto'
  };

  return (
    <>
      <header style={headerStyle}>
        <Link to="/" style={siteTitleStyle}>mathecas.lab</Link>
        <p style={taglineStyle}>
          An interactive playground of experiments & curiosities.
        </p>
        <nav style={{ marginTop: '1.5rem' }}>
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/cosmic-sloth-oracle" style={navLinkStyle}>Cosmic Sloth Oracle</Link>
          {/* Adicione mais links aqui */}
        </nav>
      </header>

      <main style={mainContentStyle}>
        <Outlet />
      </main>

      <footer style={footerStyle}>
        <p>&copy; {currentYear} Matheus Campos. All experiments conducted with care (mostly).</p>
      </footer>
    </>
  );
}

export default Layout;