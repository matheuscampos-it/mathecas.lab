// src/pages/CosmicSlothOracle/CosmicSlothOraclePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './CosmicSlothOraclePage.module.css';

const slothWisdom = [
  "The stars whisper: your greatest adventure today will be finding the comfiest spot on the couch.",
  "Cosmic alignment indicates a strong probability of 'leaving it for tomorrow'.",
  "The universe conspires... for you to watch just one more episode.",
  "A journey of a thousand miles begins with a single... nah, too much effort.",
  "Embrace the void. Especially if the void has snacks and a good Wi-Fi signal.",
  "Today's forecast: 100% chance of needing a nap.",
  "The path to enlightenment is paved with... pillows. Lots of pillows.",
  "Consider this: is it procrastination, or are you just marinating your genius?",
  "The Cosmic Sloth reminds you: 'Why stand when you can sit? Why sit when you can lie down?'",
  "Let your ambitions be as vast as the cosmos, and your efforts as minimal as a sleeping sloth.",
  "The optimal strategy often involves doing nothing, very slowly.",
  "Ponder the mysteries of the universe... or just what's for dinner. Both are valid.",
  "Remember, 'later' is a perfectly acceptable timeframe.",
  "The universe is expanding. So is your to-do list, if you let it. Don't let it.",
  "Gravitational forces suggest you remain horizontal for optimal cosmic reception."
];

const intermediaryMessagesConfig = [
  { text: "The Cosmic Sloth has acknowledged your... *yawn*... input.", duration: 2000 + Math.random() * 500 },
  { text: "Consulting the astral fluff... sifting through cosmic dust bunnies...", duration: 2500 + Math.random() * 1000 },
  { text: "Almost there... just need to align with the laziest timeline...", duration: 2000 + Math.random() * 700 }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function CosmicSlothOraclePage() {
  const [userInput, setUserInput] = useState('');
  const [displayedMessage, setDisplayedMessage] = useState("Whisper your cosmic query, or just a vibe, and see what the Sloth has to say...");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalWisdom, setIsFinalWisdom] = useState(false);

  const consultationIdRef = useRef(0); // Usaremos um contador simples para o ID da consulta

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const consultOracle = async () => {
    const currentConsultationId = ++consultationIdRef.current; // Incrementa e pega o novo ID
    console.log(`--- consultOracle Initiated (ID: ${currentConsultationId}) ---`);
    
    setIsLoading(true);
    setIsFinalWisdom(false);
    setDisplayedMessage("The Sloth is Pondering your query... or perhaps just pondering.");
    console.log(`(ID: ${currentConsultationId}) Initial state: isLoading=true, Pondering message set.`);

    try {
      for (let i = 0; i < intermediaryMessagesConfig.length; i++) {
        const msgConfig = intermediaryMessagesConfig[i];
        await sleep(msgConfig.duration);

        // Verifica se esta ainda é a consulta ativa (mais recente)
        if (consultationIdRef.current !== currentConsultationId) {
          console.log(`(ID: ${currentConsultationId}) Intermediary message ${i + 1} for an outdated consultation. Aborting.`);
          return; // Aborta esta instância da função async
        }
        
        console.log(`(ID: ${currentConsultationId}) Intermediate message ${i + 1}:`, msgConfig.text);
        setDisplayedMessage(msgConfig.text);
      }

      await sleep(1000 + Math.random() * 500); // Delay final antes da sabedoria

      if (consultationIdRef.current !== currentConsultationId) {
        console.log(`(ID: ${currentConsultationId}) Final wisdom for an outdated consultation. Aborting.`);
        return;
      }

      console.log(`(ID: ${currentConsultationId}) >>> Final Wisdom Processing! <<<`);
      const randomIndex = Math.floor(Math.random() * slothWisdom.length);
      let finalWisdomText = slothWisdom[randomIndex];

      if (userInput.trim() !== "") {
        const words = userInput.trim().toLowerCase().split(/\s+/).filter(word => word.length > 2);
        if (words.length > 0) {
          const randomWordFromInput = words[Math.floor(Math.random() * words.length)];
          if (Math.random() < 0.4) {
            finalWisdomText = `Regarding your ponderings on "${randomWordFromInput}"... ${finalWisdomText}`;
          }
        }
      }

      console.log(`(ID: ${currentConsultationId}) Final wisdom to display:`, finalWisdomText);
      setDisplayedMessage(finalWisdomText);
      setIsFinalWisdom(true);
      setUserInput('');
      
    } catch (error) {
      console.error(`(ID: ${currentConsultationId}) Error during consultation:`, error);
    } finally {
      // Este bloco finally será executado para CADA instância de consultOracle que chegar até aqui.
      // Queremos setar isLoading para false APENAS se esta for a consulta MAIS RECENTE.
      if (consultationIdRef.current === currentConsultationId) {
        setIsLoading(false);
        console.log(`(ID: ${currentConsultationId})isLoading set to false in finally.`);
      } else {
        console.log(`(ID: ${currentConsultationId}) Outdated consultation reached finally. isLoading not changed by this instance.`);
      }
    }
  };

  // Não precisamos mais do useEffect para limpar timeouts aqui, pois async/await
  // não deixa "timeouts pendentes" da mesma forma que múltiplos setTimeouts manuais
  // se a função async for abortada por um return. O 'sleep' é uma Promise, e se a
  // função que a aguarda retorna, a Promise continua até resolver ou rejeitar, mas
  // o código subsequente na função async não roda.

  return (
    <div className={styles.oracleContainer}>
      <header className={styles.oracleHeader}>
        <h2 className={styles.title}>Cosmic Sloth Oracle</h2>
        <p className={styles.description}>
          Gaze into the swirling nebulae of procrastination and receive your nugget of slothful enlightenment.
        </p>
      </header>

      <div className={styles.inputArea}>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Whisper your cosmic query (or just a vibe)..."
          className={styles.queryInput}
          disabled={isLoading}
        />
      </div>

      <div className={styles.interactionArea}>
        <button
          onClick={consultOracle}
          className={styles.oracleButton}
          disabled={isLoading}
        >
          {isLoading ? "Sloth is Pondering..." : "Consult the Cosmic Sloth"}
        </button>
      </div>

      <div className={`${styles.responseArea} ${isFinalWisdom ? styles.finalWisdomResponse : ''}`}>
        <p 
          className={
            isLoading && !isFinalWisdom && displayedMessage === "The Sloth is Pondering your query... or perhaps just pondering."
              ? styles.loadingWisdom 
              : (isLoading && !isFinalWisdom
                  ? styles.intermediaryMessage 
                  : (isFinalWisdom 
                      ? styles.revealedWisdom 
                      : styles.initialMessage
                    )
                )
          }
        >
          {displayedMessage}
        </p>
      </div>

      <footer className={styles.oracleFooter}>
        <p>Remember: Patience is a virtue, especially when waiting for cosmic sloth wisdom.</p>
      </footer>
    </div>
  );
}

export default CosmicSlothOraclePage;