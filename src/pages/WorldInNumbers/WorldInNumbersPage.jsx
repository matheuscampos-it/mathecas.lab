// src/pages/WorldInNumbers/WorldInNumbersPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './WorldInNumbersPage.module.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const capitalizeCountryName = (name) => {
  if (!name) return '';
  return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const parseOwIDTimeSeriesCSV = (csvText, entityName, yearColumnName, valueColumnName, entityColumnName = 'Entity') => {
  // console.log(`Parsing CSV for entity: "${entityName}", value column: "${valueColumnName}"`);
  const lines = csvText.split('\n');
  if (lines.length < 2) { console.warn(`CSV: File for ${valueColumnName} is empty or only headers.`); return []; }

  const headers = lines[0].trim().split(',');
  const entityIdx = headers.indexOf(entityColumnName);
  const yearIdx = headers.indexOf(yearColumnName);
  const valueIdx = headers.indexOf(valueColumnName);

  if (entityIdx === -1) console.error(`CSV Error: Column "${entityColumnName}" not found for ${valueColumnName}. Headers:`, headers);
  if (yearIdx === -1) console.error(`CSV Error: Column "${yearColumnName}" not found for ${valueColumnName}. Headers:`, headers);
  if (valueIdx === -1) console.error(`CSV Error: Column "${valueColumnName}" not found for ${valueColumnName}. Headers:`, headers);
  
  if (entityIdx === -1 || yearIdx === -1 || valueIdx === -1) return [];

  const history = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');

    if (values.length > Math.max(entityIdx, yearIdx, valueIdx) && values[entityIdx]?.trim().toLowerCase() === entityName.toLowerCase()) {
      const year = parseInt(values[yearIdx]?.trim(), 10);
      const rawValue = values[valueIdx]?.trim().replace(/,/g, '');
      const value = parseFloat(rawValue);

      if (!isNaN(year) && !isNaN(value)) {
        history.push({ year, value });
      }
    }
  }
  history.sort((a, b) => a.year - b.year);
  if (history.length > 0) {
    // console.log(`Parsed ${valueColumnName} for ${entityName} (count: ${history.length}, first 5):`, history.slice(0, 5));
  } else {
    // console.warn(`No data parsed for ${valueColumnName} for entity ${entityName}`);
  }
  return history;
};


