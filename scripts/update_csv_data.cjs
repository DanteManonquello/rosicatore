#!/usr/bin/env node

/**
 * ROSICATORE CSV UPDATE SCRIPT v4.1.3
 * 
 * Aggiorna automaticamente i CSV del sito con nuovi dati da ZIP
 * 
 * Input:
 *   - movimenti-batch-12ticker-YYYY-MM-DD.zip (pricing history)
 *   - dividendi-batch-12ticker-YYYY-MM-DD.zip (dividendi)
 * 
 * Output:
 *   - CSV unificati in /public/static/data/
 *   - Backup dei vecchi CSV in /public/static/data/backup/
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

const TICKER_CSV_MAP = {
    'IRD': 'Opus Genetics Stock Price History.csv',
    'EQT': 'EQT Stock Price History.csv',
    'AA': 'Alcoa Stock Price History.csv',
    'GSM': 'Ferroglobe Stock Price History.csv',
    'HL': 'Hecla Mining Stock Price History.csv',
    'URG': 'Ur Energy Stock Price History.csv',
    'MARA': 'Marathon Digital Stock Price History.csv',
    'PMET': 'PMET Resources Stock Price History.csv',
    'VZLA': 'Vizsla Silver Stock Price History.csv',
    'PLL': 'Elevra Lithium DRC Stock Price History.csv',
    'ABRA': 'AbraSilver Resource Stock Price History.csv',
    'PBR': 'Petroleo Brasileiro Petrobras ADR Stock Price History.csv'
};

const PATHS = {
    uploads: '/home/user/uploaded_files',
    data: '/home/user/webapp/public/static/data',
    backup: '/home/user/webapp/public/static/data/backup',
    temp: '/tmp/rosicatore_update'
};

// Mesi italiani per parsing date
const MESI_ITALIANI = {
    'gennaio': 1, 'febbraio': 2, 'marzo': 3, 'aprile': 4, 
    'maggio': 5, 'giugno': 6, 'luglio': 7, 'agosto': 8,
    'settembre': 9, 'ottobre': 10, 'novembre': 11, 'dicembre': 12
};

// ============================================================================
// UTILITIES
// ============================================================================

function log(message, level = 'info') {
    const emoji = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        progress: '🔄'
    };
    console.log(`${emoji[level] || 'ℹ️'} ${message}`);
}

function parseItalianDate(dateString) {
    // Supporta formati: "25 Agosto 2025", "25 agosto 2025"
    const match = dateString.match(/^(\d{1,2})\s+([a-zàèéìòù]+)\s+(\d{4})$/i);
    if (!match) return null;
    
    const [, day, month, year] = match;
    const monthNum = MESI_ITALIANI[month.toLowerCase()];
    
    if (!monthNum) return null;
    
    const paddedMonth = String(monthNum).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    
    return `${year}-${paddedMonth}-${paddedDay}`;
}

async function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`, 'success');
    }
}

// ============================================================================
// MERGE PRICING FILES WITH EXISTING DATA
// ============================================================================

async function mergePricingFiles(tickerDir, ticker, existingCSVPath) {
    log(`Merging pricing files for ${ticker}...`, 'progress');
    
    // Trova tutti i file CSV nella directory del ticker
    const files = fs.readdirSync(tickerDir)
        .filter(f => f.endsWith('.csv'))
        .sort(); // Ordina per nome (Parte 1, Parte 2, etc.)
    
    if (files.length === 0) {
        log(`No CSV files found for ${ticker}`, 'warning');
        return null;
    }
    
    // Mappa per tenere traccia delle righe per data (evita duplicati)
    const rowsByDate = new Map();
    let header = 'Date,Open,High,Low,Close,Volume'; // Header standard
    
    // 1. Carica CSV esistente (se esiste)
    if (fs.existsSync(existingCSVPath)) {
        log(`Loading existing CSV for ${ticker}...`, 'info');
        const existingContent = fs.readFileSync(existingCSVPath, 'utf-8');
        const existingLines = existingContent.replace(/\r\n/g, '\n').trim().split('\n');
        
        if (existingLines.length > 1) {
            const existingHeader = existingLines[0].replace(/"/g, ''); // Rimuovi virgolette
            
            // Check se CSV esistente ha formato standard (Date,Open,High,Low,Close,Volume)
            const hasStandardFormat = existingHeader.includes('Close') && existingHeader.includes('Volume');
            
            if (hasStandardFormat) {
                // Usa header esistente se standard
                header = existingHeader;
                
                // Carica righe esistenti
                for (let i = 1; i < existingLines.length; i++) {
                    const line = existingLines[i].trim();
                    if (!line) continue;
                    
                    const cleanLine = line.replace(/"/g, ''); // Rimuovi virgolette
                    const dateStr = cleanLine.split(',')[0];
                    
                    // Normalizza data in ISO
                    const isoDate = parseItalianDate(dateStr) || dateStr;
                    const normalizedDate = new Date(isoDate);
                    
                    if (!isNaN(normalizedDate.getTime())) {
                        const isoKey = normalizedDate.toISOString().split('T')[0];
                        
                        // Normalizza riga: sostituisci data con ISO
                        const parts = cleanLine.split(',');
                        parts[0] = isoKey;
                        const normalizedLine = parts.join(',');
                        
                        rowsByDate.set(isoKey, normalizedLine);
                    }
                }
                
                log(`Loaded ${rowsByDate.size} existing rows for ${ticker}`, 'success');
            } else {
                // CSV esistente ha formato non standard - ignora e usa solo nuovi dati
                log(`Existing CSV for ${ticker} has non-standard format - using new data only`, 'warning');
            }
        }
    }
    
    // 2. Aggiungi nuove righe dai file multi-parte
    let newRowsCount = 0;
    for (const file of files) {
        const filePath = path.join(tickerDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.replace(/\r\n/g, '\n').trim().split('\n');
        
        // Salta header
        const dataRows = lines.slice(1).filter(line => line.trim() !== '');
        
        for (const row of dataRows) {
            const dateStr = row.split(',')[0];
            
            // Normalizza data in ISO
            const isoDate = parseItalianDate(dateStr) || dateStr;
            const normalizedDate = new Date(isoDate);
            
            if (!isNaN(normalizedDate.getTime())) {
                const isoKey = normalizedDate.toISOString().split('T')[0];
                
                // Normalizza riga: sostituisci data con ISO
                const parts = row.split(',');
                parts[0] = isoKey;
                const normalizedLine = parts.join(',');
                
                // Sovrascrivi se esiste già (nuovi dati hanno priorità)
                if (!rowsByDate.has(isoKey)) {
                    newRowsCount++;
                }
                rowsByDate.set(isoKey, normalizedLine);
            }
        }
    }
    
    log(`Merged ${files.length} files: ${newRowsCount} new rows, ${rowsByDate.size} total rows`, 'success');
    
    // 3. Ordina per data crescente
    const sortedDates = Array.from(rowsByDate.keys()).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    const sortedRows = sortedDates.map(date => rowsByDate.get(date));
    
    // 4. Ricostruisci CSV
    const finalCSV = [header, ...sortedRows].join('\n');
    
    log(`Final CSV for ${ticker}: ${sortedRows.length} rows, range ${sortedDates[0]} → ${sortedDates[sortedDates.length - 1]}`, 'info');
    
    return finalCSV;
}

// ============================================================================
// PROCESS DIVIDENDS
// ============================================================================

async function processDividends(dividendiDir) {
    log('Processing dividend files...', 'progress');
    
    const files = fs.readdirSync(dividendiDir)
        .filter(f => f.endsWith('.csv') && f.includes('dividendi'));
    
    let allDividends = [];
    
    for (const file of files) {
        // Estrai ticker dal nome file: "2026-02-17 - PBR - 42 dividendi.csv" → "PBR"
        const tickerMatch = file.match(/- ([A-Z.]+) -/);
        if (!tickerMatch) {
            log(`Cannot extract ticker from ${file}`, 'warning');
            continue;
        }
        
        const ticker = tickerMatch[1];
        
        // Normalizza ticker: rimuovi suffissi .TO, .TSX, .TSXV
        let normalizedTicker = ticker.replace(/\.(TO|TSX|TSXV)$/, '');
        
        // Fix PLLL → PLL (errore nel nome file dividendi)
        if (normalizedTicker === 'PLLL') {
            normalizedTicker = 'PLL';
        }
        
        const filePath = path.join(dividendiDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.trim().split('\n');
        
        // Salta header e righe vuote
        const dataRows = lines.slice(1).filter(line => line.trim() !== '');
        
        for (const row of dataRows) {
            const [date, amount] = row.split(',');
            
            // Converti data italiana in ISO
            const isoDate = parseItalianDate(date);
            if (!isoDate) {
                log(`Invalid date in ${file}: ${date}`, 'warning');
                continue;
            }
            
            allDividends.push({
                ticker: normalizedTicker,
                currency: 'USD', // Assumo USD come default
                date: isoDate,
                amount: amount.trim()
            });
        }
        
        log(`Processed ${dataRows.length} dividends for ${normalizedTicker}`, 'info');
    }
    
    // Ordina per data
    allDividends.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Crea CSV unificato
    const header = 'ticker,currency,date,amount';
    const rows = allDividends.map(d => `${d.ticker},${d.currency},${d.date},${d.amount}`);
    
    log(`Processed ${allDividends.length} dividend entries`, 'success');
    
    return [header, ...rows].join('\n');
}

// ============================================================================
// VALIDATE CSV
// ============================================================================

function validatePricingCSV(csvContent) {
    const lines = csvContent.split('\n');
    const header = lines[0];
    
    const requiredColumns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
    const headerColumns = header.split(',');
    
    for (const col of requiredColumns) {
        if (!headerColumns.includes(col)) {
            throw new Error(`Missing required column: ${col}`);
        }
    }
    
    return true;
}

function validateDividendCSV(csvContent) {
    const lines = csvContent.split('\n');
    const header = lines[0];
    
    const requiredColumns = ['ticker', 'currency', 'date', 'amount'];
    const headerColumns = header.split(',');
    
    for (const col of requiredColumns) {
        if (!headerColumns.includes(col)) {
            throw new Error(`Missing required column: ${col}`);
        }
    }
    
    return true;
}

// ============================================================================
// MAIN WORKFLOW
// ============================================================================

async function main() {
    log('🚀 Starting Rosicatore CSV Update Process', 'info');
    log('================================================', 'info');
    
    try {
        // 1. Verifica file ZIP esistenti
        log('Step 1: Checking input files...', 'progress');
        
        const pricingZip = fs.readdirSync(PATHS.uploads)
            .find(f => f.startsWith('movimenti-batch-') && f.endsWith('.zip'));
        const dividendiZip = fs.readdirSync(PATHS.uploads)
            .find(f => f.startsWith('dividendi-batch-') && f.endsWith('.zip'));
        
        if (!pricingZip) {
            throw new Error('Pricing ZIP not found in /home/user/uploaded_files/');
        }
        if (!dividendiZip) {
            throw new Error('Dividendi ZIP not found in /home/user/uploaded_files/');
        }
        
        log(`Found pricing ZIP: ${pricingZip}`, 'success');
        log(`Found dividendi ZIP: ${dividendiZip}`, 'success');
        
        // 2. Crea directory temporanea
        log('Step 2: Creating temporary directories...', 'progress');
        await ensureDir(PATHS.temp);
        await ensureDir(path.join(PATHS.temp, 'pricing'));
        await ensureDir(path.join(PATHS.temp, 'dividendi'));
        
        // 3. Estrai ZIP (già estratti precedentemente, usa i file esistenti)
        log('Step 3: Using existing extracted files...', 'progress');
        
        // 4. Backup dei CSV esistenti
        log('Step 4: Backing up existing CSV files...', 'progress');
        await ensureDir(PATHS.backup);
        
        const existingCSVs = fs.readdirSync(PATHS.data)
            .filter(f => f.endsWith('.csv'));
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(PATHS.backup, `backup_${timestamp}`);
        await ensureDir(backupDir);
        
        for (const csv of existingCSVs) {
            const src = path.join(PATHS.data, csv);
            const dest = path.join(backupDir, csv);
            fs.copyFileSync(src, dest);
        }
        
        log(`Backed up ${existingCSVs.length} files to ${backupDir}`, 'success');
        
        // 5. Processa pricing files
        log('Step 5: Processing pricing files...', 'progress');
        
        let updatedCount = 0;
        let keptCount = 0;
        let notFoundCount = 0;
        
        for (const [ticker, csvFilename] of Object.entries(TICKER_CSV_MAP)) {
            // Cerca directory con possibili suffissi: ticker, ticker.TO, ticker.TSX, ticker.TSXV
            let tickerDir = path.join(PATHS.uploads, ticker);
            let foundSuffix = null;
            
            if (!fs.existsSync(tickerDir)) {
                // Prova con .TO
                const tickerDirTO = path.join(PATHS.uploads, `${ticker}.TO`);
                if (fs.existsSync(tickerDirTO)) {
                    tickerDir = tickerDirTO;
                    foundSuffix = '.TO';
                } else {
                    // Prova con .TSX
                    const tickerDirTSX = path.join(PATHS.uploads, `${ticker}.TSX`);
                    if (fs.existsSync(tickerDirTSX)) {
                        tickerDir = tickerDirTSX;
                        foundSuffix = '.TSX';
                    } else {
                        // Prova con .TSXV
                        const tickerDirTSXV = path.join(PATHS.uploads, `${ticker}.TSXV`);
                        if (fs.existsSync(tickerDirTSXV)) {
                            tickerDir = tickerDirTSXV;
                            foundSuffix = '.TSXV';
                        }
                    }
                }
            }
            
            if (!fs.existsSync(tickerDir)) {
                log(`Ticker directory not found: ${ticker} (keeping existing file)`, 'warning');
                keptCount++;
                notFoundCount++;
                continue;
            }
            
            if (foundSuffix) {
                log(`Found ${ticker}${foundSuffix} directory`, 'info');
            }
            
            const existingCSVPath = path.join(PATHS.data, csvFilename);
            const mergedCSV = await mergePricingFiles(tickerDir, ticker, existingCSVPath);
            
            if (!mergedCSV) {
                keptCount++;
                continue;
            }
            
            // Valida CSV
            validatePricingCSV(mergedCSV);
            
            // Salva CSV unificato
            fs.writeFileSync(existingCSVPath, mergedCSV, 'utf-8');
            
            log(`✅ Updated: ${csvFilename}`, 'success');
            updatedCount++;
        }
        
        log(`Summary: ${updatedCount} updated, ${keptCount} kept existing, ${notFoundCount} not found in ZIP`, 'info');
        
        // 6. Processa dividendi
        log('Step 6: Processing dividend files...', 'progress');
        
        const dividendiCSV = await processDividends(PATHS.uploads);
        validateDividendCSV(dividendiCSV);
        
        const dividendiPath = path.join(PATHS.data, 'dividendi.csv');
        fs.writeFileSync(dividendiPath, dividendiCSV, 'utf-8');
        
        log('Created: dividendi.csv', 'success');
        
        // 7. Pulizia
        log('Step 7: Cleaning up temporary files...', 'progress');
        // (opzionale: rimuovi file temporanei)
        
        log('================================================', 'info');
        log('✅ CSV Update Process Completed Successfully!', 'success');
        log('================================================', 'info');
        
        // Statistiche finali
        const updatedFiles = fs.readdirSync(PATHS.data)
            .filter(f => f.endsWith('.csv'));
        
        log(`Total CSV files in /public/static/data/: ${updatedFiles.length}`, 'info');
        
    } catch (error) {
        log(`Error: ${error.message}`, 'error');
        log(error.stack, 'error');
        process.exit(1);
    }
}

// Esegui script
if (require.main === module) {
    main();
}

module.exports = { main };
