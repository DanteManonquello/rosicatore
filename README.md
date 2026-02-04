# ROSICATORE v3.2.2 🎯

## 🎯 Project Overview
**Rosicatore** è un Portfolio Tracker Algorithm avanzato per il monitoraggio e l'analisi del valore attualizzato di portafogli azionari nel tempo.

### Caratteristiche Principali
- ✅ **CAPITALE FISSO**: 12.000 USD (non modificabile)
- ✅ **ALGORITMO CORRETTO**: Capitale Allocato vs Capitale Investito
- ✅ **MENU HAMBURGER**: Navigazione laterale con tutte le sezioni
- ✅ **SEZIONE CALCOLI**: Cronologia completa di ogni titolo (vita-morte-miracoli)
- ✅ **AUTO-CARICAMENTO CSV**: Caricamento automatico all'avvio (dati persistenti in /public/static/data/)
- ✅ **Date Preimpostate**: 11 Luglio 2025 → 1 Gennaio 2026 (modificabili)
- ✅ **Multi-Ticker Automatico**: 12 CSV prezzi pre-caricati per ogni ticker
- ✅ Calcolo attualizzazione temporale con date range selezionabili
- ✅ Gestione movimenti: Appesantimento (BUY) e Alleggerimento (SELL)
- ✅ Reinvestimento automatico dividendi
- ✅ 22 KPI completi (USD + %)
- ✅ Tracking completo storico operazioni
- ✅ Sistema errori/warning integrato
- ✅ 4 slot caricamento CSV (override manuale se necessario)

## 📊 URLs
- **Sandbox Dev**: https://3000-ili0eab6ol2wmxk3wr51n-2e1b9533.sandbox.novita.ai
- **GitHub**: (da configurare)
- **Cloudflare Pages**: (da deployare)
- **Backup v3.2.2**: https://www.genspark.ai/api/files/s/vwirvKuZ

## 🏗️ Architettura Dati

### Storage
- **Dati Persistenti**: CSV pre-caricati in `/public/static/data/`
- **Auto-Load**: Caricamento automatico all'avvio dell'app
- **Override Manuale**: Possibilità di caricare CSV personalizzati tramite UI

### Modelli Dati

#### 1. info_titoli.csv
```csv
nome,ticker,exchange,isin,quota_numeratore,quota_denominatore,tipo
Ferroglobe PLC,GSM,NASDAQ,GB00BYW6GV68,2,4,GROWTH-DIVIDEND
```

#### 2. movimenti.csv
```csv
data,ora,ticker,azione,frazione_numeratore,frazione_denominatore,note
2025-12-02,16:09,GSM,BUY,1,4,aumentiamo di 1/4
```

#### 3. dividendi.csv
```csv
ticker,isin,data_pagamento,importo_usd
GSM,GB00BYW6GV68,2025-12-29,0.014
```

#### 4. {TICKER} Stock Price History.csv
```csv
"Date","Price","Open","High","Low","Vol.","Change %"
"12/29/2025","4.620","4.640","4.720","4.560","564.84K","-2.12%"
```

## 🔢 Algoritmo di Calcolo (v3.2.2 - CORRETTO)

### CONCETTI CHIAVE
```
Capitale Totale = 12.000 USD (FISSO)
Numero Titoli = 12
Capitale Allocato per Titolo = 12.000 / 12 = 1.000 USD (FISSO)
Capitale Investito = Capitale Allocato × Frazione (VARIABILE con BUY/SELL)
```

### FASE 1: INGRESSO
```
Capitale_Allocato = Capitale_Totale / Numero_Titoli  // Es: 12000 / 12 = 1000€
Frazione_Iniziale = quota_numeratore / quota_denominatore  // Es: 2/4 = 0.5
Capitale_Investito = Capitale_Allocato × Frazione_Iniziale  // Es: 1000 × 0.5 = 500€
Azioni = Capitale_Investito / Prezzo_Ingresso  // Es: 500 / 3.92 = 127.55 azioni
Cash_Residuo = Capitale_Allocato - Capitale_Investito  // Es: 1000 - 500 = 500€
```

