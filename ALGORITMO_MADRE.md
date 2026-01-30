# 🧮 ALGORITMO MADRE - Rosicatore

**Versione**: v1.7.0  
**Data**: 2025-01-30  
**Autore**: Rosicatore Development Team

---

## 📌 INTRODUZIONE

Questo documento è il **cuore pulsante** di Rosicatore. Definisce la logica matematica e algoritmica che governa:
- Calcolo investimenti e frazioni
- Performance tracking (P&L, ROI, PMC)
- Crescita patrimonio
- **KPI dettagliati per titolo (v1.6.0) - 14+ metriche**
- Gestione movimenti (v1.5.1)
- **🆕 PMC Dinamico e Sistema Transazioni (v1.7.0)**
- Gestione dividendi (futuro)

**⚠️ IMPORTANTE**: Qualsiasi modifica alla logica di calcolo DEVE essere documentata in questo file.

---

## 🔥 NUOVO: SISTEMA PMC DINAMICO (v1.7.0)

### Il Problema Risolto

**PRIMA (v1.6.x)**: PMC statico basato solo su prezzo iniziale
```javascript
// ❌ VECCHIO METODO - PMC non si aggiorna mai
PMC = startPrice (sempre 185€)
shares = capitalInvestito / PMC
```

**Problema**: Quando fai alleggerimenti/appesantimenti, il PMC rimane fisso al prezzo iniziale, dando calcoli errati per shares e performance.

**DOPO (v1.7.0)**: PMC dinamico con tracking transazioni
```javascript
// ✅ NUOVO METODO - PMC si aggiorna ad ogni movimento
transactions = [
  { type: 'buy', shares: 54.05, price: 185, amount: 10000 },
  { type: 'sell', shares: 27.025, price: 212, amount: 5729.30 },
  { type: 'buy', shares: 11.11, price: 225, amount: 2500 }
]

PMC = Σ(acquisti_totali) / Σ(shares_totali)
```

### Logica Sistema Transazioni

**1. Inizializzazione Prima Transazione**
```javascript
// Al primo caricamento CSV con capitale e frazione
function initializeFirstTransaction(track) {
  const invested = capital × (numerator / denominator);
  const startPrice = getStartPrice(track);
  const shares = invested / startPrice;
  
  // Crea transazione iniziale
  transactions.push({
    type: 'buy',
    date: dateStart,
    shares: shares,
    price: startPrice,
    amount: invested
  });
  
  // Imposta PMC iniziale
  currentPMC = startPrice;
  totalShares = shares;
}
```

**2. Alleggerimento (Vendita)**
```javascript
// Quando numerator diminuisce (es: 4/4 → 2/4)
if (numerator < previousNumerator) {
  const deltaInvestment = previousInvested - currentInvested;
  
  // Calcola shares da vendere basandosi su PMC ATTUALE
  const sharesToSell = deltaInvestment / currentPMC;
  
  // Registra vendita al prezzo CORRENTE
  transactions.push({
    type: 'sell',
    date: dateEnd,
    shares: sharesToSell,
    price: currentPrice,
    amount: sharesToSell × currentPrice
  });
  
  // Aggiorna shares totali
  totalShares -= sharesToSell;
  
  // PMC rimane invariato (non cambia dopo vendita)
  // currentPMC = currentPMC (unchanged)
  
  // Cash incassato
  realizedCash += sharesToSell × currentPrice;
}
```

**3. Appesantimento (Acquisto)**
```javascript
// Quando numerator aumenta (es: 2/4 → 3/4)
if (numerator > previousNumerator) {
  const additionalInvestment = currentInvested - previousInvested;
  
  // Calcola shares da acquistare al prezzo CORRENTE
  const sharesToBuy = additionalInvestment / currentPrice;
  
  // Registra acquisto
  transactions.push({
    type: 'buy',
    date: dateEnd,
    shares: sharesToBuy,
    price: currentPrice,
    amount: additionalInvestment
  });
  
  // Aggiorna shares totali
  totalShares += sharesToBuy;
  
  // 🔥 RICALCOLA PMC PONDERATO
  const oldTotalValue = (totalShares - sharesToBuy) × currentPMC;
  const newTotalValue = oldTotalValue + additionalInvestment;
  currentPMC = newTotalValue / totalShares;
  
  // Usa cash realizzato se disponibile
  if (realizedCash > 0) {
    const usedCash = Math.min(realizedCash, additionalInvestment);
    realizedCash -= usedCash;
  }
}
```

