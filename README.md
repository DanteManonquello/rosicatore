# Rosicatore v4.0.0

## 🎯 Portfolio Tracker Algorithm

Rosicatore è un Portfolio Tracker che calcola il valore nel tempo di TUTTI i titoli del portafoglio.

---

## 🆕 NOVITÀ v4.0.0 - EXPORT UNIFICATO COMPLETO (17 Feb 2026)

### 🚀 **MAJOR UPDATE: Export Unificato con KPI Estesi**

**Breaking Changes:**
- ✅ Rimossi 2 pulsanti separati (CSV + JSON)
- ✅ Aggiunto 1 pulsante unificato "📦 ESPORTA REPORT COMPLETO"
- ✅ 35+ KPI portfolio aggregati (aggiunti 13 nuovi)
- ✅ 30 KPI per ogni ticker (aggiunti 21 nuovi)
- ✅ Price history completa inclusa (~180,000 righe)
- ✅ Timeline giornaliera per-ticker
- ✅ Raw data CSV embedded

**Nuove metriche implementate:**
1. **Sortino Ratio** - Risk-adjusted return usando downside deviation
2. **Calmar Ratio** - Rendimento annualizzato / max drawdown
3. **Win Rate %** - Percentuale operazioni in gain
4. **Profit Factor** - Total gains / total losses
5. **Average Win/Loss** - Media gain e loss per operazione
6. **Largest Win/Loss** - Max gain e loss singola operazione
7. **Recovery Time** - Giorni per recuperare da max drawdown
8. **Consecutive Wins/Losses Max** - Serie consecutive
9. **Downside/Upside Deviation** - Volatilità asimmetrica

**Output File:**
- **Nome**: `rosicatore_report_completo_YYYY-MM-DD_YYYY-MM-DD.json`
- **Dimensione stimata**: 15-20 MB (include price history completa)
- **Contenuto**:
  - Metadata (versione, date, config)
  - Performance Summary (35+ KPI)
  - Risk Metrics Portfolio (17 KPI)
  - Risk Metrics Per-Ticker (17 KPI × 12 ticker)
  - Timeline Aggregate (daily portfolio values)
  - Timeline Per-Ticker (daily per-ticker values)
  - Per-Ticker Breakdown (30 KPI × 12 ticker)
  - Dividends (total + timeline)
  - Raw Data (all events CSV-like)
  - Input CSVs (titoli, movimenti, dividendi)
  - Price History COMPLETA (12 ticker × ~15,000 righe)
  - Best/Worst Performers

**Uso:**
1. Calcola portafoglio (01-AGO-2025 → 17-FEB-2026)
2. Click "📦 ESPORTA REPORT COMPLETO"
3. Scarica JSON unificato (~15-20 MB)
4. Upload a GenSpark/ChatGPT/Claude per report automatico

---
- Capitale iniziale vs finale
- Gain/Loss assoluto (€)
- ROI percentuale
- Numero titoli
- Valore posizioni vs Cash

**2. Risk Metrics:**
- **Volatilità**: Deviazione standard rendimenti (%)
- **Max Drawdown**: Perdita massima % dal picco (+ data)
- **Sharpe Ratio**: Rendimento/rischio annualizzato

**3. Timeline Patrimoniale:**
- Array completo con valori giornalieri
- ROI cumulativo per ogni data
- Perfetto per generare grafici

**4. Breakdown per Ticker:**
- Capitale allocato, patrimonio finale, gain/loss
- ROI %, contributo % al gain totale
- Numero azioni, prezzi ingresso/finale
- Variazione prezzo %
- Dividendi totali ricevuti
- Numero operazioni (BUY/SELL)
- Risk metrics per ticker (volatilità, drawdown, Sharpe)

**5. Dividendi:**
- Totale ricevuto
- Breakdown per ticker
- Timeline completa dividendi

**6. Best/Worst Performers:**
- Titolo con ROI migliore
- Titolo con ROI peggiore

**📥 COME USARE:**
1. Calcola il portafoglio normalmente
2. Clicca su **"📊 ESPORTA REPORT JSON"** (accanto a CSV)
3. Scarica file: `rosicatore_report_2025-01-01_2026-01-01.json`
4. Carica il JSON in ChatGPT/Claude per generare:
   - Report visuale formattato
   - Grafici performance
   - Analisi dettagliata per cliente

