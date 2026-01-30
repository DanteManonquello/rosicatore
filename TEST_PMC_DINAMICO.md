# 🧪 TEST PMC DINAMICO v1.7.0

## 📋 SCENARIO TEST: Apple (AAPL)

### Dati Input
- **Capitale Allocato**: 10.000€
- **Prezzo Iniziale**: 185€/az
- **Data Inizio**: 01/01/2024

### Movimenti da Testare

#### 1️⃣ FASE 1: Acquisto Iniziale (01/01/2024)
```
Frazione: 4/4
Prezzo: 185€/az
```

**Risultato Atteso**:
- ✅ Transazione: BUY 54,05 shares @ 185€ = 10.000€
- ✅ PMC: 185€/az
- ✅ Total Shares: 54,05
- ✅ Cash Residuo: 0€

#### 2️⃣ FASE 2: Alleggerimento (30/06/2024)
```
Frazione: 4/4 → 2/4
Prezzo: 212€/az
```

**Risultato Atteso**:
- ✅ Transazione: SELL 27,025 shares @ 212€ = 5.729,30€
- ✅ PMC: 185€/az (unchanged)
- ✅ Total Shares: 27,025
- ✅ Cash Residuo: 5.729,30€
- ✅ Valore Posizione: 5.729,30€ (27,025 × 212)
- ✅ Patrimonio: 11.458,60€

#### 3️⃣ FASE 3: Appesantimento (30/09/2024)
```
Frazione: 2/4 → 3/4
Prezzo: 225€/az
```

**Risultato Atteso**:
- ✅ Transazione: BUY 11,11 shares @ 225€ = 2.500€
- ✅ PMC: 196,68€/az (ricalcolato!)
  - Formula: (27,025 × 185 + 11,11 × 225) / 38,135
  - Calcolo: 7.500 / 38,135 = 196,68€
- ✅ Total Shares: 38,135
- ✅ Cash Residuo: 3.229,30€ (5.729,30 - 2.500)
- ✅ Valore Posizione: 8.580,37€ (38,135 × 225)
- ✅ Patrimonio: 11.809,67€

#### 4️⃣ FASE 4: Valutazione Finale (31/12/2024)
```
Frazione: 3/4 (unchanged)
Prezzo: 240€/az
```

**Risultato Atteso**:
- ✅ Nessuna transazione
- ✅ PMC: 196,68€/az (unchanged)
- ✅ Total Shares: 38,135
- ✅ Cash Residuo: 3.229,30€
- ✅ Valore Posizione: 9.152,40€ (38,135 × 240)
- ✅ Patrimonio: 12.381,70€
- ✅ Gain/Loss: +2.381,70€
- ✅ ROI Posizioni: +22,03%
- ✅ ROI Portafoglio: +23,82%

---

## 🔍 VERIFICA UI

### KPI da Controllare

#### PMC Card
```
PMC (Prezzo Medio Carico)  🔄 DINAMICO
196,68€/az
(inizio: 185€)
```

#### Storico Transazioni
```
Data        Tipo         Shares    Prezzo    Totale
──────────  ──────────  ────────  ────────  ─────────
01/01/2024  📈 ACQUISTO   54,05     185€     10.000€
30/06/2024  📉 VENDITA    27,03     212€      5.729€
30/09/2024  📈 ACQUISTO   11,11     225€      2.500€
```

#### Console Browser
```javascript
[INIT] First transaction: 54.05 shares @ 185$ | Invested: 10000.00€
[ALLEGGERIMENTO] 4/4 → 2/4 | Vendita: 27.03 shares @ 212$ | Cash: +5729.30€
[BUY] 11.11 shares @ 225$ | PMC: 196.68$ | Total: 38.14 shares
```

---

## ✅ CHECKLIST TEST

- [ ] Carica CSV AAPL
- [ ] Imposta Capitale: 10.000€
- [ ] Imposta Data Inizio: 01/01/2024
- [ ] Imposta Frazione: 4/4
- [ ] Verifica PMC iniziale = 185€
- [ ] Verifica shares = 54,05
- [ ] Cambia Data Fine: 30/06/2024
- [ ] Cambia Frazione: 2/4
- [ ] Verifica PMC = 185€ (unchanged)
- [ ] Verifica Cash = 5.729,30€
- [ ] Verifica shares = 27,025
- [ ] Cambia Data Fine: 30/09/2024
- [ ] Cambia Frazione: 3/4
- [ ] Verifica PMC = 196,68€ (CAMBIATO!)
- [ ] Verifica Cash = 3.229,30€
- [ ] Verifica shares = 38,135
- [ ] Apri KPI → Verifica badge "DINAMICO"
- [ ] Verifica Storico Transazioni (3 righe)
- [ ] Console → Verifica logs transazioni

---

## 🎯 OBIETTIVO TEST

Verificare che il **PMC si aggiorni correttamente** dopo appesantimento e che le **shares riflettano le transazioni reali**.

**PASS CRITERIA**: PMC deve essere 196,68€/az dopo il terzo movimento (non 185€).
