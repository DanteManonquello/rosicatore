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
    <title>Rosicatore - Stock Price Timeline Tracker</title>
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
            <p class="text-purple-100 mt-2">Stock Price Timeline Tracker - Analizza gli andamenti azionari</p>
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
</body>
</html>
  `)
})

export default app
