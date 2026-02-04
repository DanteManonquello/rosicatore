// Rosicatore v3.12.0 - Portfolio Tracker Calculator
// Main Application Logic

// Global state
const state = {
    csvData: {
        titoli: null,
        valori: {}, // Map: ticker -> price history
        movimenti: null,
        dividendi: null
    },
    config: {
        capitaleTotale: 12000,  // FISSO: 12.000€
        dataInizio: null,
        dataFine: null
    },
    results: null,
    errors: [],
    loading: false
};

// Ticker to CSV filename mapping
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

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initializeDatePickers();
    setupFileUploads();
    setupCalculateButton();
    setupHamburgerMenu();
    await autoLoadCSVs(); // Auto-load on startup
});

// Set default dates (1 January 2025 - 1 January 2026)
function initializeDatePickers() {
    document.getElementById('dataInizio').value = '2025-01-01';
    document.getElementById('dataFine').value = '2026-01-01';
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Setup file upload handlers
function setupFileUploads() {
    const uploads = ['titoli', 'valori', 'movimenti', 'dividendi'];
    
    uploads.forEach(type => {
        const input = document.getElementById(`upload-${type}`);
        const status = document.getElementById(`status-${type}`);
        const slot = document.getElementById(`slot-${type}`);
        
        // File input change handler
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await handleFileUpload(file, type, status);
        });
        
        // Drag & Drop handlers
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            slot.style.transform = 'scale(1.05)';
            slot.style.opacity = '0.8';
        });
        
        slot.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            slot.style.transform = '';
            slot.style.opacity = '';
        });
        
        slot.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            slot.style.transform = '';
            slot.style.opacity = '';
            
            const file = e.dataTransfer.files[0];
            if (!file) return;
            
            // Check if it's a CSV file
            if (!file.name.endsWith('.csv')) {
                status.innerHTML = '<i class="fas fa-times-circle mr-1 status-error"></i>Solo file CSV';
                status.className = 'mt-3 text-xs status-error';
                return;
            }
            
            await handleFileUpload(file, type, status);
        });
    });
}

// Auto-load CSV files from server on startup
async function autoLoadCSVs() {
    state.loading = true;
    updateLoadingStatus('Caricamento dati persistenti...', true);
    
    try {
        // Load info_titoli
        const titoliResponse = await fetch('/static/data/info_titoli.csv');
        const titoliText = await titoliResponse.text();
        state.csvData.titoli = await parseCSVText(titoliText);
        updateSlotStatus('titoli', 'info_titoli.csv ✓ (auto-caricato)');
        
        // Load movimenti
        const movimentiResponse = await fetch('/static/data/movimenti.csv');
        const movimentiText = await movimentiResponse.text();
        state.csvData.movimenti = await parseCSVText(movimentiText);
        updateSlotStatus('movimenti', 'movimenti.csv ✓ (auto-caricato)');
        
        // Load dividendi
        const dividendiResponse = await fetch('/static/data/dividendi.csv');
        const dividendiText = await dividendiResponse.text();
        state.csvData.dividendi = await parseCSVText(dividendiText);
        updateSlotStatus('dividendi', 'dividendi.csv ✓ (auto-caricato)');
        
        // Load all price history CSVs
        const pricePromises = Object.entries(TICKER_CSV_MAP).map(async ([ticker, filename]) => {
            try {
                const response = await fetch(`/static/data/${filename}`);
                const text = await response.text();
                const data = await parseCSVText(text);
                state.csvData.valori[ticker] = data;
                return { ticker, success: true };
            } catch (error) {
                console.warn(`Failed to load ${filename}:`, error);
                return { ticker, success: false };
            }
        });
        
        const priceResults = await Promise.all(pricePromises);
        const loaded = priceResults.filter(r => r.success).length;
        updateSlotStatus('valori', `${loaded}/${Object.keys(TICKER_CSV_MAP).length} ticker caricati ✓`);
        
        updateLoadingStatus('Dati caricati! Pronto per calcolare.', false);
        state.loading = false;
        
    } catch (error) {
        console.error('Auto-load error:', error);
        updateLoadingStatus('⚠️ Errore caricamento automatico. Usa upload manuale.', false);
        state.loading = false;
    }
}

