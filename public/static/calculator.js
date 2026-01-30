/**
 * ROSICATORE v2.2.0 - Performance Calculator UI Logic
 */

let parsedMovimenti = [];
let parsedDividendi = [];
let currentPosition = null;

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

// Parse Movimenti
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

// Parse Dividendi
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
