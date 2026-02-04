# ROSICATORE v3.8.0 🎯

## 🎯 Project Overview
**Rosicatore** è un Portfolio Tracker Algorithm avanzato per il monitoraggio e l'analisi del valore attualizzato di portafogli azionari nel tempo.

### Caratteristiche Principali
- ✅ **CAPITALE FISSO PER TITOLO**: 1.000 USD per ogni titolo (non diviso)
- ✅ **FORMULA UNIVERSALE**: `(cash + valore azioni) / 4 × frazione` per BUY/SELL
- ✅ **DIVIDENDI A CASH**: Dividendi aggiunti al cash (NON reinvestiti)
- ✅ **FILTRO PRIMO BUY**: Mostra solo titoli con primo BUY ≤ dataFine (già comprati)
- ✅ **DATA INGRESSO EFFETTIVA**: Se primo BUY < dataInizio → usa dataInizio; altrimenti primo BUY
- ✅ **SPIEGAZIONE DATE PICKER**: Box informativo con logica filtro (primo BUY)
- ✅ **MENU HAMBURGER**: Navigazione laterale con tutte le sezioni
- ✅ **SEZIONE CALCOLI DETTAGLIATA**: Formato PDF step-by-step FASE per FASE
- ✅ **AUTO-CARICAMENTO CSV**: Caricamento automatico all'avvio (dati persistenti in /public/static/data/)
- ✅ **Date Preimpostate**: 01 Gennaio 2025 → 01 Gennaio 2026 (modificabili)
- ✅ **Multi-Ticker Automatico**: 12 CSV prezzi pre-caricati per ogni ticker
- ✅ Calcolo attualizzazione temporale con date range selezionabili
- ✅ Gestione movimenti: Appesantimento (BUY) e Alleggerimento (SELL)
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

## 🔢 Algoritmo di Calcolo (v3.5.0 - CAPITALE FISSO PER TITOLO)

### 💰 NUOVA LOGICA CAPITALE

**PRIMA (v3.4.0):**
```
Capitale Totale = 12.000€
Numero Titoli = 12
Capitale per Titolo = 12.000 / 12 = 1.000€
```

**ADESSO (v3.5.0):**
```
Ogni titolo inizia con 1.000€ FISSO
Indipendentemente da quanti titoli ci sono nel portafoglio
```

**Motivo:** Nel tempo posso aggiungere/togliere titoli, quindi ogni titolo parte con 1.000€ fisso all'ingresso.

---

### 🎯 FORMULA UNIVERSALE (invariata)

```javascript
// Per QUALSIASI movimento (BUY o SELL):
patrimonioAttuale = cashResiduo + (azioni × prezzo)
valore_1_quarto = patrimonioAttuale / 4
capitale_movimento = valore_1_quarto × frazione_numeratore
```

**⚠️ ECCEZIONE: Solo all'INGRESSO usa capitale allocato fisso 1.000€!**

---

### FASE 1: INGRESSO (Solo prima volta)
```
Capitale_Allocato = 1.000€  // ← FISSO per ogni titolo!
Frazione_Iniziale = quota_numeratore / quota_denominatore  // Es: 2/4 = 0.5
Capitale_Investito = Capitale_Allocato × Frazione_Iniziale  // Es: 1000 × 0.5 = 500€
Azioni = Capitale_Investito / Prezzo_Ingresso  // Es: 500 / 3.92 = 127.55 azioni
Cash_Residuo = Capitale_Allocato - Capitale_Investito  // Es: 1000 - 500 = 500€
```

---

### FASE 2: APPESANTIMENTO (BUY +1/4) - FORMULA UNIVERSALE
```
// 1. Calcola patrimonio attuale
Valore_Azioni = Azioni × Prezzo_Corrente  // Es: 127.55 × 4.63 = 590.56€
Patrimonio_Attuale = Cash_Residuo + Valore_Azioni  // Es: 500 + 590.56 = 1090.56€

// 2. Calcola valore 1/4 attualizzato
Valore_1_Quarto = Patrimonio_Attuale / 4  // Es: 1090.56 / 4 = 272.64€

// 3. Moltiplica per frazione richiesta
Capitale_Da_Investire = Valore_1_Quarto × Frazione_Numeratore  // Es: 272.64 × 1 = 272.64€

// 4. Acquista azioni
Azioni_Nuove = Capitale_Da_Investire / Prezzo_Corrente  // Es: 272.64 / 4.63 = 58.88 az
Azioni_Totali += Azioni_Nuove  // Es: 127.55 + 58.88 = 186.43 az
Cash_Residuo -= Capitale_Da_Investire  // Es: 500 - 272.64 = 227.36€
```

**Esempio numerico:**
- Prima: Cash 500€, Azioni 127.55 @ 4.63€ = 590.56€
- Patrimonio: 500 + 590.56 = **1090.56€**
- Valore 1/4: 1090.56 / 4 = **272.64€**
- BUY +1/4: **272.64€** (non 250€ fissi!)

---

