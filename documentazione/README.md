# 📚 DOCUMENTAZIONE ROSICATORE

Questa cartella contiene tutta la documentazione del progetto Rosicatore v3.18.0.

## 📂 STRUTTURA

```
documentazione/
├── README.md                           (questo file)
├── ANALISI_COERENZA_RESOCONTI.md      (analisi completa coerenza)
├── resoconti/                          (resoconti PDF originali)
│   ├── 10 febbraio 2025.pdf
│   ├── 3 aprile 2025.pdf
│   ├── 11 luglio 2025.pdf             (⚠️ DA IGNORARE)
│   ├── 29 ottobre 2025.pdf
│   └── README.md
└── movimenti_originali/                (screenshot movimenti)
    └── README.md
```

## 🎯 SCOPO

Questa documentazione serve per:
1. ✅ Verificare la coerenza tra resoconti e movimenti CSV
2. ✅ Conservare tutti i documenti originali forniti dall'utente
3. ✅ Permettere il ripristino del progetto in nuove chat
4. ✅ Fornire una timeline completa dei movimenti 2025

## 📋 DOCUMENTI PRINCIPALI

### 1. ANALISI_COERENZA_RESOCONTI.md
Contiene:
- Timeline completa 01/01/2025 → 31/12/2025
- Confronto dettagliato tra resoconti e movimenti CSV
- Verifica impatto dividendi sulle esposizioni
- Test consigliati per validazione

**Risultato:** 3 resoconti su 4 sono coerenti al 100% ✅

### 2. resoconti/
Cartella con i 4 PDF originali dei resoconti:
- ✅ 10/02/2025 - COERENTE
- ✅ 03/04/2025 - COERENTE
- ❌ 11/07/2025 - IGNORARE (movimenti mancanti)
- ✅ 29/10/2025 - COERENTE

### 3. movimenti_originali/
Cartella per conservare tutti gli screenshot dei movimenti originali forniti dall'utente.

## 🚀 COME USARE QUESTA DOCUMENTAZIONE

### Per Nuove Chat:
1. Leggi `ANALISI_COERENZA_RESOCONTI.md` per capire lo stato attuale
2. Controlla i PDF in `resoconti/` per i valori di riferimento
3. Usa `movimenti_originali/` per verificare i movimenti originali

### Per Validazione:
1. Esegui i test consigliati in `ANALISI_COERENZA_RESOCONTI.md`
2. Confronta i risultati con i resoconti PDF
3. Ignora il resoconto 11/07/2025

### Per Debugging:
1. Controlla la timeline in `ANALISI_COERENZA_RESOCONTI.md`
2. Verifica i movimenti in `/public/static/data/movimenti.csv`
3. Confronta con i valori attesi nei resoconti

## ⚠️ NOTE IMPORTANTI

1. **Resoconto 11/07/2025:** IGNORARE - contiene movimenti non registrati nel CSV
2. **EQT 29/10:** Prezzo mancante nel CSV (range parte da 15/12/2025)
3. **Dividendi:** NON modificano le esposizioni (solo cash)
4. **Campo primo_ingresso:** Solo GSM ha `true` perché è l'unico entrato dopo 01/01/2025

## 📊 RESOCONTI VALIDI

| Data | Stato | Coerenza | Titoli Verificati |
|------|-------|----------|-------------------|
| 10/02/2025 | ✅ | 100% | GSM, MARA, VZLA |
| 03/04/2025 | ✅ | 100% | AA, GSM, MARA, VZLA |
| 11/07/2025 | ❌ | - | IGNORARE |
| 29/10/2025 | ✅ | 100% | EQT, HL, AA, GSM, MARA, VZLA |

## 🎯 CONCLUSIONE

**3 resoconti su 4 sono coerenti al 100% con i movimenti CSV!**

Il resoconto dell'11 luglio 2025 contiene movimenti che non sono stati registrati nel CSV `movimenti.csv`, quindi va ignorato per la validazione.

I dividendi NON creano ambiguità nelle esposizioni perché modificano solo il cash residuo, non i quarti.

---

**Versione:** 04 Febbraio 2026  
**Progetto:** Rosicatore v3.18.0  
**Autore:** Team Rosicatore
