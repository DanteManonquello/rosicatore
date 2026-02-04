const fs = require('fs');

// Leggo info_titoli.csv
const infoTitoliRaw = fs.readFileSync('/home/user/webapp/public/static/data/info_titoli.csv', 'utf8');
const infoTitoliLines = infoTitoliRaw.trim().split('\n').slice(1); // skip header

const infoTitoli = {};
infoTitoliLines.forEach(line => {
  const [nome, ticker, exchange, isin, quota_num, quota_den, tipo] = line.split(',');
  infoTitoli[ticker] = parseFloat(quota_num) / parseFloat(quota_den);
});

console.log('INFO TITOLI (01/01/2025):');
console.log(infoTitoli);

// Leggo movimenti.csv
const movimentiRaw = fs.readFileSync('/home/user/webapp/public/static/data/movimenti.csv', 'utf8');
const movimentiLines = movimentiRaw.trim().split('\n');
const header = movimentiLines[0];

// Nuovo header con campi aggiuntivi
const newHeader = header + ',primo_ingresso,esposizione_finale,uscita_totale';

// Tracciamento quarti per ticker
const quartiAttuali = {};

// Inizializzo con info_titoli (stato al 01/01/2025)
Object.keys(infoTitoli).forEach(ticker => {
  quartiAttuali[ticker] = infoTitoli[ticker];
});

const newLines = [newHeader];

// Processo ogni movimento
for (let i = 1; i < movimentiLines.length; i++) {
  const line = movimentiLines[i];
  const parts = line.split(',');
  
  const data = parts[0];
  const ora = parts[1];
  const ticker = parts[2];
  const azione = parts[3];
  const frazione_num = parseFloat(parts[4]);
  const frazione_den = parseFloat(parts[5]);
  const prezzo = parts[6] || '';
  const nota = parts[7] || '';
  
  const frazione = frazione_num / frazione_den;
  
  // Quarti PRIMA del movimento
  const quartiPrima = quartiAttuali[ticker] || 0;
  
  // Applico movimento
  let quartiDopo;
  if (azione === 'BUY') {
    quartiDopo = quartiPrima + frazione;
  } else if (azione === 'SELL') {
    quartiDopo = Math.max(0, quartiPrima - frazione);
  }
  
  // LOGICA PRIMO INGRESSO
  const primoIngresso = (quartiPrima === 0 && quartiDopo > 0) ? 'true' : 'false';
  
  // LOGICA USCITA TOTALE
  const uscitaTotale = (quartiPrima > 0 && quartiDopo === 0) ? 'true' : 'false';
  
  // Esposizione finale (arrotondata a 2 decimali)
  const esposizioneFinale = Math.round(quartiDopo * 100) / 100;
  
  // Aggiorno stato
  quartiAttuali[ticker] = quartiDopo;
  
  // Costruisco nuova riga
  const newLine = `${data},${ora},${ticker},${azione},${frazione_num},${frazione_den},${prezzo},${nota},${primoIngresso},${esposizioneFinale},${uscitaTotale}`;
  
  newLines.push(newLine);
  
  console.log(`${ticker} ${data}: ${quartiPrima} → ${quartiDopo} | primo=${primoIngresso} | uscita=${uscitaTotale}`);
}

// Scrivo nuovo CSV
fs.writeFileSync('/tmp/movimenti_nuovo.csv', newLines.join('\n'), 'utf8');
console.log('\n✅ CSV GENERATO: /tmp/movimenti_nuovo.csv');