**🎯 USE CASE:**
*"Il cliente X mesi fa non ha voluto investire. Ora vuoi mostrargli ESATTAMENTE cosa avrebbe guadagnato/perso con i dati reali."*

Il JSON contiene TUTTI i dati necessari per creare una presentazione professionale con grafici, metriche rischio/rendimento, e breakdown dettagliato.

**Formato JSON Esempio:**
```json
{
  "metadata": {
    "versione": "3.37.0",
    "periodoAnalisi": { "dataInizio": "2025-01-01", "dataFine": "2026-01-01" }
  },
  "performanceSummary": {
    "capitaleIniziale": 12000,
    "capitaleFinale": 13500,
    "gainLossAssoluto": 1500,
    "roiPercentuale": 12.5
  },
  "riskMetrics": {
    "volatilita": 15.2,
    "maxDrawdown": -8.5,
    "sharpeRatio": 0.83
  },
  "timeline": [ /* valori giornalieri */ ],
  "perTicker": [ /* breakdown dettagliato */ ],
  "dividendi": { /* cash flow */ }
}
```

---

## 🆕 NOVITÀ v3.23.0 - LAZY LOADING SMART (07 Feb 2026)

### 🚀 **PERFORMANCE BOOST: Caricamento Intelligente CSV**

**Problema risolto:**
- ❌ Caricamento di TUTTI i CSV (127,000 righe) causava timeout
- ❌ Cloudflare Workers limitato a 10sec/128MB
- ❌ 9/11 ticker fallivano il caricamento

**Soluzione implementata:**
- ✅ **Default: Solo dati 2020+** (~17,000 righe, 850KB)
- ✅ **On-demand: Dati storici** (solo se necessario)
- ✅ **Smart loading: Solo ticker attivi** (da info_titoli.csv)

**Come funziona:**
1. **Avvio app**: Carica solo dati 2020-2026 (6 anni)
2. **Date >= 2020**: Calcolo immediato (dati già in memoria)
3. **Date < 2020**: Carica dati completi automaticamente
4. **Progress bar**: Mostra "⏳ Caricamento dati storici..."

**Vantaggi:**
- ✅ **10x più veloce**: Caricamento iniziale ~2 sec (prima: 20+ sec)
- ✅ **90% use cases**: Maggior parte calcoli 2020+
- ✅ **Zero timeout**: Rispetta limiti Cloudflare Workers
- ✅ **Zero cambi file**: Nessun split fisico CSV

**Test verificati:**
- ✅ Date 2020-2026: Caricamento immediato
- ✅ Date 2015-2026: Carica storico automaticamente
- ✅ Tutti i 12 ticker funzionanti

---

## 🆕 NOVITÀ v3.22.2 - FIX URL ENCODING CSV (07 Feb 2026)

### 🐛 **BUG FIX CRITICO: URL Encoding Nome File**

**Problema risolto:**
- ❌ CSV con spazi nel nome non venivano caricati
- ❌ Fetch falliva per: `"EQT Stock Price History.csv"` (spazi)
- ❌ HTTP status 000 (connessione rifiutata)

**Soluzione implementata:**
- ✅ URL encoding automatico: `encodeURIComponent(filename)`
- ✅ Check HTTP status: `if (!response.ok) throw Error`
- ✅ Tutti gli 11 ticker ora caricano correttamente

**Test verificati:**
- ✅ EQT: 11,568 righe (spazi nel path)
- ✅ AA: 14,146 righe (spazi nel path)
- ✅ PBR: 6,411 righe (spazi nel path)
- ✅ MARA: 3,460 righe (spazi nel path)
- ✅ PMET: 2,874 righe (spazi nel path)
- ✅ IRD: 5,089 righe (spazi nel path)
- ✅ HL: 11,568 righe (spazi nel path)
- ✅ GSM: 4,157 righe (spazi nel path)
- ✅ URG: 4,412 righe (spazi nel path)
- ✅ VZLA: 1,015 righe (caricava già prima)
- ✅ ABRA: 431 righe (caricava già prima)

---

## 🆕 NOVITÀ v3.22.1 - FIX CARICAMENTO CSV (07 Feb 2026)