### Esempio Completo Scenario

```
📅 SCENARIO: AAPL - 10.000€ | 4/4 → 2/4 → 3/4

─────────────────────────────────────────────────
📅 FASE 1: ACQUISTO INIZIALE (01/01/2024)
─────────────────────────────────────────────────
Capitale Allocato:      10.000€
Frazione:               4/4
Capitale Investito:     10.000€
Prezzo:                 185$/az

Transazione #1: BUY
├─ Shares:              54,05
├─ Prezzo:              185€/az
├─ Totale:              10.000€
└─ PMC:                 185€/az ✅

Stato:
├─ Total Shares:        54,05
├─ PMC:                 185€/az
├─ Cash Residuo:        0€
└─ Patrimonio:          10.000€

─────────────────────────────────────────────────
📅 FASE 2: ALLEGGERIMENTO (30/06/2024)
─────────────────────────────────────────────────
Frazione:               4/4 → 2/4
Prezzo Corrente:        212€/az

Calcolo Vendita:
├─ Delta Capitale:      10.000 - 5.000 = 5.000€
├─ Shares da Vendere:   5.000 / 185 = 27,025 shares
└─ Cash Incassato:      27,025 × 212 = 5.729,30€

Transazione #2: SELL
├─ Shares:              27,025
├─ Prezzo:              212€/az
├─ Totale:              5.729,30€
└─ PMC:                 185€/az (unchanged) ✅

Stato:
├─ Total Shares:        27,025
├─ PMC:                 185€/az (invariato)
├─ Cash Residuo:        5.729,30€
├─ Valore Posizione:    5.729,30€ (27,025 × 212)
└─ Patrimonio:          11.458,60€

─────────────────────────────────────────────────
📅 FASE 3: APPESANTIMENTO (30/09/2024)
─────────────────────────────────────────────────
Frazione:               2/4 → 3/4
Prezzo Corrente:        225€/az

Calcolo Acquisto:
├─ Delta Capitale:      7.500 - 5.000 = 2.500€
├─ Shares da Acquistare: 2.500 / 225 = 11,11 shares
└─ Prezzo Acquisto:     225€/az

Transazione #3: BUY
├─ Shares:              11,11
├─ Prezzo:              225€/az
├─ Totale:              2.500€
└─ PMC:                 ??? (da calcolare)

🔥 RICALCOLO PMC PONDERATO:
├─ Shares Vecchie:      27,025 @ 185€/az = 5.000€
├─ Shares Nuove:        11,11 @ 225€/az = 2.500€
├─ Total Shares:        38,135
├─ Total Investito:     7.500€
└─ NUOVO PMC:           7.500 / 38,135 = 196,68€/az ✅

Stato:
├─ Total Shares:        38,135
├─ PMC:                 196,68€/az (aggiornato!)
├─ Cash Residuo:        3.229,30€ (5.729,30 - 2.500)
├─ Valore Posizione:    8.580,37€ (38,135 × 225)
└─ Patrimonio:          11.809,67€

─────────────────────────────────────────────────
📅 FASE 4: VALUTAZIONE FINALE (31/12/2024)
─────────────────────────────────────────────────
Frazione:               3/4 (unchanged)
Prezzo Corrente:        240€/az

Nessuna Transazione

Stato:
├─ Total Shares:        38,135
├─ PMC:                 196,68€/az ✅
├─ Valore Posizione:    9.152,40€ (38,135 × 240)
├─ Cash Residuo:        3.229,30€
├─ Patrimonio:          12.381,70€
├─ Gain/Loss:           +2.381,70€
├─ ROI Posizioni:       +22,03% [(9.152,40 - 7.500) / 7.500]
└─ ROI Portafoglio:     +23,82% [(12.381,70 - 10.000) / 10.000]

─────────────────────────────────────────────────
📊 RIEPILOGO TRANSAZIONI
─────────────────────────────────────────────────
1. [BUY]  01/01/2024: 54,05 shares @ 185€ = 10.000€
2. [SELL] 30/06/2024: 27,025 shares @ 212€ = 5.729,30€
3. [BUY]  30/09/2024: 11,11 shares @ 225€ = 2.500€

Totale Transazioni: 3
PMC Finale:         196,68€/az (dinamico!)
Shares Finali:      38,135
```

### Vantaggi Sistema v1.7.0

