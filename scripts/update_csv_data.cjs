#!/usr/bin/env node

/**
 * ROSICATORE CSV UPDATE SCRIPT v4.1.1
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
// MERGE PRICING FILES
// ============================================================================

async function mergePricingFiles(tickerDir, ticker) {
    log(`Merging pricing files for ${ticker}...`, 'progress');
    
    // Trova tutti i file CSV nella directory del ticker
    const files = fs.readdirSync(tickerDir)
        .filter(f => f.endsWith('.csv'))
        .sort(); // Ordina per nome (Parte 1, Parte 2, etc.)
    
    if (files.length === 0) {
        log(`No CSV files found for ${ticker}`, 'warning');
        return null;
    }
    
    let allRows = [];
    let header = null;
    
    for (const file of files) {
        const filePath = path.join(tickerDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.trim().split('\n');
        
        if (!header) {
            header = lines[0]; // Salva header dal primo file
            allRows.push(header);
        }
        
        // Aggiungi tutte le righe tranne l'header
        const dataRows = lines.slice(1).filter(line => line.trim() !== '');
        allRows.push(...dataRows);
    }
    
    log(`Merged ${files.length} files into ${allRows.length - 1} data rows`, 'success');
    
    // Ordina per data (assumendo che la prima colonna sia Date)
    const dataRows = allRows.slice(1);
    dataRows.sort((a, b) => {
        const dateA = a.split(',')[0];
        const dateB = b.split(',')[0];
        
        const isoA = parseItalianDate(dateA) || dateA;
        const isoB = parseItalianDate(dateB) || dateB;
        
        return new Date(isoA) - new Date(isoB);
    });
    
    // Ricostruisci CSV con header + righe ordinate
    const finalCSV = [header, ...dataRows].join('\n');
    
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
                ticker,
                currency: 'USD', // Assumo USD come default
                date: isoDate,
                amount: amount.trim()
            });
        }
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
        
        for (const [ticker, csvFilename] of Object.entries(TICKER_CSV_MAP)) {
            const tickerDir = path.join(PATHS.uploads, ticker);
            
            if (!fs.existsSync(tickerDir)) {
                log(`Ticker directory not found: ${ticker}`, 'warning');
                continue;
            }
            
            const mergedCSV = await mergePricingFiles(tickerDir, ticker);
            
            if (!mergedCSV) continue;
            
            // Valida CSV
            validatePricingCSV(mergedCSV);
            
            // Salva CSV unificato
            const outputPath = path.join(PATHS.data, csvFilename);
            fs.writeFileSync(outputPath, mergedCSV, 'utf-8');
            
            log(`Created: ${csvFilename}`, 'success');
        }
        
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
