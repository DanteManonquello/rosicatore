/**
 * ROSICATORE v2.4.0 - Workflow Semplificato
 * Upload multiplo CSV → Data globale → Parser auto-crea titoli
 */

let uploadedCSVs = {}; // { 'HL': 'Date,Price\n...', 'EQT': '...' }
let parsedMovimenti = [];
let parsedDividendi = [];
let positions = {}; // { 'HL': Position instance }

// ===================================================================
// TOGGLE CALCULATOR
// ===================================================================

document.getElementById('toggle-calculator').addEventListener('click', () => {
    const section = document.getElementById('calculator-section');
    const icon = document.querySelector('#toggle-calculator i:last-child');
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        section.classList.add('hidden');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
});

// ===================================================================
// STEP 1: UPLOAD CSV MULTIPLI
// ===================================================================

document.getElementById('csvFiles').addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    uploadedCSVs = {};
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = file.name;
        
        // Estrai ticker dal nome file (es: HL.csv → HL)
        const ticker = filename.replace('.csv', '').toUpperCase();
        
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedCSVs[ticker] = event.target.result;
            updateUploadedFilesList();
        };
        reader.readAsText(file);
    }
});

function updateUploadedFilesList() {
    const container = document.getElementById('filesContainer');
    const filesDiv = document.getElementById('uploadedFiles');
    
    if (Object.keys(uploadedCSVs).length === 0) {
        filesDiv.classList.add('hidden');
        return;
    }
    
    filesDiv.classList.remove('hidden');
    container.innerHTML = Object.keys(uploadedCSVs).map(ticker => 
        '<div class="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center">' +
        '<i class="fas fa-file-csv text-green-600 text-2xl mb-1"></i>' +
        '<div class="font-bold text-green-800">' + ticker + '</div>' +
        '<div class="text-xs text-gray-600">' + ticker + '.csv</div>' +
        '<button onclick="removeCSV(\'' + ticker + '\')" class="mt-2 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">' +
        '<i class="fas fa-times"></i> Rimuovi' +
        '</button>' +
        '</div>'
    ).join('');
}

window.removeCSV = function(ticker) {
    delete uploadedCSVs[ticker];
    updateUploadedFilesList();
};

// ===================================================================
// STEP 2: PARSER MOVIMENTI (AUTO-CREA TITOLI)
// ===================================================================

document.getElementById('parseMovimentiBtn').addEventListener('click', () => {
    const text = document.getElementById('movimentiInput').value;
    if (!text.trim()) {
        alert('⚠️ Incolla prima i movimenti!');
        return;
    }
    
    const { movimenti, errori } = RosicatoreParser.parseMovimentiText(text);
    parsedMovimenti = movimenti;
    
    // Show preview
    const previewDiv = document.getElementById('movimentiPreview');
    const previewList = document.getElementById('movimentiPreviewList');
    
    if (movimenti.length > 0) {
        previewDiv.classList.remove('hidden');
        previewList.innerHTML = movimenti.map((m, i) => {
            const tipoColor = m.type === 'BUY' ? 'text-green-600' : 'text-red-600';
            return '<div class="flex items-center gap-2 p-2 bg-white rounded">' +
                '<span class="font-bold text-gray-600">' + (i + 1) + '.</span>' +
                '<span class="' + tipoColor + ' font-bold">' + m.type + '</span>' +
                '<span class="text-gray-700">' + m.date + '</span>' +
                '<span class="font-mono bg-blue-100 px-2 py-1 rounded">' + m.numerator + '/' + m.denominator + '</span>' +
                '<span class="text-purple-700 font-bold">' + m.ticker + '</span>' +
                '</div>';
        }).join('');
    }
    
    // Show errors
    const errorsDiv = document.getElementById('movimentiErrors');
    const errorsList = document.getElementById('movimentiErrorsList');
    
    if (errori.length > 0) {
        errorsDiv.classList.remove('hidden');
        errorsList.innerHTML = errori.map(e => 
            '<div class="p-2 bg-white rounded">' +
            '<strong>Riga ' + e.riga + ':</strong> ' + e.errore + '<br>' +
            '<code class="text-xs bg-gray-200 px-1">' + e.testo + '</code>' +
            '</div>'
        ).join('');
    } else {
        errorsDiv.classList.add('hidden');
    }
    
    alert('✅ Trovati ' + movimenti.length + ' movimenti (' + errori.length + ' errori)');
    
    // Auto-crea titoli
    autoCreatePositions();
});

// ===================================================================
// STEP 2: PARSER DIVIDENDI (AUTO-ASSOCIA AI TITOLI)
// ===================================================================