✅ **PMC Accurato**: Riflette il vero costo medio delle azioni possedute
✅ **Shares Corrette**: Basate su transazioni reali, non su formule statiche
✅ **Tracking Storico**: Tutte le operazioni registrate e visualizzabili
✅ **Cash Realizzato**: Tracciamento preciso del cash da vendite
✅ **Performance Reale**: ROI calcolato su dati reali, non stimati

---

## 📊 LOGICA INVESTIMENTI (Frazioni)

### Frazione Investimento

**Formula Base**:
```
frazione = numerator / denominator
```

**Esempi**:
- `1/4` = 25% del capitale alloggiato
- `0.5/4` = 12.5% del capitale alloggiato
- `3/4` = 75% del capitale alloggiato
- `4/4` = 100% del capitale alloggiato

**Supporto Decimali**:
- ✅ Virgola italiana: `0,5/4` → automaticamente convertito in `0.5/4`
- ✅ Punto decimale: `0.5/4` → accettato direttamente
- ✅ Frazioni maggiori di 1: `1.5/4` = 37.5%

### Calcolo Capitale Investito

**Formula**:
```
capitalInvestito = capitalAlloggiato × frazione
```

**Esempio**:
```javascript
Capitale Alloggiato: 10.000€
Frazione: 3/4 = 0.75
Capitale Investito: 10.000 × 0.75 = 7.500€
```

### Calcolo Capitale Residuo

**Formula**:
```
capitalResiduo = capitalAlloggiato - capitalInvestito
```

**Esempio**:
```javascript
Capitale Alloggiato: 10.000€
Capitale Investito: 7.500€
Capitale Residuo: 10.000 - 7.500 = 2.500€
```

---

## 💰 CALCOLO PERFORMANCE

### Prezzo Medio di Carico (PMC)

**Definizione**: Il PMC è il prezzo di acquisto iniziale delle azioni.

**Formula**:
```
PMC = Prezzo all'inizio della traccia (startPrice)
```

**Calcolo Shares (Azioni Possedute)**:
```
shares = capitalInvestito / PMC
```

**Esempio**:
```javascript
Capitale Investito: 3.000€
PMC (Prezzo Start): 100€
Shares: 3.000 / 100 = 30 azioni
```

### Valore Corrente Posizione

**Formula**:
```
valoreCorrente = shares × prezzoAttuale
```

**Esempio**:
```javascript
Shares: 30 azioni
Prezzo Attuale (End): 120€
Valore Corrente: 30 × 120 = 3.600€
```

### Gain/Loss (Profitto/Perdita)

**Formula in €**:
```
gainLoss€ = valoreCorrente - capitalInvestito
```

**Formula in %**:
```
gainLoss% = (gainLoss€ / capitalInvestito) × 100
```

**Esempio**:
```javascript
Valore Corrente: 3.600€
Capitale Investito: 3.000€

Gain/Loss €: 3.600 - 3.000 = +600€
Gain/Loss %: (600 / 3.000) × 100 = +20%
```

---

## 📈 CRESCITA PATRIMONIO

### Patrimonio Netto

**Definizione**: Valore totale del portafoglio (posizioni + liquidità).

**Formula**:
```
patrimonioNetto = Σ(valoriCorrenti) + Σ(capitaliResidui)
```

**Esempio**:
```javascript
// Traccia 1
Valore Corrente: 3.600€
Residuo: 7.000€

// Traccia 2
Valore Corrente: 1.200€
Residuo: 3.800€

Patrimonio Netto = (3.600 + 1.200) + (7.000 + 3.800) = 15.600€
```

### Crescita Patrimonio

**Formula in €**:
```
crescitaPatrimonio€ = patrimonioNetto - Σ(capitaliAlloggiati)
```

**Formula in %**:
```
crescitaPatrimonio% = (crescitaPatrimonio€ / Σ(capitaliAlloggiati)) × 100
```

**Esempio**:
```javascript
Patrimonio Iniziale (Capitale Alloggiato Totale): 20.000€
Patrimonio Netto Attuale: 21.500€

Crescita Patrimonio €: 21.500 - 20.000 = +1.500€
Crescita Patrimonio %: (1.500 / 20.000) × 100 = +7.5%
```

---

## 📊 KPI DETTAGLIATI PER TITOLO (v1.6.0)

### Definizione

Ogni traccia (titolo) dispone di **14+ KPI specifici** suddivisi in 4 sezioni:

### 1. CAPITALE (3 KPI)

**1.1 Capitale Allocato**
```
capitalAllocato = track.capital
```
- Importo in €
- Percentuale sul portafoglio totale: `(capitalAllocato / ΣcapitaliAllocati) × 100`

