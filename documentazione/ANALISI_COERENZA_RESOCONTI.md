# ANALISI COERENZA RESOCONTI vs MOVIMENTI

## 📋 RESOCONTI DISPONIBILI

1. **10 FEBBRAIO 2025** ✅
2. **3 APRILE 2025** ✅
3. **11 LUGLIO 2025** ⚠️ (MOVIMENTI MANCANTI - IGNORARE)
4. **29 OTTOBRE 2025** ✅

---

## 🔍 TIMELINE COMPLETA: 01/01/2025 → 31/12/2025

### BASE: 01/01/2025 (da info_titoli.csv)
```
PBR:  3/4 (0.75)
EQT:  3/4 (0.75)
AA:   2/4 (0.50)
HL:   4/4 (1.00)
URG:  4/4 (1.00)
MARA: 0.5/4 (0.125)
PMET: 1/4 (0.25)
VZLA: 2/4 (0.50)
PLL:  1/4 (0.25)
ABRA: 0.5/4 (0.125)
IRD:  0.5/4 (0.125)
GSM:  0/4 (0.00)
```

---

## 📈 MOVIMENTI REGISTRATI NEL CSV

### 1️⃣ 13/01/2025 - MARA BUY 1/4 @ $16.88
```
Prima:  0.5/4 (0.125)
Dopo:   1.5/4 (0.375)
```

### 2️⃣ 10/02/2025 - GSM BUY 1/4 @ $4.17 (PRIMO INGRESSO)
```
Prima:  0/4 (0.00)
Dopo:   1/4 (0.25)
```

**✅ RESOCONTO 10/02/2025:**
```
GSM:  1/4   ✅ MATCH
MARA: 1.5/4 ✅ MATCH
VZLA: 2/4   ✅ MATCH (nessun movimento)
AA:   2/4   ✅ MATCH (nessun movimento)
HL:   4/4   ✅ MATCH (nessun movimento)
```
**COERENZA: 100% ✅**

---

### 3️⃣ 25/02/2025 - VZLA BUY 1/4 @ $1.92
```
Prima:  2/4 (0.50)
Dopo:   3/4 (0.75)
```

### 4️⃣ 25/02/2025 - GSM BUY 1/4 @ $3.54
```
Prima:  1/4 (0.25)
Dopo:   2/4 (0.50)
```

### 5️⃣ 03/04/2025 - AA BUY 1/4 @ $28.75
```
Prima:  2/4 (0.50)
Dopo:   3/4 (0.75)
```

### 6️⃣ 03/04/2025 - MARA BUY 1.5/4 @ $11.44
```
Prima:  1.5/4 (0.375)
Dopo:   3/4 (0.75)
```

**✅ RESOCONTO 03/04/2025:**
```
AA:   3/4   ✅ MATCH
GSM:  2/4   ✅ MATCH
MARA: 3/4   ✅ MATCH
VZLA: 3/4   ✅ MATCH
HL:   4/4   ✅ MATCH (nessun movimento)
```
**COERENZA: 100% ✅**

---

### 7️⃣ 23/06/2025 - VZLA BUY 1/4 @ $3.011
```
Prima:  3/4 (0.75)
Dopo:   4/4 (1.00)
```

---

### ⚠️ RESOCONTO 11/07/2025 - INCOERENZA RILEVATA

**FOGLIO 11/07:**
```
AA:   2/4   ⚠️ dovrebbe essere 3/4
GSM:  3/4   ⚠️ dovrebbe essere 2/4
HL:   3/4   ⚠️ dovrebbe essere 4/4
MARA: 2/4   ⚠️ dovrebbe essere 3/4
VZLA: 3/4   ⚠️ dovrebbe essere 4/4
```

**MOVIMENTI MANCANTI dedotti (NON NEL CSV):**
```
AA:   SELL 1/4 (3/4 → 2/4)
GSM:  BUY 1/4  (2/4 → 3/4)
HL:   SELL 1/4 (4/4 → 3/4)
MARA: SELL 1/4 (3/4 → 2/4)
VZLA: SELL 1/4 (4/4 → 3/4)
```

**❌ DECISIONE: IGNORARE RESOCONTO 11/07/2025**
Il CSV movimenti.csv NON contiene questi movimenti, quindi questo resoconto non può essere validato.

---

### 8️⃣ 18/08/2025 - HL SELL 1/4 @ $7.75
```
Prima:  4/4 (1.00)
Dopo:   3/4 (0.75)
```

### 9️⃣ 29/10/2025 - EQT BUY 1/4 (prezzo CSV mancante, stimato da CSV prezzi)
```
Prima:  3/4 (0.75)
Dopo:   4/4 (1.00)
```

