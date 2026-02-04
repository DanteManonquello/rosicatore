# ROSICATORE v3.0.2

## 🎯 Project Overview
**Rosicatore** è un Portfolio Tracker Algorithm avanzato per il monitoraggio e l'analisi del valore attualizzato di portafogli azionari nel tempo.

### Caratteristiche Principali
- ✅ Calcolo attualizzazione temporale con date range selezionabili
- ✅ Gestione movimenti: Appesantimento (BUY) e Alleggerimento (SELL)
- ✅ Reinvestimento automatico dividendi
- ✅ 22 KPI completi (USD + %)
- ✅ Tracking completo storico operazioni
- ✅ Sistema errori/warning integrato
- ✅ 4 slot caricamento CSV (Titoli, Valori, Movimenti, Dividendi)

## 📊 URLs
- **Local Dev**: http://localhost:3000
- **GitHub**: (da configurare)
- **Cloudflare Pages**: (da deployare)

## 🏗️ Architettura Dati

### Storage
- **NO Database**: Tutto client-side, nessuna persistenza
- **CSV Upload**: Caricamento manuale file ad ogni sessione

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

## 🔢 Algoritmo di Calcolo

### FASE 1: INGRESSO
```
Capitale_Investito = Capitale_Totale × Frazione_Iniziale
Azioni = Capitale_Investito / Prezzo_Ingresso
Cash_Residuo = Capitale_Totale - Capitale_Investito
```

### FASE 2: APPESANTIMENTO (BUY)
```
Capitale_Nuovo = Capitale_Totale × Frazione_Delta
Azioni_Nuove = Capitale_Nuovo / Prezzo_Corrente
Azioni_Totali += Azioni_Nuove
Cash_Residuo -= Capitale_Nuovo
```

### FASE 3: ALLEGGERIMENTO (SELL)
```
Valore_Attuale = Azioni × Prezzo_Corrente
Valore_Da_Vendere = Valore_Attuale × Frazione_Delta
Azioni_Da_Vendere = Valore_Da_Vendere / Prezzo_Corrente
Azioni_Totali -= Azioni_Da_Vendere
Cash_Residuo += Valore_Da_Vendere
```

### FASE 4: DIVIDENDO (REINVESTITO AUTOMATICAMENTE)
```
Dividendo_Totale = Azioni × Dividendo_Per_Azione
Azioni_Nuove = Dividendo_Totale / Prezzo_Giorno_Dividendo
Azioni_Totali += Azioni_Nuove
```

### FASE 5: VALUTAZIONE FINALE
```
Valore_Posizione = Azioni × Prezzo_Finale
Patrimonio_Totale = Valore_Posizione + Cash_Residuo
Gain_Loss = Patrimonio_Totale - Capitale_Totale
ROI = (Gain_Loss / Capitale_Totale) × 100
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
11. **Capitale Allocato** (USD) - Capitale iniziale
12. **Capitale Investito** (USD) - Capitale effettivo in azioni
13. **Peso Portafoglio** (%) - % azioni su totale
14. **Frazione Attuale** - Frazione corrente investita

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
1. Inserisci **Capitale Totale** (default: 2000 USD)
2. Seleziona **Data Inizio** (default: 6 mesi fa)
3. Seleziona **Data Fine** (default: oggi)

### Step 2: Caricamento CSV
1. Clicca su **TITOLI** e carica `info_titoli.csv`
2. Clicca su **VALORI** e carica `{TICKER}_Stock_Price_History.csv`
3. Clicca su **MOVIMENTI** e carica `movimenti.csv` (opzionale)
4. Clicca su **DIVIDENDI** e carica `dividendi.csv` (opzionale)

### Step 3: Calcolo
1. Clicca **CALCOLA PORTAFOGLIO**
2. Visualizza **22 KPI** in tempo reale
3. Analizza **Tabella Storica** dettagliata

### Gestione Errori
- Gli errori vengono mostrati in sezione dedicata
- Dividendi/movimenti fuori periodo vengono segnalati
- Date mancanti nei prezzi usano match più vicino

## 🚀 Deployment

### Local Development
```bash
cd /home/user/webapp
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
- **Version**: v3.0.2
- **Status**: ✅ ATTIVO
- **Deployment**: Local sandbox
- **Last Updated**: 2026-02-03

## 🗺️ Roadmap

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

### v3.1.0 (PROSSIMO)
- ⏳ Multi-ticker simultaneo
- ⏳ Selezione ticker da dropdown
- ⏳ Aggregazione portafoglio completo

### v3.2.0
- ⏳ Export PDF report
- ⏳ Grafici evoluzione temporale
- ⏳ Chart.js integration

### v3.3.0
- ⏳ Storage opzionale (D1 database)
- ⏳ Salvare configurazioni
- ⏳ History sessioni precedenti

## ⚠️ Note Importanti
- **NO TASSE**: L'algoritmo NON calcola tassazione
- **NO COMMISSIONI**: Nessuna commissione broker considerata
- **USD ONLY**: Tutti i valori sono in dollari USA
- **REINVESTIMENTO**: Dividendi reinvestiti automaticamente al prezzo del giorno di pagamento
- **CLIENT-SIDE**: Tutti i dati rimangono nel browser, nessuna persistenza