**1.2 Capitale Investito**
```
capitalInvestito = capitalAllocato × frazione
```
- Importo in €
- Percentuale sul capitale allocato: `(capitalInvestito / capitalAllocato) × 100`

**1.3 Capitale Residuo**
```
capitalResiduo = capitalAllocato - capitalInvestito
```
- Importo in €
- Percentuale sul capitale allocato: `(capitalResiduo / capitalAllocato) × 100`

### 2. PERFORMANCE (4 KPI)

**2.1 Valore Corrente**
```
valoreCorriente = shares × prezzoAttuale
```

**2.2 Gain/Loss Assoluto**
```
gainLoss€ = valoreCorriente - capitalInvestito
```

**2.3 Gain/Loss Percentuale**
```
gainLoss% = (gainLoss€ / capitalInvestito) × 100
```

**2.4 ROI (Return on Investment)**
```
ROI% = gainLoss%
```

### 3. PREZZI (4 KPI)

**3.1 Prezzo Medio Carico (PMC)**
```
PMC = prezzoIniziale (startPrice)
```

**3.2 Prezzo Attuale**
```
prezzoAttuale = endPrice
```

**3.3 Variazione Prezzo Assoluta**
```
variazionePrezzo€ = prezzoAttuale - PMC
```

**3.4 Variazione Prezzo Percentuale**
```
variazionePrezzo% = (variazionePrezzo€ / PMC) × 100
```

### 4. COMPOSIZIONE PORTAFOGLIO (4 KPI)

**4.1 Peso nel Portafoglio**
```
peso% = (valoreCorriente / ΣvaloriCorrenti) × 100
```

**4.2 Esposizione**
```
esposizione% = frazione × 100
```

**4.3 Shares Possedute**
```
shares = capitalInvestito / PMC
```

**4.4 Rapporto Valore/Investito**
```
rapportoValoreInvestito = valoreCorriente / capitalInvestito
```
- `>1.0x` = In profitto
- `<1.0x` = In perdita

### 5. INDICATORE MOVIMENTO

**Definizione Movimento**:
```
hasMovement = prezzoAttuale ≠ PMC
direction = prezzoAttuale > PMC ? +1 : -1
changePercent = ((prezzoAttuale - PMC) / PMC) × 100
```

**Badge Movimento**:
- ↗️ Verde: Movimento positivo (gain)
- ↘️ Rosso: Movimento negativo (loss)
- ⚪ Grigio: Nessun movimento

**Esempio Completo**:
```javascript
// Input
capital: 10.000€
fraction: 3/4 (75%)
PMC: 100€
prezzoAttuale: 125€

// Calcoli KPI
1. CAPITALE
   - Allocato: 10.000€ (50% portafoglio)
   - Investito: 7.500€ (75% allocato)
   - Residuo: 2.500€ (25% allocato)

2. PERFORMANCE
   - Valore Corrente: 9.375€
   - Gain/Loss €: +1.875€
   - Gain/Loss %: +25%
   - ROI: +25%

3. PREZZI
   - PMC: 100€
   - Prezzo Attuale: 125€
   - Variazione €: +25€
   - Variazione %: +25%

4. COMPOSIZIONE
   - Peso: 47% portafoglio
   - Esposizione: 75% (3/4)
   - Shares: 75
   - Rapporto: 1.25x (profitto)

5. MOVIMENTO
   - Badge: ↗️ +25% Movimento
```

---

## 🎯 KPI DASHBOARD

### KPI Base (Sezione 1)
1. **Capitale Alloggiato**: Somma capitali di tutte le tracce
2. **Capitale Investito**: Somma investimenti attivi
3. **Capitale Residuo**: Somma liquidità non investita
4. **Titoli Diversi**: Conteggio tracce attive

### KPI Performance (Sezione 2)
1. **Liquidità Investita**: % media investimento
2. **Quarti Investiti**: Somma frazioni (es: 12/48)
3. **GAIN/LOSS €**: Profitto/perdita totale in euro
4. **GAIN/LOSS %**: Profitto/perdita totale percentuale
5. **💎 Patrimonio Netto**: Valore portafoglio totale
6. **📈 Crescita Patrimonio**: Aumento patrimonio in € e %

### KPI Extended (Sezione 3)
1. **🏆 Best Performer**: Traccia con ROI% massimo
2. **💀 Worst Performer**: Traccia con ROI% minimo
3. **📊 ROI Medio %**: Media gain/loss % tutte tracce
4. **🎯 Win Rate**: % tracce in gain