// Parse CSV from text
function parseCSVText(text) {
    return new Promise((resolve, reject) => {
        Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    reject(new Error('Errore parsing CSV: ' + results.errors[0].message));
                } else {
                    resolve(results.data);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

// Update slot status UI
function updateSlotStatus(type, message) {
    const status = document.getElementById(`status-${type}`);
    if (status) {
        status.innerHTML = `<i class="fas fa-check-circle mr-1 status-loaded"></i>${message}`;
        status.className = 'mt-3 text-xs status-loaded';
    }
}

// Update loading status in UI
function updateLoadingStatus(message, loading) {
    const btn = document.getElementById('btnCalcola');
    if (loading) {
        btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`;
        btn.disabled = true;
    } else {
        btn.innerHTML = '<i class="fas fa-calculator mr-2"></i>CALCOLA PORTAFOGLIO';
        btn.disabled = false;
        
        // Show message in console or status area
        console.log(message);
    }
}

// Handle file upload (shared for input and drag&drop)
async function handleFileUpload(file, type, status) {
    status.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Caricamento...';
    
    try {
        const data = await parseCSV(file);
        
        // For 'valori', need special handling (manual override for all tickers)
        if (type === 'valori') {
            // Clear all and use this CSV for all tickers (backward compatibility)
            state.csvData.valori = {};
            Object.keys(TICKER_CSV_MAP).forEach(ticker => {
                state.csvData.valori[ticker] = data;
            });
        } else {
            state.csvData[type] = data;
        }
        
        status.innerHTML = `<i class="fas fa-check-circle mr-1 status-loaded"></i>${file.name} ✓`;
        status.className = 'mt-3 text-xs status-loaded';
        
        // Validate data
        validateCSV(type, data);
        
    } catch (error) {
        status.innerHTML = '<i class="fas fa-times-circle mr-1 status-error"></i>Errore: ' + error.message;
        status.className = 'mt-3 text-xs status-error';
        
        if (type === 'valori') {
            state.csvData.valori = {};
        } else {
            state.csvData[type] = null;
        }
    }
}

// Parse CSV file
function parseCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    reject(new Error('Errore parsing CSV: ' + results.errors[0].message));
                } else {
                    resolve(results.data);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

// Validate CSV data
function validateCSV(type, data) {
    if (!data || data.length === 0) {
        addError(`CSV ${type} vuoto o non valido`);
        return false;
    }
    
    // Type-specific validation
    const requiredFields = {
        titoli: ['ticker', 'quota_numeratore', 'quota_denominatore'],
        valori: ['Date', 'Price'],
        movimenti: ['data', 'ticker', 'azione', 'frazione_numeratore', 'frazione_denominatore'],
        dividendi: ['ticker', 'data_pagamento', 'importo_usd']
    };
    
    const fields = requiredFields[type];
    const firstRow = data[0];
    
    for (const field of fields) {
        if (!(field in firstRow)) {
            addError(`CSV ${type} manca campo: ${field}`);
            return false;
        }
    }
    
    return true;
}

// Setup calculate button
function setupCalculateButton() {
    const btn = document.getElementById('btnCalcola');
    
    btn.addEventListener('click', async () => {
        // Clear previous errors
        state.errors = [];
        hideErrors();
        
        // Get config
        state.config.capitaleTotale = parseFloat(document.getElementById('capitaleTotale').value);
        state.config.dataInizio = document.getElementById('dataInizio').value;
        state.config.dataFine = document.getElementById('dataFine').value;
        
        // Validate inputs
        if (!validateInputs()) {
            showErrors();
            return;
        }
        
        // Disable button
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>CALCOLO IN CORSO...';
        
        try {
            // Run calculation
            const results = calculatePortfolio();
            
            // Display results
            displayResults(results);
            
            btn.innerHTML = '<i class="fas fa-check mr-3"></i>CALCOLO COMPLETATO';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-calculator mr-3"></i>RICALCOLA PORTAFOGLIO';
                btn.disabled = false;
            }, 2000);
            
        } catch (error) {
            addError('Errore calcolo: ' + error.message);
            showErrors();
            btn.innerHTML = '<i class="fas fa-calculator mr-3"></i>CALCOLA PORTAFOGLIO';
            btn.disabled = false;
        }
    });
}

// Validate inputs before calculation
function validateInputs() {
    let valid = true;
    
    // Check CSV data loaded
    if (!state.csvData.titoli) {
        addError('CSV Titoli non caricato');
        valid = false;
    }
    if (!state.csvData.valori) {
        addError('CSV Valori non caricato');
        valid = false;
    }
    if (!state.csvData.movimenti) {
        addError('CSV Movimenti non caricato (opzionale ma raccomandato)');
        // Not blocking
    }
    if (!state.csvData.dividendi) {
        addError('CSV Dividendi non caricato (opzionale)');
        // Not blocking
    }
    
    // Check config
    if (!state.config.capitaleTotale || state.config.capitaleTotale <= 0) {
        addError('Capitale totale deve essere > 0');
        valid = false;
    }
    
    if (!state.config.dataInizio) {
        addError('Data inizio non specificata');
        valid = false;
    }
    
    if (!state.config.dataFine) {
        addError('Data fine non specificata');
        valid = false;
    }
    
    // Check date order
    if (state.config.dataInizio && state.config.dataFine) {
        const start = new Date(state.config.dataInizio);
        const end = new Date(state.config.dataFine);
        if (start >= end) {
            addError('Data inizio deve essere precedente a data fine');
            valid = false;
        }
    }
    
    return valid;
}

// Main calculation function
function calculatePortfolio() {
    console.log('Starting portfolio calculation...');
    
    const { capitaleTotale, dataInizio, dataFine } = state.config;
    const { titoli, valori, movimenti, dividendi } = state.csvData;
    
    const allResults = [];
    const titoliSkipped = [];
    
    for (const titoloInfo of titoli) {
        const ticker = titoloInfo.ticker;
        
        // STEP 1: Costruisco timeline completa di TUTTI i movimenti (anche precedenti al periodo)
        const movimentiTicker = movimenti
            ? movimenti
                .filter(m => m.ticker === ticker)
                .sort((a, b) => new Date(a.data) - new Date(b.data))
            : [];
        
        // STEP 2: Calcolo quarti posseduti movimento per movimento
        let quartiAttuali = 0;
        let primoIngressoStorico = null;  // Primo INGRESSO nella storia completa
        let dataUscitaPrePeriodo = null;  // Ultima USCITA prima del periodo
        
        const timelineQuarti = [];
        
        movimentiTicker.forEach(m => {
            const frazione = m.frazione_numeratore / m.frazione_denominatore;
            const quartiPrecedenti = quartiAttuali;
            
            if (m.azione === 'BUY') {
                quartiAttuali += frazione;
                
                // INGRESSO: se prima avevo 0 quarti, ora ho >0
                if (quartiPrecedenti === 0 && quartiAttuali > 0) {
                    if (!primoIngressoStorico) {
                        primoIngressoStorico = m.data;
                        console.log(`${ticker} - PRIMO INGRESSO STORICO: ${m.data}`);
                    }
                }
            } else if (m.azione === 'SELL') {
                quartiAttuali -= frazione;
                
                // USCITA: se prima avevo >0 quarti, ora ho 0
                if (quartiPrecedenti > 0 && quartiAttuali <= 0) {
                    quartiAttuali = 0;  // Forza a 0 per evitare negativi
                    if (m.data < dataInizio) {
                        dataUscitaPrePeriodo = m.data;
                        console.log(`${ticker} - USCITA PRE-PERIODO: ${m.data}`);
                    }
                }
            }
            
            timelineQuarti.push({
                data: m.data,
                azione: m.azione,
                frazione,
                quartiDopo: quartiAttuali,
                tipo: quartiPrecedenti === 0 && quartiAttuali > 0 ? 'INGRESSO' :
                      quartiPrecedenti > 0 && quartiAttuali <= 0 ? 'USCITA' :
                      m.azione === 'BUY' ? 'APPESANTIMENTO' : 'ALLEGGERIMENTO'
            });
        });
        
        console.log(`${ticker} - Timeline quarti:`, timelineQuarti);
        
        // STEP 3: Determino se calcolare questo titolo nel periodo scelto
        
        // CASO 1: Nessun movimento = titolo già in portafoglio da info_titoli.csv
        if (movimentiTicker.length === 0) {
            const frazioneInfoTitoli = titoloInfo.quota_numeratore / titoloInfo.quota_denominatore;
            
            if (frazioneInfoTitoli > 0) {
                // Titolo già in portafoglio, calcolo DA dataInizio
                console.log(`${ticker}: già in portafoglio (nessun movimento), calcolo DA ${dataInizio}`);
                
                try {
                    const result = calculateSingleTicker(ticker, titoloInfo, capitaleTotale, dataInizio, dataFine, valori, movimenti, dividendi, frazioneInfoTitoli);
                    allResults.push(result);
                } catch (error) {
                    console.error(`Error calculating ${ticker}:`, error);
                    addError(`Errore calcolo ${ticker}: ${error.message}`);
                    titoliSkipped.push({
                        ticker,
                        nome: titoloInfo.nome,
                        motivo: `Errore: ${error.message}`
                    });
                }
            } else {
                // Nessun movimento E 0 quarti in info_titoli.csv = mai comprato
                console.log(`${ticker}: MAI comprato, SKIP`);
                titoliSkipped.push({
                    ticker,
                    nome: titoloInfo.nome,
                    motivo: 'Mai acquistato'
                });
            }
            continue;
        }
        
        // CASO 2: Primo INGRESSO storico DOPO dataFine → NON calcolare
        if (primoIngressoStorico && primoIngressoStorico > dataFine) {
            console.log(`${ticker}: primo INGRESSO ${primoIngressoStorico} DOPO dataFine ${dataFine}, SKIP`);
            titoliSkipped.push({
                ticker,
                nome: titoloInfo.nome,
                dataPrimoBuy: primoIngressoStorico,
                motivo: `Non ancora acquistato nel periodo (ingresso: ${primoIngressoStorico})`
            });
            continue;
        }
        
        // CASO 3: Calcolo quarti posseduti al dataInizio
        let quartiAlDataInizio = 0;
        
        movimentiTicker
            .filter(m => m.data < dataInizio)
            .forEach(m => {
                const frazione = m.frazione_numeratore / m.frazione_denominatore;
                if (m.azione === 'BUY') {
                    quartiAlDataInizio += frazione;
                } else if (m.azione === 'SELL') {
                    quartiAlDataInizio -= frazione;
                }
            });
        
        // Forza a 0 se negativo
        if (quartiAlDataInizio < 0) quartiAlDataInizio = 0;
        
        console.log(`${ticker} - Quarti al ${dataInizio}: ${quartiAlDataInizio}`);
        
        // CASO 4: Se quarti al dataInizio = 0, cerca primo INGRESSO NEL periodo
        if (quartiAlDataInizio <= 0) {
            // Cerca primo INGRESSO (0→>0) nel periodo [dataInizio, dataFine]
            const movimentiNelPeriodo = timelineQuarti.filter(t => 
                t.data >= dataInizio && t.data <= dataFine
            );
            
            let primoIngressoNelPeriodo = null;
            let quartiTemp = 0;
            
            for (const movimento of movimentiNelPeriodo) {
                const quartiPrima = quartiTemp;
                
                if (movimento.azione === 'BUY') {
                    quartiTemp += movimento.frazione;
                } else if (movimento.azione === 'SELL') {
                    quartiTemp -= movimento.frazione;
                }
                
                if (quartiTemp < 0) quartiTemp = 0;
                
                // INGRESSO: 0 → >0
                if (quartiPrima === 0 && quartiTemp > 0) {
                    primoIngressoNelPeriodo = movimento.data;
                    console.log(`${ticker} - PRIMO INGRESSO NEL PERIODO: ${primoIngressoNelPeriodo}`);
                    break;
                }
            }
            
            if (!primoIngressoNelPeriodo) {
                // Nessun INGRESSO nel periodo = non presente in portafoglio
                console.log(`${ticker}: 0 quarti al dataInizio E nessun INGRESSO nel periodo, SKIP`);
                titoliSkipped.push({
                    ticker,
                    nome: titoloInfo.nome,
                    motivo: 'Non presente in portafoglio nel periodo selezionato'
                });
                continue;
            }
            
            // CALCOLA dal primo INGRESSO nel periodo
            console.log(`${ticker}: CALCOLO DA ${primoIngressoNelPeriodo}, quarti iniziali: 0`);
            
            try {
                const result = calculateSingleTicker(ticker, titoloInfo, capitaleTotale, primoIngressoNelPeriodo, dataFine, valori, movimenti, dividendi, 0);
                allResults.push(result);
            } catch (error) {
                console.error(`Error calculating ${ticker}:`, error);
                addError(`Errore calcolo ${ticker}: ${error.message}`);
                titoliSkipped.push({
                    ticker,
                    nome: titoloInfo.nome,
                    motivo: `Errore: ${error.message}`
                });
            }
        } else {
            // Quarti > 0 al dataInizio = già in portafoglio
            console.log(`${ticker}: CALCOLO DA ${dataInizio}, quarti iniziali: ${quartiAlDataInizio}`);
            
            try {
                const result = calculateSingleTicker(ticker, titoloInfo, capitaleTotale, dataInizio, dataFine, valori, movimenti, dividendi, quartiAlDataInizio);
                allResults.push(result);
            } catch (error) {
                console.error(`Error calculating ${ticker}:`, error);
                addError(`Errore calcolo ${ticker}: ${error.message}`);
                titoliSkipped.push({
                    ticker,
                    nome: titoloInfo.nome,
                    motivo: `Errore: ${error.message}`
                });
            }
        }
    }
    
    if (allResults.length === 0) {
        throw new Error('Nessun titolo calcolato con successo nel periodo selezionato');
    }
    
    return {
        stocks: allResults,
        titoliSkipped,
        totalPatrimonio: allResults.reduce((sum, r) => sum + r.summary.patrimonioFinale, 0),
        totalGainLoss: allResults.reduce((sum, r) => sum + r.summary.gainLoss, 0),
        periodoAnalisi: {
            dataInizio,
            dataFine,
            titoliAttivi: allResults.length,
            titoliSkippati: titoliSkipped.length
        }
    };
}

// Calculate single ticker
function calculateSingleTicker(ticker, titoloInfo, capitaleTotalePortafoglio, dataInizio, dataFine, valori, movimenti, dividendi, frazioneAlDataInizio = null) {
    
    // NUOVA LOGICA: Ogni titolo inizia con 1000€ FISSO
    const capitaleAllocato = 1000;  // ← 1000€ FISSO per ogni titolo!
    
    // Se frazioneAlDataInizio è passata, usa quella (titolo già in portafoglio)
    // Altrimenti usa frazione iniziale da info_titoli.csv
    const frazioneIniziale = frazioneAlDataInizio !== null ? frazioneAlDataInizio : (titoloInfo.quota_numeratore / titoloInfo.quota_denominatore);
    let capitaleInvestito = capitaleAllocato * frazioneIniziale;
    
    const prezzoIngresso = getPrezzoByDate(valori, dataInizio, ticker);
    if (!prezzoIngresso) {
        throw new Error(`Prezzo ingresso non trovato per ${ticker} data ${dataInizio}`);
    }
    
    let azioni = capitaleInvestito / prezzoIngresso;  // Es: 500 / 3.92 = 127.55 azioni
    let cashResiduo = capitaleAllocato - capitaleInvestito;  // Es: 1000 - 500 = 500€
    let frazioneAttuale = frazioneIniziale;
    
    console.log('Ingresso:', { 
        ticker, 
        capitaleAllocato, 
        frazioneIniziale, 
        capitaleInvestito, 
        prezzoIngresso, 
        azioni, 
        cashResiduo, 
        frazioneAttuale 
    });
    
    // Get all events (movimenti + dividendi) sorted by date
    const eventi = [];
    
    // Add movimenti events
    if (movimenti && movimenti.length > 0) {
        movimenti
            .filter(m => m.ticker === ticker)
            .forEach(m => {
                eventi.push({
                    data: m.data,
                    tipo: m.azione, // 'BUY' or 'SELL'
                    frazione_num: m.frazione_numeratore,
                    frazione_den: m.frazione_denominatore,
                    note: m.note
                });
            });
    }
    
    // Add dividendi events
    if (dividendi && dividendi.length > 0) {
        dividendi
            .filter(d => d.ticker === ticker)
            .forEach(d => {
                eventi.push({
                    data: d.data_pagamento,
                    tipo: 'DIVIDEND',
                    importo: d.importo_usd,
                    isin: d.isin
                });
            });
    }
    
    // Sort events by date
    eventi.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    console.log('Eventi trovati:', eventi.length);
    
    // Track history for detailed output
    const history = [{
        data: dataInizio,
        evento: 'INGRESSO',
        azioni,
        prezzo: prezzoIngresso,
        valoreAzioni: azioni * prezzoIngresso,
        cashResiduo,
        patrimonioTotale: (azioni * prezzoIngresso) + cashResiduo,
        frazioneAttuale: frazioneIniziale
    }];
    
    // Process events
    eventi.forEach(evento => {
        const dataEvento = evento.data;
        
        // Skip if outside date range
        if (dataEvento < dataInizio || dataEvento > dataFine) {
            addError(`Evento ${evento.tipo} del ${dataEvento} fuori dal periodo di analisi`);
            return;
        }
        
        const prezzoEvento = getPrezzoByDate(valori, dataEvento, ticker);
        if (!prezzoEvento) {
            addError(`Prezzo non trovato per data evento: ${dataEvento}`);
            return;
        }
        
        if (evento.tipo === 'BUY') {
            // APPESANTIMENTO - FORMULA UNIVERSALE
            // Patrimonio attuale = Cash + Valore Azioni
            // Valore 1/4 = Patrimonio / 4
            // Capitale da investire = Valore 1/4 × Frazione
            
            const frazione = evento.frazione_num / evento.frazione_den;
            const valoreAzioni = azioni * prezzoEvento;
            const patrimonioAttuale = cashResiduo + valoreAzioni;
            const valore_1_quarto = patrimonioAttuale / 4;
            const capitaleDaInvestire = valore_1_quarto * evento.frazione_num;  // ← FORMULA UNIVERSALE!
            
            const azioniNuove = capitaleDaInvestire / prezzoEvento;
            
            azioni += azioniNuove;
            cashResiduo -= capitaleDaInvestire;
            frazioneAttuale += frazione;
            capitaleInvestito += capitaleDaInvestire;
            
            history.push({
                data: dataEvento,
                evento: `BUY +${evento.frazione_num}/${evento.frazione_den}`,
                azioni,
                prezzo: prezzoEvento,
                valoreAzioni: azioni * prezzoEvento,
                cashResiduo,
                patrimonioTotale: (azioni * prezzoEvento) + cashResiduo,
                frazioneAttuale,
                note: evento.note,
                dettagli: `Patrimonio: ${patrimonioAttuale.toFixed(2)}€, Valore 1/4: ${valore_1_quarto.toFixed(2)}€, Investito: ${capitaleDaInvestire.toFixed(2)}€ (${evento.frazione_num}/4), Azioni nuove: ${azioniNuove.toFixed(4)}`
            });
            
        } else if (evento.tipo === 'SELL') {
            // ALLEGGERIMENTO - FORMULA UNIVERSALE
            // Patrimonio attuale = Cash + Valore Azioni
            // Valore 1/4 = Patrimonio / 4
            // Capitale da vendere = Valore 1/4 × Frazione
            
            const frazione = evento.frazione_num / evento.frazione_den;
            const valoreAzioni = azioni * prezzoEvento;
            const patrimonioAttuale = cashResiduo + valoreAzioni;
            const valore_1_quarto = patrimonioAttuale / 4;
            const capitaleDaVendere = valore_1_quarto * evento.frazione_num;  // ← FORMULA UNIVERSALE!
            
            const azioniDaVendere = capitaleDaVendere / prezzoEvento;
            
            azioni -= azioniDaVendere;
            cashResiduo += capitaleDaVendere;
            frazioneAttuale -= frazione;
            capitaleInvestito -= capitaleDaVendere;
            
            history.push({
                data: dataEvento,
                evento: `SELL -${evento.frazione_num}/${evento.frazione_den}`,
                azioni,
                prezzo: prezzoEvento,
                valoreAzioni: azioni * prezzoEvento,
                cashResiduo,
                patrimonioTotale: (azioni * prezzoEvento) + cashResiduo,
                frazioneAttuale,
                note: evento.note,
                dettagli: `Patrimonio: ${patrimonioAttuale.toFixed(2)}€, Valore 1/4: ${valore_1_quarto.toFixed(2)}€, Venduto: ${capitaleDaVendere.toFixed(2)}€ (${evento.frazione_num}/4), Azioni vendute: ${azioniDaVendere.toFixed(4)}, Cash ricevuto: +${capitaleDaVendere.toFixed(2)}€`
            });
            
        } else if (evento.tipo === 'DIVIDEND') {
            // DIVIDENDO - Aggiungi solo al CASH (NON reinvestire)
            const dividendoTotale = azioni * evento.importo;
            cashResiduo += dividendoTotale;  // ← Aggiunge al CASH!
            
            history.push({
                data: dataEvento,
                evento: `DIVIDEND $${evento.importo}`,
                azioni,
                prezzo: prezzoEvento,
                valoreAzioni: azioni * prezzoEvento,
                cashResiduo,
                patrimonioTotale: (azioni * prezzoEvento) + cashResiduo,
                frazioneAttuale,
                dividendoTotale,
                dettagli: `Dividendo ricevuto: ${dividendoTotale.toFixed(2)}€ (${azioni.toFixed(4)} azioni × $${evento.importo}), Aggiunto al cash (NON reinvestito)`
            });
        }
    });
    
    // Final valuation
    const prezzoFinale = getPrezzoByDate(valori, dataFine, ticker);
    if (!prezzoFinale) {
        throw new Error(`Prezzo finale non trovato per data ${dataFine}`);
    }
    
    const valorePosizioneFinale = azioni * prezzoFinale;
    const patrimonioFinale = valorePosizioneFinale + cashResiduo;
    const gainLoss = patrimonioFinale - capitaleAllocato;  // Gain vs capitale ALLOCATO
    const roiPortafoglio = (gainLoss / capitaleAllocato) * 100;
    
    history.push({
        data: dataFine,
        evento: 'FINE PERIODO',
        azioni,
        prezzo: prezzoFinale,
        valoreAzioni: valorePosizioneFinale,
        cashResiduo,
        patrimonioTotale: patrimonioFinale,
        frazioneAttuale
    });
    
    // Calculate KPIs
    const kpis = calculateKPIs({
        ticker,
        capitaleAllocato,  // Capitale allocato FISSO per il titolo
        capitaleInvestito,  // Capitale effettivamente investito (varia con BUY/SELL)
        valorePosizioneFinale,
        patrimonioFinale,
        cashResiduo,
        azioni,
        prezzoIngresso,
        prezzoFinale,
        gainLoss,
        roiPortafoglio,
        frazioneAttuale,
        history
    });
    
    return {
        ticker,
        kpis,
        history,
        summary: {
            capitaleAllocato,  // Capitale ALLOCATO (fisso)
            capitaleInvestito,  // Capitale INVESTITO (cumulativo con BUY/SELL)
            valorePosizioneFinale,
            patrimonioFinale,
            cashResiduo,
            azioni,
            prezzoIngresso,
            prezzoFinale,
            gainLoss,
            roiPortafoglio,
            frazioneAttuale
        }
    };
}

// Get price by date from valori CSV
// NOTE: For now, assumes single CSV with all prices
// TODO: Support multiple CSV files (one per ticker)
function getPrezzoByDate(valori, targetDate, ticker) {
    // Get price history for this specific ticker
    const tickerData = valori[ticker];
    
    if (!tickerData || tickerData.length === 0) {
        console.warn(`No price data for ticker ${ticker}`);
        return null;
    }
    
    // Convert date formats
    const target = dayjs(targetDate);
    
    // Find exact match or closest date
    let closestPrice = null;
    let minDiff = Infinity;
    
    tickerData.forEach(row => {
        const rowDate = dayjs(row.Date, 'MM/DD/YYYY');
        const diff = Math.abs(target.diff(rowDate, 'day'));
        
        if (diff < minDiff) {
            minDiff = diff;
            closestPrice = parseFloat(row.Price);
        }
    });
    
    return closestPrice;
}

// Calculate comprehensive KPIs
function calculateKPIs(data) {
    const {
        ticker,
        capitaleAllocato,  // ← Capitale allocato iniziale
        capitaleInvestito,  // ← Capitale effettivamente investito (cumulativo con BUY)
        valorePosizioneFinale,
        patrimonioFinale,
        cashResiduo,
        azioni,
        prezzoIngresso,
        prezzoFinale,
        gainLoss,
        roiPortafoglio,
        frazioneAttuale,
        history
    } = data;
    
    // Calculate various metrics
    const pesoPortafoglio = (valorePosizioneFinale / patrimonioFinale) * 100;
    const roiPosizioni = ((valorePosizioneFinale - capitaleInvestito) / capitaleInvestito) * 100;
    const variazionePrezzo = ((prezzoFinale - prezzoIngresso) / prezzoIngresso) * 100;
    
    // Count events
    const numMovimenti = history.filter(h => h.evento.includes('BUY') || h.evento.includes('SELL')).length;
    const numDividendi = history.filter(h => h.evento.includes('DIVIDEND')).length;
    const dividendiTotali = history
        .filter(h => h.dividendoTotale)
        .reduce((sum, h) => sum + h.dividendoTotale, 0);
    
    // Calculate peak/trough
    let maxPatrimonio = patrimonioFinale;
    let minPatrimonio = patrimonioFinale;
    history.forEach(h => {
        if (h.patrimonioTotale > maxPatrimonio) maxPatrimonio = h.patrimonioTotale;
        if (h.patrimonioTotale < minPatrimonio) minPatrimonio = h.patrimonioTotale;
    });
    
    const drawdown = ((patrimonioFinale - maxPatrimonio) / maxPatrimonio) * 100;
    
    return [
        { label: 'Patrimonio Totale', value: patrimonioFinale.toFixed(2), unit: 'USD', type: 'main' },
        { label: 'Gain/Loss', value: gainLoss.toFixed(2), unit: 'USD', type: gainLoss >= 0 ? 'positive' : 'negative' },
        { label: 'ROI Portafoglio', value: roiPortafoglio.toFixed(2), unit: '%', type: roiPortafoglio >= 0 ? 'positive' : 'negative' },
        { label: 'ROI Posizioni', value: roiPosizioni.toFixed(2), unit: '%', type: roiPosizioni >= 0 ? 'positive' : 'negative' },
        { label: 'Valore Posizione', value: valorePosizioneFinale.toFixed(2), unit: 'USD', type: 'neutral' },
        { label: 'Cash Residuo', value: cashResiduo.toFixed(2), unit: 'USD', type: 'neutral' },
        { label: 'Azioni Possedute', value: azioni.toFixed(4), unit: 'az', type: 'neutral' },
        { label: 'Prezzo Ingresso', value: prezzoIngresso.toFixed(3), unit: 'USD', type: 'neutral' },
        { label: 'Prezzo Finale', value: prezzoFinale.toFixed(3), unit: 'USD', type: 'neutral' },
        { label: 'Variazione Prezzo', value: variazionePrezzo.toFixed(2), unit: '%', type: variazionePrezzo >= 0 ? 'positive' : 'negative' },
        { label: 'Capitale Allocato', value: capitaleAllocato.toFixed(2), unit: 'USD', type: 'neutral' },  // ← Usa capitaleAllocato
        { label: 'Capitale Investito', value: capitaleInvestito.toFixed(2), unit: 'USD', type: 'neutral' },
        { label: 'Peso Portafoglio', value: pesoPortafoglio.toFixed(2), unit: '%', type: 'neutral' },
        { label: 'Frazione Attuale', value: frazioneAttuale.toFixed(2), unit: '', type: 'neutral' },
        { label: 'Numero Movimenti', value: numMovimenti, unit: '', type: 'neutral' },
        { label: 'Numero Dividendi', value: numDividendi, unit: '', type: 'neutral' },
        { label: 'Dividendi Totali', value: dividendiTotali.toFixed(2), unit: 'USD', type: 'positive' },
        { label: 'Max Patrimonio', value: maxPatrimonio.toFixed(2), unit: 'USD', type: 'positive' },
        { label: 'Min Patrimonio', value: minPatrimonio.toFixed(2), unit: 'USD', type: 'negative' },
        { label: 'Drawdown', value: drawdown.toFixed(2), unit: '%', type: drawdown >= 0 ? 'neutral' : 'negative' },
        { label: 'Gain vs Max', value: (patrimonioFinale - maxPatrimonio).toFixed(2), unit: 'USD', type: 'neutral' },
        { label: 'Gain vs Min', value: (patrimonioFinale - minPatrimonio).toFixed(2), unit: 'USD', type: 'positive' }
    ];
}

// Display results
function displayResults(results) {
    console.log('Displaying results:', results);
    
    // Show KPI section
    const kpiSection = document.getElementById('kpiSection');
    kpiSection.classList.remove('hidden');
    kpiSection.classList.add('fade-in');
    
    // Render periodo analisi + info date picker
    renderPeriodoAnalisi(results.periodoAnalisi, results.titoliSkipped);
    
    // Render KPI cards (aggregate from all stocks)
    const kpiGrid = document.getElementById('kpiGrid');
    kpiGrid.innerHTML = '';
    
    // Calculate aggregate KPIs
    const aggregateKPIs = calculateAggregateKPIs(results);
    aggregateKPIs.forEach(kpi => {
        const card = createKPICard(kpi);
        kpiGrid.appendChild(card);
    });
    
    // Render stock summary table (all stocks)
    renderStockSummaryMulti(results.stocks);
    
    // Render detailed history (first stock for now, TODO: selectable)
    if (results.stocks.length > 0) {
        renderDetailedHistory(results.stocks[0].history, results.stocks[0].ticker);
    }
    
    // Render calculations section (VITA MORTE MIRACOLI)
    renderCalculationsSection(results.stocks);
    
    // Update sidebar info
    updateSidebarInfo();
    
    // Scroll to results
    kpiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Calculate aggregate KPIs from all stocks
function calculateAggregateKPIs(results) {
    const { totalPatrimonio, totalGainLoss } = results;
    const capitaleTotale = state.config.capitaleTotale;
    const roiTotale = (totalGainLoss / capitaleTotale) * 100;
    
    // Aggregate metrics
    const totalAzioni = results.stocks.reduce((sum, s) => sum + s.summary.azioni, 0);
    const totalCash = results.stocks.reduce((sum, s) => sum + s.summary.cashResiduo, 0);
    const totalValorePosizioni = results.stocks.reduce((sum, s) => sum + s.summary.valorePosizioneFinale, 0);
    const numTitoli = results.stocks.length;
    
    return [
        { label: 'Patrimonio Totale', value: totalPatrimonio.toFixed(2), unit: 'USD', type: 'main' },
        { label: 'Gain/Loss Totale', value: totalGainLoss.toFixed(2), unit: 'USD', type: totalGainLoss >= 0 ? 'positive' : 'negative' },
        { label: 'ROI Portfolio', value: roiTotale.toFixed(2), unit: '%', type: roiTotale >= 0 ? 'positive' : 'negative' },
        { label: 'Valore Posizioni', value: totalValorePosizioni.toFixed(2), unit: 'USD', type: 'neutral' },
        { label: 'Cash Totale', value: totalCash.toFixed(2), unit: 'USD', type: 'neutral' },
        { label: 'Numero Titoli', value: numTitoli, unit: '', type: 'neutral' },
        { label: 'Capitale Allocato', value: capitaleTotale.toFixed(2), unit: 'USD', type: 'neutral' }
    ];
}

// Create KPI card element
function createKPICard(kpi) {
    const div = document.createElement('div');
    div.className = `kpi-card bg-gray-800 rounded-lg p-4 border ${
        kpi.type === 'main' ? 'border-green-500' :
        kpi.type === 'positive' ? 'border-green-700' :
        kpi.type === 'negative' ? 'border-red-700' :
        'border-gray-700'
    }`;
    
    const colorClass = 
        kpi.type === 'main' ? 'text-green-400' :
        kpi.type === 'positive' ? 'text-green-400' :
        kpi.type === 'negative' ? 'text-red-400' :
        'text-gray-300';
    
    div.innerHTML = `
        <div class="text-xs text-gray-400 mb-1">${kpi.label}</div>
        <div class="text-2xl font-bold ${colorClass}">
            ${kpi.value}
            <span class="text-sm">${kpi.unit}</span>
        </div>
    `;
    
    return div;
}

// Render stock summary table (MULTI-TICKER)
function renderStockSummaryMulti(stocks) {
    const content = document.getElementById('stockSummaryContent');
    
    let html = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b-2 border-gray-600">
                        <th class="text-left py-3 px-4 font-semibold">Ticker</th>
                        <th class="text-left py-3 px-4 font-semibold">Nome</th>
                        <th class="text-center py-3 px-4 font-semibold">Tipo</th>
                        <th class="text-right py-3 px-4 font-semibold">Capitale Allocato</th>
                        <th class="text-right py-3 px-4 font-semibold">Capitale Investito</th>
                        <th class="text-right py-3 px-4 font-semibold">Frazione</th>
                        <th class="text-right py-3 px-4 font-semibold">Azioni</th>
                        <th class="text-right py-3 px-4 font-semibold">Prezzo Ingresso</th>
                        <th class="text-right py-3 px-4 font-semibold">Prezzo Attuale</th>
                        <th class="text-right py-3 px-4 font-semibold">Var. Prezzo</th>
                        <th class="text-right py-3 px-4 font-semibold">Valore Posizione</th>
                        <th class="text-right py-3 px-4 font-semibold">Cash Residuo</th>
                        <th class="text-right py-3 px-4 font-semibold">Peso %</th>
                        <th class="text-right py-3 px-4 font-semibold">Gain/Loss</th>
                        <th class="text-right py-3 px-4 font-semibold">ROI %</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    stocks.forEach(stock => {
        const { ticker, summary } = stock;
        
        // Get titolo info
        const titoloInfo = state.csvData.titoli.find(t => t.ticker === ticker);
        const titoloNome = titoloInfo ? titoloInfo.nome : ticker;
        const tipoTitolo = titoloInfo ? titoloInfo.tipo : 'N/A';
        
        const {
            capitaleAllocato,      // ← Capitale allocato FISSO
            capitaleInvestito,     // ← Capitale effettivamente investito (cumulativo)
            valorePosizioneFinale,
            patrimonioFinale,
            cashResiduo,
            azioni,
            prezzoIngresso,
            prezzoFinale,
            gainLoss,
            roiPortafoglio,
            frazioneAttuale
        } = summary;
        
        // Calculate additional metrics
        const frazioneInizialeStr = titoloInfo ? `${titoloInfo.quota_numeratore}/${titoloInfo.quota_denominatore}` : 'N/A';
        const frazioneAttualeStr = `${(frazioneAttuale * titoloInfo.quota_denominatore).toFixed(2)}/${titoloInfo.quota_denominatore}`;
        const pesoPortafoglio = (valorePosizioneFinale / patrimonioFinale) * 100;
        const variazionePrezzo = ((prezzoFinale - prezzoIngresso) / prezzoIngresso) * 100;
        
        html += `
            <tr class="border-b border-gray-700 hover:bg-gray-750">
                <td class="py-3 px-4 font-bold text-blue-400">${ticker}</td>
                <td class="py-3 px-4">${titoloNome}</td>
                <td class="py-3 px-4 text-center">
                    <span class="px-2 py-1 rounded text-xs ${
                        tipoTitolo.includes('DIVIDEND') ? 'bg-green-900 text-green-300' :
                        tipoTitolo.includes('GROWTH') ? 'bg-blue-900 text-blue-300' :
                        'bg-purple-900 text-purple-300'
                    }">
                        ${tipoTitolo}
                    </span>
                </td>
                <td class="py-3 px-4 text-right font-medium">$${capitaleAllocato.toFixed(2)}</td>
                <td class="py-3 px-4 text-right">$${capitaleInvestito.toFixed(2)}</td>
                <td class="py-3 px-4 text-right text-gray-400">
                    <span title="Frazione iniziale: ${frazioneInizialeStr}">${frazioneAttualeStr}</span>
                </td>
                <td class="py-3 px-4 text-right">${azioni.toFixed(4)}</td>
                <td class="py-3 px-4 text-right">$${prezzoIngresso.toFixed(3)}</td>
                <td class="py-3 px-4 text-right font-medium">$${prezzoFinale.toFixed(3)}</td>
                <td class="py-3 px-4 text-right ${variazionePrezzo >= 0 ? 'text-green-400' : 'text-red-400'}">
                    ${variazionePrezzo >= 0 ? '+' : ''}${variazionePrezzo.toFixed(2)}%
                </td>
                <td class="py-3 px-4 text-right font-bold">$${valorePosizioneFinale.toFixed(2)}</td>
                <td class="py-3 px-4 text-right text-gray-400">$${cashResiduo.toFixed(2)}</td>
                <td class="py-3 px-4 text-right">${pesoPortafoglio.toFixed(2)}%</td>
                <td class="py-3 px-4 text-right font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}">
                    ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)}
                </td>
                <td class="py-3 px-4 text-right font-bold ${roiPortafoglio >= 0 ? 'text-green-400' : 'text-red-400'}">
                    ${roiPortafoglio >= 0 ? '+' : ''}${roiPortafoglio.toFixed(2)}%
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <div class="mt-4 text-xs text-gray-500 text-center">
            <i class="fas fa-info-circle mr-1"></i>
            Questa tabella mostra il riepilogo di tutti i ${stocks.length} titoli nel portafoglio
        </div>
    `;
    
    content.innerHTML = html;
}

// Render stock summary table
function renderStockSummary(results) {
    const content = document.getElementById('stockSummaryContent');
    const { ticker, summary } = results;
    
    // Get titolo info
    const titoloInfo = state.csvData.titoli.find(t => t.ticker === ticker);
    const titoloNome = titoloInfo ? titoloInfo.nome : ticker;
    const tipoTitolo = titoloInfo ? titoloInfo.tipo : 'N/A';
    
    const {
        capitaleAllocato,      // ← Capitale allocato FISSO
        capitaleInvestito,     // ← Capitale effettivamente investito (cumulativo)
        valorePosizioneFinale,
        patrimonioFinale,
        cashResiduo,
        azioni,
        prezzoIngresso,
        prezzoFinale,
        gainLoss,
        roiPortafoglio,
        frazioneAttuale
    } = summary;
    
    // Calculate additional metrics
    const frazioneInizialeStr = titoloInfo ? `${titoloInfo.quota_numeratore}/${titoloInfo.quota_denominatore}` : 'N/A';
    const frazioneAttualeStr = `${(frazioneAttuale * titoloInfo.quota_denominatore).toFixed(2)}/${titoloInfo.quota_denominatore}`;
    const pesoPortafoglio = (valorePosizioneFinale / patrimonioFinale) * 100;
    const variazionePrezzo = ((prezzoFinale - prezzoIngresso) / prezzoIngresso) * 100;
    
    let html = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b-2 border-gray-600">
                        <th class="text-left py-3 px-4 font-semibold">Ticker</th>
                        <th class="text-left py-3 px-4 font-semibold">Nome</th>
                        <th class="text-center py-3 px-4 font-semibold">Tipo</th>
                        <th class="text-right py-3 px-4 font-semibold">Capitale Allocato</th>
                        <th class="text-right py-3 px-4 font-semibold">Capitale Investito</th>
                        <th class="text-right py-3 px-4 font-semibold">Frazione</th>
                        <th class="text-right py-3 px-4 font-semibold">Azioni</th>
                        <th class="text-right py-3 px-4 font-semibold">Prezzo Ingresso</th>
                        <th class="text-right py-3 px-4 font-semibold">Prezzo Attuale</th>
                        <th class="text-right py-3 px-4 font-semibold">Var. Prezzo</th>
                        <th class="text-right py-3 px-4 font-semibold">Valore Posizione</th>
                        <th class="text-right py-3 px-4 font-semibold">Cash Residuo</th>
                        <th class="text-right py-3 px-4 font-semibold">Peso %</th>
                        <th class="text-right py-3 px-4 font-semibold">Gain/Loss</th>
                        <th class="text-right py-3 px-4 font-semibold">ROI %</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-700 hover:bg-gray-750">
                        <td class="py-3 px-4 font-bold text-blue-400">${ticker}</td>
                        <td class="py-3 px-4">${titoloNome}</td>
                        <td class="py-3 px-4 text-center">
                            <span class="px-2 py-1 rounded text-xs ${
                                tipoTitolo.includes('DIVIDEND') ? 'bg-green-900 text-green-300' :
                                tipoTitolo.includes('GROWTH') ? 'bg-blue-900 text-blue-300' :
                                'bg-purple-900 text-purple-300'
                            }">
                                ${tipoTitolo}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right font-medium">$${capitaleAllocato.toFixed(2)}</td>
                        <td class="py-3 px-4 text-right">$${capitaleInvestito.toFixed(2)}</td>
                        <td class="py-3 px-4 text-right text-gray-400">
                            <span title="Frazione iniziale: ${frazioneInizialeStr}">${frazioneAttualeStr}</span>
                        </td>
                        <td class="py-3 px-4 text-right">${azioni.toFixed(4)}</td>
                        <td class="py-3 px-4 text-right">$${prezzoIngresso.toFixed(3)}</td>
                        <td class="py-3 px-4 text-right font-medium">$${prezzoFinale.toFixed(3)}</td>
                        <td class="py-3 px-4 text-right ${variazionePrezzo >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${variazionePrezzo >= 0 ? '+' : ''}${variazionePrezzo.toFixed(2)}%
                        </td>
                        <td class="py-3 px-4 text-right font-bold">$${valorePosizioneFinale.toFixed(2)}</td>
                        <td class="py-3 px-4 text-right text-gray-400">$${cashResiduo.toFixed(2)}</td>
                        <td class="py-3 px-4 text-right">${pesoPortafoglio.toFixed(2)}%</td>
                        <td class="py-3 px-4 text-right font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)}
                        </td>
                        <td class="py-3 px-4 text-right font-bold ${roiPortafoglio >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${roiPortafoglio >= 0 ? '+' : ''}${roiPortafoglio.toFixed(2)}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="mt-4 text-xs text-gray-500 text-center">
            <i class="fas fa-info-circle mr-1"></i>
            Questa tabella mostra il riepilogo di ciascun titolo nel portafoglio
        </div>
    `;
    
    content.innerHTML = html;
}

// Render detailed history table
function renderDetailedHistory(history, ticker) {
    const content = document.getElementById('detailedContent');
    
    let html = `
        <div class="mb-4">
            <span class="text-sm text-gray-400">Storico operazioni per: </span>
            <span class="text-lg font-bold text-blue-400">${ticker}</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-700">
                        <th class="text-left py-2 px-3">Data</th>
                        <th class="text-left py-2 px-3">Evento</th>
                        <th class="text-right py-2 px-3">Azioni</th>
                        <th class="text-right py-2 px-3">Prezzo</th>
                        <th class="text-right py-2 px-3">Valore Azioni</th>
                        <th class="text-right py-2 px-3">Cash</th>
                        <th class="text-right py-2 px-3">Patrimonio</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    history.forEach(h => {
        html += `
            <tr class="border-b border-gray-800 hover:bg-gray-750">
                <td class="py-2 px-3">${h.data}</td>
                <td class="py-2 px-3 font-medium">${h.evento}</td>
                <td class="py-2 px-3 text-right">${h.azioni.toFixed(4)}</td>
                <td class="py-2 px-3 text-right">$${h.prezzo.toFixed(3)}</td>
                <td class="py-2 px-3 text-right">$${h.valoreAzioni.toFixed(2)}</td>
                <td class="py-2 px-3 text-right">$${h.cashResiduo.toFixed(2)}</td>
                <td class="py-2 px-3 text-right font-bold">$${h.patrimonioTotale.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    content.innerHTML = html;
}

// Error handling
function addError(message) {
    state.errors.push(message);
    console.error('Error:', message);
}

function showErrors() {
    if (state.errors.length === 0) return;
    
    const section = document.getElementById('errorsSection');
    const list = document.getElementById('errorsList');
    
    list.innerHTML = '';
    state.errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        list.appendChild(li);
    });
    
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth' });
}

