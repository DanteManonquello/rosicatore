# 📊 Rosicatore v1.5.1 - Stock Price Timeline Tracker

Analizza gli andamenti azionari con un'interfaccia stile DAW (Digital Audio Workstation) per visualizzare multiple tracce di dati finanziari.

## 🎯 Versione Attuale: v1.5.1 - MOVIMENTI INTELLIGENTE

### ✨ Novità v1.5.1

#### 📊 Registra Movimenti (Comandi Rapidi)
- **🔄 Delta Esposizioni**: Aggiungi/riduci frazioni con comandi rapidi
- **⚡ Sintassi Semplice**: `AAPL +1/4`, `TSLA -0.5/4`, `PBR 3/4`
- **🎯 Auto-Match Ticker**: Riconosce ticker con/senza exchange
- **🧠 Delta vs Override**: `+` = aggiungi, `-` = sottrai, nessun segno = imposta

**Esempi Comandi**:
```
AAPL +1/4        (aggiungi 1/4 alla frazione attuale)
TSLA -0.5/4      (riduci 0.5/4 dalla frazione attuale)
NYSE:PBR 3/4     (imposta frazione a 3/4)
GSM +0,5/4       (virgola italiana supportata)
```

**Logica**:
- `+1/4` su `2/4` → `3/4` ✅ (delta)
- `-0.5/4` su `3/4` → `2.5/4` ✅ (delta)
- `3/4` su `2/4` → `3/4` ✅ (override)

#### 💼 Fix "Valore Posizioni" (ex "Valore Portafoglio")
- **Rinominato per chiarezza**: "Valore Posizioni" = solo valore investimenti attivi
- **Nessun cambio logica**: Calcolo invariato
- **Patrimonio Netto** rimane somma completa (posizioni + residuo)

### 📋 Funzionalità v1.5.0 (Precedenti)

#### 🔄 localStorage DISABLED - Nessuna Persistenza
- **❌ Dati NON salvati**: Ogni refresh = ricomincia da zero
- **🔄 Fresh Start**: App vuota ad ogni apertura
- **📋 Caricamento Manuale**: Utente deve ricaricare CSV ogni volta
- **⚠️ Nessun Backup Automatico**: Dati persi al refresh/chiusura

**Perché?**:
- Controllo totale utente sui dati
- Nessun rischio di dati vecchi/corrotti
- Workflow pulito: carica → analizza → chiudi

**Come Usare**:
1. Apri Rosicatore
2. Carica CSV (Multi Upload o singoli)
3. Imposta esposizioni/capitale
4. Analizza performance
5. **⚠️ NON fare refresh** o perdi tutto
6. Quando finito, chiudi tab

**Cosa è stato RIMOSSO**:
- ❌ `localStorage.setItem()` (salvataggio)
- ❌ `localStorage.getItem()` (caricamento)
- ❌ Funzione `saveTracks()` (disabilitata)
- ❌ Persistenza automatica

### 📋 Funzionalità v1.4.7 (Precedenti)

#### 💎 KPI Crescita Patrimonio
- **💰 Patrimonio Netto**: Valore totale portafoglio (posizioni + liquidità)
- **📈 Crescita Patrimonio**: Aumento/diminuzione patrimonio in € e %
- **🧮 Formula**: `Patrimonio Attuale - Capitale Iniziale`

**Esempio Calcolo**:
```javascript
Capitale Alloggiato: 10.000€
Investito: 3.000€ → Valore: 3.600€
Residuo: 7.000€

Patrimonio Netto = 3.600 + 7.000 = 10.600€
Crescita = 10.600 - 10.000 = +600€ (+6%)
```

#### 📚 ALGORITMO_MADRE.md
- **🔥 Cuore di Rosicatore**: File documentale con tutta la logica
- **📊 Formule Complete**: Investimenti, PMC, Performance, Patrimonio
- **🚧 Roadmap Futura**: Movimenti, Dividendi, CAGR, Sharpe Ratio
- **📝 Changelog Integrato**: Storia modifiche algoritmo

