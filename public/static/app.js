// Rosicatore v3.0.2 - Portfolio Tracker Calculator
// Main Application Logic

// Global state
const state = {
    csvData: {
        titoli: null,
        valori: null,
        movimenti: null,
        dividendi: null
    },
    config: {
        capitaleTotale: 2000,
        dataInizio: null,
        dataFine: null
    },
    results: null,
    errors: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeDatePickers();
    setupFileUploads();
    setupCalculateButton();
});

// Set default dates (last 6 months)
function initializeDatePickers() {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    document.getElementById('dataInizio').value = formatDateForInput(sixMonthsAgo);
    document.getElementById('dataFine').value = formatDateForInput(today);
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

// Handle file upload (shared for input and drag&drop)
async function handleFileUpload(file, type, status) {
    status.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Caricamento...';
    
    try {
        const data = await parseCSV(file);
        state.csvData[type] = data;
        status.innerHTML = `<i class="fas fa-check-circle mr-1 status-loaded"></i>${file.name} ✓`;
        status.className = 'mt-3 text-xs status-loaded';
        
        // Validate data
        validateCSV(type, data);
        
    } catch (error) {
        status.innerHTML = '<i class="fas fa-times-circle mr-1 status-error"></i>Errore: ' + error.message;
        status.className = 'mt-3 text-xs status-error';
        state.csvData[type] = null;
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
    
    // MULTI-TICKER: Calculate for ALL tickers
    const allResults = [];
    
    for (const titoloInfo of titoli) {
        const ticker = titoloInfo.ticker;
        
        console.log('Calculating for ticker:', ticker);
        console.log('Titolo info:', titoloInfo);
        
        try {
            const result = calculateSingleTicker(ticker, titoloInfo, capitaleTotale, dataInizio, dataFine, valori, movimenti, dividendi);
            allResults.push(result);
        } catch (error) {
            console.error(`Error calculating ${ticker}:`, error);
            addError(`Errore calcolo ${ticker}: ${error.message}`);
        }
    }
    
    if (allResults.length === 0) {
        throw new Error('Nessun titolo calcolato con successo');
    }
    
    // Return all results
    return {
        stocks: allResults,
        totalPatrimonio: allResults.reduce((sum, r) => sum + r.summary.patrimonioFinale, 0),
        totalGainLoss: allResults.reduce((sum, r) => sum + r.summary.gainLoss, 0)
    };
}

// Calculate single ticker
function calculateSingleTicker(ticker, titoloInfo, capitaleTotalePortafoglio, dataInizio, dataFine, valori, movimenti, dividendi) {
    
    // Calculate capital allocated for THIS ticker based on fraction
    const frazioneIniziale = titoloInfo.quota_numeratore / titoloInfo.quota_denominatore;
    const capitaleAllocato = capitaleTotalePortafoglio * frazioneIniziale;  // ← Capitale per QUESTO titolo
    const capitaleInvestito = capitaleAllocato;  // Initially all allocated capital is invested
    
    const prezzoIngresso = getPrezzoByDate(valori, dataInizio, ticker);
    if (!prezzoIngresso) {
        throw new Error(`Prezzo ingresso non trovato per ${ticker} data ${dataInizio}`);
    }
    
    let azioni = capitaleInvestito / prezzoIngresso;
    let cashResiduo = 0;  // Initially no cash for this ticker (all invested)
    let frazioneAttuale = frazioneIniziale;
    
    console.log('Ingresso:', { capitaleInvestito, prezzoIngresso, azioni, cashResiduo, frazioneAttuale });
    
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
        patrimonioTotale: (azioni * prezzoIngresso) + cashResiduo
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
            // APPESANTIMENTO
            const frazione = evento.frazione_num / evento.frazione_den;
            const capitaleNuovo = capitaleAllocato * frazione;  // ← USA capitaleAllocato del titolo
            const azioniNuove = capitaleNuovo / prezzoEvento;
            
            azioni += azioniNuove;
            cashResiduo -= capitaleNuovo;
            frazioneAttuale += frazione;
            
            history.push({
                data: dataEvento,
                evento: `BUY +${evento.frazione_num}/${evento.frazione_den}`,
                azioni,
                prezzo: prezzoEvento,
                valoreAzioni: azioni * prezzoEvento,
                cashResiduo,
                patrimonioTotale: (azioni * prezzoEvento) + cashResiduo,
                note: evento.note
            });
            
        } else if (evento.tipo === 'SELL') {
            // ALLEGGERIMENTO
            const valoreAttuale = azioni * prezzoEvento;
            const frazione = evento.frazione_num / evento.frazione_den;
            const valoreDaVendere = valoreAttuale * frazione;
            const azioniDaVendere = valoreDaVendere / prezzoEvento;
            
            azioni -= azioniDaVendere;
            cashResiduo += valoreDaVendere;
            frazioneAttuale -= frazione;
            
            history.push({
                data: dataEvento,
                evento: `SELL -${evento.frazione_num}/${evento.frazione_den}`,
                azioni,
                prezzo: prezzoEvento,
                valoreAzioni: azioni * prezzoEvento,
                cashResiduo,
                patrimonioTotale: (azioni * prezzoEvento) + cashResiduo,
                note: evento.note
            });
            
        } else if (evento.tipo === 'DIVIDEND') {
            // DIVIDENDO REINVESTITO
            const dividendoTotale = azioni * evento.importo;
            const azioniNuove = dividendoTotale / prezzoEvento;
            
            azioni += azioniNuove;
            // NO cash update (reinvested)
            
            history.push({
                data: dataEvento,
                evento: `DIVIDEND $${evento.importo}`,
                azioni,
                prezzo: prezzoEvento,
                valoreAzioni: azioni * prezzoEvento,
                cashResiduo,
                patrimonioTotale: (azioni * prezzoEvento) + cashResiduo,
                dividendoTotale,
                azioniNuove
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
    const gainLoss = patrimonioFinale - capitaleAllocato;  // ← Gain vs capitale ALLOCATO
    const roiPortafoglio = (gainLoss / capitaleAllocato) * 100;
    
    history.push({
        data: dataFine,
        evento: 'FINE PERIODO',
        azioni,
        prezzo: prezzoFinale,
        valoreAzioni: valorePosizioneFinale,
        cashResiduo,
        patrimonioTotale: patrimonioFinale
    });
    
    // Calculate KPIs
    const kpis = calculateKPIs({
        ticker,
        capitaleAllocato,  // ← Passa capitale ALLOCATO
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
            capitaleAllocato,  // ← Capitale ALLOCATO per questo titolo
            valorePosizioneFinale,
            patrimonioFinale,
            cashResiduo,
            azioni,
            prezzoIngresso,
            prezzoFinale,
            gainLoss,
            roiPortafoglio
        }
    };
}

// Get price by date from valori CSV
// NOTE: For now, assumes single CSV with all prices
// TODO: Support multiple CSV files (one per ticker)
function getPrezzoByDate(valori, targetDate, ticker) {
    // Convert date formats
    const target = dayjs(targetDate);
    
    // Find exact match or closest date
    let closestPrice = null;
    let minDiff = Infinity;
    
    valori.forEach(row => {
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
        capitaleAllocato,  // ← Cambiato da capitaleTotale
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
    const capitaleInvestito = capitaleAllocato * frazioneAttuale;  // ← USA capitaleAllocato
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
            capitaleAllocato,  // ← Cambiato da capitaleTotale
            valorePosizioneFinale,
            patrimonioFinale,
            cashResiduo,
            azioni,
            prezzoIngresso,
            prezzoFinale,
            gainLoss,
            roiPortafoglio
        } = summary;
        
        // Calculate additional metrics
        const capitaleInvestito = capitaleAllocato - cashResiduo;  // ← USA capitaleAllocato
        const frazioneInvestita = titoloInfo ? `${titoloInfo.quota_numeratore}/${titoloInfo.quota_denominatore}` : 'N/A';
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
                <td class="py-3 px-4 text-right text-gray-400">${frazioneInvestita}</td>
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
        capitaleTotale,
        valorePosizioneFinale,
        patrimonioFinale,
        cashResiduo,
        azioni,
        prezzoIngresso,
        prezzoFinale,
        gainLoss,
        roiPortafoglio
    } = summary;
    
    // Calculate additional metrics
    const capitaleInvestito = valorePosizioneFinale - gainLoss + (capitaleTotale - patrimonioFinale);
    const frazioneInvestita = titoloInfo ? `${titoloInfo.quota_numeratore}/${titoloInfo.quota_denominatore}` : 'N/A';
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
                        <td class="py-3 px-4 text-right font-medium">$${capitaleTotale.toFixed(2)}</td>
                        <td class="py-3 px-4 text-right">$${capitaleInvestito.toFixed(2)}</td>
                        <td class="py-3 px-4 text-right text-gray-400">${frazioneInvestita}</td>
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