function hideErrors() {
    document.getElementById('errorsSection').classList.add('hidden');
}

// Setup hamburger menu
function setupHamburgerMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    // Open menu
    menuToggle.addEventListener('click', () => {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    });
    
    // Close menu
    const closeMenu = () => {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    };
    
    menuClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking on menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            closeMenu();
        });
    });
    
    // Update sidebar info
    updateSidebarInfo();
}

// Update sidebar info
function updateSidebarInfo() {
    const titoliCount = state.csvData.titoli ? state.csvData.titoli.length : '-';
    const sidebarElement = document.getElementById('sidebarTitoliCount');
    if (sidebarElement) {
        sidebarElement.textContent = titoliCount;
    }
}

// Render periodo analisi + spiegazione date picker
function renderPeriodoAnalisi(periodoInfo, titoliSkipped) {
    // Trova elemento kpiSection e inserisci prima del kpiGrid
    const kpiSection = document.getElementById('kpiSection');
    const kpiGrid = document.getElementById('kpiGrid');
    
    // Rimuovi box esistente se presente
    const existingBox = document.getElementById('periodoAnalisiBox');
    if (existingBox) existingBox.remove();
    
    // Crea nuovo box
    const box = document.createElement('div');
    box.id = 'periodoAnalisiBox';
    box.className = 'bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6 border-2 border-blue-500';
    
    let html = `
        <div class="flex items-center gap-3 mb-4">
            <i class="fas fa-calendar-check text-3xl text-blue-400"></i>
            <div>
                <h3 class="text-2xl font-bold text-white">Periodo di Analisi</h3>
                <p class="text-sm text-gray-300">Come funziona il filtro Date Picker</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                <div class="text-xs text-gray-400 mb-1">
                    <i class="fas fa-calendar-alt mr-1"></i>Data Inizio
                </div>
                <div class="text-xl font-bold text-white">${periodoInfo.dataInizio}</div>
            </div>
            
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                <div class="text-xs text-gray-400 mb-1">
                    <i class="fas fa-calendar-check mr-1"></i>Data Fine
                </div>
                <div class="text-xl font-bold text-white">${periodoInfo.dataFine}</div>
            </div>
            
            <div class="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                <div class="text-xs text-gray-400 mb-1">
                    <i class="fas fa-chart-line mr-1"></i>Giorni Analisi
                </div>
                <div class="text-xl font-bold text-white">${Math.ceil((new Date(periodoInfo.dataFine) - new Date(periodoInfo.dataInizio)) / (1000 * 60 * 60 * 24))} giorni</div>
            </div>
        </div>
        
        <!-- SPIEGAZIONE LOGICA -->
        <div class="bg-yellow-900 bg-opacity-30 border-l-4 border-yellow-500 rounded-lg p-4 mb-4">
            <div class="flex items-start gap-3">
                <i class="fas fa-lightbulb text-2xl text-yellow-400 mt-1"></i>
                <div>
                    <h4 class="text-lg font-bold text-yellow-300 mb-2">📋 Come Funziona il Date Picker</h4>
                    <div class="text-sm text-gray-200 space-y-2">
                        <p><strong>REGOLA BASE:</strong> Il Date Picker definisce <strong>il periodo di analisi</strong> del portafoglio!</p>
                        
                        <p><strong>1. Titoli in Portafoglio:</strong> TUTTI i titoli in <code>info_titoli.csv</code> sono <strong>già in portafoglio</strong> con la loro frazione iniziale (es. PBR 3/4, HL 4/4).</p>
                        
                        <p><strong>2. Data Ingresso:</strong> TUTTI i titoli entrano il giorno <strong>${periodoInfo.dataInizio}</strong> (inizio del periodo di analisi) con la frazione indicata in <code>info_titoli.csv</code>.</p>
                        
                        <p><strong>3. Movimenti:</strong> Il file <code>movimenti.csv</code> contiene SOLO le modifiche (BUY/SELL) durante il periodo:</p>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>✅ <strong>BUY</strong>: Appesantimento (aumento frazione)</li>
                            <li>✅ <strong>SELL</strong>: Alleggerimento (riduzione frazione)</li>
                            <li>✅ <strong>Movimenti nel periodo</strong>: Applicati solo se tra ${periodoInfo.dataInizio} e ${periodoInfo.dataFine}</li>
                        </ul>
                        
                        <p><strong>4. Data Uscita:</strong> Tutti i titoli escono il giorno <strong>${periodoInfo.dataFine}</strong> (valutazione finale).</p>
                        
                        <p><strong>Esempio:</strong> PBR parte con 3/4 il <code>01/01/2025</code>, nessun movimento nel 2025, valutazione finale al <code>01/01/2026</code> con frazione ancora 3/4.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- TITOLI CALCOLATI -->
        <div class="bg-green-900 bg-opacity-30 border-l-4 border-green-500 rounded-lg p-4 mb-4">
            <h4 class="text-lg font-bold text-green-300 mb-2">
                <i class="fas fa-check-circle mr-2"></i>
                Titoli Calcolati: ${periodoInfo.titoliAttivi}
            </h4>
            <p class="text-sm text-gray-300">Tutti i titoli in <code>info_titoli.csv</code> vengono calcolati per il periodo ${periodoInfo.dataInizio} → ${periodoInfo.dataFine}.</p>
        </div>
    `;
    
    // Titoli skippati (se presenti)
    if (titoliSkipped && titoliSkipped.length > 0) {
        html += `
            <div class="bg-red-900 bg-opacity-30 border-l-4 border-red-500 rounded-lg p-4">
                <h4 class="text-lg font-bold text-red-300 mb-3">
                    <i class="fas fa-times-circle mr-2"></i>
                    Titoli Esclusi dal Periodo: ${titoliSkipped.length}
                </h4>
                <div class="space-y-2">
        `;
        
        titoliSkipped.forEach(t => {
            html += `
                <div class="bg-gray-900 bg-opacity-50 rounded p-3 text-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-bold text-red-400">${t.ticker}</span>
                            <span class="text-gray-300"> - ${t.nome}</span>
                        </div>
                        <div class="text-xs text-gray-400">
                            Ingresso: ${t.dataIngresso}
                        </div>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        <i class="fas fa-info-circle mr-1"></i>${t.motivo}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    box.innerHTML = html;
    
    // Inserisci prima del kpiGrid
    kpiSection.insertBefore(box, kpiGrid);
}

// Render calculations section - VITA MORTE MIRACOLI di ogni titolo (FORMATO PDF DETTAGLIATO)
function renderCalculationsSection(stocks) {
    const content = document.getElementById('calculationsContent');
    
    let html = '';
    
    stocks.forEach((stock, index) => {
        const { ticker, summary, history } = stock;
        
        // Get titolo info
        const titoloInfo = state.csvData.titoli.find(t => t.ticker === ticker);
        const titoloNome = titoloInfo ? titoloInfo.nome : ticker;
        const tipoTitolo = titoloInfo ? titoloInfo.tipo : 'N/A';
        
        html += `
            <div class="mb-12 ${index > 0 ? 'border-t-4 border-gray-600 pt-12' : ''}">
                <!-- HEADER TITOLO -->
                <div class="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-3xl font-bold text-white mb-2">
                                ${ticker} - ${titoloNome}
                            </h4>
                            <div class="flex items-center gap-4">
                                <span class="px-3 py-1 rounded text-sm font-medium ${
                                    tipoTitolo.includes('DIVIDEND') ? 'bg-green-700 text-green-200' :
                                    tipoTitolo.includes('GROWTH') ? 'bg-blue-700 text-blue-200' :
                                    'bg-purple-700 text-purple-200'
                                }">
                                    ${tipoTitolo}
                                </span>
                                <span class="text-gray-300">ISIN: ${titoloInfo ? titoloInfo.isin : 'N/A'}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-300">Patrimonio Finale</div>
                            <div class="text-3xl font-bold ${summary.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}">
                                $${summary.patrimonioFinale.toFixed(2)}
                            </div>
                            <div class="text-lg ${summary.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}">
                                ${summary.gainLoss >= 0 ? '+' : ''}$${summary.gainLoss.toFixed(2)} (${summary.roiPortafoglio.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- SETUP INIZIALE -->
                <div class="bg-gray-800 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
                    <h5 class="text-xl font-bold mb-4 text-blue-400">📋 SETUP INIZIALE</h5>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div class="text-gray-400">Capitale Allocato</div>
                            <div class="text-lg font-bold text-white">$${summary.capitaleAllocato.toFixed(2)}</div>
                        </div>
                        <div>
                            <div class="text-gray-400">Frazione Iniziale</div>
                            <div class="text-lg font-bold text-white">${titoloInfo ? titoloInfo.quota_numeratore : '?'}/${titoloInfo ? titoloInfo.quota_denominatore : '?'} (${((titoloInfo.quota_numeratore / titoloInfo.quota_denominatore) * 100).toFixed(0)}%)</div>
                        </div>
                        <div>
                            <div class="text-gray-400">Prezzo Ingresso</div>
                            <div class="text-lg font-bold text-white">$${summary.prezzoIngresso.toFixed(3)}</div>
                        </div>
                        <div>
                            <div class="text-gray-400">Azioni Iniziali</div>
                            <div class="text-lg font-bold text-white">${history[0].azioni.toFixed(4)} az</div>
                        </div>
                    </div>
                </div>
        `;
        
        // CRONOLOGIA DETTAGLIATA - FASE PER FASE
        history.forEach((h, histIndex) => {
            const isIngresso = h.evento === 'INGRESSO';
            const isBuy = h.evento.includes('BUY');
            const isSell = h.evento.includes('SELL');
            const isDividend = h.evento.includes('DIVIDEND');
            const isFine = h.evento === 'FINE PERIODO';
            
            let borderColor = 'border-gray-700';
            let bgColor = 'bg-gray-800';
            let iconColor = 'text-gray-400';
            let icon = 'fa-circle';
            let faseTitle = h.evento;
            
            if (isIngresso) {
                borderColor = 'border-blue-500';
                bgColor = 'bg-blue-900 bg-opacity-20';
                iconColor = 'text-blue-400';
                icon = 'fa-sign-in-alt';
                faseTitle = `FASE ${histIndex + 1}: INGRESSO`;
            } else if (isBuy) {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-900 bg-opacity-20';
                iconColor = 'text-green-400';
                icon = 'fa-arrow-up';
                faseTitle = `FASE ${histIndex + 1}: APPESANTIMENTO ${h.evento.replace('BUY ', '')}`;
            } else if (isSell) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-900 bg-opacity-20';
                iconColor = 'text-red-400';
                icon = 'fa-arrow-down';
                faseTitle = `FASE ${histIndex + 1}: ALLEGGERIMENTO ${h.evento.replace('SELL ', '')}`;
            } else if (isDividend) {
                borderColor = 'border-yellow-500';
                bgColor = 'bg-yellow-900 bg-opacity-20';
                iconColor = 'text-yellow-400';
                icon = 'fa-coins';
                faseTitle = `FASE ${histIndex + 1}: DIVIDENDO`;
            } else if (isFine) {
                borderColor = 'border-purple-500';
                bgColor = 'bg-purple-900 bg-opacity-20';
                iconColor = 'text-purple-400';
                icon = 'fa-flag-checkered';
                faseTitle = `FASE ${histIndex + 1}: VALUTAZIONE FINALE`;
            }
            
            html += `
                <div class="mb-6 border-l-4 ${borderColor} ${bgColor} rounded-lg p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <i class="fas ${icon} text-2xl ${iconColor}"></i>
                        <div>
                            <h6 class="text-lg font-bold text-white">${faseTitle}</h6>
                            <div class="text-sm text-gray-400">${h.data}</div>
                        </div>
                    </div>
                    
                    <!-- DETTAGLI OPERAZIONE -->
                    ${h.dettagli ? `
                        <div class="bg-gray-900 bg-opacity-50 rounded p-3 mb-4 text-sm text-gray-300">
                            <i class="fas fa-info-circle mr-2 ${iconColor}"></i>
                            ${h.dettagli}
                        </div>
                    ` : ''}
                    
                    ${h.note ? `
                        <div class="bg-gray-900 bg-opacity-50 rounded p-3 mb-4 text-sm italic text-gray-400">
                            <i class="fas fa-sticky-note mr-2"></i>
                            ${h.note}
                        </div>
                    ` : ''}
                    
                    <!-- STEP BY STEP -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                            <div class="text-xs text-gray-400 mb-1">
                                <i class="fas fa-chart-line mr-1"></i>Prezzo
                            </div>
                            <div class="text-lg font-bold text-white">$${h.prezzo.toFixed(3)}</div>
                        </div>
                        
                        <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                            <div class="text-xs text-gray-400 mb-1">
                                <i class="fas fa-layer-group mr-1"></i>Azioni Possedute
                            </div>
                            <div class="text-lg font-bold text-white">${h.azioni.toFixed(4)} az</div>
                        </div>
                        
                        <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                            <div class="text-xs text-gray-400 mb-1">
                                <i class="fas fa-chart-area mr-1"></i>Valore Azioni
                            </div>
                            <div class="text-lg font-bold text-green-400">$${h.valoreAzioni.toFixed(2)}</div>
                        </div>
                        
                        <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                            <div class="text-xs text-gray-400 mb-1">
                                <i class="fas fa-wallet mr-1"></i>Cash Residuo
                            </div>
                            <div class="text-lg font-bold text-blue-400">$${h.cashResiduo.toFixed(2)}</div>
                        </div>
                        
                        <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                            <div class="text-xs text-gray-400 mb-1">
                                <i class="fas fa-piggy-bank mr-1"></i>Patrimonio Totale
                            </div>
                            <div class="text-lg font-bold text-purple-400">$${h.patrimonioTotale.toFixed(2)}</div>
                        </div>
                        
                        ${h.frazioneAttuale !== undefined ? `
                            <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                                <div class="text-xs text-gray-400 mb-1">
                                    <i class="fas fa-percentage mr-1"></i>Frazione Attuale
                                </div>
                                <div class="text-lg font-bold text-yellow-400">${h.frazioneAttuale.toFixed(2)}</div>
                            </div>
                        ` : ''}
                        
                        ${h.dividendoTotale !== undefined ? `
                            <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                                <div class="text-xs text-gray-400 mb-1">
                                    <i class="fas fa-coins mr-1"></i>Dividendo Ricevuto
                                </div>
                                <div class="text-lg font-bold text-yellow-400">$${h.dividendoTotale.toFixed(2)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        // RISULTATO FINALE
        html += `
                <div class="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 mt-6">
                    <h5 class="text-xl font-bold mb-4 text-white">
                        <i class="fas fa-trophy mr-2 text-yellow-400"></i>
                        RISULTATO FINALE - ${ticker}
                    </h5>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div class="text-sm text-gray-300">Capitale Allocato</div>
                            <div class="text-xl font-bold text-white">$${summary.capitaleAllocato.toFixed(2)}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-300">Capitale Investito</div>
                            <div class="text-xl font-bold text-white">$${summary.capitaleInvestito.toFixed(2)}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-300">Cash Residuo</div>
                            <div class="text-xl font-bold text-blue-400">$${summary.cashResiduo.toFixed(2)}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-300">Azioni Finali</div>
                            <div class="text-xl font-bold text-white">${summary.azioni.toFixed(4)} az</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-300">Valore Posizione</div>
                            <div class="text-xl font-bold text-green-400">$${summary.valorePosizioneFinale.toFixed(2)}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-300">Patrimonio Totale</div>
                            <div class="text-xl font-bold text-purple-400">$${summary.patrimonioFinale.toFixed(2)}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-300">Gain/Loss</div>
                            <div class="text-xl font-bold ${summary.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}">
                                ${summary.gainLoss >= 0 ? '+' : ''}$${summary.gainLoss.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-300">ROI Portafoglio</div>
                            <div class="text-xl font-bold ${summary.roiPortafoglio >= 0 ? 'text-green-400' : 'text-red-400'}">
                                ${summary.roiPortafoglio >= 0 ? '+' : ''}${summary.roiPortafoglio.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
}