function WorldInNumbersPage() {
  // --- Estados --- (como antes)
  const [worldPopulation, setWorldPopulation] = useState(null);
  const [basePopulation, setBasePopulation] = useState(null);
  const [populationYear, setPopulationYear] = useState('');
  const [internetUsers, setInternetUsers] = useState(null);
  const [internetUsersYear, setInternetUsersYear] = useState('');
  const [withoutElectricityGlobal, setWithoutElectricityGlobal] = useState(null);
  const [withoutElectricityGlobalYear, setWithoutElectricityGlobalYear] = useState('');
  const [employedAgricultureGlobal, setEmployedAgricultureGlobal] = useState(null);
  const [employedAgricultureGlobalYear, setEmployedAgricultureGlobalYear] = useState('');
  const [undernourishedGlobal, setUndernourishedGlobal] = useState(null);
  const [undernourishedGlobalYear, setUndernourishedGlobalYear] = useState('');
  const [extremePovertyGlobal, setExtremePovertyGlobal] = useState(null);
  const [extremePovertyGlobalYear, setExtremePovertyGlobalYear] = useState('');

  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');
  
  // Históricos por país
  const [countryPopulationHistory, setCountryPopulationHistory] = useState([]);
  const [countryInternetHistory, setCountryInternetHistory] = useState([]);
  const [countryWithoutElectricityHistory, setCountryWithoutElectricityHistory] = useState([]);
  const [countryEmployedAgricultureHistory, setCountryEmployedAgricultureHistory] = useState([]);
  const [countryUndernourishedHistory, setCountryUndernourishedHistory] = useState([]);
  const [countryExtremePovertyHistory, setCountryExtremePovertyHistory] = useState([]);

  const [chartData, setChartData] = useState({ labels: [], datasets: [] }); // Inicializado corretamente
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [isLoadingCountry, setIsLoadingCountry] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [errorCountry, setErrorCountry] = useState(null);
  
  // --- Opções do Gráfico ATUALIZADAS ---
  const chartOptions = { // Removido useRef aqui, vamos passar como prop diretamente
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: 'var(--white-smoke)', font: { size: 13 }, padding: 15, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 12 }},
      title: { display: true, text: 'Historical Data - Select a Country', color: 'var(--white-smoke)', font: { size: 18, weight: '600' }, padding: { top: 15, bottom: 25 }},
      tooltip: { 
        backgroundColor: 'rgba(29, 37, 43, 0.95)', titleColor: 'var(--pomp-and-power)', titleFont: { weight: 'bold', size: 14 },
        bodyColor: 'var(--white-smoke)', bodyFont: { size: 12 }, padding: 10,
        borderColor: 'var(--pomp-and-power)', borderWidth: 1, cornerRadius: 6, displayColors: true, boxPadding: 4,
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.y !== null) {
                    const value = context.parsed.y;
                    if (Math.abs(value) >= 1000000) label += (value / 1000000).toFixed(1) + 'M';
                    else if (Math.abs(value) >= 1000) label += (value / 1000).toFixed(0) + 'K';
                    else label += new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(value);
                }
                return label;
            }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Year', color: 'var(--white-smoke)', font: {size: 13, weight: '500'} },
        ticks: { color: 'var(--text-secondary)', maxRotation: 45, minRotation: 45, font: {size: 11}, autoSkipPadding: 20 },
        grid: { color: 'rgba(245, 243, 245, 0.1)' } 
      },
      // ÚNICO Eixo Y Principal (Esquerda)
      yMain: { 
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Value', color: 'var(--white-smoke)', font: {size:14, weight: '500'} }, // Título genérico
        ticks: { 
            color: 'var(--text-secondary)', 
            font: {size:11}, 
            callback: (value) => { // Formatação K/M
                if (Math.abs(value) >= 1000000) return `${(value/1000000).toFixed(1)}M`;
                if (Math.abs(value) >= 1000) return `${(value/1000).toFixed(0)}K`;
                return value;
            } 
        },
        grid: { drawOnChartArea: true, color: 'rgba(245, 243, 245, 0.15)' } 
      }
    }
  };


  // --- Funções de Fetch (fetchWorldBankData, fetchOwIDGlobalData, fetchOwIDCountryHistory) ---
  // (Estas funções permanecem como na última versão completa que te enviei. Vou omiti-las aqui por brevidade,
  // mas certifique-se de que elas estão corretas no seu código, especialmente os console.logs e tratamento de erro)
  const fetchWorldBankData = useCallback(async (countryCodeOrGlobal, indicator, yearSetter, dataSetter, dataLabel, yearsToTry = 5, isHistory = false) => { /* ...código como antes... */ 
    console.log(`WB: Fetching ${dataLabel} for ${countryCodeOrGlobal}...`);
    let dateParam = `date=${new Date().getFullYear() - yearsToTry + 1}:${new Date().getFullYear()}`;
    let perPageParam = `per_page=100`;

    if (!isHistory) {
        for (let i = 0; i < yearsToTry; i++) {
            const yearToTry = new Date().getFullYear() - i;
            const apiUrl = `https://api.worldbank.org/v2/country/${countryCodeOrGlobal}/indicator/${indicator}?format=json&date=${yearToTry}&per_page=1`;
            try {
                const res = await fetch(apiUrl);
                if (!res.ok) { /*console.warn(`WB: Not OK for ${dataLabel} ${yearToTry}: ${res.status}`);*/ continue; }
                const data = await res.json();
                if (data && data[1] && data[1][0] && data[1][0].value !== null) {
                    if(yearSetter) yearSetter(data[1][0].date); 
                    if(dataSetter) dataSetter(data[1][0].value);
                    // console.log(`WB Global: OK for ${dataLabel} ${data[1][0].date}:`, data[1][0].value);
                    return data[1][0].value;
                }
            } catch (e) { console.error(`WB Error for ${dataLabel} ${yearToTry}:`, e); }
        }
        if(dataSetter) dataSetter(null); if(yearSetter) yearSetter('N/A (WB)');
        // console.warn(`WB: No global data for ${dataLabel}`);
        return null;
    }
    // Para histórico
    const apiUrl = `https://api.worldbank.org/v2/country/${countryCodeOrGlobal}/indicator/${indicator}?format=json&${dateParam}&${perPageParam}`;
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) { /*console.warn(`WB History: Not OK for ${dataLabel} ${countryCodeOrGlobal}: ${res.status}`);*/ return []; }
        const data = await res.json();
        if (data && data[1]) {
            const history = data[1].filter(item => item.value !== null)
                                 .map(item => ({ year: parseInt(item.date), value: item.value }))
                                 .sort((a, b) => a.year - b.year);
            // console.log(`WB History: OK for ${dataLabel} ${countryCodeOrGlobal} (count: ${history.length}):`, history.slice(0,5));
            return history;
        }
    } catch (e) { console.error(`WB History Error for ${dataLabel} ${countryCodeOrGlobal}:`, e); }
    // console.warn(`WB: No history data for ${dataLabel} ${countryCodeOrGlobal}`);
    return [];
  }, []);
  
  const fetchOwIDGlobalData = useCallback(async (csvFileName, valueColumnName, yearSetter, dataSetter, dataLabel, unitConversion = val => val) => {
    // console.log(`OWID Global: Fetching ${dataLabel} from ${csvFileName}...`);
    try {
        const res = await fetch(`/data/${csvFileName}`);
        if (!res.ok) { /*console.error(`OWID Global ${dataLabel}: Fetch failed for ${csvFileName}`);*/ dataSetter(null); yearSetter('N/A'); return null;}
        const text = await res.text();
        const history = parseOwIDTimeSeriesCSV(text, 'World', 'Year', valueColumnName);
        if (!history || history.length === 0) { 
            // console.warn(`OWID Global ${dataLabel}: No history parsed for World in ${csvFileName}`);
            dataSetter(null); yearSetter('N/A (OWID)'); return null;
        }
        const latest = history[history.length -1]; 
        if(latest) {
            const finalValue = unitConversion(latest.value);
            if(yearSetter) yearSetter(String(latest.year)); 
            if(dataSetter) dataSetter(finalValue);
            // console.log(`OWID Global ${dataLabel}: OK for ${latest.year}`, finalValue);
            return finalValue;
        }
    } catch(e){console.error(`OWID Global ${dataLabel} Error:`, e);}
    if(dataSetter) dataSetter(null); if(yearSetter) yearSetter('N/A (OWID)');
    // console.warn(`OWID Global ${dataLabel}: No data for World in ${csvFileName}`);
    return null;
  }, []);

  const fetchOwIDCountryHistory = useCallback(async (csvFileName, countryName, valueColumnName, dataLabel, unitConversion = val => val) => {
    if (!countryName) return [];
    // console.log(`OWID Country ${dataLabel}: Fetching history for ${countryName} from ${csvFileName}...`);
    try {
      const response = await fetch(`/data/${csvFileName}`);
      if (!response.ok) { throw new Error(`Failed to load ${csvFileName} for country history`); }
      const csvText = await response.text();
      const history = parseOwIDTimeSeriesCSV(csvText, countryName, 'Year', valueColumnName);
      return history.map(item => ({ ...item, value: unitConversion(item.value) }));
    } catch (e) { console.error(`OWID Country ${dataLabel} History Error for ${countryName}:`, e); return []; }
  }, []);


  // --- useEffects ---
  useEffect(() => { /* Efeito para loadGlobalData como antes */ 
    const loadGlobalData = async () => {
      setIsLoadingGlobal(true);
      setErrorGlobal(null);
      await Promise.allSettled([
        fetchWorldBankData('WLD', 'SP.POP.TOTL', setPopulationYear, setBasePopulation, 'World Population', 5, false),
        fetchOwIDGlobalData('number-of-internet-users.csv', 'Number of Internet users', setInternetUsersYear, setInternetUsers, 'Internet Users'),
        fetchOwIDGlobalData('people-without-electricity.csv', 'Access to electricity (number of people without access)', setWithoutElectricityGlobalYear, setWithoutElectricityGlobal, 'People w/o Electricity'),
        fetchOwIDGlobalData('employed-in-agriculture.csv', 'number_employed_agri', setEmployedAgricultureGlobalYear, setEmployedAgricultureGlobal, 'Employed in Agriculture'),
        fetchOwIDGlobalData('undernourished-people.csv', '2.1.1 Number of undernourished people | 000000000024001 || Value | 006132 || millions', setUndernourishedGlobalYear, setUndernourishedGlobal, 'Undernourished People', (val) => val),
        fetchOwIDGlobalData('extreme-poverty.csv', '$2.15 a day - Number in poverty', setExtremePovertyGlobalYear, setExtremePovertyGlobal, 'People in Extreme Poverty')
      ]);
      setIsLoadingGlobal(false);
    };
    loadGlobalData();
  }, [fetchWorldBankData, fetchOwIDGlobalData]);
  
  useEffect(() => { /* Contador de população global como antes */ 
    if (basePopulation === null || isLoadingGlobal) return;
    setWorldPopulation(basePopulation);
    const interval = setInterval(() => setWorldPopulation(prev => Math.floor(prev + 2.7)), 1000);
    return () => clearInterval(interval);
  }, [basePopulation, isLoadingGlobal]);

  useEffect(() => { /* Popular lista de países como antes */
    const getCountryList = async () => {
      try {
        const response = await fetch('/data/number-of-internet-users.csv'); 
        if (!response.ok) throw new Error('Failed to load country list data');
        const csvText = await response.text();
        const lines = csvText.split('\n').slice(1);
        const countriesMap = new Map();
        lines.forEach(line => {
          const values = line.trim().split(',');
          if (values.length >= 2 && values[0] && values[1] && values[1].trim().length === 3 && values[1].trim().toUpperCase() !== 'OWID_WRL') {
            countriesMap.set(values[1].trim().toUpperCase(), capitalizeCountryName(values[0].trim()));
          }
        });
        const sortedCountries = Array.from(countriesMap.entries())
                                     .sort((a,b) => a[1].localeCompare(b[1]))
                                     .map(([code, name]) => ({ code, name }));
        setCountryList(sortedCountries);
        const brazil = sortedCountries.find(c => c.code === 'BRA');
        if (brazil) { setSelectedCountry(brazil.code); setSelectedCountryName(brazil.name); }
      } catch (error) { console.error("Error populating country list:", error); setErrorCountry("Could not load country list."); }
    };
    getCountryList();
  }, []);

  // Efeito para buscar dados do PAÍS SELECIONADO (ATUALIZADO)
  useEffect(() => {
    if (!selectedCountry || !selectedCountryName) {
      setChartData({ labels: [], datasets: [] });
      // Limpar históricos específicos
      setCountryPopulationHistory([]); setCountryInternetHistory([]); setCountryWithoutElectricityHistory([]);
      setCountryEmployedAgricultureHistory([]); setCountryUndernourishedHistory([]); setCountryExtremePovertyHistory([]);
      return;
    }

    const loadCountryData = async () => {
      console.log(`Loading all historical data for selected country: ${selectedCountryName} (${selectedCountry})`);
      setIsLoadingCountry(true);
      setErrorCountry(null);
      setChartData({ labels: [], datasets: [] }); // Limpa o gráfico anterior

      try {
        const [
            popHistory, internetHistory, withoutElectricityHistory, 
            employedAgricultureHistory, undernourishedHistory, extremePovertyHistory
        ] = await Promise.all([
          fetchWorldBankData(selectedCountry, 'SP.POP.TOTL', null, null, 'Country Population History', 60, true),
          fetchOwIDCountryHistory('number-of-internet-users.csv', selectedCountryName, 'Number of Internet users', 'Internet Users'),
          fetchOwIDCountryHistory('people-without-electricity.csv', selectedCountryName, 'Access to electricity (number of people without access)', 'People w/o Electricity'),
          fetchOwIDCountryHistory('employed-in-agriculture.csv', selectedCountryName, 'number_employed_agri', 'Employed in Agri.'),
          fetchOwIDCountryHistory('undernourished-people.csv', selectedCountryName, '2.1.1 Number of undernourished people | 000000000024001 || Value | 006132 || millions', 'Undernourished'),
          fetchOwIDCountryHistory('extreme-poverty.csv', selectedCountryName, '$2.15 a day - Number in poverty', 'Extreme Poverty')
        ]);

        // Armazenar os históricos individuais
        setCountryPopulationHistory(popHistory || []);
        setCountryInternetHistory(internetHistory || []);
        setCountryWithoutElectricityHistory(withoutElectricityHistory || []);
        setCountryEmployedAgricultureHistory(employedAgricultureHistory || []);
        setCountryUndernourishedHistory(undernourishedHistory || []);
        setCountryExtremePovertyHistory(extremePovertyHistory || []);

        const allYears = new Set();
        // Usar os estados que acabamos de setar para popular allYears
        const datasetsForYears = [
            countryPopulationHistory, countryInternetHistory, countryWithoutElectricityHistory,
            countryEmployedAgricultureHistory, countryUndernourishedHistory, countryExtremePovertyHistory
        ];

        datasetsForYears.forEach(dataset => {
            if(Array.isArray(dataset)) dataset.forEach(d => { if (d && typeof d.year === 'number' && !isNaN(d.year)) allYears.add(d.year); });
        });
        
        const labels = Array.from(allYears).sort((a, b) => a - b).filter(year => year >= 1990 && year <= new Date().getFullYear());

        if (labels.length === 0) {
            console.warn("Nenhum ano nos labels após o filtro (>= 1990). O gráfico não será renderizado.");
            setIsLoadingCountry(false);
            setChartData({ labels: [], datasets: [] });
            setErrorCountry(`No recent historical data (since 1990) found for ${selectedCountryName}.`);
            return;
        }

        const mapDataToLabels = (historyData, allLabels) => {
          if (!Array.isArray(historyData) || historyData.length === 0) return allLabels.map(() => null);
          const dataMap = new Map(historyData.map(item => [item.year, item.value]));
          return allLabels.map(year => dataMap.get(year) || null);
        };
        
        // Definindo os datasets para o gráfico
        const finalDatasets = [
            { label: `Population`, data: mapDataToLabels(popHistory, labels), borderColor: 'var(--blue-munsell)', backgroundColor: 'rgba(56,145,166,0.3)', tension: 0.3, fill: true, yAxisID: 'yMain', pointRadius: 2, pointHoverRadius: 5, borderWidth: 3 },
            { label: `Internet Users`, data: mapDataToLabels(internetHistory, labels), borderColor: 'var(--burnt-sienna)', backgroundColor: 'rgba(215,129,106,0.3)', tension: 0.3, fill: true, yAxisID: 'yMain', pointRadius: 2, pointHoverRadius: 5, borderWidth: 2.5 },
            { label: `W/o Electricity`, data: mapDataToLabels(withoutElectricityHistory, labels), borderColor: '#f1c40f', /* Amarelo */ backgroundColor: 'rgba(241,196,15,0.2)', tension: 0.3, fill: false, yAxisID: 'yMain', pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 },
            { label: `Employed Agriculture`, data: mapDataToLabels(employedAgricultureHistory, labels), borderColor: '#2ecc71', /* Verde */ backgroundColor: 'rgba(46,204,113,0.2)', tension: 0.3, fill: false, yAxisID: 'yMain', pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 },
            { label: `Undernourished`, data: mapDataToLabels(undernourishedHistory, labels), borderColor: '#e74c3c', /* Vermelho */ backgroundColor: 'rgba(231,76,60,0.2)', tension: 0.3, fill: false, yAxisID: 'yMain', pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 },
            { label: `Extreme Poverty ($2.15)`, data: mapDataToLabels(extremePovertyHistory, labels), borderColor: '#9b59b6', /* Roxo Ametista */ backgroundColor: 'rgba(155,89,182,0.2)', tension: 0.3, fill: false, yAxisID: 'yMain', pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 },
          ].filter(ds => ds.data.some(d => d !== null));

        console.log("Chart Datasets prepared:", finalDatasets.map(ds => ({label: ds.label, dataPoints: ds.data.filter(d => d !== null).length })));
        
        if (finalDatasets.length > 0) {
            setChartData({ labels, datasets: finalDatasets });
        } else {
            console.warn("Nenhum dataset com dados válidos para plotar.");
            setChartData({ labels: [], datasets: [] }); 
            setErrorCountry(`Not enough historical data to plot for ${selectedCountryName}.`);
        }

      } catch (e) {
        console.error(`Error fetching country data for ${selectedCountryName}:`, e);
        setErrorCountry(`Failed to load data for ${selectedCountryName}.`);
        setChartData({ labels: [], datasets: [] });
      }
      setIsLoadingCountry(false);
    };

    loadCountryData();
  }, [selectedCountry, selectedCountryName, fetchWorldBankData, fetchOwIDCountryHistory]); // Adicione fetchOwIDCountryHistory aqui

  // Atualizar dinamicamente o título do gráfico
  useEffect(() => { 
    // Criar uma cópia do objeto de opções para modificação segura
    const newOptions = JSON.parse(JSON.stringify(chartOptions)); // Deep copy
    if (newOptions.plugins && newOptions.plugins.title) {
        newOptions.plugins.title.text = selectedCountryName 
            ? `Historical Data for ${selectedCountryName}` 
            : 'Historical Data - Select a Country';
    }
    // Atualizar as opções do gráfico no estado ou ref se necessário para forçar re-render
    // Neste caso, como chartOptions é passado como prop, não precisamos de um estado para ele,
    // mas se o título é a única coisa mudando dinamicamente nas opções,
    // a abordagem com ref é mais para evitar recriação do objeto options a cada render.
    // Se o Chart.js não pegar a mudança no título (o que é improvável),
    // você pode precisar forçar uma re-renderização do gráfico ou gerenciar 'options' como estado.
    // Por agora, o chartOptions é um objeto constante e o título é atualizado nele.
    // O Chart.js deve pegar a mudança na prop 'options' se ela for passada novamente.
    // No entanto, como estamos usando useRef para chartOptions, e não é um estado,
    // precisamos de uma forma de dizer ao Chart.js para atualizar.
    // A maneira mais simples é ter 'options' como parte do estado se ele precisa ser dinâmico.
    // Ou, passar uma key que muda para o componente <Line> para forçar sua recriação.
    // Para o título, Chart.js geralmente atualiza bem.
  }, [selectedCountryName, chartOptions]); // Adicionado chartOptions


  const handleCountryChange = (event) => {
    const countryCode = event.target.value;
    if (!countryCode) { 
        setSelectedCountry(''); 
        setSelectedCountryName(''); 
        setChartData({ labels: [], datasets: [] }); // Limpa o gráfico
        return; 
    }
    const countryObject = countryList.find(c => c.code === countryCode);
    setSelectedCountry(countryCode);
    setSelectedCountryName(countryObject ? countryObject.name : '');
  };

  const formatNumber = (num, isPercent = false, isSmallCount = false) => {
    if (num === null || num === undefined) return 'N/A';
    if (isPercent) return `${parseFloat(num).toFixed(1)}%`;
    if (isSmallCount) {
        if (Math.abs(num) < 1000000 && num !== 0) return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
    }
    if (Math.abs(num) >= 1000000) return `${(num/1000000).toFixed(1)} M`;
    if (Math.abs(num) >= 1000) return `${(num/1000).toFixed(0)} K`;
    return new Intl.NumberFormat('en-US', {maximumFractionDigits: (num === 0 ? 0 : (Number.isInteger(num) ? 0 : 2))}).format(num);
  };
  
  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>The World in <span>Numbers</span></h2>
        <p className={styles.pageSubtitle}>Key global statistics & country-specific trends. Select a country for a detailed view.</p>
      </header>
      
      {/* CARDS GLOBAIS */}
      {isLoadingGlobal && (!worldPopulation && !internetUsers /* && outros globais === null */) && 
        <div className={styles.loadingMessage}>Fetching global stats...</div>}
      {errorGlobal && <div className={styles.errorMessage}>{errorGlobal}</div>}
      
      {!isLoadingGlobal && (
        <div className={styles.statsGrid}>
          {/* ... seus cards globais como antes ... */}
          <div className={styles.statCard}><h3 className={styles.statLabel}>World Population (Live Est.)</h3><p className={styles.statValue}>{formatNumber(worldPopulation)}</p><p className={styles.statUnit}>{populationYear ? `Based on ${populationYear} data (WB)` : 'Estimating...'}</p></div>
          <div className={styles.statCard}><h3 className={styles.statLabel}>Internet Users (World)</h3><p className={styles.statValue}>{formatNumber(internetUsers)}</p><p className={styles.statUnit}>{internetUsersYear && internetUsersYear !== 'N/A' ? `${internetUsersYear} (OWID)`: 'N/A'}</p></div>
          <div className={styles.statCard}><h3 className={styles.statLabel}>W/o Electricity (World)</h3><p className={styles.statValue}>{formatNumber(withoutElectricityGlobal, false, true)}</p><p className={styles.statUnit}>{withoutElectricityGlobalYear && withoutElectricityGlobalYear !== 'N/A' ? `${withoutElectricityGlobalYear} (OWID)`: 'N/A'}</p></div>
          <div className={styles.statCard}><h3 className={styles.statLabel}>Employed in Agri. (World)</h3><p className={styles.statValue}>{formatNumber(employedAgricultureGlobal, false, true)}</p><p className={styles.statUnit}>{employedAgricultureGlobalYear && employedAgricultureGlobalYear !== 'N/A' ? `${employedAgricultureGlobalYear} (OWID)`: 'N/A'}</p></div>
          <div className={styles.statCard}><h3 className={styles.statLabel}>Undernourished (World)</h3><p className={styles.statValue}>{formatNumber(undernourishedGlobal, false, true)}</p><p className={styles.statUnit}>{undernourishedGlobalYear && undernourishedGlobalYear !== 'N/A' ? `${undernourishedGlobalYear} (OWID)`: 'N/A'}</p></div>
          <div className={styles.statCard}><h3 className={styles.statLabel}>Extreme Poverty (World)</h3><p className={styles.statValue}>{formatNumber(extremePovertyGlobal, false, true)}</p><p className={styles.statUnit}>{extremePovertyGlobalYear && extremePovertyGlobalYear !== 'N/A' ? `${extremePovertyGlobalYear} (OWID)`: 'N/A'}</p></div>
        </div>
      )}

      {/* DASHBOARD INTERATIVO POR PAÍS */}
      <section className={styles.interactiveDashboard}>
        <h3 className={styles.sectionTitle}>Country <span>Deep Dive</span></h3>
        <div className={styles.controlsContainer}>
          <label htmlFor="country-select" className={styles.selectLabel}>Select a Country:</label>
          <select id="country-select" value={selectedCountry} onChange={handleCountryChange} className={styles.countrySelect} disabled={countryList.length === 0 || isLoadingCountry}>
            <option value="">-- Select Country --</option>
            {countryList.map(country => (<option key={country.code} value={country.code}>{country.name}</option>))}
          </select>
        </div>

        {isLoadingCountry && <div className={styles.loadingMessage}>Loading data for {selectedCountryName}...</div>}
        {errorCountry && <div className={styles.errorMessage}>{errorCountry}</div>}
        
        {!isLoadingCountry && selectedCountry && 
         (!chartData.datasets || chartData.datasets.length === 0) && 
         !errorCountry &&
          <p className={styles.noDataMessage}>No historical data available to plot for {selectedCountryName} for the selected indicators or period.</p>
        }

        {selectedCountry && !isLoadingCountry && chartData.datasets && chartData.datasets.length > 0 && (
          <div className={styles.countryChartContainer}>
            {/* Passando chartOptions diretamente como prop */}
            <Line options={chartOptions} data={chartData} /> 
          </div>
        )}
      </section>
    </div>
  );
}

export default WorldInNumbersPage;