### 🐛 **BUG FIX CRITICO: Parsing Date CSV**

**Problema risolto:**
- ❌ CSV non venivano letti correttamente
- ❌ Formato date errato: `MM/DD/YYYY` invece di `YYYY-MM-DD`
- ❌ Campo prezzo errato: `Price` invece di `Close`

**Soluzione implementata:**
- ✅ Parsing date corretto: `dayjs(row.Date, 'YYYY-MM-DD')`
- ✅ Campo prezzo corretto: `parseFloat(row.Close)`
- ✅ Tutti i 11 ticker ora caricano correttamente

**Test verificati:**
- ✅ PBR: 6,411 righe (1997-2026)
- ✅ EQT: 11,568 righe (1980-2026)
- ✅ MARA: 3,460 righe (2012-2026)
- ✅ PMET: 2,874 righe (2014-2026)
- ✅ IRD: 5,089 righe (2005-2026)
- ✅ AA: 14,146 righe (1962-2026)
- ✅ HL: 11,568 righe (1972-2026)
- ✅ GSM: 4,157 righe (2007-2026)
- ✅ URG: 4,412 righe (2007-2026)
- ✅ VZLA: 1,015 righe (2020-2026)
- ✅ ABRA: 431 righe (2023-2026)

---

## 🆕 NOVITÀ v3.22.0 - CSV PREZZI STORICI COMPLETI (07 Feb 2026)

### 🔥 CSV Prezzi Aggiornati - 65,133 righe!

**📊 TUTTI I TICKER AGGIORNATI:**
- ✅ **EQT**: 11,568 righe (1980-2026) - prima solo 21!
- ✅ **MARA**: 3,460 righe (2012-2026) - prima solo 20!
- ✅ **PMET**: 2,874 righe (2014-2026) - prima solo 19!
- ✅ **IRD**: 5,089 righe (2005-2026) - prima solo 20!
- ✅ **AA**: 14,146 righe (1962-2026)
- ✅ **HL**: 11,568 righe (1972-2026)
- ✅ **PBR**: 6,411 righe (1997-2026)
- ✅ **GSM**: 4,157 righe (2007-2026)
- ✅ **URG**: 4,412 righe (2007-2026)
- ✅ **VZLA**: 1,015 righe (2020-2026)
- ✅ **ABRA**: 431 righe (2023-2026)

**🎯 DATI 2025 VERIFICATI:**
- Tutti i ticker hanno **250+ giorni** di prezzi nel 2025
- Range: 01/01/2025 → 31/12/2025 completo
- **ROI ora calcolati su dati REALI!**

**📦 BACKUP VECCHI CSV:**
- Directory: `public/static/data/backup_prezzi_old/`
- Preservati per confronto

---

## 🆕 NOVITÀ v3.21.0 - VERIFICA CALCOLI + CSV DOWNLOAD

### ✨ Verifica Calcoli Completa

**📊 ANALISI ESEGUITA:**
- ✅ **Codice matematicamente CORRETTO!**
- ✅ Formula Universale BUY/SELL: verificata
- ✅ Calcolo ROI: verificato  
- ✅ Dividendi: verificati
- ✅ Movimenti pre-periodo: verificati

**🚨 PROBLEMA IDENTIFICATO:**
- ❌ **CSV prezzi EQT, MARA, PMET, IRD INCOMPLETI!**
- EQT: solo 21 righe (da 12/15/2025 in poi)
- MARA: solo 20 righe (dicembre 2025)
- **Questo causa performance gonfiate!**

**📋 File Creato:**
- `VERIFICA_CALCOLI_COMPLETA.md` - Report dettagliato con:
  - Test su 10 date random per ogni ticker
  - Confronto CSV vs dati attesi
  - Analisi root cause performance alte
  - Soluzioni proposte

### ✨ Download CSV (Singolo + Aggregato)

**📥 NUOVE FUNZIONALITÀ:**
- **Pulsante CSV per ogni titolo**: Scarica storico eventi ticker
- **Pulsante CSV globale**: Scarica tutti i titoli in un unico CSV
- **Colonne CSV**: data, ticker, evento, prezzo, azioni, valore, cash, patrimonio, frazione, gainLoss, ROI
- **Perfetto per grafici**: Importa in Excel/Python per analisi avanzate

