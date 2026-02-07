# Rosicatore v3.20.0

## 🎯 Portfolio Tracker Algorithm

Rosicatore è un Portfolio Tracker che calcola il valore nel tempo di TUTTI i titoli del portafoglio.

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
05 Febbraio 2026 - v3.20.0

---

## 🔄 Changelog

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