document.getElementById('parseDividendiBtn').addEventListener('click', () => {
    const text = document.getElementById('dividendiInput').value;
    if (!text.trim()) {
        alert('⚠️ Incolla prima i dividendi!');
        return;
    }
    
    const { dividendi, errori } = RosicatoreParser.parseDividendiText(text);
    parsedDividendi = dividendi;
    
    // Show preview
    const previewDiv = document.getElementById('dividendiPreview');
    const previewList = document.getElementById('dividendiPreviewList');
    
    if (dividendi.length > 0) {
        previewDiv.classList.remove('hidden');
        previewList.innerHTML = dividendi.map((d, i) => 
            '<div class="flex items-center gap-2 p-2 bg-white rounded">' +
            '<span class="font-bold text-gray-600">' + (i + 1) + '.</span>' +
            '<span class="text-gray-700">' + d.date + '</span>' +
            '<span class="text-green-600 font-mono font-bold">$' + d.amount.toFixed(4) + '</span>' +
            (d.ticker ? '<span class="text-purple-700 font-bold">' + d.ticker + '</span>' : '') +
            '</div>'
        ).join('');
    }
    
    // Show errors
    const errorsDiv = document.getElementById('dividendiErrors');
    const errorsList = document.getElementById('dividendiErrorsList');
    
    if (errori.length > 0) {
        errorsDiv.classList.remove('hidden');
        errorsList.innerHTML = errori.map(e => 
            '<div class="p-2 bg-white rounded">' +
            '<strong>Riga ' + e.riga + ':</strong> ' + e.errore + '<br>' +
            '<code class="text-xs bg-gray-200 px-1">' + e.testo + '</code>' +
            '</div>'
        ).join('');
    } else {
        errorsDiv.classList.add('hidden');
    }
    
    alert('✅ Trovati ' + dividendi.length + ' dividendi (' + errori.length + ' errori)');
});

// ===================================================================
// AUTO-CREA POSIZIONI DAI TICKER RILEVATI
// ===================================================================

function autoCreatePositions() {
    const globalDate = document.getElementById('globalDateStart').value;
    const globalFracNum = parseInt(document.getElementById('globalFracNum').value);
    const globalFracDen = parseInt(document.getElementById('globalFracDen').value);
    
    if (!globalDate) {
        alert('⚠️ Imposta prima la data globale!');
        return;
    }
    
    // Estrai tutti i ticker unici dai movimenti
    const tickers = [...new Set(parsedMovimenti.map(m => m.ticker))];
    
    for (const ticker of tickers) {
        if (positions[ticker]) {
            console.log('Posizione ' + ticker + ' già esistente, skip');
            continue;
        }
        
        // Crea Position
        try {
            const name = ticker; // Default name = ticker
            const isin = parsedMovimenti.find(m => m.ticker === ticker)?.isin || '';
            
            const position = new Position(ticker, name, isin, 'NYSE', globalDate, globalFracNum, globalFracDen);
            
            // Carica CSV se disponibile
            if (uploadedCSVs[ticker]) {
                position.loadPriceHistory(uploadedCSVs[ticker]);
            }
            
            // Applica movimenti del ticker
            for (const mov of parsedMovimenti) {
                if (mov.ticker === ticker) {
                    if (mov.type === 'BUY') {
                        position.buyFraction(mov.date, mov.numerator, mov.denominator, mov.notes);
                    } else if (mov.type === 'SELL') {
                        position.sellFraction(mov.date, mov.numerator, mov.denominator, mov.notes);
                    }
                }
            }
            
            // Applica dividendi del ticker
            for (const div of parsedDividendi) {
                if (div.ticker === ticker) {
                    position.addDividend(div.date, div.amount, 'Dividendo $' + div.amount);
                }
            }
            
            positions[ticker] = position;
            console.log('✅ Creata posizione ' + ticker);
            
        } catch (error) {
            console.error('❌ Errore creando ' + ticker + ':', error);
        }
    }
    
    updateDetectedStocks();
}

// Mostra titoli rilevati
function updateDetectedStocks() {
    const container = document.getElementById('stocksList');
    const section = document.getElementById('detectedStocks');
    
    if (Object.keys(positions).length === 0) {
        section.classList.add('hidden');
        return;
    }
    
    section.classList.remove('hidden');
    container.innerHTML = Object.keys(positions).map(ticker => {
        const pos = positions[ticker];
        return '<div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">' +
            '<div class="flex items-center justify-between mb-2">' +
            '<span class="text-2xl font-bold text-green-700">' + ticker + '</span>' +
            '<i class="fas fa-check-circle text-green-500 text-xl"></i>' +
            '</div>' +
            '<div class="text-sm text-gray-700">' +
            '<div>Transazioni: <strong>' + pos.transactions.length + '</strong></div>' +
            '<div>Data ingresso: <strong>' + pos.dateStart + '</strong></div>' +
            '<div>Frazione: <strong>' + pos.initialFractionNum + '/' + pos.initialFractionDen + '</strong></div>' +
            '</div>' +
            '</div>';
    }).join('');
}

