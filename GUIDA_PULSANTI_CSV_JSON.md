# 📊 Guida ai Pulsanti di Export - Rosicatore v3.37.1

## 🎯 Panoramica
Dopo il calcolo del portafoglio, l'interfaccia mostra **DUE pulsanti di export**:
1. 🟦 **"SCARICA CSV TUTTI I TITOLI"** (verde-blu)
2. 🟪 **"📊 ESPORTA REPORT JSON"** (viola-rosa)

---

## 🟦 Pulsante 1: CSV AGGREGATO

### Aspetto Visivo
```
[🟦 SCARICA CSV TUTTI I TITOLI (12 ticker)]
```
- Colore: gradiente verde-blu
- Posizione: dopo i KPI card
- Icona: 📊

### Funzione Tecnica
**Trigger**: `downloadAggregateCSV()`  
**File generato**: `rosicatore_tutti_titoli_2025-08-01_2026-02-17.csv`  
**Dimensione**: ~50-200 KB (dipende da numero eventi)

### Contenuto File
**Formato**: CSV con 11 colonne, UTF-8, delimitatore virgola

**Header**:
```csv
data,ticker,evento,prezzo,azioni,valoreAzioni,cashResiduo,patrimonioTotale,frazione,gainLoss,roiPortafoglio
```

**Esempio righe**:
```csv
2025-08-01,EQT,📈 BUY,45.20,22.12,1000.00,500.00,1500.00,0.75,0.00,0.00%
2025-08-05,AA,💰 DIVIDEND,55.00,18.18,1000.00,520.50,1520.50,0.50,20.50,1.37%
2025-08-10,HL,📈 BUY,6.85,146.00,1000.00,120.00,2520.50,1.00,520.50,20.65%
2025-09-15,PBR,📉 SELL,12.50,0.00,0.00,1680.00,3450.00,0.00,450.00,13.04%
2025-11-20,MARA,⚠️ PRELIEVO CASH,22.30,44.84,1000.00,450.00,4120.00,0.50,1120.00,27.18%
```

### Descrizione Colonne

| Colonna | Descrizione | Esempio |
|---------|-------------|---------|
| **data** | Data evento ISO 8601 | `2025-08-01` |
| **ticker** | Simbolo azionario | `EQT`, `AA`, `HL` |
| **evento** | Tipo operazione | `📈 BUY`, `💰 DIVIDEND`, `📉 SELL`, `⚠️ PRELIEVO CASH`, `🏁 VALUTAZIONE FINALE` |
| **prezzo** | Prezzo azione USD | `45.20` |
| **azioni** | Numero azioni possedute dopo l'evento | `22.12` |
| **valoreAzioni** | Valore totale posizione (azioni × prezzo) | `1000.00` |
| **cashResiduo** | Contante liquido disponibile | `500.00` |
| **patrimonioTotale** | Valore azioni + cash | `1500.00` |
| **frazione** | % portafoglio allocata a questo ticker | `0.75` (75%) |
| **gainLoss** | Gain/Loss assoluto USD (patrimonio - capitale iniziale) | `520.50` |
| **roiPortafoglio** | ROI % complessivo portafoglio | `13.04%` |

### Casi d'Uso

#### 1. Analisi Excel/Google Sheets
```excel
=PIVOT(A:K, {"ticker", "evento"}, SUM(I:I))
```
→ Gain/Loss per ticker e tipo evento

#### 2. Grafici Temporali Cross-Ticker
```python
import pandas as pd
df = pd.read_csv('rosicatore_tutti_titoli.csv')
df.pivot_table(values='patrimonioTotale', index='data', columns='ticker').plot()
```
→ Andamento patrimonio per ogni ticker

#### 3. Audit Trail Completo
- Verifica manuale ogni operazione
- Backup calcoli per compliance
- Export in contabilità aziendale