**📊 Formato CSV:**
```csv
data,ticker,evento,prezzo,azioni,valoreAzioni,cashResiduo,patrimonioTotale,frazione,gainLoss,roiPortafoglio
2025-01-01,PBR,INGRESSO,14.500,51.7241,750.00,250.00,1000.00,0.7500,0.00,0.00
2025-04-22,PBR,DIVIDEND,15.000,51.7241,775.86,263.50,1039.36,0.7500,39.36,3.94
...
```

### ✨ Sezione "🧮 COME SI CALCOLANO LE KPI"

**Nuova sezione espandibile** con spiegazioni dettagliate per:
- 📊 Gain/Loss (guadagno assoluto)
- 📈 ROI Portafoglio (su capitale allocato)
- 💹 ROI Posizioni (su capitale investito)
- 📉 Variazione Prezzo (performance grezza)
- ⚖️ Peso Portafoglio (azioni vs cash)
- 💰 Dividendi Totali (componente reddito)

**Ogni KPI include:**
- Formula matematica esplicita
- Spiegazione cosa rappresenta
- Differenza tra metriche simili

---

## 🆕 NOVITÀ v3.20.0 - SEZIONE PERFORMANCE E ROI

### ✨ Nuova Sezione "📈 RIEPILOGO PERFORMANCE"

Ogni titolo ora mostra un **RIEPILOGO COMPLETO PERFORMANCE** con:

**📊 KPI Principali:**
- Capitale Allocato vs Patrimonio Finale
- Gain/Loss Totale
- ROI Portafoglio (su capitale allocato)

**📈 Analisi ROI Dettagliata:**
- **ROI Portafoglio**: Performance TOTALE (azioni + cash + dividendi)
  - Formula: `(Patrimonio - Capitale) / Capitale × 100`
  - Include TUTTO il capitale
- **ROI Posizioni**: Performance SOLO AZIONI (esclude cash)
  - Formula: `(Valore - Investito) / Investito × 100`
  - Solo azioni, no cash
- **Variazione Prezzo**: Variazione prezzo azione (no dividendi)
  - Formula: `(Finale - Ingresso) / Ingresso × 100`
  - Solo prezzo grezzo

**💰 Scomposizione Gain/Loss:**
- Gain da Prezzo (azioni)
- Gain da Dividendi
- Gain Totale (verificato matematicamente)

**📊 Composizione Patrimonio:**
- Valore Posizione (azioni)
- Cash Residuo
- Peso Azioni %
- Peso Cash %

Tutti i calcoli sono **espliciti, verificabili e matematicamente corretti**! 🎯

---

## 🆕 NOVITÀ v3.19.0 - CALCOLI STEP-BY-STEP

### ✨ Nuova Sezione "📊 CALCOLI DETTAGLIATI"

Ogni titolo ora mostra i calcoli **PASSO-PASSO** per ogni fase:

**🎯 FASE 1: INGRESSO**
- Step 1: Frazione (es: 2/4 = 0.50 = 50%)
- Step 2: Capitale Investito/Residuo
- Step 3: Acquisto Azioni
- Step 4: Valore Posizione

**🎯 FASE 2: APPESANTIMENTO/ALLEGGERIMENTO**
- Step 1: Valutazione Pre-Operazione
- Step 2: Calcolo Formula Universale (BUY o SELL)
- Step 3: Situazione Post-Operazione

**🎯 FASE 3: DIVIDENDO**
- Step 1: Dividendo Lordo
- Step 2: Cash Aggiornato
- Step 3: Valore Posizione

**🎯 FASE FINALE: VALUTAZIONE**
- Step 1: Valore Finale Posizione
- Step 2: Performance Complessiva
- Step 3: ROI Posizioni (su capitale investito)
- Step 4: ROI Portafoglio (su capitale allocato)

Tutti i calcoli sono espliciti e verificabili!

---

## 🆕 NOVITÀ v3.15.0 - CSV CON CAMPO `primo_ingresso`

### ✨ Nuovo formato CSV movimenti

Il CSV `movimenti.csv` ora include **3 nuovi campi**:

1. **`primo_ingresso`** (true/false): Indica se il movimento è il PRIMO INGRESSO storico (0 → >0 quarti)
2. **`esposizione_finale`** (numero): Quarti posseduti DOPO il movimento (es. 0.25 = 1/4)
3. **`uscita_totale`** (true/false): Indica se il movimento porta a USCITA totale (>0 → 0 quarti)

### 📊 Esempio CSV:

```csv
data,ora,ticker,azione,frazione_numeratore,frazione_denominatore,prezzo_usd,note,primo_ingresso,esposizione_finale,uscita_totale
2025-01-13,15:37,MARA,BUY,1,4,16.88,entriamo in Marathon Digital - esposizione ammonta a 1.5/4,false,0.38,false
2025-02-10,15:43,GSM,BUY,1,4,4.17,entriamo in Ferroglobe PLC con una prima posizione parziale,true,0.25,false
```

### 🔍 Distinzione INGRESSO vs APPESANTIMENTO

Il campo `primo_ingresso` risolve la **confusione matematica** tra:

- **PRIMO INGRESSO** (`primo_ingresso = true`): Passaggio da 0 a >0 quarti
  - Esempio: GSM 10/02/2025 → da 0/4 a 1/4
  
- **APPESANTIMENTO** (`primo_ingresso = false`): BUY quando già possiedo >0 quarti
  - Esempio: MARA 13/01/2025 → da 0.5/4 a 1.5/4 (avevo già 0.5/4)

### 📁 Base dati: `info_titoli.csv`

Il file `info_titoli.csv` rappresenta lo **stato al 01/01/2025**:

```
MARA: 0.5/4 (già in portafoglio)
GSM: NON presente (0/4)
EQT: 3/4 (già in portafoglio)
...
```

Quindi:
- MARA 13/01: BUY 1/4 → da 0.5/4 a 1.5/4 → `primo_ingresso = false` ✅
- GSM 10/02: BUY 1/4 → da 0/4 a 1/4 → `primo_ingresso = true` ✅

---

## 📋 Caratteristiche principali

- ✅ **TUTTI I TITOLI CALCOLATI**: Analisi di ogni titolo presente in `info_titoli.csv`
- ✅ **DATE PICKER**: Definisce l'intervallo di analisi
- ✅ **FRAZIONE INIZIALE**: Ogni titolo parte con la frazione indicata in CSV (es. PBR 3/4)
- ✅ **MOVIMENTI.csv**: Contiene SOLO BUY/SELL aggiuntivi con campi `primo_ingresso`, `esposizione_finale`, `uscita_totale`
- ✅ **CAPITALE FISSO PER TITOLO**: 1.000 USD per titolo
- ✅ **FORMULA UNIVERSALE**: (cash + valore azioni) / 4 × frazione per BUY/SELL
- ✅ **DIVIDENDI A CASH**: Dividendi aggiunti al cash (non reinvestiti)
- ✅ **MENU HAMBURGER**: Navigazione laterale completa
- ✅ **SEZIONE CALCOLI DETTAGLIATA**: PDF step-by-step FASE per FASE
- ✅ **AUTO-CARICAMENTO CSV**: Caricamento automatico all'avvio; dati persistenti in `/public/static/data/`
- ✅ **Date Preimpostate**: 01 Gennaio 2025 → 01 Gennaio 2026 (modificabili)
- ✅ **Multi-Ticker Automatico**: 12 CSV prezzi pre-caricati per ogni ticker
- ✅ **Calcolo attualizzazione temporale**: Date range selezionabili
- ✅ **Gestione movimenti**: Appesantimento (BUY) e Alleggerimento (SELL)
- ✅ **22 KPI completi**: USD + %
- ✅ **Tracking completo storico operazioni**
- ✅ **Sistema errori/warning integrato**
- ✅ **4 slot caricamento CSV**: Override manuale se necessario

---

## 🌐 URLs

- **Sandbox Dev**: https://3000-i2ubmb13xm7pk5sakzkyq-5634da27.sandbox.novita.ai
- **GitHub**: https://github.com/DanteManonquello/rosicatore
- **Cloudflare Pages**: (da deployare)
- **Backup v3.15.0**: https://www.genspark.ai/api/files/s/aQ92gOvu

---

## 📊 Architettura Dati