### KPI Portfolio (Sezione 4)
1. **💰 Valore Portafoglio**: Somma valori posizioni
2. **💵 Investimento Medio**: Media capitale investito
3. **🔥 Tracce in Gain**: Conteggio posizioni positive
4. **❄️ Tracce in Loss**: Conteggio posizioni negative

---

## ✅ GESTIONE MOVIMENTI RAPIDI (v1.5.1 - IMPLEMENTATO)

**Funzionalità implementate**:

### 1. Comandi Delta Esposizioni
```javascript
// Sintassi comando
TICKER +NUMERATOR/DENOMINATOR  // Aggiungi frazione
TICKER -NUMERATOR/DENOMINATOR  // Riduci frazione  
TICKER NUMERATOR/DENOMINATOR   // Imposta frazione (override)

// Esempi
AAPL +1/4      // Frazione attuale: 2/4 → Nuova: 3/4
TSLA -0.5/4    // Frazione attuale: 3/4 → Nuova: 2.5/4
PBR 3/4        // Frazione attuale: 2/4 → Nuova: 3/4 (override)
```

### 2. Logica Delta vs Override
```javascript
function applyMovimento(track, movimento) {
  const oldNumerator = track.numerator;
  
  if (movimento.isDelta) {
    // Delta: aggiungi/sottrai
    const delta = movimento.sign === '+' ? movimento.numerator : -movimento.numerator;
    track.numerator = oldNumerator + delta;
  } else {
    // Override: imposta valore
    track.numerator = movimento.numerator;
  }
  
  track.denominator = movimento.denominator;
}
```

### 3. Parser Multi-Formato
```javascript
// Supporta:
AAPL +1/4           // Ticker semplice
NYSE:PBR -0.5/4     // Ticker con exchange
GSM +0,5/4          // Virgola italiana
TSLA    3/4         // Spazi multipli
```

### 4. Auto-Match Ticker
```javascript
// Match intelligente per ticker
// "NYSE:PBR" → cerca "PBR" in filename
// "AAPL" → cerca "AAPL" in filename
// Case-insensitive, parziale
```

---

## 🚧 TODO: GESTIONE MOVIMENTI AVANZATA (v1.6.0+)

**Funzionalità da implementare**:

### 1. Acquisti Successivi (Dollar Cost Averaging)
```javascript
// Tracciare multiple transazioni di acquisto
transactions: [
  { date: '2024-01-01', shares: 10, price: 100€, amount: 1000€ },
  { date: '2024-02-01', shares: 8, price: 125€, amount: 1000€ }
]

// PMC aggiornato
PMC = Σ(amount) / Σ(shares)
```

### 2. Vendite Parziali
```javascript
// Registrare vendite parziali
{ date: '2024-03-01', shares: -5, price: 150€, amount: 750€, type: 'sell' }

// Aggiornare shares possedute
sharesAttuali = Σ(transactions.shares)
```

### 3. Ribilanciamento Posizioni
```javascript
// Calcolare nuove frazioni target
targetFraction = desiredAllocation / totalCapital
// Suggerire operazioni per raggiungere target
```

### 4. Tracking Storico Transazioni
```javascript
// Database transazioni
transactionHistory: [
  { id, trackId, type: 'buy'|'sell', date, shares, price, amount, fees }
]
```

---

## 💵 TODO: GESTIONE DIVIDENDI (v1.5.0)

**Funzionalità da implementare**:

### 1. Registrazione Dividendi
```javascript
dividends: [
  { date: '2024-01-15', amount: 50€, trackId: 'AAPL' },
  { date: '2024-04-15', amount: 52€, trackId: 'AAPL' }
]
```

### 2. Calcolo Dividend Yield
```javascript
dividendYield = (Σ(dividendi_annuali) / capitalInvestito) × 100
```

### 3. Reinvestimento Automatico (DRIP)
```javascript
// Opzione per reinvestire dividendi
if (track.drip) {
  newShares = dividend / currentPrice;
  track.shares += newShares;
}
```

### 4. Tassazione Dividendi
```javascript
// Calcolare ritenuta fiscale
taxRate = 26%; // Italia
netDividend = grossDividend × (1 - taxRate);
```

---

## 🔬 FORMULE MATEMATICHE PRINCIPALI

### 1. ROI (Return on Investment)
```
ROI% = ((Valore Finale - Investimento Iniziale) / Investimento Iniziale) × 100
```