#### 4. Performance Attribution
```sql
SELECT ticker, SUM(gainLoss) as contributo
FROM rosicatore_data
WHERE evento = '🏁 VALUTAZIONE FINALE'
GROUP BY ticker
ORDER BY contributo DESC
```
→ Ranking contributi per ticker

---

## 🟪 Pulsante 2: REPORT JSON

### Aspetto Visivo
```
[🟪 📊 ESPORTA REPORT JSON]
```
- Colore: gradiente viola-rosa
- Posizione: accanto al pulsante CSV
- Icona: 📊

### Funzione Tecnica
**Trigger**: `downloadReportJSON()`  
**File generato**: `rosicatore_report_2025-08-01_2026-02-17.json`  
**Dimensione**: ~100-200 KB (dipende da timeline daily)

### Struttura JSON Completa

```json
{
  "metadata": {
    "appVersion": "3.37.1",
    "generatedAt": "2026-02-17T15:30:45Z",
    "analysisPeriod": {
      "start": "2025-08-01",
      "end": "2026-02-17"
    },
    "totalCapital": 12000,
    "tickersCount": 12,
    "calculationNotes": [
      "Dati storici prezzi: Yahoo Finance",
      "Capitale fisso per titolo: $1,000",
      "Dividendi reinvestiti in cash, non automaticamente"
    ]
  },
  
  "performanceSummary": {
    "initialCapital": 12000.00,
    "finalCapital": 17217.11,
    "totalGainLoss": 5217.11,
    "roi": 43.48,
    "finalCash": 2500.00,
    "finalPositionValue": 14717.11,
    "activeTickers": 8,
    "closedPositions": 4
  },
  
  "riskMetrics": {
    "portfolioVolatility": 2.15,
    "maxDrawdown": -5.32,
    "maxDrawdownDate": "2025-11-15",
    "sharpeRatio": 1.24,
    "description": "Volatilità calcolata su deviazione standard rendimenti giornalieri. Sharpe assume risk-free rate 3%."
  },
  
  "timeline": [
    {"date": "2025-08-01", "totalPatrimonio": 12000.00, "gainLoss": 0, "roi": 0},
    {"date": "2025-08-02", "totalPatrimonio": 12150.00, "gainLoss": 150, "roi": 1.25},
    {"date": "2025-08-03", "totalPatrimonio": 11980.00, "gainLoss": -20, "roi": -0.17},
    ...
    {"date": "2026-02-17", "totalPatrimonio": 17217.11, "gainLoss": 5217.11, "roi": 43.48}
  ],
  
  "perTicker": {
    "EQT": {
      "allocatedCapital": 1000.00,
      "finalValue": 1150.25,
      "gainLoss": 150.25,
      "roi": 15.03,
      "contribution": 2.88,
      "shareCount": 20.20,
      "entryPrice": 49.50,
      "exitPrice": 56.93,
      "priceChange": 15.01,
      "dividendsReceived": 120.50,
      "buyCount": 3,
      "sellCount": 1,
      "volatility": 3.45,
      "sharpeRatio": 1.15,
      "maxDrawdown": -8.20,
      "finalCashFraction": 0.0
    },
    "AA": {
      "allocatedCapital": 1000.00,
      "finalValue": 1615.32,
      "gainLoss": 615.32,
      "roi": 61.53,
      "contribution": 11.79,
      "shareCount": 25.58,
      "entryPrice": 39.10,
      "exitPrice": 63.15,
      "priceChange": 61.51,
      "dividendsReceived": 40.00,
      "buyCount": 2,
      "sellCount": 0,
      "volatility": 4.12,
      "sharpeRatio": 1.85,
      "maxDrawdown": -12.50,
      "finalCashFraction": 0.0
    },
    "HL": {
      "allocatedCapital": 1000.00,
      "finalValue": 3464.15,
      "gainLoss": 2464.15,
      "roi": 246.41,
      "contribution": 47.23,
      "shareCount": 146.20,
      "entryPrice": 6.85,
      "exitPrice": 23.69,
      "priceChange": 245.84,
      "dividendsReceived": 0.00,
      "buyCount": 1,
      "sellCount": 0,
      "volatility": 12.50,
      "sharpeRatio": 3.45,
      "maxDrawdown": -25.30,
      "finalCashFraction": 0.0
    },
    ...
  },
  
  "dividends": {
    "total": 245.50,
    "perTicker": {
      "PBR": 85.00,
      "EQT": 120.50,
      "AA": 40.00
    },
    "timeline": [
      {"date": "2025-10-15", "ticker": "PBR", "amount": 25.00},
      {"date": "2025-11-20", "ticker": "EQT", "amount": 60.25},
      {"date": "2026-01-10", "ticker": "AA", "amount": 40.00},
      ...
    ]
  },
  
  "bestPerformer": {
    "ticker": "HL",
    "roi": 246.41,
    "gainLoss": 2464.15
  },
  
  "worstPerformer": {
    "ticker": "VZLA",
    "roi": -12.34,
    "gainLoss": -123.40
  },
  
  "notes": [
    "Questo report è stato generato automaticamente dal sistema Rosicatore v3.37.1",
    "I dati storici provengono da Yahoo Finance e potrebbero contenere errori",
    "Il calcolo assume capitale fisso di $12,000 diviso equamente tra titoli attivi",
    "Dividendi sono pagati in cash e non reinvestiti automaticamente",
    "Le metriche di rischio sono calcolate su rendimenti giornalieri",
    "Max drawdown rappresenta la massima perdita da picco precedente",
    "Sharpe ratio assume risk-free rate del 3% annuo"
  ]
}
```

