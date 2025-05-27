// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css'; // Certifique-se que este arquivo CSS existe e tem os estilos dos cards

function HomePage() {
  const projects = [
    {
      id: 'cosmic-sloth',
      title: 'Cosmic Sloth <span>Oracle</span>',
      description: 'Seek profoundly lazy wisdom from the stars. What does the universe have in store for your nap time?',
      link: '/cosmic-sloth-oracle',
      status: 'Interactive',
      cardStyle: { // Estilo inline para o card do Cosmic Sloth Oracle
        backgroundImage: `url('/images/sloth.png')`, // Caminho para sua imagem da preguiça
      }
    },
    {
      id: 'world-in-numbers',
      title: 'The World in <span>Numbers</span>',
      description: 'An interactive dashboard displaying global statistics and country-specific deep dives.',
      link: '/world-in-numbers',
      status: 'Dashboard',
      cardStyle: { 
        backgroundImage: `url('/images/world.png')`, 
      }
    },
    {
      id: 'accidental-melodies',
      title: 'Accidental <span>Melodies</span>',
      description: 'Become an unintentional composer. Click around and see what sonic accidents you can create.',
      link: '#', // Link placeholder até a página existir
      status: 'Planned'
    },
    {
      id: 'daily-what-if',
      title: 'Daily "<span>What If?</span>"',
      description: 'Explore absurd choices for everyday situations and their hilariously unpredictable outcomes.',
      link: '#', // Placeholder
      status: 'Planned'
    },
    {
      id: 'tiny-huge-gallery',
      title: 'Gallery of <span>Tiny/Huge</span> Things',
      description: 'An interactive journey through scale, from the unimaginably small to the cosmically vast.',
      link: '#', // Placeholder
      status: 'Planned'
    }
    // Adicione mais projetos aqui conforme eles surgem
  ];

  return (
    <>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Welcome to <span>mathecas.lab</span>!</h1>
        <p className={styles.heroSubtitle}>
          An interactive playground where curiosity meets code. Dive into a collection of unique experiments and digital oddities.
        </p>
        <div className={styles.actionButtonsContainer}>
          <a 
            href="https://www.linkedin.com/in/matheus-campos-it/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`${styles.actionButton} ${styles.linkedinButton}`}
          >
            Follow on LinkedIn
          </a>
          <a 
            href="mailto:campos98matheus@gmail.com" 
            className={`${styles.actionButton} ${styles.contactButton}`}
          >
            Contact Me
          </a>
          <a 
            href="#" // Atualize este link quando tiver sua página de doação
            className={`${styles.actionButton} ${styles.coffeeButton}`}
            title="Support my work!"
          >
            Buy Me a Coffee
          </a>
        </div>
      </section>

      <section className={styles.projectsArea}>
        <h2 className={styles.projectsGridTitle}>Explore The <span>Lab</span></h2>
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <article 
              key={project.id} 
              className={styles.projectCard}
              // Aplica o estilo de fundo inline se definido no objeto do projeto
              style={project.cardStyle || {}} 
            >
              {/* Div para o overlay de conteúdo, para garantir legibilidade sobre a imagem de fundo */}
              <div className={styles.cardContentOverlay}> 
                <h3 dangerouslySetInnerHTML={{ __html: project.title }}></h3>
                <p>{project.description}</p>
                
                {/* O Link ou Status Badge agora fica DENTRO do cardContentOverlay para melhor controle de layout */}
                {project.link === '#' ? (
                  <span className={styles.statusBadge} style={{backgroundColor: 'var(--text-secondary)', color: 'var(--night)'}}>{project.status}</span>
                ) : (
                  <Link to={project.link} className={styles.projectLink}>Explore Experiment</Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;