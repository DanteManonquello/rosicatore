/**
 * ROSICATORE v2.3.0 - Performance Calculator con Multi-Posizioni e KPI
 */

let parsedMovimenti = [];
let parsedDividendi = [];
let positions = {}; // { ticker: Position instance }
let selectedPositionTicker = null;

// ===================================================================
// GESTIONE POSIZIONI
// ===================================================================

// Toggle calculator
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

// Crea nuova posizione
document.getElementById('createPositionBtn').addEventListener('click', () => {
    const ticker = document.getElementById('newTicker').value.trim().toUpperCase();
    const name = document.getElementById('newName').value.trim();
    const isin = document.getElementById('newISIN').value.trim();
    const dateStart = document.getElementById('newDateStart').value;
    const fracNum = parseInt(document.getElementById('newFracNum').value);
    const fracDen = parseInt(document.getElementById('newFracDen').value);
    const csvData = document.getElementById('newPriceCSV').value.trim();
    
    // Validazioni
    if (!ticker) {
        alert('⚠️ Inserisci il ticker!');
        return;
    }
    if (!name) {
        alert('⚠️ Inserisci il nome del titolo!');
        return;
    }
    if (!dateStart) {
        alert('⚠️ Seleziona la data di ingresso!');
        return;
    }
    if (fracNum <= 0 || fracDen <= 0) {
        alert('⚠️ Frazione iniziale non valida!');
        return;
    }
    
    // Check duplicati
    if (positions[ticker]) {
        alert('⚠️ Posizione ' + ticker + ' già esistente!');
        return;
    }
    
    // Crea Position instance
    try {
        const position = new Position(ticker, name, isin, 'NYSE', dateStart, fracNum, fracDen);
        
        // Load CSV se fornito
        if (csvData) {
            position.loadPriceHistory(csvData);
        }
        
        positions[ticker] = position;
        
        // Clear form
        document.getElementById('newTicker').value = '';
        document.getElementById('newName').value = '';
        document.getElementById('newISIN').value = '';
        document.getElementById('newDateStart').value = '';
        document.getElementById('newFracNum').value = '1';
        document.getElementById('newFracDen').value = '4';
        document.getElementById('newPriceCSV').value = '';
        
        updatePositionsList();
        updatePositionSelects();
        
        alert('✅ Posizione ' + ticker + ' creata!');
    } catch (error) {
        alert('❌ Errore: ' + error.message);
    }
});

// Aggiorna lista posizioni
function updatePositionsList() {
    const container = document.getElementById('positionsContainer');
    
    if (Object.keys(positions).length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm italic">Nessuna posizione creata. Crea la prima!</p>';
        return;
    }
    
    container.innerHTML = Object.keys(positions).map(ticker => {
        const pos = positions[ticker];
        return '<div class="flex items-center justify-between bg-purple-100 rounded-lg p-3">' +
            '<div>' +
            '<span class="font-bold text-purple-800">' + pos.ticker + '</span>' +
            '<span class="text-gray-600 ml-2">(' + pos.name + ')</span>' +
            '<span class="text-xs text-gray-500 ml-2">ISIN: ' + pos.isin + '</span>' +
            '</div>' +
            '<button onclick="deletePosition(\'' + ticker + '\')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">' +
            '<i class="fas fa-trash"></i> Elimina' +
            '</button>' +
            '</div>';
    }).join('');
}

// Elimina posizione
window.deletePosition = function(ticker) {
    if (confirm('Eliminare posizione ' + ticker + '?')) {
        delete positions[ticker];
        updatePositionsList();
        updatePositionSelects();
        alert('✅ Posizione eliminata');
    }
};

// Aggiorna select posizioni
function updatePositionSelects() {
    const movSelect = document.getElementById('movimentiPositionSelect');
    const divSelect = document.getElementById('dividendiPositionSelect');
    
    const options = '<option value="">Seleziona posizione...</option>' +
        Object.keys(positions).map(ticker => 
            '<option value="' + ticker + '">' + ticker + ' - ' + positions[ticker].name + '</option>'
        ).join('');
    
    movSelect.innerHTML = options;
    divSelect.innerHTML = options;
}