**Sezioni Principali**:
1. Logica Investimenti (Frazioni)
2. Calcolo Performance (P&L, ROI, PMC)
3. Crescita Patrimonio
4. TODO: Gestione Movimenti (v1.5.0)
5. TODO: Gestione Dividendi (v1.5.0)
6. Formule Matematiche Avanzate

### 📋 Funzionalità v1.4.6 (Precedenti)

#### 🔢 Supporto Virgola Italiana
- **✅ Parser Robusto**: Supporta sia `0.5/4` che `0,5/4` (virgola italiana)
- **✅ Calcoli Decimali**: Frazioni come 0.5/4, 0.25/4, 1.5/4 funzionano perfettamente
- **✅ Fix parseFloat**: Conversione automatica virgola → punto per calcoli

#### 📊 Dashboard KPI Estesa (8 Nuovi KPI)
- **🏆 Best Performer**: Traccia con ROI% più alto (nome + %)
- **💀 Worst Performer**: Traccia con ROI% più basso (nome + %)
- **📈 ROI Medio %**: Media gain/loss % di tutte le tracce con dati
- **🎯 Win Rate**: Percentuale tracce in gain (verde >50%, rosso <50%)
- **💰 Valore Portafoglio**: Somma valori correnti di tutte le posizioni
- **💵 Investimento Medio**: Capitale medio investito per traccia
- **🔥 Tracce in Gain**: Conteggio posizioni positive (verde)
- **❄️ Tracce in Loss**: Conteggio posizioni negative (rosso)

#### 🧮 Test Calcoli Rigorosi
```javascript
// Esempio calcoli con decimali
Capital: 10.000€
Quota: 0.5/4 (12.5%)
→ Investito: 1.250€ ✅
→ Residuo: 8.750€ ✅

Capital: 10.000€
Quota: 0,5/4 (virgola italiana)
→ Investito: 1.250€ ✅
→ Parsing automatico virgola ✅
```

### 📋 Funzionalità v1.4.5 (Precedenti)
- **💰 Capitale Totale Opzionale**: Input per capitale che viene diviso equamente tra tracce
- **🔢 Suddivisione Automatica**: Capitale totale ÷ N tracce = capitale per traccia
- **📊 Feedback Dettagliato**: Mostra capitale assegnato a ogni traccia
- **✅ Fix Calcoli**: Ora il capitale viene correttamente distribuito

#### 🎯 Come Usare Smart Expositions Parser v1.4.5
1. **Inserisci Capitale Totale** (opzionale, es: 12000€)
2. **Copia** da Excel/Google Sheets la tabella con: NOME, TICKER, QUOTA
3. **Incolla** nella textarea (accetta anche header)
4. **Click** "Applica Esposizioni"
5. **Ricevi** feedback con capitale diviso automaticamente

**Esempio:**
- Capitale Totale: 12.000€
- 12 tracce trovate
- Risultato: 1.000€ per traccia

### 📋 Funzionalità v1.4.4 (Precedenti)
- **🪄 Parser Intelligente Esposizioni**: Incolla tabella da Excel/Sheets e applica esposizioni automaticamente
- **📋 Auto-detect Formato**: Riconosce TAB, spazi multipli, con/senza header
- **🎯 Match Automatico**: Per NOME o TICKER (estrae da "NYSE:PBR" → "PBR")
- **🔢 Supporto Decimali**: Quote come 0.5/4, 1/4, 3/4
- **✅ Feedback Dettagliato**: Alert con ✅/❌ per ogni traccia aggiornata

#### 🎯 Come Usare Smart Expositions Parser
1. **Copia** da Excel/Google Sheets la tabella con: NOME, TICKER, QUOTA
2. **Incolla** nella textarea (accetta anche header)
3. **Click** "Applica Esposizioni"
4. **Ricevi** feedback immediato con tracce aggiornate

**Formato Supportato:**
```
NOME                    TICKER      QUOTA
Petroleo Brasileiro     NYSE:PBR    3/4
EQT Corporation         NYSE:EQT    3/4
AbraSilver Resource     TSXV:ABRA   0.5/4
```

