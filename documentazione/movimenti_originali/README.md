# MOVIMENTI ORIGINALI - DOCUMENTAZIONE

Questa cartella contiene tutti gli screenshot e i documenti originali dei movimenti forniti dall'utente.

## 📂 CONTENUTO

I movimenti vengono registrati nel file `/public/static/data/movimenti.csv` e devono rispettare questo formato:

```csv
data,ora,ticker,azione,frazione_numeratore,frazione_denominatore,prezzo_usd,note,primo_ingresso,esposizione_finale,uscita_totale
```

## 📋 MOVIMENTI REGISTRATI (2025)

### GENNAIO 2025
1. **13/01/2025 15:37** - MARA BUY 1/4 @ $16.88
   - Nota: "entriamo in Marathon Digital - esposizione ammonta a 1.5/4"
   - Esposizione finale: 0.375 (1.5/4)

### FEBBRAIO 2025
2. **10/02/2025 15:43** - GSM BUY 1/4 @ $4.17 ⭐ PRIMO INGRESSO
   - Nota: "entriamo in Ferroglobe PLC con una prima posizione parziale"
   - Esposizione finale: 0.25 (1/4)

3. **25/02/2025 16:38** - VZLA BUY 1/4 @ $1.92
   - Nota: "entriamo in Vizsla Silver - esposizione ammonta a 3/4"
   - Esposizione finale: 0.75 (3/4)

4. **25/02/2025 16:39** - GSM BUY 1/4 @ $3.54
   - Nota: "incrementiamo di 1/4 in Ferroglobe - esposizione ammonta a 2/4"
   - Esposizione finale: 0.50 (2/4)

### APRILE 2025
5. **03/04/2025 15:35** - AA BUY 1/4 @ $28.75
   - Nota: "incrementiamo di 1/4 in Alcoa - esposizione ammonta a 3/4"
   - Esposizione finale: 0.75 (3/4)

6. **03/04/2025 15:36** - MARA BUY 1.5/4 @ $11.44
   - Nota: "incrementiamo di 1.5/4 in Marathon Digital - esposizione ammonta a 3/4"
   - Esposizione finale: 0.75 (3/4)

### GIUGNO 2025
7. **23/06/2025 15:38** - VZLA BUY 1/4 @ $3.011
   - Nota: "incrementiamo di 1/4 in Vizsla Silver - esposizione ammonta a 4/4"
   - Esposizione finale: 1.00 (4/4)

### AGOSTO 2025
8. **18/08/2025** - HL SELL 1/4 @ $7.75
   - Nota: "alleggerimento posizione - da 4/4 a 3/4"
   - Esposizione finale: 0.75 (3/4)

### OTTOBRE 2025
9. **29/10/2025 14:40** - EQT BUY 1/4
   - Nota: "incrementiamo di 1/4 in EQT - esposizione ammonta a 4/4"
   - Esposizione finale: 1.00 (4/4)
   - ⚠️ Prezzo mancante nel CSV (range CSV prezzi parte da 15/12/2025)

### DICEMBRE 2025
10. **02/12/2025 16:09** - GSM BUY 1/4 @ $4.63
    - Nota: "incrementiamo di 1/4 in Ferroglobe - esposizione ammonta a 3/4"
    - Esposizione finale: 0.75 (3/4)

11. **22/12/2025 15:33** - VZLA SELL 1/4 @ $5.48
    - Nota: "alleggerisce di 1/4 la posizione - portandola a 3/4 - profitto +197%"
    - Esposizione finale: 0.75 (3/4)

## 📊 STATISTICHE MOVIMENTI

- **Totale movimenti:** 11
- **Buy:** 9
- **Sell:** 2
- **Primi ingressi:** 1 (GSM)
- **Titoli movimentati:** 5 (MARA, GSM, VZLA, AA, HL, EQT)

## ⚠️ NOTE IMPORTANTI

1. **Movimento 29/10 EQT:** Prezzo non disponibile nel CSV prezzi (parte da 15/12/2025)
2. **Campo primo_ingresso:** Solo GSM ha `primo_ingresso=true` perché è l'unico entrato dopo il 01/01/2025
3. **Esposizione finale:** Campo calcolato che riflette i quarti totali DOPO il movimento

## 🎯 MAPPATURA ESPOSIZIONI

| Ticker | Base 01/01 | Finale 31/12 | Delta | Movimenti |
|--------|------------|--------------|-------|-----------|
| PBR    | 3/4        | 3/4          | 0     | 0         |
| EQT    | 3/4        | 4/4          | +1/4  | 1 (BUY)   |
| AA     | 2/4        | 3/4          | +1/4  | 1 (BUY)   |
| HL     | 4/4        | 3/4          | -1/4  | 1 (SELL)  |
| URG    | 4/4        | 4/4          | 0     | 0         |
| MARA   | 0.5/4      | 3/4          | +2.5/4| 2 (BUY)   |
| PMET   | 1/4        | 1/4          | 0     | 0         |
| VZLA   | 2/4        | 3/4          | +1/4  | 3 (2 BUY, 1 SELL) |
| PLL    | 1/4        | 1/4          | 0     | 0         |
| ABRA   | 0.5/4      | 0.5/4        | 0     | 0         |
| IRD    | 0.5/4      | 0.5/4        | 0     | 0         |
| GSM    | 0/4        | 3/4          | +3/4  | 3 (BUY)   |

## 📁 FILES ORIGINALI

Tutti gli screenshot e i documenti PDF originali inviati dall'utente sono archiviati in questa cartella per riferimento futuro.

---

**Mantenere questa documentazione aggiornata con ogni nuovo movimento registrato!**