// ===================================================================
// PARSER MOVIMENTI
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
                '<span class="font-bold">' + (i + 1) + '.</span>' +
                '<span class="' + tipoColor + ' font-bold">' + m.type + '</span>' +
                '<span>' + m.date + '</span>' +
                '<span class="font-mono">' + m.numerator + '/' + m.denominator + '</span>' +
                '<span class="text-gray-500">' + m.ticker + '</span>' +
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
            '<code class="text-xs">' + e.testo + '</code>' +
            '</div>'
        ).join('');
    } else {
        errorsDiv.classList.add('hidden');
    }
    
    alert('✅ Trovati ' + movimenti.length + ' movimenti (' + errori.length + ' errori)');
});

// Applica movimenti
document.getElementById('applyMovimentiBtn').addEventListener('click', () => {
    const ticker = document.getElementById('movimentiPositionSelect').value;
    
    if (!ticker) {
        alert('⚠️ Seleziona una posizione!');
        return;
    }
    
    if (parsedMovimenti.length === 0) {
        alert('⚠️ Nessun movimento da applicare!');
        return;
    }
    
    const position = positions[ticker];
    let successi = 0;
    let falliti = 0;
    
    for (const mov of parsedMovimenti) {
        try {
            if (mov.type === 'BUY') {
                position.buyFraction(mov.date, mov.numerator, mov.denominator, mov.notes);
            } else if (mov.type === 'SELL') {
                position.sellFraction(mov.date, mov.numerator, mov.denominator, mov.notes);
            }
            successi++;
        } catch (error) {
            console.error('Errore movimento:', error);
            falliti++;
        }
    }
    
    alert('✅ Applicati ' + successi + ' movimenti a ' + ticker + ' (' + falliti + ' falliti)');
    
    // Clear
    document.getElementById('movimentiInput').value = '';
    document.getElementById('movimentiPreview').classList.add('hidden');
    parsedMovimenti = [];
});

// ===================================================================
// PARSER DIVIDENDI
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
            '<span class="font-bold">' + (i + 1) + '.</span>' +
            '<span>' + d.date + '</span>' +
            '<span class="text-green-600 font-mono font-bold">$' + d.amount.toFixed(4) + '</span>' +
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
            '<code class="text-xs">' + e.testo + '</code>' +
            '</div>'
        ).join('');
    } else {
        errorsDiv.classList.add('hidden');
    }
    
    alert('✅ Trovati ' + dividendi.length + ' dividendi (' + errori.length + ' errori)');
});

// Applica dividendi
document.getElementById('applyDividendiBtn').addEventListener('click', () => {
    const ticker = document.getElementById('dividendiPositionSelect').value;
    
    if (!ticker) {
        alert('⚠️ Seleziona una posizione!');
        return;
    }
    
    if (parsedDividendi.length === 0) {
        alert('⚠️ Nessun dividendo da applicare!');
        return;
    }
    
    const position = positions[ticker];
    let successi = 0;
    let falliti = 0;
    
    for (const div of parsedDividendi) {
        try {
            position.addDividend(div.date, div.amount, 'Dividendo $' + div.amount + '/share');
            successi++;
        } catch (error) {
            console.error('Errore dividendo:', error);
            falliti++;
        }
    }
    
    alert('✅ Applicati ' + successi + ' dividendi a ' + ticker + ' (' + falliti + ' falliti)');
    
    // Clear
    document.getElementById('dividendiInput').value = '';
    document.getElementById('dividendiPreview').classList.add('hidden');
    parsedDividendi = [];
});

// ===================================================================
// CALCOLA PERFORMANCE
// ===================================================================

document.getElementById('calculatePerformanceBtn').addEventListener('click', () => {
    if (Object.keys(positions).length === 0) {
        alert('⚠️ Nessuna posizione da calcolare!');
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

// Crea card KPI per una posizione
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
