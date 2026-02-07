// Test live per verificare calcoli date picker

// TEST 1: Periodo breve senza movimenti
const test1 = {
    dataInizio: '2025-01-01',
    dataFine: '2025-01-15',
    descrizione: 'Solo 15 giorni, nessun movimento, nessun dividendo',
    movimentiAttesi: 0,
    dividendiAttesi: 0,
    tickerDaCalcolare: 11 // Tutti tranne GSM
};

// TEST 2: Periodo con 1 movimento
const test2 = {
    dataInizio: '2025-01-01',
    dataFine: '2025-01-20',
    descrizione: 'Include movimento MARA del 13 gennaio',
    movimentiAttesi: 1, // MARA BUY 13/01
    dividendiAttesi: 0,
    tickerDaCalcolare: 11
};

// TEST 3: Periodo con dividendi
const test3 = {
    dataInizio: '2025-01-01',
    dataFine: '2025-03-31',
    descrizione: 'Include dividendi EQT (18 feb) e AA (4 mar), HL (10 mar), PBR (22 apr - fuori)',
    movimentiAttesi: 3, // MARA 13/01, GSM 10/02, VZLA+GSM 25/02
    dividendiAttesi: 3, // EQT, AA, HL
    tickerDaCalcolare: 12 // Tutti (GSM entra il 10 feb)
};

console.log('Test preparati:', test1, test2, test3);
