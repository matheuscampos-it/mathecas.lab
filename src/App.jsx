// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Importe o Layout
import HomePage from './pages/HomePage'; // Importe a HomePage
import CosmicSlothOraclePage from './pages/CosmicSlothOracle/CosmicSlothOraclePage';

// Opcional: Crie uma página Not Found
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}> {/* Layout é o pai de todas as rotas aninhadas */}
        <Route index element={<HomePage />} /> {/* Rota para a página inicial */}
        <Route path="cosmic-sloth-oracle" element={<CosmicSlothOraclePage />} />
        {/* Adicione mais rotas para outros projetos aqui: */}
        {/* <Route path="accidental-melodies" element={<AccidentalMelodiesPage />} /> */}
        {/* <Route path="*" element={<NotFoundPage />} />  Routa para "página não encontrada" */}
      </Route>
    </Routes>
  );
}

export default App;