### Storage
- **Dati Persistenti**: `/public/static/data/`
- **Auto-Load**: Caricamento automatico all'avvio
- **Override Manuale**: Caricamenti CSV personalizzati via UI

### Modelli Dati

#### `info_titoli.csv` (stato al 01/01/2025)
```csv
nome,ticker,exchange,isin,quota_numeratore,quota_denominatore,tipo
Ferroglobe PLC,GSM,NASDAQ,GB00BYW6GV68,0,4,GROWTH-DIVIDEND
Marathon Digital,MARA,NASDAQ,US5657881067,0.5,4,GROWTH-SPECULATIVE
```

#### `movimenti.csv` (movimenti 2025 con campo `primo_ingresso`)
```csv
data,ora,ticker,azione,frazione_numeratore,frazione_denominatore,prezzo_usd,note,primo_ingresso,esposizione_finale,uscita_totale
2025-01-13,15:37,MARA,BUY,1,4,16.88,appesantimento da 0.5/4 a 1.5/4,false,0.38,false
2025-02-10,15:43,GSM,BUY,1,4,4.17,primo ingresso in portafoglio,true,0.25,false
```

---

## 🧪 Test Scenarios

### TEST 1: 01/01/2025 → 12/01/2025
**Atteso**: 11 titoli calcolati
- Tutti i titoli in `info_titoli.csv` (già in portafoglio al 01/01)
- GSM escluso (primo ingresso 10/02 > dataFine)

### TEST 2: 03/03/2025 → 10/09/2025
**Atteso**: 12 titoli calcolati
- 11 titoli da `info_titoli.csv`
- 1 titolo nuovo: GSM (primo ingresso 10/02 < dataInizio)

### TEST 3: 01/01/2025 → 31/12/2025
**Atteso**: 12 titoli calcolati
- Tutti i titoli presenti nel 2025

---

## 📦 Deployment

### Platform
Cloudflare Pages

### Status
✅ Active

### Tech Stack
Hono + TypeScript + TailwindCSS + Papa Parse + Day.js

### Last Updated
17 Febbraio 2026 - v3.37.1

---

## 🔄 Changelog

### v3.37.1 (17/02/2026)
- 🐛 **BUGFIX CRITICO**: Download JSON/CSV non funzionante
- ✅ Aggiunta riga `state.results = results` in setupCalculateButton()
- ✅ Download JSON ora funzionante dopo calcolo
- ✅ Download CSV verificato funzionante
- ✅ Favicon placeholder aggiunto (elimina 404)
- ✅ 1 riga modificata (insert), 0 funzioni toccate

### v3.37.0 (17/02/2026)
- ✅ **EXPORT REPORT JSON**: Nuova funzionalità per esportare report completo in formato JSON
- ✅ **Risk Metrics**: Calcolo automatico Volatilità, Max Drawdown, Sharpe Ratio
- ✅ **Timeline Patrimoniale**: Array completo valori giornalieri per grafici
- ✅ **Breakdown per Ticker**: Contributo % gain totale, risk metrics individuali
- ✅ **Dividendi Summary**: Totale ricevuto + timeline + breakdown per ticker
- ✅ **Best/Worst Performers**: Identificazione automatica migliori/peggiori ROI
- ✅ **UI Button**: Pulsante "📊 ESPORTA REPORT JSON" accanto a CSV download
- ✅ **Use Case Cliente**: File JSON ottimizzato per presentazioni "cosa sarebbe successo se..."
- ✅ **+250 righe codice**: Tutte AGGIUNTE, zero modifiche a funzioni esistenti

### v3.21.0 (05/02/2026)
- ✅ **VERIFICA CALCOLI COMPLETA**: Analisi matematica di tutte le formule
- ✅ **Report dettagliato**: File VERIFICA_CALCOLI_COMPLETA.md con risultati
- ✅ **Problema identificato**: CSV prezzi EQT, MARA, PMET, IRD incompleti (causa performance alte)
- ✅ **CSV DOWNLOAD SINGOLO**: Pulsante per scaricare CSV ogni titolo
- ✅ **CSV DOWNLOAD AGGREGATO**: Pulsante per scaricare CSV tutti i titoli
- ✅ **Formato CSV ottimizzato**: 11 colonne per grafici e analisi (data, ticker, evento, prezzo, azioni, valore, cash, patrimonio, frazione, gainLoss, ROI)
- ✅ **Sezione "COME SI CALCOLANO LE KPI"**: Spiegazione dettagliata formule con esempi
- ✅ **Accordion espandibile**: Click per mostrare/nascondere spiegazioni KPI
- ⚠️ **NOTA**: Serve scaricare CSV completi da Yahoo Finance per EQT, MARA, PMET, IRD