### Casi d'Uso

#### 1. Report Cliente AI-Generated
```bash
# Upload a ChatGPT/Claude:
"Analizza questo JSON e crea una presentazione professionale 
per un cliente che non ha investito a Agosto 2025. 
Evidenzia cosa avrebbe guadagnato, i rischi sostenuti, 
e confronta con un portafoglio tradizionale 60/40."
```
→ Slide deck automatico in 30 secondi

#### 2. Dashboard Power BI / Tableau
```python
import json
with open('rosicatore_report.json') as f:
    data = json.load(f)
    
# Import diretto in dashboard interattiva
df_timeline = pd.DataFrame(data['timeline'])
df_tickers = pd.DataFrame(data['perTicker']).T
```
→ Grafici interattivi real-time

#### 3. Presentazione "What-If"
**Scenario**: Cliente rifiuta proposta Agosto 2025, rivedi a Febbraio 2026

**Slide automatica**:
```
"Se avesse investito $12,000 il 1° Agosto 2025:
✅ Patrimonio oggi: $17,217 (+43.48%)
✅ Guadagno assoluto: $5,217
✅ Volatilità: 2.15% (bassa)
✅ Max drawdown: -5.32% (Nov 2025)
✅ Sharpe Ratio: 1.24 (eccellente risk-adj return)

Best performer: HL (+246.41%)
Dividendi incassati: $245.50

Il mercato è salito, ma non è troppo tardi per iniziare."
```

#### 4. Backup Completo Metriche
- Snapshot JSON leggero (~150 KB)
- Tutti i KPI in un unico file
- Facilmente versionabile (Git, Dropbox)
- Import veloce in qualsiasi tool di analisi

---

## 🔄 Workflow Completo

### Step-by-Step
1. **Configura date** (es. 01-Ago-2025 → 17-Feb-2026)
2. **Carica CSV** (auto-load da `/static/data/` o upload manuale)
3. **Clicca "CALCOLA PORTAFOGLIO"**
4. **Attendi calcolo** (~5-10 sec per 12 ticker)
5. **Vedi KPI cards** (patrimonio, ROI, gain/loss, ecc.)
6. **Scarica CSV** per analisi Excel/grafici personalizzati
7. **Scarica JSON** per report AI-generated o dashboard