### FASE 3: ALLEGGERIMENTO (SELL -1/4) - FORMULA UNIVERSALE
```
// 1. Calcola patrimonio attuale
Valore_Azioni = Azioni × Prezzo_Corrente  // Es: 186.43 × 5.20 = 969.44€
Patrimonio_Attuale = Cash_Residuo + Valore_Azioni  // Es: 227.36 + 969.44 = 1196.80€

// 2. Calcola valore 1/4 attualizzato
Valore_1_Quarto = Patrimonio_Attuale / 4  // Es: 1196.80 / 4 = 299.20€

// 3. Moltiplica per frazione richiesta
Capitale_Da_Vendere = Valore_1_Quarto × Frazione_Numeratore  // Es: 299.20 × 1 = 299.20€

// 4. Vendi azioni
Azioni_Da_Vendere = Capitale_Da_Vendere / Prezzo_Corrente  // Es: 299.20 / 5.20 = 57.54 az
Azioni_Totali -= Azioni_Da_Vendere  // Es: 186.43 - 57.54 = 128.89 az
Cash_Residuo += Capitale_Da_Vendere  // Es: 227.36 + 299.20 = 526.56€
```

**Esempio numerico:**
- Prima: Cash 227.36€, Azioni 186.43 @ 5.20€ = 969.44€
- Patrimonio: 227.36 + 969.44 = **1196.80€**
- Valore 1/4: 1196.80 / 4 = **299.20€**
- SELL -1/4: **299.20€** (non 250€ fissi!)

---

### FASE 4: DIVIDENDO - SOLO CASH (NON REINVESTITO)
```
Dividendo_Totale = Azioni × Importo_Per_Azione  // Es: 181.54 × 0.014 = 2.54€
Cash_Residuo += Dividendo_Totale  // Es: 250 + 2.54 = 252.54€
// Azioni rimangono INVARIATE (no nuove azioni)
```

---

### 📊 TABELLA COMPARATIVA

| Momento | Cash | Valore Azioni | Patrimonio | Valore 1/4 | Movimento | Importo |
|---------|------|---------------|-----------|------------|-----------|---------|
| Ingresso | 500€ | 500€ | 1.000€ | - | +2/4 (fisso) | **500€** |
| Dopo BUY | 500€ | 590.56€ | 1.090.56€ | 272.64€ | +1/4 | **272.64€** |
| Dopo crescita | 227.36€ | 969.44€ | 1.196.80€ | 299.20€ | -1/4 | **299.20€** |
| Dopo SELL | 526.56€ | 670.24€ | 1.196.80€ | 299.20€ | +1/4 | **299.20€** |

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
- **Version**: v3.5.0
- **Status**: ✅ ATTIVO
- **Deployment**: Sandbox
- **Last Updated**: 2026-02-04

## 🗺️ Roadmap

### v3.8.0 (COMPLETATO) 🔥 **CURRENT - LOGICA DEFINITIVA!**
- ✅ **FILTRO PER PRIMO BUY** (Finalmente corretto!)
  - Trova primo movimento BUY per ogni titolo
  - ❌ SKIP se primo BUY > dataFine (non ancora comprato)
  - ✅ Includi se primo BUY ≤ dataFine
  - Se primo BUY < dataInizio → usa dataInizio come ingresso (già in portafoglio)
  - Se primo BUY ≥ dataInizio → usa primo BUY come ingresso (entra nel periodo)
- ✅ **SPIEGAZIONE CORRETTA**
  - Box spiega: "Titolo appare SOLO SE comprato prima o durante il periodo"
  - Esempio: Periodo 01/01→09/01, GSM primo BUY 13/01 → ESCLUSO
- ✅ **ELENCO TITOLI ESCLUSI**
  - Mostra titoli non ancora comprati con data primo BUY
  - Motivo chiaro: "Non ancora acquistato (primo BUY: ...)"

### v3.7.0 (OBSOLETO - ERRORE OPPOSTO) ❌
- ❌ Nessun filtro: mostrava TUTTI i titoli sempre
- ❌ Bug: titoli futuri apparivano in periodi passati
- ❌ Logica errata: ignorava completamente primo BUY

### v3.6.0 (OBSOLETO - LOGICA ERRATA) ❌
- ❌ Filtro sbagliato: escludeva titoli senza BUY
- ❌ Bug: filtrava troppo aggressivamente

### v3.5.0 (COMPLETATO) 💰
- ✅ **CAPITALE FISSO PER TITOLO: 1.000€**
- ✅ **NUOVI CSV MOVIMENTI E TITOLI**
- ✅ **DATE AGGIORNATE**: 01/01/2025 → 01/01/2026

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
- **CAPITALE FISSO PER TITOLO**: 1.000 USD per ogni titolo (non diviso)
- **FORMULA UNIVERSALE**: `(cash + valore azioni) / 4 × frazione` per BUY/SELL
- **DIVIDENDI A CASH**: Dividendi NON reinvestiti, vanno nel cash
- **NO TASSE**: L'algoritmo NON calcola tassazione
- **NO COMMISSIONI**: Nessuna commissione broker considerata
- **USD ONLY**: Tutti i valori sono in dollari USA
- **CLIENT-SIDE**: Tutti i dati rimangono nel browser, nessuna persistenza

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