### 2. CAGR (Compound Annual Growth Rate)
```
CAGR = ((Valore Finale / Valore Iniziale)^(1/anni) - 1) × 100
```
*[TODO: Da implementare per tracce con data inizio/fine]*

### 3. Sharpe Ratio
```
Sharpe = (Rendimento Medio - Tasso Risk-Free) / Deviazione Standard
```
*[TODO: Da implementare con calcolo volatilità]*

### 4. Max Drawdown
```
Max Drawdown = ((Valore Minimo - Picco Precedente) / Picco Precedente) × 100
```
*[TODO: Da implementare con analisi storica prezzi]*

---

## 📝 CHANGELOG

### v1.7.0 (2025-01-30) - 🔥 PMC DINAMICO & SISTEMA TRANSAZIONI
- ✅ **SISTEMA TRANSAZIONI COMPLETO**: Tracking acquisti/vendite con storico
- ✅ **PMC DINAMICO**: Ricalcolo PMC ponderato ad ogni acquisto
- ✅ **SHARES CORRETTE**: Basate su transazioni reali, non formule statiche
- ✅ **ALLEGGERIMENTI PRECISI**: Vendita shares basata su PMC attuale
- ✅ **APPESANTIMENTI PRECISI**: Acquisto shares con ricalcolo PMC
- ✅ **UI STORICO TRANSAZIONI**: Tabella completa transazioni nei KPI
- ✅ **BADGE PMC DINAMICO**: Indicatore visuale quando PMC cambia
- ✅ **CONSOLE LOGS**: Dettagli operazioni per debug
- 🔧 **Formula PMC**: `PMC = Σ(acquisti_totali) / Σ(shares_totali)`
- 🔧 **Variazione Prezzo**: Ora calcolata da PMC attuale, non startPrice
- 📊 **Campi Track Nuovi**:
  - `transactions[]`: Array storico transazioni
  - `currentPMC`: PMC attuale dinamico
  - `totalShares`: Shares totali possedute
- 🎯 **Risolve Bug Critico**: PMC statico che dava calcoli errati dopo movimenti

### v1.5.1 (2025-01-24)
- ✅ **Registra Movimenti**: Sezione comandi rapidi esposizioni
- ✅ **Parser Delta/Override**: Sintassi `+1/4`, `-0.5/4`, `3/4`
- ✅ **Auto-Match Ticker**: Riconosce AAPL, NYSE:AAPL automaticamente
- ✅ **Virgola Italiana**: Supporto `0,5/4` nei movimenti
- 🔄 **Fix UI**: "Valore Portafoglio" → "Valore Posizioni" (chiarezza)

### v1.5.0 (2025-01-24)
- ❌ **localStorage DISABLED**: Nessuna persistenza dati
- 🔄 **Fresh Start**: App vuota ad ogni apertura
- ❌ Rimossa funzione `saveTracks()` (disabilitata)
- ❌ Rimossa funzione `loadTracks()` (non più usata)
- ❌ Rimosso caricamento iniziale da localStorage
- ⚠️ **Breaking Change**: Utente deve ricaricare CSV ogni volta

### v1.4.7 (2025-01-24)
- ✅ Creazione ALGORITMO_MADRE.md
- ✅ Documentazione logica investimenti frazioni
- ✅ Documentazione calcolo performance
- ✅ Documentazione crescita patrimonio
- ✅ Template TODO per movimenti e dividendi
- ✅ KPI Patrimonio Netto implementato
- ✅ KPI Crescita Patrimonio implementato

### v1.4.6 (2025-01-24)
- ✅ Supporto virgola italiana (0,5/4)
- ✅ Fix calcoli decimali (parseFloat)
- ✅ 8 nuovi KPI dashboard

### v1.4.5 (2025-01-24)
- ✅ Input capitale totale
- ✅ Suddivisione automatica capitale

### v1.4.4 (2025-01-24)
- ✅ Smart Expositions Parser
- ✅ Match automatico NOME/TICKER

### v1.6.8 (2025-01-28)
- ✅ **FIX LEGGIBILITÀ INPUT**: Testo nero invece di grigio chiaro
- 🎨 **CSS Fix**: Aggiunto `text-gray-900` a tutti gli input number
- 👁️ **Accessibilità**: Contrasto WCAG compliant
- 📊 **Input Modificati**:
  - Capitale Allocato: `text-xl font-bold text-gray-900`
  - Numeratore Frazione: `text-gray-900`
  - Denominatore Frazione: `text-gray-900`
