import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', version: '3.2.1' })
})

// Main route - Rosicatore Portfolio Tracker
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rosicatore v3.2.1 - Portfolio Tracker</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 min-h-screen text-white">
        
        <!-- Hamburger Menu Button (Mobile/Desktop) -->
        <button id="menuToggle" class="fixed top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg border border-gray-600 transition-all">
            <i class="fas fa-bars text-xl"></i>
        </button>

        <!-- Sidebar Menu -->
        <div id="sidebar" class="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-2xl transform translate-x-full transition-transform duration-300 z-40 overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-bold text-green-400">
                        <i class="fas fa-bars mr-2"></i>Menu
                    </h2>
                    <button id="menuClose" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- Menu Items -->
                <nav class="space-y-2">
                    <a href="#configSection" class="menu-item block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                        <i class="fas fa-cog mr-3 text-blue-400"></i>
                        Configurazione
                    </a>
                    <a href="#kpiSection" class="menu-item block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                        <i class="fas fa-tachometer-alt mr-3 text-green-400"></i>
                        KPI Performance
                    </a>
                    <a href="#stockSummary" class="menu-item block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                        <i class="fas fa-table mr-3 text-purple-400"></i>
                        Riepilogo Titoli
                    </a>
                    <a href="#detailedResults" class="menu-item block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                        <i class="fas fa-history mr-3 text-yellow-400"></i>
                        Storico Operazioni
                    </a>
                    <a href="#calculationsSection" class="menu-item block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                        <i class="fas fa-calculator mr-3 text-red-400"></i>
                        Calcoli Dettagliati
                    </a>
                </nav>

                <div class="mt-8 pt-8 border-t border-gray-700">
                    <div class="text-sm text-gray-400">
                        <div class="mb-2"><strong>Versione:</strong> 3.2.2</div>
                        <div class="mb-2"><strong>Capitale Fisso:</strong> $12,000</div>
                        <div><strong>Titoli:</strong> <span id="sidebarTitoliCount">-</span></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Overlay -->
        <div id="overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden"></div>
        
        <!-- Header -->
        <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-4xl font-bold flex items-center gap-3">
                        <i class="fas fa-chart-line text-green-400"></i>
                        ROSICATORE
                    </h1>
                    <p class="text-gray-400 mt-1">Portfolio Tracker Algorithm - v3.2.1</p>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-400">Sistema di Tracking</div>
                    <div class="text-2xl font-bold text-green-400">ATTIVO</div>
                </div>
            </div>

            <!-- Configuration Section -->
            <div id="configSection" class="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-cog text-blue-400"></i>
                    Configurazione Analisi
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <!-- Capital Input -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            <i class="fas fa-dollar-sign mr-2"></i>Capitale Totale (USD)
                        </label>
                        <input 
                            type="number" 
                            id="capitaleTotale" 
                            value="12000"
                            readonly
                            class="w-full bg-gray-600 border border-gray-600 rounded px-4 py-2 text-gray-300 cursor-not-allowed"
                            placeholder="12000"
                        />
                        <p class="text-xs text-gray-400 mt-1"><i class="fas fa-lock mr-1"></i>Capitale fisso</p>
                    </div>

                    <!-- Start Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            <i class="fas fa-calendar-alt mr-2"></i>Data Inizio
                        </label>
                        <input 
                            type="date" 
                            id="dataInizio"
                            class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <!-- End Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            <i class="fas fa-calendar-check mr-2"></i>Data Fine
                        </label>
                        <input 
                            type="date" 
                            id="dataFine"
                            class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <!-- CSV Upload Section - 4 Slots -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                
                <!-- Slot 1: Titoli -->
                <div class="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700 hover:shadow-xl transition-all cursor-pointer" id="slot-titoli">
                    <div class="text-center">
                        <i class="fas fa-building text-5xl mb-4 text-blue-300"></i>
                        <h3 class="text-xl font-bold mb-2">TITOLI</h3>
                        <p class="text-sm text-blue-200 mb-4">info_titoli.csv</p>
                        <input type="file" id="upload-titoli" accept=".csv" class="hidden" />
                        <button onclick="document.getElementById('upload-titoli').click()" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium transition-colors">
                            <i class="fas fa-upload mr-2"></i>Carica CSV
                        </button>
                        <div id="status-titoli" class="mt-3 text-xs"></div>
                    </div>
                </div>

                <!-- Slot 2: Valori -->
                <div class="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-700 hover:shadow-xl transition-all cursor-pointer" id="slot-valori">
                    <div class="text-center">
                        <i class="fas fa-chart-bar text-5xl mb-4 text-green-300"></i>
                        <h3 class="text-xl font-bold mb-2">VALORI</h3>
                        <p class="text-sm text-green-200 mb-4">price_history.csv</p>
                        <input type="file" id="upload-valori" accept=".csv" class="hidden" />
                        <button onclick="document.getElementById('upload-valori').click()" class="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-medium transition-colors">
                            <i class="fas fa-upload mr-2"></i>Carica CSV
                        </button>
                        <div id="status-valori" class="mt-3 text-xs"></div>
                    </div>
                </div>

                <!-- Slot 3: Movimenti -->
                <div class="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700 hover:shadow-xl transition-all cursor-pointer" id="slot-movimenti">
                    <div class="text-center">
                        <i class="fas fa-exchange-alt text-5xl mb-4 text-purple-300"></i>
                        <h3 class="text-xl font-bold mb-2">MOVIMENTI</h3>
                        <p class="text-sm text-purple-200 mb-4">movimenti.csv</p>
                        <input type="file" id="upload-movimenti" accept=".csv" class="hidden" />
                        <button onclick="document.getElementById('upload-movimenti').click()" class="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm font-medium transition-colors">
                            <i class="fas fa-upload mr-2"></i>Carica CSV
                        </button>
                        <div id="status-movimenti" class="mt-3 text-xs"></div>
                    </div>
                </div>

                <!-- Slot 4: Dividendi -->
                <div class="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 border border-yellow-700 hover:shadow-xl transition-all cursor-pointer" id="slot-dividendi">
                    <div class="text-center">
                        <i class="fas fa-coins text-5xl mb-4 text-yellow-300"></i>
                        <h3 class="text-xl font-bold mb-2">DIVIDENDI</h3>
                        <p class="text-sm text-yellow-200 mb-4">dividendi.csv</p>
                        <input type="file" id="upload-dividendi" accept=".csv" class="hidden" />
                        <button onclick="document.getElementById('upload-dividendi').click()" class="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded text-sm font-medium transition-colors">
                            <i class="fas fa-upload mr-2"></i>Carica CSV
                        </button>
                        <div id="status-dividendi" class="mt-3 text-xs"></div>
                    </div>
                </div>

            </div>

            <!-- Calculate Button -->
            <div class="text-center mb-6">
                <button id="btnCalcola" class="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fas fa-calculator mr-3"></i>
                    CALCOLA PORTAFOGLIO
                </button>
            </div>

            <!-- Errors/Warnings Section -->
            <div id="errorsSection" class="hidden bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-bold mb-2 flex items-center gap-2">
                    <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                    Errori e Avvisi
                </h3>
                <ul id="errorsList" class="list-disc list-inside text-sm space-y-1"></ul>
            </div>

            <!-- KPI Section -->
            <div id="kpiSection" class="hidden">
                <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
                    <i class="fas fa-tachometer-alt text-green-400"></i>
                    KPI Performance
                </h2>
                
                <!-- Main KPIs Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6" id="kpiGrid">
                    <!-- KPIs will be dynamically inserted here -->
                </div>

                <!-- Stock Summary Table -->
                <div id="stockSummary" class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                        <i class="fas fa-table text-blue-400"></i>
                        Riepilogo Titoli
                    </h3>
                    <div id="stockSummaryContent"></div>
                </div>

                <!-- Detailed Results -->
                <div id="detailedResults" class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                    <h3 class="text-xl font-bold mb-4">Storico Operazioni</h3>
                    <div id="detailedContent"></div>
                </div>

                <!-- Calculations Section - VITA MORTE MIRACOLI -->
                <div id="calculationsSection" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                        <i class="fas fa-calculator text-red-400"></i>
                        Calcoli Dettagliati per Titolo
                    </h3>
                    <p class="text-sm text-gray-400 mb-4">
                        Questa sezione mostra la cronologia completa di ogni titolo: ingressi, esposizioni, movimenti, dividendi, vendite e tutte le operazioni.
                    </p>
                    <div id="calculationsContent"></div>
                </div>
            </div>

        </div>

        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
