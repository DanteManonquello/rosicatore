# 📊 Rosicatore v2.4.0 - Workflow Semplificato

**UPLOAD MULTIPLO CSV + AUTO-DETECT** - Flusso semplice e intuitivo

## 🚀 Versione Attuale: v2.4.0 - WORKFLOW SEMPLIFICATO

### 💥 NOVITÀ v2.4.0 - FINALMENTE SEMPLICE!

**WORKFLOW RIVOLUZIONATO** ✅:

```
1️⃣ CARICA CSV MULTIPLI
   - Upload 5-10 file CSV insieme (HL.csv, EQT.csv, GSM.csv...)
   - Formato: Date,Price

2️⃣ IMPOSTA DATA GLOBALE
   - Una sola data vale per TUTTI i titoli
   - Una sola frazione globale (es: 1/4)

3️⃣ INCOLLA MOVIMENTI (tutti insieme, anche titoli diversi)
   "18/08/2025  NYSE:HL   diminuiamo di 1/4"
   "29 ott 2025 NYSE:EQT  aumentiamo di 1/3"
   "2 dic 2025  NASDAQ:GSM aumentiamo di 1/4"
   → Parser crea automaticamente i titoli!

4️⃣ INCOLLA DIVIDENDI (tutti insieme, anche titoli diversi)
   "29 dicembre 2025  HL   $0.014"
   "15 marzo 2026     EQT  $0.25"
   → Parser associa automaticamente al ticker!

5️⃣ CALCOLA PERFORMANCE
   → Dashboard mostra KPI per tutti i titoli!
```

---

## ✅ **COSA È CAMBIATO**

### **RIMOSSO (era confuso):**
- ❌ Form "Crea Posizione" singola
- ❌ Select dropdown "Applica a posizione"
- ❌ Workflow complicato (crea → applica → calcola)

### **AGGIUNTO (semplice):**
- ✅ **Upload multiplo CSV** (trascina & drop o seleziona multiple files)
- ✅ **Data globale** (un solo campo per tutti i titoli)
- ✅ **Frazione globale** (valida per tutti)
- ✅ **Auto-detect ticker** (dai movimenti/dividendi stessi)
- ✅ **Sezione "Titoli Rilevati"** (mostra automaticamente i titoli creati)

---

## 🎯 **WORKFLOW PASSO-PASSO**

### **STEP 1: Carica CSV Prezzi**
```
Trascina i file CSV oppure click per selezionare:
- HL.csv
- EQT.csv
- GSM.csv

Formato richiesto:
Date,Price
2025-01-01,10.50
2025-01-02,10.75
```

### **STEP 2a: Imposta Impostazioni Globali**
```
Data Ingresso Globale: 2025-01-15 (vale per TUTTI)
Frazione Globale: 1/4 (vale per TUTTI)
```

### **STEP 2b: Incolla TUTTI i Movimenti (anche titoli misti)**
```
18/08/2025 h15.39   Hecla Mining    NYSE:HL     US4227041062    diminuiamo di 1/4
29 ottobre 2025     EQT-Corporation NYSE:EQT    US26884L1098    aumentiamo di 1/3
2 dicembre 2025     Ferroglobe PLC  NASDAQ:GSM  GB00BYW6GV68    aumentiamo di 1/4

Click "Analizza Movimenti" → Parser crea automaticamente HL, EQT, GSM!
```

### **STEP 2c: Incolla TUTTI i Dividendi (anche titoli misti)**
```
Data di Pagamento    Importo per Azione (USD)
29 dicembre 2025 HL  $0.014
26 giugno 2025 HL    $0.014
15 marzo 2026 EQT    $0.25

Click "Analizza Dividendi" → Parser associa automaticamente ai ticker!
```

### **STEP 3: Calcola Performance**
```
Click "Calcola Performance Completa"
→ Dashboard mostra KPI per HL, EQT, GSM contemporaneamente!
```

---

## 📊 **KPI DISPONIBILI (16+ Metrics)**

- ✅ ROI Totale %
- ✅ Capitale Attuale $
- ✅ Gain/Loss Totale $
- ✅ ROI Simple, Weighted, Annualized, Total
- ✅ Sharpe Ratio, Sortino Ratio
- ✅ Max Drawdown %, Volatility %
- ✅ Totale Transazioni, Acquisti, Vendite, Dividendi

---

## 🎨 **UI PRESERVATA**

**Sistema Timeline Tracker v1.7.0** intatto:
- Upload CSV multi-traccia originale
- Visualizzazione grafici Chart.js
- Tutte le funzionalità esistenti

**Performance Calculator** (sezione espandibile):
- Click bottone per mostrare/nascondere
- Non interferisce con tracker

---

## 📋 **FORMATO SUPPORTATO**

### **CSV Prezzi:**
```csv
Date,Price
2025-01-01,10.50
2025-01-02,10.75
2025-01-03,10.80
```

### **Movimenti:**
```
18/08/2025 h15.39        Hecla Mining        NYSE:HL        US4227041062        diminuiamo di 1/4
29 ottobre 2025 h14.40   EQT-Corporation     NYSE:EQT       US26884L1098        aumentiamo di 1/4
```
**Parser riconosce automaticamente:** Ticker (HL), Tipo (BUY/SELL), Data, Frazione

### **Dividendi:**
```
29 dicembre 2025  HL   $0.014
26/06/2025        EQT  0.25
2025-12-29 GSM | 0.014 USD
```
**Parser riconosce automaticamente:** Ticker (HL), Data, Importo

---

## 🔧 **Tech Stack**

- **Frontend**: HTML5 + TailwindCSS + Chart.js
- **Engine**: Position class (v2.0.0) con PMC dinamico
- **Parser**: Auto-detect intelligente ticker/date/importi
- **Backend**: Hono (Cloudflare Workers)
- **Runtime**: Cloudflare Pages

---

## 🚀 **Deploy**

- **GitHub**: https://github.com/DanteManonquello/rosicatore
- **Production**: https://rosicatore.pages.dev

---

## 💡 **FILOSOFIA DESIGN**

**v2.3.0** (complicato): "Crea posizione → Seleziona posizione → Applica movimenti"
**v2.4.0** (semplice): "Carica CSV → Incolla tutto → Il parser fa il resto!"

**Principio chiave**: L'utente incolla dati grezzi, il sistema capisce automaticamente cosa fare.

---

**🎯 WORKFLOW SEMPLIFICATO - FINALMENTE INTUITIVO!**