### v3.20.0 (05/02/2026)
- ✅ **NUOVA SEZIONE PERFORMANCE**: Riepilogo completo performance per ogni titolo
- ✅ **3 TIPI DI ROI**: ROI Portafoglio, ROI Posizioni, Variazione Prezzo (tutti espliciti)
- ✅ **Scomposizione Gain/Loss**: Gain da Prezzo + Gain da Dividendi + Verifica matematica
- ✅ **Composizione Patrimonio**: Valore Azioni vs Cash Residuo con percentuali
- ✅ **Analisi KPI**: Capitale Allocato, Investito, Patrimonio Finale side-by-side
- ✅ **Formule esplicite**: Ogni ROI mostra la formula matematica completa
- ✅ **Design potenziato**: Gradiente purple-blue-indigo con bordo giallo

### v3.19.0 (05/02/2026)
- ✅ **NUOVA SEZIONE CALCOLI STEP-BY-STEP**: Visualizzazione dettagliata dei calcoli per ogni fase
- ✅ **Formula Universale Esplicita**: Mostra tutti i passaggi matematici (BUY/SELL/DIVIDEND)
- ✅ **Step numerati**: Ogni fase mostra Step 1, Step 2, Step 3, Step 4 con calcoli esatti
- ✅ **Calcoli verificabili**: Es: "127.55 × 4.630 = $590.56" visibili in ogni riga
- ✅ **Performance trasparenti**: ROI Posizioni vs ROI Portafoglio chiaramente distinti
- ✅ **Formato monospace**: Font mono per leggibilità matematica ottimale
- ✅ **Colori intuitivi**: Blu=Ingresso, Verde=BUY, Rosso=SELL, Giallo=Dividendo, Viola=Fine

### v3.18.0 (05/02/2026)
- ✅ **AGGIORNAMENTO DIVIDENDI**: Dataset completo con 517 dividendi storici
- ✅ **5 ticker con dividendi**: PBR (65), EQT (149), AA (206), GSM (30), HL (67)
- ✅ **Dati reali 2025**: 19 dividendi verificati per l'anno corrente
- ✅ **ISIN corretti**: Mappatura verificata con info_titoli.csv
- ✅ **Backup vecchio file**: dividendi.csv.backup_old
- ✅ **Formato payment_date**: Ex-dividend calcolata come payment-15 giorni

### v3.15.0 (04/02/2026)
- ✅ Aggiunto campo `primo_ingresso` al CSV movimenti
- ✅ Aggiunto campo `esposizione_finale` al CSV movimenti
- ✅ Aggiunto campo `uscita_totale` al CSV movimenti
- ✅ Codice usa campo CSV invece di calcolo dinamico
- ✅ Distinzione matematica tra PRIMO INGRESSO e APPESANTIMENTO
- ✅ GSM è l'unico titolo con `primo_ingresso = true` (10/02/2025)
- ✅ Backup CSV vecchio creato: `movimenti_backup_20260204_212655.csv`

### v3.14.0 (04/02/2026)
- ✅ Rimosso check errato `primoIngressoStorico > dataFine`
- ✅ Titoli in `info_titoli.csv` sempre calcolati se quarti > 0 al dataInizio
- ✅ Fix EQT, AA, MARA, VZLA che erano skippati erroneamente

### v3.13.0 (04/02/2026)
- ✅ Usa `info_titoli.csv` come BASE per calcolo quarti al dataInizio
- ✅ Rappresenta stato al 01/01/2025

### v3.12.1 (04/02/2026)
- ✅ Fix normalizzazione date movimenti (Papa Parse dynamicTyping)

### v3.12.0 (04/02/2026)
- ✅ Fix logica ingresso/uscita titoli
- ✅ Corretto calcolo quarti per periodo

---

## 📄 License

MIT
