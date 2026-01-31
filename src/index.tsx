import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// In-memory storage for uploaded CSV data
const stockData: Record<string, any[]> = {}

// API: Upload CSV data
app.post('/api/upload', async (c) => {
  try {
    const body = await c.req.json()
    const { trackId, csvData, filename } = body
    
    if (!trackId || !csvData) {
      return c.json({ error: 'Missing trackId or csvData' }, 400)
    }
    
    // Parse CSV data
    const lines = csvData.split('\n').filter((line: string) => line.trim())
    const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim())
    
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.replace(/"/g, '').trim())
      if (values.length === headers.length) {
        const row: any = {}
        headers.forEach((header: string, index: number) => {
          row[header] = values[index]
        })
        data.push(row)
      }
    }
    
    stockData[trackId] = {
      filename: filename || 'unknown',
      data: data
    }
    
    return c.json({ 
      success: true, 
      trackId, 
      filename,
      rowCount: data.length 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// API: Get track data
app.get('/api/track/:trackId', (c) => {
  const trackId = c.req.param('trackId')
  const data = stockData[trackId]
  
  if (!data) {
    return c.json({ error: 'Track not found' }, 404)
  }
  
  return c.json(data)
})

// API: Delete track
app.delete('/api/track/:trackId', (c) => {
  const trackId = c.req.param('trackId')
  
  if (stockData[trackId]) {
    delete stockData[trackId]
    return c.json({ success: true })
  }
  
  return c.json({ error: 'Track not found' }, 404)
})

// Serve HTML
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rosicatore v2.3.0 - Multi-Posizione + KPI Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .track {
            transition: all 0.3s ease;
        }
        .track:hover {
            background-color: rgba(59, 130, 246, 0.05);
        }
        .track-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div class="max-w-7xl mx-auto">
            <h1 class="text-4xl font-bold flex items-center gap-3">
                <i class="fas fa-chart-line"></i>
                Rosicatore
            </h1>
            <p class="text-purple-100 mt-2 text-lg">v2.3.0 - Multi-Posizione + KPI Dashboard Completa</p>
            <p class="text-purple-200 mt-1 text-sm">📊 Timeline Tracker • 🧮 16+ ROI Metrics • 📋 Multi-Titolo • 🤖 Parser Intelligente</p>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto p-6">
        
        <!-- Tracks Container -->
        <div id="tracks-container" class="space-y-4">
            <!-- Tracks will be added here -->
        </div>

        <!-- Add Track Button -->
        <div class="mt-6 text-center">
            <button id="add-track-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition flex items-center gap-2 mx-auto">
                <i class="fas fa-plus"></i>
                Aggiungi Traccia
            </button>
        </div>
        
        <!-- Toggle Performance Calculator -->
        <div class="mt-8 text-center">
            <button id="toggle-calculator" class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition flex items-center gap-3 mx-auto text-lg">
                <i class="fas fa-calculator"></i>
                Performance Calculator
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>
        
        <!-- Performance Calculator Section (nascosto di default) -->
        <div id="calculator-section" class="hidden mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-2xl p-8 border-2 border-purple-200">
            <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <i class="fas fa-chart-pie text-purple-600"></i>
                Calcolo Performance Portafoglio
            </h2>
            
            <p class="text-gray-600 mb-6">
                ✨ Crea posizioni, incolla movimenti/dividendi con <strong>linguaggio naturale italiano</strong> e calcola performance!
            </p>
            
            <!-- Gestione Posizioni -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-purple-200">
                <h3 class="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <i class="fas fa-briefcase"></i>
                    Gestione Posizioni
                </h3>
                
                <!-- Form Nuova Posizione -->
                <div class="bg-purple-50 rounded-lg p-4 mb-4">
                    <h4 class="font-bold text-purple-800 mb-3">➕ Crea Nuova Posizione</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Ticker</label>
                            <input type="text" id="newTicker" placeholder="HL" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Nome Titolo</label>
                            <input type="text" id="newName" placeholder="Hecla Mining" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">ISIN</label>
                            <input type="text" id="newISIN" placeholder="US4227041062" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Data Ingresso</label>
                            <input type="date" id="newDateStart" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Frazione Iniziale (numeratore)</label>
                            <input type="number" id="newFracNum" value="1" min="1" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Frazione Iniziale (denominatore)</label>
                            <input type="number" id="newFracDen" value="4" min="1" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                    </div>
                    <div class="mt-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">CSV Prezzi (opzionale)</label>
                        <textarea id="newPriceCSV" rows="3" placeholder="Date,Price&#10;2025-01-01,10.50&#10;2025-01-02,10.75" class="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs"></textarea>
                    </div>
                    <button id="createPositionBtn" class="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition">
                        <i class="fas fa-plus-circle"></i> Crea Posizione
                    </button>
                </div>
                
                <!-- Lista Posizioni Attive -->
                <div id="positionsList" class="space-y-3">
                    <h4 class="font-bold text-gray-700 mb-2">📋 Posizioni Attive:</h4>
                    <div id="positionsContainer" class="space-y-2">
                        <p class="text-gray-500 text-sm italic">Nessuna posizione creata. Crea la prima!</p>
                    </div>
                </div>
            </div>
            
            <!-- Import movimenti e dividendi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <!-- Movimenti -->
                <div class="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
                    <h3 class="text-xl font-bold text-orange-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-exchange-alt"></i>
                        Movimenti (aumentiamo/diminuiamo)
                    </h3>
                    <p class="text-sm text-gray-600 mb-3">
                        Esempio: <code class="bg-gray-100 px-2 py-1 rounded text-xs">18/08/2025 h15.39 Hecla Mining NYSE:HL US4227041062 diminuiamo di 1/4</code>
                    </p>
                    <textarea id="movimentiInput" rows="6" 
                              class="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm"
                              placeholder="Incolla qui i movimenti (uno per riga)..."></textarea>
                    <button id="parseMovimentiBtn" class="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition">
                        <i class="fas fa-magic"></i> Analizza Movimenti
                    </button>
                    <div id="movimentiPreview" class="hidden mt-4 p-3 bg-green-50 rounded border border-green-200">
                        <h4 class="font-semibold text-sm text-green-800 mb-2">✅ Movimenti riconosciuti:</h4>
                        <div id="movimentiPreviewList" class="text-xs space-y-1"></div>
                        <div class="mt-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Applica a posizione:</label>
                            <select id="movimentiPositionSelect" class="w-full border border-gray-300 rounded px-3 py-2 mb-2">
                                <option value="">Seleziona posizione...</option>
                            </select>
                            <button id="applyMovimentiBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                                <i class="fas fa-check"></i> Applica Movimenti
                            </button>
                        </div>
                    </div>
                    <div id="movimentiErrors" class="hidden mt-4 p-3 bg-red-50 rounded border border-red-200">
                        <h4 class="font-semibold text-sm text-red-700 mb-2">⚠️ Errori:</h4>
                        <div id="movimentiErrorsList" class="text-xs text-red-600 space-y-1"></div>
                    </div>
                </div>
                
                <!-- Dividendi -->
                <div class="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                    <h3 class="text-xl font-bold text-blue-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-dollar-sign"></i>
                        Dividendi (auto-detect)
                    </h3>
                    <p class="text-sm text-gray-600 mb-3">
                        Esempio: <code class="bg-gray-100 px-2 py-1 rounded text-xs">29 dicembre 2025    $0.014</code>
                    </p>
                    <textarea id="dividendiInput" rows="6" 
                              class="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm"
                              placeholder="Incolla qui i dividendi (con date e importi)..."></textarea>
                    <button id="parseDividendiBtn" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
                        <i class="fas fa-magic"></i> Analizza Dividendi
                    </button>
                    <div id="dividendiPreview" class="hidden mt-4 p-3 bg-green-50 rounded border border-green-200">
                        <h4 class="font-semibold text-sm text-green-800 mb-2">✅ Dividendi riconosciuti:</h4>
                        <div id="dividendiPreviewList" class="text-xs space-y-1"></div>
                        <div class="mt-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Applica a posizione:</label>
                            <select id="dividendiPositionSelect" class="w-full border border-gray-300 rounded px-3 py-2 mb-2">
                                <option value="">Seleziona posizione...</option>
                            </select>
                            <button id="applyDividendiBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                                <i class="fas fa-check"></i> Applica Dividendi
                            </button>
                        </div>
                    </div>
                    <div id="dividendiErrors" class="hidden mt-4 p-3 bg-red-50 rounded border border-red-200">
                        <h4 class="font-semibold text-sm text-red-700 mb-2">⚠️ Errori:</h4>
                        <div id="dividendiErrorsList" class="text-xs text-red-600 space-y-1"></div>
                    </div>
                </div>
            </div>
            
            <!-- Bottone Calcola Performance -->
            <div class="mt-8 text-center">
                <button id="calculatePerformanceBtn" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-lg shadow-xl transition text-xl">
                    <i class="fas fa-calculator"></i>
                    Calcola Performance Completa
                </button>
                <p class="text-gray-600 text-sm mt-2">Calcola tutti i KPI per le posizioni attive</p>
            </div>
            
            <!-- Risultati Calcolo -->
            <div id="risultatiCalcolo" class="hidden mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-2xl p-6 border-2 border-green-300">
                <h3 class="text-3xl font-bold text-green-700 mb-6 flex items-center gap-3">
                    <i class="fas fa-trophy"></i>
                    Dashboard Performance
                </h3>
                <div id="risultatiContent" class="space-y-6"></div>
            </div>
        </div>
    </div>

    <!-- Modal for Chart -->
    <div id="chart-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 id="modal-title" class="text-2xl font-bold text-gray-800"></h2>
                    <button id="close-modal" class="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
                </div>
                <div class="mb-4 flex gap-4 flex-wrap">
                    <select id="chart-metric" class="border border-gray-300 rounded px-4 py-2">
                        <option value="Price">Prezzo</option>
                        <option value="High">Massimo</option>
                        <option value="Low">Minimo</option>
                        <option value="Open">Apertura</option>
                        <option value="Vol.">Volume</option>
                    </select>
                    <input type="date" id="date-start" class="border border-gray-300 rounded px-4 py-2">
                    <input type="date" id="date-end" class="border border-gray-300 rounded px-4 py-2">
                    <button id="update-chart" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Aggiorna Grafico
                    </button>
                </div>
                <canvas id="stock-chart" class="w-full" height="400"></canvas>
            </div>
        </div>
    </div>

    <script>
        let tracks = [{ id: 'track-1', data: null, filename: null }];
        let currentChart = null;
        let currentTrackId = null;

        // Render tracks
        function renderTracks() {
            const container = document.getElementById('tracks-container');
            container.innerHTML = '';

            tracks.forEach((track, index) => {
                const trackDiv = document.createElement('div');
                trackDiv.className = 'track bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500';
                trackDiv.innerHTML = \`
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-layer-group text-purple-500"></i>
                            Traccia \${index + 1}
                        </h3>
                        <div class="flex gap-2">
                            \${track.data ? \`
                                <button onclick="showChart('\${track.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                    <i class="fas fa-chart-line"></i>
                                    Visualizza Grafico
                                </button>
                            \` : ''}
                            <button onclick="removeTrack('\${track.id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                <i class="fas fa-trash"></i>
                                Rimuovi
                            </button>
                        </div>
                    </div>
                    <div class="mb-4">
                        \${track.filename ? \`
                            <p class="text-green-600 font-semibold flex items-center gap-2">
                                <i class="fas fa-check-circle"></i>
                                File caricato: \${track.filename}
                            </p>
                            <p class="text-gray-600 text-sm mt-1">
                                <i class="fas fa-database"></i>
                                \${track.data.length} righe di dati
                            </p>
                        \` : \`
                            <label class="block text-gray-700 font-semibold mb-2">
                                <i class="fas fa-upload"></i>
                                Carica CSV
                            </label>
                            <input type="file" accept=".csv" onchange="uploadCSV('\${track.id}', event)" 
                                   class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                                          file:rounded file:border-0 file:text-sm file:font-semibold 
                                          file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100">
                        \`}
                    </div>
                \`;
                container.appendChild(trackDiv);
            });
        }

        // Add track
        document.getElementById('add-track-btn').addEventListener('click', () => {
            const newTrack = {
                id: \`track-\${Date.now()}\`,
                data: null,
                filename: null
            };
            tracks.push(newTrack);
            renderTracks();
        });

        // Remove track
        window.removeTrack = function(trackId) {
            if (tracks.length === 1) {
                alert('Non puoi rimuovere l\\'ultima traccia!');
                return;
            }
            tracks = tracks.filter(t => t.id !== trackId);
            
            // Delete from server
            fetch(\`/api/track/\${trackId}\`, { method: 'DELETE' });
            
            renderTracks();
        };

        // Upload CSV
        window.uploadCSV = async function(trackId, event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                const csvData = e.target.result;
                
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            trackId: trackId,
                            csvData: csvData,
                            filename: file.name
                        })
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        // Fetch the data
                        const dataResponse = await fetch(\`/api/track/\${trackId}\`);
                        const trackData = await dataResponse.json();
                        
                        const track = tracks.find(t => t.id === trackId);
                        track.data = trackData.data;
                        track.filename = trackData.filename;
                        
                        renderTracks();
                    } else {
                        alert('Errore nel caricamento: ' + result.error);
                    }
                } catch (error) {
                    alert('Errore: ' + error.message);
                }
            };
            reader.readAsText(file);
        };

        // Show chart
        window.showChart = async function(trackId) {
            currentTrackId = trackId;
            const track = tracks.find(t => t.id === trackId);
            
            if (!track || !track.data) return;

            document.getElementById('modal-title').textContent = track.filename;
            document.getElementById('chart-modal').classList.remove('hidden');

            // Set date range
            const dates = track.data.map(d => d.Date);
            document.getElementById('date-start').value = dates[dates.length - 1];
            document.getElementById('date-end').value = dates[0];

            updateChart();
        };

        // Update chart
        document.getElementById('update-chart').addEventListener('click', updateChart);

        function updateChart() {
            const track = tracks.find(t => t.id === currentTrackId);
            if (!track || !track.data) return;

            const metric = document.getElementById('chart-metric').value;
            const dateStart = document.getElementById('date-start').value;
            const dateEnd = document.getElementById('date-end').value;

            // Filter data by date range
            let filteredData = track.data;
            if (dateStart || dateEnd) {
                filteredData = track.data.filter(d => {
                    const date = new Date(d.Date);
                    const start = dateStart ? new Date(dateStart) : new Date('1900-01-01');
                    const end = dateEnd ? new Date(dateEnd) : new Date('2100-12-31');
                    return date >= start && date <= end;
                });
            }

            // Prepare chart data
            const labels = filteredData.map(d => d.Date).reverse();
            const values = filteredData.map(d => {
                const val = d[metric];
                if (metric === 'Vol.') {
                    return parseFloat(val.replace('M', '')) * 1000000;
                }
                return parseFloat(val);
            }).reverse();

            // Destroy previous chart
            if (currentChart) {
                currentChart.destroy();
            }

            // Create new chart
            const ctx = document.getElementById('stock-chart');
            currentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: metric,
                        data: values,
                        borderColor: 'rgb(147, 51, 234)',
                        backgroundColor: 'rgba(147, 51, 234, 0.1)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Data'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: metric
                            }
                        }
                    }
                }
            });
        }

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('chart-modal').classList.add('hidden');
            if (currentChart) {
                currentChart.destroy();
                currentChart = null;
            }
        });

        // Initial render
        renderTracks();
    </script>
    
    <script src="/static/portfolio-engine.js"></script>
    <script src="/static/parsers.js"></script>
    <script src="/static/calculator.js"></script>
</body>
</html>
  `)
})

export default app
