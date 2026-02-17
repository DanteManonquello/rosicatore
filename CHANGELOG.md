# 📋 CHANGELOG - Rosicatore v4.1.1

## v4.1.1 - AGGIORNAMENTO CSV AUTOMATICO (17 Febbraio 2026)

### ✨ Nuove Funzionalità

#### 🤖 Sistema Automatico di Aggiornamento CSV
- **Script**: `scripts/update_csv_data.cjs`
- **Funzione**: Aggiornamento automatico dei CSV dal formato CSVatore
- **Input**: 2 file ZIP (pricing + dividendi)
- **Output**: CSV unificati pronti per il sito

#### 🔧 Funzionalità Script

1. **Merge Automatico Pricing**:
   - Unisce file multi-parte (es. PBR - Parte 1, Parte 2, Parte 3, Parte 4)
   - Mantiene un solo header
   - Ordina cronologicamente
   - Valida schema CSV

2. **Unificazione Dividendi**:
   - Estrae ticker dal nome file
   - Aggiunge colonna `ticker` automaticamente
   - Converte date italiano → ISO
   - Crea CSV unificato con schema `ticker,currency,date,amount`

3. **Backup Automatico**:
   - Salva tutti i CSV esistenti prima dell'aggiornamento
   - Directory: `/public/static/data/backup/backup_TIMESTAMP/`
   - Sicurezza: nessuna perdita dati

4. **Validazione**:
   - Verifica colonne richieste
   - Parsing date italiano
   - Rimozione righe vuote
   - Ordinamento cronologico

### 📊 Dati Aggiornati (17 Feb 2026)

**Ticker aggiornati** (9 su 12):
- IRD: 5,096 rows (Opus Genetics)
- EQT: 11,573 rows
- AA: 14,151 rows (Alcoa)
- GSM: 4,162 rows (Ferroglobe)
- HL: 11,573 rows (Hecla Mining)
- URG: 4,417 rows (Ur Energy)
- MARA: 3,465 rows (Marathon Digital)
- VZLA: 1,020 rows (Vizsla Silver)
- PBR: 6,416 rows (Petrobras)

**Totale**:
- ~62,000+ righe pricing
- 232 dividendi
- Periodo: Agosto 2000 - Febbraio 2026

**Ticker mantenuti** (CSV esistenti):
- PMET: PMET Resources (non presente in nuovo ZIP)
- PLL: Elevra Lithium DRC (non presente in nuovo ZIP)
- ABRA: AbraSilver Resource (non presente in nuovo ZIP)

### 📝 Documentazione

- **File**: `WORKFLOW_AGGIORNAMENTO_CSV.md`
- **Contenuto**:
  - Procedura automatica completa
  - Mapping ticker → nome file
  - Validazioni automatiche
  - Log di esempio
  - Workflow futuro semplificato

### 🔄 Workflow Futuro Semplificato

Per il prossimo aggiornamento:

```bash
# 1. Fornisci i due ZIP
# 2. Esegui comando unico:
cd /home/user/webapp && \
  node scripts/update_csv_data.cjs && \
  npm run build && \
  pm2 restart rosicatore
```

### 🎯 Obiettivo Raggiunto

✅ **Workflow completamente automatizzato**: fornisci i ZIP, esegui lo script, il sito è aggiornato.

---

## v4.1.0 - SUPPORTO DATE ITALIANO (17 Febbraio 2026)

### ✨ Nuove Funzionalità

#### 🇮🇹 Parser Date Italiano Nativo
- Supporto formato `DD Mese YYYY` (es. "10 Agosto 2000")
- Parsing automatico mesi italiani (gennaio, febbraio, marzo, ecc.)
- Case-insensitive
- Supporto accenti

#### 🔧 Funzioni Aggiunte

1. **parseItalianDate(dateString)**:
   - Input: "10 Agosto 2000"
   - Output: "2000-08-10"
   - Supporta tutti i mesi italiani

2. **formatItalianDate(isoDate)**:
   - Input: "2000-08-10"
   - Output: "10 Agosto 2000"
   - Formattazione leggibile

3. **parseUniversalDate(dateString)** - Esteso:
   - Supporto formato italiano
   - Backward compatible con YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
   - Fallback automatico

### 🎯 Motivazione

- File CSV da CSVatore usano formato italiano
- Elimina ambiguità tra formato US (MM/DD) e EU (DD/MM)
- Allineamento con input utente naturale
- Leggibilità immediata (mesi in lettere)

### ✅ Test Validati

- ✅ "10 Agosto 2000" → 2000-08-10
- ✅ "25 agosto 2025" → 2025-08-25 (case-insensitive)
- ✅ "1 Gennaio 2026" → 2026-01-01
- ✅ Backward compatibility con formati esistenti

---

## v4.0.0 - EXPORT UNIFICATO COMPLETO (8 Agosto 2025)

### ✨ Nuove Funzionalità

#### 📦 Export Unificato KPI Completi
- **Pulsante Unico**: "📦 ESPORTA REPORT COMPLETO"
- **File JSON**: `rosicatore_report_completo_START_END.json`
- **Dimensione**: ~15-20 MB

#### 📊 KPI Portfolio (35+ Totali)

**Esistenti (22)**:
- Patrimonio Iniziale/Finale
- Gain/Loss Totale
- ROI Portfolio %
- Valore Posizioni/Cash
- Max/Min Patrimonio
- Drawdown
- Volatilità
- Sharpe Ratio

**Nuovi (13)**:
- Sortino Ratio
- Calmar Ratio
- Win Rate %
- Profit Factor
- Average Win/Loss
- Largest Win/Loss
- Recovery Time
- Consecutive Wins/Losses Max
- Downside/Upside Deviation