### 📋 Funzionalità v1.4.3 (Precedenti)
- **📈 GAIN/LOSS € Totale**: Profitto/perdita in euro del portafoglio completo
- **📊 GAIN/LOSS % Totale**: Performance percentuale globale
- **🎨 Colori Dinamici**: Verde ⬆️ per gain, rosso ⬇️ per loss
- **📅 Data Fine Default = Oggi**: Tutte le nuove tracce hanno `dateEnd = oggi`
- **🧮 Calcolo Matematico**: Somma gain/loss di tutte le tracce con capitale investito

### 📋 Funzionalità Complete

#### 📊 Dashboard Portafoglio con KPI Performance (v1.4.3)
```
┌─ Portafoglio Totale ─────────────────────────────┐
│ Capitale      Capitale      Capitale    Titoli   │
│ Alloggiato    Investito     Residuo     Diversi  │
│ 12.000€       3.000€        9.000€      12       │
│                                                   │
│ Liquidità     Quarti        GAIN/LOSS €          │
│ Investita     Investiti                          │
│ 25.0%         12/48         +500,00€ ⬆️          │
│                                                   │
│               GAIN/LOSS %                        │
│               +16,67% ⬆️                          │
└──────────────────────────────────────────────────┘
```

- ✅ **GAIN/LOSS €**: Somma(Valore Corrente - Capitale Investito) tutte le tracce
- ✅ **GAIN/LOSS %**: (GAIN/LOSS € / Capitale Investito Totale) × 100
- ✅ **Colori**: Verde per positivo, rosso per negativo
- ✅ **Frecce**: ⬆️ gain, ⬇️ loss

#### 🚀 Multi Upload con Impostazioni Globali (v1.4.2)
- ✅ **Capitale Totale**: Si divide automaticamente per numero tracce
- ✅ **Data Inizio Comune**: Applicata a tutte le tracce
- ✅ **Data Fine Comune**: Applicata a tutte le tracce (default = oggi)
- ✅ **Validazione**: Date start > end vengono ignorate
- ✅ **Reset Automatico**: Input puliti dopo upload

#### 💰 Gestione Capitale e Investimenti
- ✅ **Capitale Alloggiato**: Riferimento fisso iniziale (editabile per traccia)
- ✅ **Capitale Investito**: Calcolo automatico da frazione (1/4, 2/4, ecc.)
- ✅ **Capitale Residuo**: Disponibile non investito

#### 📊 KPI Performance per Traccia
- ✅ **Valore Corrente**: Valutazione posizione attuale
- ✅ **Gain/Loss (P&L)**: Profitto/Perdita in € e %
- ✅ **Prezzo Medio Carico**: PMC automatico
- ✅ **Prezzo Attuale**: Quotazione corrente

#### 📈 Analisi e Grafici
- ✅ **Grafici Interattivi**: Stile Google Finance
- ✅ **Period Selector**: 1G, 5G, 1M, 6M, YTD, 1A, 5A, Max
- ✅ **Metriche Multiple**: Prezzo, High, Low, Open, Volume
- ✅ **Filtri Data**: Range temporali personalizzati

#### 🚀 Upload Multiplo (v1.4.1+)
- ✅ **Drag & Drop**: Zona collassabile con chevron
- ✅ **Supporto Formati**: CSV, ZIP, TAR, TAR.GZ, cartelle
- ✅ **Multi-selezione**: Carica decine di CSV contemporaneamente
- ✅ **Auto-tracce**: Crea automaticamente 1 traccia per CSV

## 🚀 Link Progetto

- **Live Demo**: https://danteemanonquello.github.io/rosicatore
- **GitHub Repo**: https://github.com/DanteManonquello/rosicatore

## 💾 Architettura Dati

```javascript
track = {
  id: 'track-123',
  filename: 'Apple Stock.csv',
  data: [...],
  capital: 10000,        // Capitale alloggiato
  numerator: 1,          // Frazione investita (numeratore)
  denominator: 4,        // Frazione investita (denominatore)
  dateStart: '2024-01-01', // Data inizio
  dateEnd: '2026-01-23'    // Data fine (default = oggi)
}
```