### FASE 2: APPESANTIMENTO (BUY +1/4)
```
Frazione_Delta = frazione_numeratore / frazione_denominatore  // Es: 1/4 = 0.25
Capitale_Nuovo = Capitale_Allocato × Frazione_Delta  // Es: 1000 × 0.25 = 250€
Azioni_Nuove = Capitale_Nuovo / Prezzo_Corrente  // Es: 250 / 4.63 = 53.99 azioni
Azioni_Totali += Azioni_Nuove  // Es: 127.55 + 53.99 = 181.54 azioni
Cash_Residuo -= Capitale_Nuovo  // Es: 500 - 250 = 250€
Capitale_Investito += Capitale_Nuovo  // Es: 500 + 250 = 750€
Frazione_Attuale += Frazione_Delta  // Es: 2/4 + 1/4 = 3/4
```

### FASE 3: ALLEGGERIMENTO (SELL -1/4)
```
Frazione_Delta = frazione_numeratore / frazione_denominatore  // Es: 1/4 = 0.25
Capitale_Da_Vendere = Capitale_Allocato × Frazione_Delta  // Es: 1000 × 0.25 = 250€
Azioni_Da_Vendere = Capitale_Da_Vendere / Prezzo_Corrente
Azioni_Totali -= Azioni_Da_Vendere
Cash_Residuo += Capitale_Da_Vendere
Capitale_Investito -= Capitale_Da_Vendere
Frazione_Attuale -= Frazione_Delta
```

### FASE 4: DIVIDENDO (REINVESTITO AUTOMATICAMENTE)
```
Dividendo_Totale = Azioni × Dividendo_Per_Azione  // Es: 181.54 × 0.014 = 2.54€
Azioni_Nuove = Dividendo_Totale / Prezzo_Giorno_Dividendo  // Es: 2.54 / 4.62 = 0.55 azioni
Azioni_Totali += Azioni_Nuove  // Es: 181.54 + 0.55 = 182.09 azioni
```

### FASE 5: VALUTAZIONE FINALE
```
Valore_Posizione = Azioni × Prezzo_Finale  // Es: 181.54 × 4.59 = 833.27€
Patrimonio_Totale = Valore_Posizione + Cash_Residuo  // Es: 833.27 + 250 = 1083.27€
Gain_Loss = Patrimonio_Totale - Capitale_Allocato  // Es: 1083.27 - 1000 = +83.27€
ROI = (Gain_Loss / Capitale_Allocato) × 100  // Es: 83.27 / 1000 × 100 = +8.33%
```

## 📈 KPI Disponibili (22 Metriche)

### KPI Principali
1. **Patrimonio Totale** (USD) - Valore complessivo portafoglio
2. **Gain/Loss** (USD) - Profitto/Perdita assoluta
3. **ROI Portafoglio** (%) - Return on Investment totale
4. **ROI Posizioni** (%) - ROI solo su capitale investito

### KPI Valori
5. **Valore Posizione** (USD) - Valore azioni possedute
6. **Cash Residuo** (USD) - Liquidità disponibile
7. **Azioni Possedute** (az) - Numero azioni
8. **Prezzo Ingresso** (USD) - Prezzo acquisto iniziale
9. **Prezzo Finale** (USD) - Prezzo corrente
10. **Variazione Prezzo** (%) - % cambio prezzo

### KPI Capitali
11. **Capitale Allocato** (USD) - Capitale FISSO per titolo (es. 1000€)
12. **Capitale Investito** (USD) - Capitale EFFETTIVO in azioni (varia con BUY/SELL)
13. **Peso Portafoglio** (%) - % azioni su totale
14. **Frazione Attuale** - Frazione corrente investita (varia con BUY/SELL)

### KPI Operazioni
15. **Numero Movimenti** - Totale BUY/SELL
16. **Numero Dividendi** - Totale pagamenti dividendi
17. **Dividendi Totali** (USD) - Somma dividendi incassati

### KPI Performance
18. **Max Patrimonio** (USD) - Picco massimo
19. **Min Patrimonio** (USD) - Minimo raggiunto
20. **Drawdown** (%) - % distanza da max
21. **Gain vs Max** (USD) - Differenza da picco
22. **Gain vs Min** (USD) - Guadagno da minimo

## 🎮 Guida Utente