- 🐛 **Bug**: Input valori quasi invisibili (grigio chiaro su bianco)
- ✅ **Risolto**: Nero pieno per tutti i valori numerici

### v1.6.7 (2025-01-28)
- ✅ **INPUT CAPITALE ALLOCATO PER TRACCIA**: Ora modificabile manualmente
- ✅ **Doppia Modalità**: Globale (divide equamente) + Manuale (per traccia)
- ✅ **UI**: Capitale Allocato da readonly → input modificabile
- ✅ **Event Listener**: Input capita allocato con validazione (min=0)
- ✅ **Reset**: Quando cambia capitale → reset cash/dividendi
- ✅ **Priorità**: Impostazioni Globali sovrascrivono input manuali
- ✅ **Sync**: `track.capitalAllocato` e `track.capital` allineati
- 🎯 **UX**: Input arancione con bordo focus ring orange-500
- 📊 **Calcoli**: `investedCapital = capitalAllocato × (numerator/denominator)`

### v1.6.6 (2025-01-28)
- ✅ **FIX CRITICO**: Menu accordion non si aprivano (JavaScript bloccato)
- 🐛 **Bug**: Dichiarazione duplicata `const capitalAllocato` (righe 835 e 868)
- ✅ **Risolto**: Rimossa dichiarazione duplicata in ROI Portafoglio calc
- ✅ **Impatto**: Event listeners accordion ora funzionano correttamente
- ✅ **Test**: Playwright verifica no errori JavaScript bloccanti
- 🎯 **Menu Funzionanti**: Caricamento Multiplo, Esposizioni, Movimenti, Impostazioni Globali

### v1.6.5 (2025-01-24)
- ✅ **CAPITALE RESIDUO ATTUALIZZATO**: Cash da vendite al prezzo CORRENTE
- ✅ **Nuovi Campi Track**: `capitalAllocato`, `realizedCash`, `dividends`, `previousNumerator`
- ✅ **Logica Alleggerimento**: Traccia frazione precedente, calcola cash vendita
- ✅ **Formula Cash**: `soldShares × currentPrice` (non prezzo carico)
- ✅ **Residuo Totale**: `realizedCash + (base - invested)`
- ✅ **ROI Portafoglio Corretto**: `(Patrimonio - Allocato) / Allocato`
- ✅ **Patrimonio**: `ValorePosizioni + Cash + Dividendi`
- ✅ **UI Migliorata**: 8 KPI invece di 6
  - Capitale Allocato (arancio)
  - Capitale Investito (giallo)
  - Cash Realizzato (teal)
  - Dividendi (indigo)
- 🎯 **Fix Cruciale**: Alleggerimento 4/4→2/4 ora mostra cash corretto
- 📊 **Esempio**: 10k allocato, vendi metà @ 212 → cash = 5.729€ (non 5.000€)

### v1.6.4 (2025-01-24)
- ✅ **KPI DETTAGLIATI PER TRACCIA**: ROI Posizioni, ROI Portafoglio, % Peso aggiunti
- ✅ **ROI Posizioni Traccia**: `(ValoreCorrente - Investito) / Investito × 100`
- ✅ **ROI Portafoglio Traccia**: `(Patrimonio - CapitaleBase) / CapitaleBase × 100`
- ✅ **% Peso Portafoglio**: `(InvestitoTraccia / CapitaleTotale) × 100`
- ✅ **UI Migliorata**: Box colorati (verde/blu) per ROI, box viola per Peso
- ✅ **Calcolo Sincrono**: `updateCalculations()` aggiornato per KPI per traccia
- ✅ **Layout**: ROI Dual → Grid 3 (Investito/Residuo/Azioni) → Peso
- 📊 **Formule**: Implementate formule v1.6.1 ma A LIVELLO DI SINGOLA TRACCIA
- 🎯 **Obiettivo**: Vedere performance di ogni titolo, non solo dashboard globale

### v1.6.3 (2025-01-24)
- ✅ **IMPOSTAZIONI GLOBALI FUNZIONALI**: Sezione sopra prima traccia DAW
- ✅ **Capitale Totale**: Input capitale portafoglio (divide equamente tra tracce)
- ✅ **Date Globali**: Data Inizio/Fine applicate a tutte le tracce
- ✅ **Pulsante Applica**: Aggiorna tutte le tracce con 1 click
- ✅ **Validazione**: Controlli su capitale > 0, date valide, tracce presenti
- ✅ **Divisione Equa**: `capitalPerTraccia = capitaleTotale / numTracce`
- ✅ **Feedback Dettagliato**: Alert con riepilogo operazione
- ✅ Frazioni (N/4) rimangono invariate
- ❌ **RIMOSSO**: Sezione placeholder v1.6.1 (sostituita con funzionale)

