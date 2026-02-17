# 📦 Workflow Aggiornamento CSV - Rosicatore v4.1.1

## 🎯 Procedura Automatica

### Input Richiesti

1. **File Pricing**: `movimenti-batch-12ticker-YYYY-MM-DD.zip`
   - Contiene directory per ticker (PBR/, EQT/, AA/, etc.)
   - Ogni directory ha file multi-parte: `Ticker - Parte 1.csv`, `Ticker - Parte 2.csv`, etc.
   - Formato CSV: `Date,Open,High,Low,Close,Volume`
   - Date in formato italiano: `DD Mese YYYY` (es. "10 Agosto 2000")

2. **File Dividendi**: `dividendi-batch-12ticker-YYYY-MM-DD.zip`
   - Contiene file per ticker: `YYYY-MM-DD - TICKER - NN dividendi.csv`
   - Formato CSV: `Date,Amount`
   - Date in formato italiano: `DD Mese YYYY` (es. "25 Agosto 2025")

### Esecuzione Script

```bash
# 1. Upload dei file ZIP in /home/user/uploaded_files/
# 2. Estrazione automatica (già fatta se upload tramite interfaccia)
# 3. Esecuzione script:

cd /home/user/webapp
node scripts/update_csv_data.cjs
```

### Output Generato

Lo script produce:

1. **Backup dei vecchi CSV**:
   - Directory: `/home/user/webapp/public/static/data/backup/backup_TIMESTAMP/`
   - Contiene tutti i CSV esistenti prima dell'aggiornamento

2. **CSV Pricing Unificati**:
   - Posizione: `/home/user/webapp/public/static/data/`
   - Nome file: `[Ticker Full Name] Stock Price History.csv`
   - Esempio: `Petroleo Brasileiro Petrobras ADR Stock Price History.csv`
   - Formato: `Date,Open,High,Low,Close,Volume`
   - Date ordinate cronologicamente

3. **CSV Dividendi Unificato**:
   - File: `/home/user/webapp/public/static/data/dividendi.csv`
   - Formato: `ticker,currency,date,amount`
   - Colonna `ticker` aggiunta automaticamente
   - Date convertite in formato ISO (YYYY-MM-DD)

### Mapping Ticker → Nome File

| Ticker | Nome File CSV |
|--------|---------------|
| IRD | Opus Genetics Stock Price History.csv |
| EQT | EQT Stock Price History.csv |
| AA | Alcoa Stock Price History.csv |
| GSM | Ferroglobe Stock Price History.csv |
| HL | Hecla Mining Stock Price History.csv |
| URG | Ur Energy Stock Price History.csv |
| MARA | Marathon Digital Stock Price History.csv |
| PMET | PMET Resources Stock Price History.csv |
| VZLA | Vizsla Silver Stock Price History.csv |
| PLL | Elevra Lithium DRC Stock Price History.csv |
| ABRA | AbraSilver Resource Stock Price History.csv |
| PBR | Petroleo Brasileiro Petrobras ADR Stock Price History.csv |

### Validazioni Automatiche

Lo script esegue:

1. ✅ Verifica presenza colonne richieste
2. ✅ Parsing date italiano → ISO
3. ✅ Ordinamento cronologico
4. ✅ Rimozione righe vuote
5. ✅ Merge multi-parte con un solo header
6. ✅ Aggiunta colonna `ticker` ai dividendi
7. ✅ Estrazione ticker dal nome file dividendi

### Log di Esempio

```
ℹ️ 🚀 Starting Rosicatore CSV Update Process
ℹ️ ================================================
🔄 Step 1: Checking input files...
✅ Found pricing ZIP: movimenti-batch-12ticker-1970-2026-02-17.zip
✅ Found dividendi ZIP: dividendi-batch-12ticker-2026-02-17.zip
🔄 Step 2: Creating temporary directories...
🔄 Step 3: Using existing extracted files...
🔄 Step 4: Backing up existing CSV files...
✅ Backed up 15 files to /home/user/webapp/public/static/data/backup/backup_2026-02-17T13-44-26-713Z
🔄 Step 5: Processing pricing files...
🔄 Merging pricing files for PBR...
✅ Merged 4 files into 6416 data rows
✅ Created: Petroleo Brasileiro Petrobras ADR Stock Price History.csv
🔄 Step 6: Processing dividend files...
✅ Processed 232 dividend entries
✅ Created: dividendi.csv
ℹ️ ================================================
✅ ✅ CSV Update Process Completed Successfully!
ℹ️ ================================================
ℹ️ Total CSV files in /public/static/data/: 15
```

### Rebuild e Restart

Dopo l'aggiornamento CSV:

```bash
# Build del sito
cd /home/user/webapp
npm run build

# Riavvio con PM2
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs
```

### Verifica Funzionamento

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Verifica file CSV aggiornati
ls -lh /home/user/webapp/public/static/data/*.csv

# Verifica formato pricing
head -5 /home/user/webapp/public/static/data/"Petroleo Brasileiro Petrobras ADR Stock Price History.csv"

# Verifica formato dividendi
head -10 /home/user/webapp/public/static/data/dividendi.csv
```

## 🔄 Prossimo Aggiornamento (Workflow Semplificato)

Per aggiornare i CSV in futuro:

1. **Fornisci i due ZIP**:
   - `movimenti-batch-12ticker-YYYY-MM-DD.zip`
   - `dividendi-batch-12ticker-YYYY-MM-DD.zip`

2. **Esegui comando automatico**:
   ```bash
   cd /home/user/webapp && node scripts/update_csv_data.cjs && npm run build && pm2 restart rosicatore
   ```

3. **Verifica risultato**: Il sito sarà aggiornato automaticamente con i nuovi dati.

## 📊 Statistiche Ultimo Aggiornamento (17 Feb 2026)

- **Ticker aggiornati**: 9 su 12
- **Righe pricing totali**: ~62,000+
- **Dividendi totali**: 232 entry
- **Periodo coperto**: Agosto 2000 - Febbraio 2026
- **Dimensione CSV totale**: ~3.2 MB

## ⚠️ Note Importanti

1. **Format Date**: Il parser accetta solo formato italiano `DD Mese YYYY` per i nuovi file
2. **Ticker Mancanti**: Se un ticker non ha directory nei ZIP, il file esistente viene mantenuto
3. **Backup Automatico**: Tutti i CSV vecchi sono salvati prima della sostituzione
4. **Validazione Schema**: Lo script verifica colonne richieste prima del merge
5. **Ordinamento**: Tutte le date sono ordinate cronologicamente

## 🎯 Obiettivo Raggiunto

✅ **Workflow completamente automatizzato**: fornisci i ZIP, esegui lo script, il sito è aggiornato.