### Step 1: Configurazione
1. **Capitale Totale**: FISSO a 12.000 USD (non modificabile)
2. Seleziona **Data Inizio** (default: 11 Luglio 2025)
3. Seleziona **Data Fine** (default: 1 Gennaio 2026)

### Step 2: Caricamento CSV
**I dati sono già pre-caricati automaticamente all'avvio!**
- ✅ **TITOLI**: 12 titoli pre-caricati
- ✅ **VALORI**: 12 CSV prezzi pre-caricati
- ✅ **MOVIMENTI**: Pre-caricati
- ✅ **DIVIDENDI**: Pre-caricati

Puoi comunque caricare CSV personalizzati tramite i 4 slot se necessario.

### Step 3: Calcolo
1. Clicca **CALCOLA PORTAFOGLIO**
2. Visualizza **22 KPI** in tempo reale
3. Analizza **Tabella Riepilogo** con tutti i titoli
4. Esplora **Storico Operazioni** del primo titolo
5. Consulta **Calcoli Dettagliati** per vedere vita-morte-miracoli di ogni titolo

### Step 4: Navigazione
Usa il **Menu Hamburger** (in alto a destra) per navigare tra le sezioni:
- 🔧 **Configurazione**: Setup iniziale
- 📊 **KPI Performance**: KPI aggregati
- 📋 **Riepilogo Titoli**: Tabella con tutti i titoli
- 📜 **Storico Operazioni**: Cronologia primo titolo
- 🧮 **Calcoli Dettagliati**: Cronologia completa titolo per titolo

### Gestione Errori
- Gli errori vengono mostrati in sezione dedicata
- Dividendi/movimenti fuori periodo vengono segnalati
- Date mancanti nei prezzi usano match più vicino

## 🚀 Deployment

### Local Development
```bash
cd /home/user/webapp
npm install
npm run build
pm2 start ecosystem.config.cjs
pm2 logs rosicatore --nostream
```

### Production (Cloudflare Pages)
```bash
npm run build
wrangler pages deploy dist --project-name rosicatore
```

## 🛠️ Tech Stack
- **Backend**: Hono (Cloudflare Workers)
- **Frontend**: Vanilla JS + TailwindCSS
- **CSV Parser**: PapaParse
- **Date Handling**: DayJS
- **Icons**: FontAwesome
- **Deployment**: Cloudflare Pages