### v1.6.1 (2025-01-24)
- ✅ **DOPPIO ROI**: ROI Posizioni (99%) vs ROI Portafoglio (51%)
- ✅ **KPI UTILI PER GUADAGNARE** (no cazzate accademiche):
  - ROI Posizioni (su capitale investito)
  - ROI Portafoglio (su capitale totale)
  - Max Drawdown (perdita massima %)
  - Capitale a Rischio (% esposta)
  - Top 3 Concentrazione (peso 3 titoli maggiori)
- ✅ **Impostazioni Tracce**: Sezione sempre visibile dopo "Registra Movimenti"
- ✅ Formule semplificate: no Beta, Alpha, Sharpe (roba da wannabe)
- ✅ Focus: Quanto guadagno? Quanto rischio? Dove sono i soldi?

### v1.6.0 (2025-01-24)
- ✅ **KPI DETTAGLIATI PER TITOLO** (14+ metriche)
- ✅ Sezione collapsabile "📊 Mostra KPI" per ogni traccia
- ✅ Indicatore movimento con badge colorato (↗️/↘️/⚪)
- ✅ 4 categorie KPI:
  - CAPITALE (3 KPI): Allocato, Investito, Residuo
  - PERFORMANCE (4 KPI): Valore, Gain/Loss €, Gain/Loss %, ROI
  - PREZZI (4 KPI): PMC, Prezzo Attuale, Variazione €, Variazione %
  - COMPOSIZIONE (4 KPI): Peso Portafoglio, Esposizione, Shares, Rapporto Valore/Investito
- ✅ Calcoli automatici on-demand (click pulsante)
- ✅ Layout responsive 2-4 colonne
- ✅ Colori dinamici verde/rosso per gain/loss

### v1.5.1 (2025-01-24)
- ✅ KPI Performance Globali (GAIN/LOSS € e %)
- ✅ Colori dinamici verde/rosso

### v1.4.2 (2025-01-23)
- ✅ Impostazioni Globali Multi Upload
- ✅ Data Fine default = oggi

### v1.4.1 (2025-01-22)
- ✅ Multi Upload con Drag & Drop
- ✅ Supporto ZIP/TAR.GZ

---

## 📚 RIFERIMENTI

- **Capitale Alloggiato**: Capitale totale disponibile per investimenti (input utente)
- **Capitale Investito**: Parte del capitale effettivamente impiegata in posizioni attive
- **Capitale Residuo**: Liquidità non investita (capitale alloggiato - investito)
- **PMC (Prezzo Medio di Carico)**: Prezzo medio di acquisto delle azioni
- **Valore Corrente**: Valutazione attuale della posizione (shares × prezzo attuale)
- **Gain/Loss (P&L)**: Profitto o perdita sulla posizione (valore corrente - investito)
- **Patrimonio Netto**: Valore totale del portafoglio (posizioni + liquidità)
- **Crescita Patrimonio**: Variazione del patrimonio netto rispetto all'iniziale

---

## 🔐 NOTE IMPORTANTI

1. **Precisione Decimali**: Tutti i calcoli finanziari usano `parseFloat()` con precisione 2 decimali per display
2. **Virgola Italiana**: Parser converte automaticamente `,` → `.` prima dei calcoli
3. **Division by Zero**: Tutti i calcoli percentuali hanno check `if (denominatore > 0)`
4. **Tracce Senza Dati**: Contano per capitale alloggiato MA non per performance
5. **Date Start/End**: `dateStart` = data acquisto (PMC), `dateEnd` = data valutazione (prezzo corrente)

---

## 🎓 GLOSSARIO

- **ROI**: Return on Investment (Ritorno sull'Investimento)
- **P&L**: Profit & Loss (Profitto e Perdita)
- **PMC**: Prezzo Medio di Carico
- **DCA**: Dollar Cost Averaging (Investimento Graduale)
- **DRIP**: Dividend Reinvestment Plan (Reinvestimento Dividendi)
- **CAGR**: Compound Annual Growth Rate (Tasso Crescita Annuo Composto)
- **Drawdown**: Discesa massima dal picco precedente

---

**🔥 Questo algoritmo è il CUORE di Rosicatore. Ogni modifica deve passare da qui.**