**✅ RESOCONTO 29/10/2025:**
```
EQT:  4/4   ✅ MATCH
HL:   3/4   ✅ MATCH (dopo SELL 18/08)
AA:   3/4   ✅ MATCH
GSM:  2/4   ✅ MATCH
MARA: 3/4   ✅ MATCH
VZLA: 4/4   ✅ MATCH
PMET: 1/4   ✅ MATCH (nessun movimento)
ABRA: 0.5/4 ✅ MATCH (nessun movimento)
IRD:  0.5/4 ✅ MATCH (nessun movimento)
```
**COERENZA: 100% ✅**

---

### 🔟 02/12/2025 - GSM BUY 1/4 @ $4.63
```
Prima:  2/4 (0.50)
Dopo:   3/4 (0.75)
```

### 1️⃣1️⃣ 22/12/2025 - VZLA SELL 1/4 @ $5.48 (profit +197%)
```
Prima:  4/4 (1.00)
Dopo:   3/4 (0.75)
```

---

## 🎯 ESPOSIZIONI FINALI AL 31/12/2025

```
PBR:  3/4  (0.75)
EQT:  4/4  (1.00) ← BUY 29/10
AA:   3/4  (0.75) ← BUY 03/04
HL:   3/4  (0.75) ← SELL 18/08
URG:  4/4  (1.00)
MARA: 3/4  (0.75) ← BUY 13/01 + BUY 03/04
PMET: 1/4  (0.25)
VZLA: 3/4  (0.75) ← BUY 25/02 + BUY 23/06 - SELL 22/12
PLL:  1/4  (0.25)
ABRA: 0.5/4 (0.125)
IRD:  0.5/4 (0.125)
GSM:  3/4  (0.75) ← BUY 10/02 + BUY 25/02 + BUY 02/12
```

---

## 🧮 IMPATTO DIVIDENDI SULLE ESPOSIZIONI

### DIVIDENDI REGISTRATI (dividendi.csv):
```
GSM: 2025-03-26 → $0.014 USD
GSM: 2025-06-26 → $0.014 USD
GSM: 2025-12-29 → $0.014 USD
```

### ✅ CONCLUSIONE: I DIVIDENDI NON MODIFICANO LE ESPOSIZIONI

I dividendi **aumentano solo il CASH RESIDUO**, non modificano i quarti!

**Esempio GSM:**
- Esposizione: 3/4 (non cambia con i dividendi)
- Cash: aumenta di $0.014 × numero_azioni × 3 pagamenti
- Azioni: **rimangono invariate**

**❌ I DIVIDENDI NON CREANO AMBIGUITÀ NELLE ESPOSIZIONI**

---

## ✅ VERIFICA COERENZA: RIEPILOGO FINALE

| Data Resoconto | Stato Coerenza | Note |
|----------------|----------------|------|
| **10/02/2025** | ✅ 100% | Tutte le esposizioni match con i movimenti |
| **03/04/2025** | ✅ 100% | Tutte le esposizioni match con i movimenti |
| **11/07/2025** | ❌ IGNORARE | Movimenti mancanti nel CSV (5 titoli incoerenti) |
| **29/10/2025** | ✅ 100% | Tutte le esposizioni match con i movimenti |

---

## 🎯 RACCOMANDAZIONI

1. ✅ **Usare resoconti:** 10/02, 03/04, 29/10 per validazione
2. ❌ **Ignorare resoconto:** 11/07 (movimenti non registrati)
3. ✅ **Dividendi:** NON modificano esposizioni (solo cash)
4. ✅ **CSV movimenti.csv:** AFFIDABILE per 3 resoconti su 4
5. ⚠️ **Nota EQT:** CSV prezzi parte da 15/12/2025 (movimento 29/10 fuori range)

---

## 🚀 TEST CONSIGLIATI

### Test 1: Periodo Completo
```
Data Inizio: 01/01/2025
Data Fine:   31/12/2025
Risultato atteso: 12 titoli calcolati
```

### Test 2: Verifica 10/02/2025
```
Data Inizio: 01/01/2025
Data Fine:   10/02/2025
Verifica: GSM = 1/4, MARA = 1.5/4
```

### Test 3: Verifica 03/04/2025
```
Data Inizio: 01/01/2025
Data Fine:   03/04/2025
Verifica: AA = 3/4, MARA = 3/4, GSM = 2/4, VZLA = 3/4
```

### Test 4: Verifica 29/10/2025
```
Data Inizio: 01/01/2025
Data Fine:   29/10/2025
Verifica: EQT = 4/4, HL = 3/4
```

### Test 5: Periodo Parziale (31/08 → 31/12)
```
Data Inizio: 31/08/2025
Data Fine:   31/12/2025
Risultato: Deve applicare simulazione storica dal 01/01 al 31/08
```

---

**Ultima Revisione:** 04 Febbraio 2026  
**Versione Rosicatore:** v3.18.0