// ===================================================================
// STEP 3: CALCOLA PERFORMANCE
// ===================================================================

document.getElementById('calculatePerformanceBtn').addEventListener('click', () => {
    if (Object.keys(positions).length === 0) {
        alert('⚠️ Nessun titolo rilevato! Prima:\n1. Carica CSV\n2. Imposta data globale\n3. Incolla movimenti/dividendi');
        return;
    }
    
    const resultsDiv = document.getElementById('risultatiCalcolo');
    const contentDiv = document.getElementById('risultatiContent');
    
    resultsDiv.classList.remove('hidden');
    contentDiv.innerHTML = '';
    
    // Calcola performance per ogni posizione
    for (const ticker of Object.keys(positions)) {
        const pos = positions[ticker];
        const kpis = pos.calculateKPIs();
        
        // Render KPI card
        const card = createKPICard(pos, kpis);
        contentDiv.innerHTML += card;
    }
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
});

// Crea card KPI
function createKPICard(position, kpis) {
    return '<div class="bg-white rounded-lg shadow-xl p-6 border-2 border-green-200">' +
        '<h4 class="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">' +
        '<i class="fas fa-chart-line"></i>' +
        position.ticker + ' - ' + position.name +
        '</h4>' +
        
        // Metriche principali
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">' +
        createMetricBox('ROI Totale', kpis.roi.toFixed(2) + '%', kpis.roi >= 0 ? 'green' : 'red') +
        createMetricBox('Capitale Attuale', '$' + kpis.currentValue.toFixed(2), 'blue') +
        createMetricBox('Gain/Loss', '$' + kpis.totalGainLoss.toFixed(2), kpis.totalGainLoss >= 0 ? 'green' : 'red') +
        '</div>' +
        
        // ROI Metrics
        '<div class="bg-gray-50 rounded-lg p-4 mb-4">' +
        '<h5 class="font-bold text-gray-700 mb-3">📊 ROI Metrics</h5>' +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">' +
        createSmallMetric('ROI Simple', kpis.roiMetrics.roiSimple.toFixed(2) + '%') +
        createSmallMetric('ROI Weighted', kpis.roiMetrics.roiWeighted.toFixed(2) + '%') +
        createSmallMetric('ROI Annualized', kpis.roiMetrics.roiAnnualized.toFixed(2) + '%') +
        createSmallMetric('ROI Total', kpis.roiMetrics.roiTotal.toFixed(2) + '%') +
        '</div>' +
        '</div>' +
        
        // Risk Metrics
        '<div class="bg-gray-50 rounded-lg p-4 mb-4">' +
        '<h5 class="font-bold text-gray-700 mb-3">⚠️ Risk Metrics</h5>' +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">' +
        createSmallMetric('Sharpe Ratio', kpis.riskMetrics.sharpeRatio.toFixed(2)) +
        createSmallMetric('Sortino Ratio', kpis.riskMetrics.sortinoRatio.toFixed(2)) +
        createSmallMetric('Max Drawdown', kpis.riskMetrics.maxDrawdown.toFixed(2) + '%') +
        createSmallMetric('Volatility', kpis.riskMetrics.volatility.toFixed(2) + '%') +
        '</div>' +
        '</div>' +
        
        // Transazioni
        '<div class="bg-gray-50 rounded-lg p-4">' +
        '<h5 class="font-bold text-gray-700 mb-3">📋 Transazioni</h5>' +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">' +
        createSmallMetric('Totale Trans.', position.transactions.length) +
        createSmallMetric('Acquisti', position.transactions.filter(t => t.type === 'BUY').length) +
        createSmallMetric('Vendite', position.transactions.filter(t => t.type === 'SELL').length) +
        createSmallMetric('Dividendi', position.transactions.filter(t => t.type === 'DIVIDEND').length) +
        '</div>' +
        '</div>' +
        
        '</div>';
}

function createMetricBox(label, value, color) {
    const colors = {
        green: 'bg-green-100 border-green-300 text-green-800',
        red: 'bg-red-100 border-red-300 text-red-800',
        blue: 'bg-blue-100 border-blue-300 text-blue-800'
    };
    
    return '<div class="' + colors[color] + ' rounded-lg p-4 border-2">' +
        '<div class="text-sm font-semibold mb-1">' + label + '</div>' +
        '<div class="text-2xl font-bold">' + value + '</div>' +
        '</div>';
}

function createSmallMetric(label, value) {
    return '<div class="bg-white rounded p-2">' +
        '<div class="text-xs text-gray-600">' + label + '</div>' +
        '<div class="font-bold text-gray-800">' + value + '</div>' +
        '</div>';
}
