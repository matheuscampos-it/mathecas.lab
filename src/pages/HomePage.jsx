// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css'; // Mantenha a importação do seu CSS Module

function HomePage() {
  const projects = [
    {
      id: 'cosmic-sloth',
      title: 'Cosmic Sloth <span>Oracle</span>',
      description: 'Seek profoundly lazy wisdom from the stars. What does the universe have in store for your nap time?',
      link: '/cosmic-sloth-oracle',
      status: 'Coming Soon'
    },
    {
      id: 'accidental-melodies',
      title: 'Accidental <span>Melodies</span>',
      description: 'Become an unintentional composer. Click around and see what sonic accidents you can create.',
      link: '#',
      status: 'Planned'
    },
    {
      id: 'daily-what-if',
      title: 'Daily "<span>What If?</span>"',
      description: 'Explore absurd choices for everyday situations and their hilariously unpredictable outcomes.',
      link: '#',
      status: 'Planned'
    },
  ];

  return (
    <>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Welcome to <span>mathecas.lab</span>!</h1>
        <p className={styles.heroSubtitle}>
          An interactive playground where curiosity meets code. Dive into a collection of unique experiments and digital oddities.
        </p>
        
        {/* NOVA SEÇÃO DE BOTÕES DE AÇÃO */}
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
            href="#" // Link placeholder - substitua quando tiver sua página "Buy Me a Coffee"
            className={`${styles.actionButton} ${styles.coffeeButton}`}
            title="Support my work!" // Opcional: title para mais info no hover
          >
            Buy Me a Coffee
          </a>
        </div>
      </section>

      <section className={styles.projectsArea}>
        <h2 className={styles.projectsGridTitle}>Featured <span>Experiments</span></h2>
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <article key={project.id} className={styles.projectCard}>
              <h3 dangerouslySetInnerHTML={{ __html: project.title }}></h3>
              <p>{project.description}</p>
              {project.link === '#' ? (
                 <span style={{color: 'var(--text-secondary)', alignSelf: 'flex-start'}}>{project.status}...</span>
              ) : (
                <Link to={project.link}>Explore Project</Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;