## 🧮 Formula KPI Performance Globali (v1.4.3)

### **GAIN/LOSS € Totale**:
```
Per ogni traccia:
  capitalInvested = capital × (numerator / denominator)
  startPrice = getStartPrice(track)
  endPrice = getEndPrice(track)
  shares = capitalInvested / startPrice
  currentValue = shares × endPrice
  gainLoss = currentValue - capitalInvested

Totale:
  GAIN/LOSS € = Σ(gainLoss di tutte le tracce)
```

### **GAIN/LOSS % Totale**:
```
GAIN/LOSS % = (GAIN/LOSS € / Capitale Investito Totale) × 100

Esempio:
  Capitale Investito Totale: 10.000€
  Valore Corrente Totale: 12.500€
  GAIN/LOSS €: 2.500€
  GAIN/LOSS %: (2500 / 10000) × 100 = +25%
```

## 📊 Supporto File

- ✅ CSV singoli (`.csv`)
- ✅ ZIP multipli (`.zip`)
- ✅ TAR/TAR.GZ (`.tar`, `.tar.gz`)
- ✅ Cartelle (multi-selezione)
- ✅ Drag & Drop universale

## 🛠️ Tech Stack

- **Framework**: Vanilla JS + HTML5
- **Charts**: Chart.js 4.4.0
- **Compression**: JSZip 3.10.1 + fflate 0.8.1
- **UI**: Tailwind CSS
- **Icons**: FontAwesome 6.4.0
- **Storage**: LocalStorage (persistenza client-side)
- **Server**: http-server (sviluppo)

## 📝 Formato CSV Supportato

```csv
"Date","Price","Open","High","Low","Vol.","Change %"
"01/13/2026","12.30","11.99","12.37","11.99","32.94M","3.62%"
```

## 🚀 Quick Start

### Sviluppo Locale
```bash
# Avvia server statico
npx http-server . -p 3000

# Oppure con PM2
pm2 start ecosystem.config.cjs
```

### Test
```bash
# Apri browser
open http://localhost:3000/index.html
```

### PM2 Commands
```bash
pm2 list
pm2 logs rosicatore --nostream
pm2 restart rosicatore
pm2 delete rosicatore
```

## 🎯 Come Interpretare KPI Performance

### **Esempio Portafoglio**:
```
Capitale Alloggiato: 50.000€
Capitale Investito: 12.500€ (25% in 5 tracce)
Capitale Residuo: 37.500€

Performance:
GAIN/LOSS €: +2.100€ ⬆️
GAIN/LOSS %: +16,80% ⬆️

Interpretazione:
- Hai investito 12.500€ totali
- Il valore attuale è 14.600€
- Hai guadagnato 2.100€
- Performance: +16,80%
```

## 📦 Changelog

### v1.4.3 (23 Gennaio 2026) - KPI PERFORMANCE GLOBALI
- ✅ GAIN/LOSS € totale nel dashboard
- ✅ GAIN/LOSS % totale nel dashboard
- ✅ Colori dinamici (verde/rosso) con frecce
- ✅ Data fine default = oggi per nuove tracce
- ✅ Calcolo matematico preciso su tutte le tracce
- ✅ **PRESERVATO 100%**: Tutte le funzionalità v1.4.2

### v1.4.2 (23 Gennaio 2026) - IMPOSTAZIONI GLOBALI
- ✅ Input capitale globale con divisione automatica
- ✅ Input date comuni (start/end)
- ✅ Divisione matematica pura (decimali illimitati)

### v1.4.1 (23 Gennaio 2026) - MULTI UPLOAD COMPLETA
- ✅ Drag & Drop zona collapsabile
- ✅ Supporto ZIP/TAR.GZ
- ✅ Auto-naming tracce

### v1.3.2 (Precedente)
- Bugfix calcoli
- Dashboard portafoglio
- Performance box con KPI

---

**Ultimo aggiornamento**: 23 Gennaio 2026  
**Versione**: v1.4.3 - KPI PERFORMANCE GLOBALI  
Made with 💜 by DanteManonquello