#### 📈 KPI Per-Ticker (30+ Ciascuno)

**Esistenti (9)**:
- Capitale Allocato
- Valore Finale
- Gain/Loss
- ROI %
- Contributo Portfolio
- Azioni Possedute
- Dividendi Totali
- Numero Operazioni

**Nuovi (21)**:
- Entry/Exit Price
- Price Change %
- Buy/Sell Counts
- Max Drawdown & Date
- Volatilità
- Sharpe/Sortino/Calmar
- Win Rate %
- Profit Factor
- Average/Large Wins/Losses
- Recovery Time
- Consecutive Wins/Losses
- Downside/Upside Deviation
- Final Cash Fraction

### 📋 Struttura JSON Report

```json
{
  "_metadata": {
    "appVersion": "4.0.0",
    "generatedAt": "2026-02-17T15:30:00Z",
    "period": { "start": "2025-08-01", "end": "2026-02-17" },
    "totalCapital": 12000,
    "tickersCount": 12
  },
  "performanceSummary": { /* 35+ KPI portfolio */ },
  "riskMetrics": {
    "portfolio": { /* 17 KPI */ },
    "perTicker": { /* 17 KPI per ticker */ }
  },
  "timeline": [ /* 200 giorni × tutti i ticker */ ],
  "perTicker": { /* 30 KPI per ogni ticker */ },
  "dividends": { /* Totali + timeline */ },
  "rawData": {
    "inputData": { /* CSV originali */ },
    "priceHistory": { /* ~180k rows */ },
    "timelinePerTicker": { /* 2,400 punti */ }
  },
  "bestPerformer": { "ticker": "HL", "roi": 246.41 },
  "worstPerformer": { "ticker": "VZLA", "roi": -12.34 },
  "notes": [ /* 12 spiegazioni KPI */ ]
}
```

### 🗑️ Rimozioni

- ❌ Pulsante "Scarica CSV Completo"
- ❌ Pulsante "ESPORTA REPORT JSON"
- ✅ Sostituiti con unico pulsante unificato

### 🎯 Obiettivo Raggiunto

✅ **Tutti i KPI in un unico file**: portfolio + per-ticker + timeline + raw data + price history

---

## v3.37.1 - FIX DOWNLOAD CSV/JSON (17 Febbraio 2026)

### 🐛 Bug Fix Critici

1. **Fix Download JSON/CSV**:
   - Problema: `state.results` non veniva popolato
   - Effetto: Click su "ESPORTA REPORT JSON" mostrava "Nessun dato disponibile"
   - Soluzione: Aggiunto `state.results = results;` in `setupCalculateButton()`
   - Risultato: Download funzionanti

2. **Fix Favicon 404**:
   - Aggiunto `/static/favicon.ico`
   - Risolti errori 404 nel browser

### 📝 Modifiche

- **File**: `public/static/app.js`
- **Linea aggiunta**: `state.results = results;` (riga 567)
- **Altre modifiche**: Nessuna

---

## v3.37.0 - EXPORT REPORT JSON (17 Febbraio 2026)

### ✨ Nuove Funzionalità

1. **Pulsante "ESPORTA REPORT JSON"**:
   - Genera file JSON completo con tutti i KPI
   - Nome file: `rosicatore_report_START_END.json`
   - Dimensione: ~150 KB

2. **Struttura Report JSON**:
   - Metadata (versione, periodo, capitale)
   - Performance Summary (ROI, gain/loss, capitale finale)
   - Risk Metrics (volatilità, drawdown, Sharpe)
   - Timeline giornaliera
   - Per-Ticker breakdown
   - Dividendi totali
   - Best/Worst performers

---

## Versioni Precedenti

### v3.36.0 - VALIDATION ROBUSTA (12 Febbraio 2026)
- Validazione movimenti robusta
- Ordinamento eventi per data
- Logs dettagliati
- Safeguard frazioni negative
- Validazione finale prima di SKIP

### v3.35.0 - FIX FRAZIONE INIZIALE (12 Febbraio 2026)
- Correzione calcolo frazione iniziale
- Usa frazione reale alla data di inizio
- Risolto bug GSM

---

## 📊 Timeline Sviluppo

- **12 Feb 2026**: v3.35.0 - Fix frazione iniziale
- **12 Feb 2026**: v3.36.0 - Validation robusta
- **17 Feb 2026**: v3.37.0 - Export report JSON
- **17 Feb 2026**: v3.37.1 - Fix download CSV/JSON + favicon
- **8 Ago 2025**: v4.0.0 - Export unificato completo
- **17 Feb 2026**: v4.1.0 - Supporto date italiano
- **17 Feb 2026**: v4.1.1 - Aggiornamento CSV automatico

---

## 🎯 Roadmap Futura

### Prossime Versioni

1. **v4.2.0 - Report PDF**:
   - Generazione PDF report completo
   - Template professionale
   - Grafici integrati

2. **v4.3.0 - Benchmark S&P 500**:
   - Confronto con benchmark
   - Alpha/Beta calculation
   - Information Ratio

3. **v4.4.0 - Multi-Currency**:
   - Supporto valute multiple
   - Conversione automatica
   - FX rates integration

---

## 📝 Note di Versioning

**Schema Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Cambi breaking (es. rimozione pulsanti, cambio struttura dati)
- **MINOR**: Nuove funzionalità (es. supporto date italiano)
- **PATCH**: Bug fix, miglioramenti (es. fix download)

**Naming Archive**: `Rosicatore_vX.Y.Z_DESCRIPTION.tar.gz`