## 📝 Status
- **Version**: v3.2.2
- **Status**: ✅ ATTIVO
- **Deployment**: Sandbox (https://3000-ili0eab6ol2wmxk3wr51n-2e1b9533.sandbox.novita.ai)
- **Last Updated**: 2026-02-04

## 🗺️ Roadmap

### v3.2.2 (COMPLETATO) ✨ **CURRENT**
- ✅ **CAPITALE FISSO 12.000 USD** - Non più modificabile dall'utente
- ✅ **ALGORITMO CORRETTO** - Capitale Allocato vs Capitale Investito
  - Capitale Allocato = 12.000 / 12 = 1.000€ per titolo (FISSO)
  - Capitale Investito = Allocato × Frazione (VARIABILE)
  - Cash Residuo = Allocato - Investito
- ✅ **MENU HAMBURGER** - Navigazione laterale con tutte le sezioni
- ✅ **SEZIONE CALCOLI DETTAGLIATI** - Vita-morte-miracoli di ogni titolo
  - Cronologia completa operazioni
  - Dettagli movimenti (BUY, SELL, DIVIDEND)
  - Riepilogo per ogni titolo
  - Tabella completa con 9 colonne informative

### v3.2.1 (COMPLETATO) 🔧
- ✅ **FIX CAPITALE ALLOCATO** - Ogni titolo usa il SUO capitale proporzionale!
- ✅ Corretto calcolo: `capitaleAllocato = capitaleTotale * frazione`
- ✅ Fixato: Tutti i titoli mostravano $1200 invece di proporzionale
- ✅ Fixato: Gain/Loss calcolato su capitale allocato corretto
- ✅ Fixato: ROI calcolato su capitale allocato corretto
- ✅ Fixato: Cash residuo per titolo (inizialmente 0, poi da movimenti)

### v3.1.0 (COMPLETATO) 🚀
- ✅ **MULTI-TICKER SUPPORT** - Calcola TUTTI i titoli caricati!
- ✅ Itera su tutti i ticker del CSV info_titoli
- ✅ Calcolo simultaneo di N titoli
- ✅ Tabella con UNA RIGA per OGNI titolo
- ✅ KPI aggregati patrimonio totale
- ✅ Gestione errori per ticker singolo (continua anche se uno fallisce)

### v3.0.2 (COMPLETATO)
- ✅ Tabella riepilogo titoli
- ✅ Dati chiave per ogni ticker (nome, capitale, crescita, ROI)
- ✅ 15 colonne informative per titolo
- ✅ Color coding per tipo titolo (DIVIDEND/GROWTH/SPECULATIVE)
- ✅ Visual feedback con hover effects

### v3.0.1 (COMPLETATO)
- ✅ Drag & Drop support per CSV upload
- ✅ Visual feedback durante drag
- ✅ Validazione formato file (.csv only)
- ✅ Nome file mostrato dopo upload

### v3.0.0 (COMPLETATO)
- ✅ Calcolo attualizzazione temporale
- ✅ Appesantimento/Alleggerimento
- ✅ Dividendi reinvestiti automaticamente
- ✅ 22 KPI funzionanti
- ✅ Sistema errori/warning
- ✅ Single-ticker calculation (GSM)

### v3.3.0 (PROSSIMO)
- ⏳ Export PDF report
- ⏳ Grafici evoluzione temporale
- ⏳ Chart.js integration
- ⏳ Selezione ticker da dropdown per storico operazioni

### v3.4.0
- ⏳ Storage opzionale (D1 database)
- ⏳ Salvare configurazioni
- ⏳ History sessioni precedenti
- ⏳ Confronto periodi temporali

## ⚠️ Note Importanti
- **CAPITALE FISSO**: 12.000 USD non modificabile
- **NO TASSE**: L'algoritmo NON calcola tassazione
- **NO COMMISSIONI**: Nessuna commissione broker considerata
- **USD ONLY**: Tutti i valori sono in dollari USA
- **REINVESTIMENTO**: Dividendi reinvestiti automaticamente al prezzo del giorno di pagamento
- **CLIENT-SIDE**: Tutti i dati rimangono nel browser, nessuna persistenza
- **ALGORITMO CORRETTO**: Distinzione chiara tra Capitale Allocato (fisso) e Capitale Investito (variabile)

## 🧮 Esempio Pratico (GSM)

### Setup Iniziale
- Capitale Totale: 12.000 USD
- Numero Titoli: 12
- Capitale Allocato GSM: 12.000 / 12 = **1.000 USD**
- Frazione Iniziale: 2/4 = 0.5
- Capitale Investito: 1.000 × 0.5 = **500 USD**
- Cash Residuo: 1.000 - 500 = **500 USD**

### Operazioni
1. **01/08/2025 - INGRESSO 2/4**
   - Prezzo: $3.920
   - Azioni: 500 / 3.920 = 127.55 azioni
   - Valore: 127.55 × 3.920 = $500
   - Cash: $500

2. **02/12/2025 - BUY +1/4 (da 2/4 a 3/4)**
   - Prezzo: $4.630
   - Capitale Nuovo: 1.000 × 0.25 = $250
   - Azioni Nuove: 250 / 4.630 = 53.99 azioni
   - Azioni Totali: 127.55 + 53.99 = 181.54 azioni
   - Capitale Investito: 500 + 250 = $750
   - Cash: 500 - 250 = $250

3. **29/12/2025 - DIVIDEND $0.014**
   - Dividendo: 181.54 × 0.014 = $2.54
   - Azioni Nuove: 2.54 / 4.620 = 0.55 azioni
   - Azioni Totali: 181.54 + 0.55 = 182.09 azioni
   - Cash: $250 (invariato)

4. **02/01/2026 - FINE PERIODO**
   - Prezzo: $4.590
   - Valore Azioni: 182.09 × 4.590 = $835.79
   - Cash: $250
   - Patrimonio: $835.79 + $250 = **$1.085.79**
   - Gain/Loss: $1.085.79 - $1.000 = **+$85.79**
   - ROI: 85.79 / 1.000 × 100 = **+8.58%**