### Esempio Completo
```bash
# Scenario: Ricontatto cliente dopo 6 mesi
1. Apri Rosicatore
2. Imposta date: 01-AGO-2025 → 17-FEB-2026
3. Calcola → Total Patrimonio: $17,217.11
4. Scarica JSON
5. Upload a ChatGPT:
   "Crea una presentazione PowerPoint professionale 
    basata su questo JSON. Target: cliente prospect 
    che ha detto 'ci penso' 6 mesi fa."
6. Ottieni:
   - 5 slide con grafici
   - Executive summary
   - Risk analysis
   - Call-to-action finale
   
Tempo totale: 3 minuti
```

---

## 📝 Note Tecniche

### Bug Fix v3.37.1
**Problema precedente (v3.37.0)**:
- `calculatePortfolio()` ritornava `results`, ma non assegnava `state.results`
- Conseguenza: `downloadReportJSON()` e `downloadAggregateCSV()` vedevano sempre `null`
- Sintomo: Alert "Nessun dato disponibile per generare il report"

**Fix applicato**:
```javascript
// app.js, linea 567 (in setupCalculateButton)
const results = await calculatePortfolio(config);
state.results = results; // ← FIX: aggiunte questa riga
await displayResults(results);
```

### Validazione Download
Entrambe le funzioni controllano `state.results`:
```javascript
if (!state.results || !state.results.stocks) {
    alert('⚠️ Nessun dato disponibile...');
    return;
}
```
→ Ora funziona correttamente dopo il fix

### Compatibilità Browser
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 non supportato (usa Blob API moderna)

---

## 🎯 KPI Presenti nel JSON vs CSV

### Solo in JSON (non in CSV)
- ✅ Risk metrics aggregati (Sharpe, volatility, max drawdown)
- ✅ Contribution % per ticker
- ✅ Best/Worst performer automatico
- ✅ Metadata (versione app, data generazione)
- ✅ Note esplicative per interpretazione
- ✅ Per-ticker risk metrics (Sharpe individuale, volatility)

### Solo in CSV (non in JSON)
- ✅ Timeline granulare di ogni singolo evento
- ✅ Dettaglio riga-per-riga di BUY/SELL/DIVIDEND
- ✅ Cash residuo snapshot ad ogni operazione
- ✅ Frazione portafoglio istantanea per ogni evento

### Comune ad Entrambi
- ✅ Timeline valori patrimoniali (daily in JSON, event-based in CSV)
- ✅ ROI progressivo
- ✅ Gain/Loss totale

---

## ❓ FAQ

**Q: Quale usare per presentazione cliente?**  
A: **JSON** → Upload a ChatGPT/Claude, genera slide automatiche

**Q: Quale usare per analisi Excel personalizzata?**  
A: **CSV** → Import diretto in Excel, pivot tables, grafici custom

**Q: Posso generare entrambi contemporaneamente?**  
A: Sì, clicca prima CSV, poi JSON (o viceversa)

**Q: Il JSON contiene anche i dati raw del CSV?**  
A: No, JSON è aggregato e summarizzato. Per dettaglio completo serve CSV.

**Q: Posso editare il JSON e re-importarlo?**  
A: No, attualmente è solo export. Ma puoi usarlo come input per altri tool.

**Q: Quanto è grande il file JSON?**  
A: ~100-200 KB (compresso ~30 KB). Leggero per email/upload.

---

## 🚀 Prossimi Sviluppi (Roadmap)

- [ ] Export PDF con grafici embedded
- [ ] Export Excel multi-sheet (KPI + Timeline + Per-Ticker)
- [ ] Confronto JSON tra periodi diversi
- [ ] Import JSON per ricreare calcolo
- [ ] Shareable link diretto (hosting JSON su Cloudflare R2)

---

**Versione documento**: 1.0  
**Data**: 17 Febbraio 2026  
**Autore**: Rosicatore Development Team  
**Licenza**: Internal Use Only
