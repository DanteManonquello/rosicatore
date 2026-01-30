/**
 * ROSICATORE v2.2.0 - PARSER INTELLIGENTE
 * 
 * Parser per dividendi e movimenti con auto-detect formato
 */

const RosicatoreParser = {
  
  /**
   * PARSER DIVIDENDI INTELLIGENTE
   * Auto-detecta data e importo da qualsiasi formato
   * 
   * Formati supportati:
   * - "29 dicembre 2025    $0.014"
   * - "26/06/2025    0.014"
   * - "Data: 29/12/2025 Importo: $0.014"
   * - "2025-12-29 | 0.014 USD"
   */
  parseDividendiText(text) {
    const righe = text.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const dividendi = [];
    const errori = [];
    
    // Mesi italiani
    const mesiItaliani = {
      'gennaio': 1, 'febbraio': 2, 'marzo': 3, 'aprile': 4,
      'maggio': 5, 'giugno': 6, 'luglio': 7, 'agosto': 8,
      'settembre': 9, 'ottobre': 10, 'novembre': 11, 'dicembre': 12
    };
    
    for (let i = 0; i < righe.length; i++) {
      const riga = righe[i];
      
      // Skip header se contiene parole chiave
      if (riga.toLowerCase().includes('pagamento') || 
          riga.toLowerCase().includes('importo') ||
          riga.toLowerCase().includes('data')) {
        continue;
      }
      
      try {
        const risultato = this.parseDividendoRiga(riga, mesiItaliani);
        if (risultato) {
          dividendi.push(risultato);
        }
      } catch (error) {
        errori.push({
          riga: i + 1,
          testo: riga,
          errore: error.message
        });
      }
    }
    
    return { dividendi, errori };
  },
  
  /**
   * Parse singola riga dividendo - AUTO-DETECT
   */
  parseDividendoRiga(riga, mesiItaliani) {
    // Rimuovi caratteri extra
    let testo = riga.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim();
    
    // ============================================
    // STEP 1: TROVA DATA
    // ============================================
    let dataTrovata = null;
    
    // Formato 1: "29 dicembre 2025" (data italiana lunga)
    const regexDataItaliana = /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/i;
    const matchItaliano = testo.match(regexDataItaliana);
    if (matchItaliano) {
      const giorno = parseInt(matchItaliano[1]);
      const mese = mesiItaliani[matchItaliano[2].toLowerCase()];
      const anno = parseInt(matchItaliano[3]);
      dataTrovata = `${anno}-${String(mese).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`;
    }
    
    // Formato 2: "DD/MM/YYYY" o "DD-MM-YYYY"
    if (!dataTrovata) {
      const regexSlash = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
      const matchSlash = testo.match(regexSlash);
      if (matchSlash) {
        const giorno = parseInt(matchSlash[1]);
        const mese = parseInt(matchSlash[2]);
        const anno = parseInt(matchSlash[3]);
        dataTrovata = `${anno}-${String(mese).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`;
      }
    }
    
    // Formato 3: "YYYY-MM-DD" (ISO standard)
    if (!dataTrovata) {
      const regexISO = /(\d{4})-(\d{2})-(\d{2})/;
      const matchISO = testo.match(regexISO);
      if (matchISO) {
        dataTrovata = matchISO[0];
      }
    }
    
    if (!dataTrovata) {
      throw new Error('Data non trovata nel testo');
    }
    
    // ============================================
    // STEP 2: TROVA IMPORTO
    // ============================================
    let importoTrovato = null;
    
    // Rimuovi simboli valuta e trova numeri decimali
    const testoNumeri = testo.replace(/[$€£¥]/g, '').replace(/USD|EUR|GBP|JPY/gi, '');
    
    // Cerca pattern numero decimale (es: 0.014, .014, 14.5, 0,014)
    const regexNumero = /(\d+[.,]\d+)/g;
    const numeriTrovati = testoNumeri.match(regexNumero);
    
    if (numeriTrovati) {
      // Prendi l'ultimo numero trovato (di solito è l'importo)
      const numeroStr = numeriTrovati[numeriTrovati.length - 1];
      importoTrovato = parseFloat(numeroStr.replace(',', '.'));
      
      if (isNaN(importoTrovato) || importoTrovato <= 0) {
        throw new Error('Importo non valido');
      }
    }
    
    // Fallback: cerca numero intero piccolo (es: dividendo 0 o 1)
    if (!importoTrovato) {
      const regexIntero = /\b(\d{1,3})\b/g;
      const interiTrovati = testoNumeri.match(regexIntero);
      if (interiTrovati) {
        // Prendi l'ultimo numero che non è parte della data
        for (let i = interiTrovati.length - 1; i >= 0; i--) {
          const num = parseInt(interiTrovati[i]);
          if (num < 100) {  // Probabilmente un dividendo
            importoTrovato = num;
            break;
          }
        }
      }
    }
    
    if (!importoTrovato && importoTrovato !== 0) {
      throw new Error('Importo non trovato nel testo');
    }
    
    return {
      date: dataTrovata,
      amount: importoTrovato
    };
  },
  
  /**
   * PARSER MOVIMENTI CON LINGUAGGIO NATURALE
   * 
   * Formato supportato:
   * "18/08/2025 h15.39    Hecla Mining    NYSE:HL    US4227041062    diminuiamo di 1/4"
   */
  parseMovimentiText(text) {
    const righe = text.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const movimenti = [];
    const errori = [];
    
    const mesiItaliani = {
      'gennaio': 1, 'febbraio': 2, 'marzo': 3, 'aprile': 4,
      'maggio': 5, 'giugno': 6, 'luglio': 7, 'agosto': 8,
      'settembre': 9, 'ottobre': 10, 'novembre': 11, 'dicembre': 12
    };
    
    for (let i = 0; i < righe.length; i++) {
      const riga = righe[i];
      
      try {
        const movimento = this.parseMovimentoRiga(riga, mesiItaliani);
        if (movimento) {
          movimenti.push(movimento);
        }
      } catch (error) {
        errori.push({
          riga: i + 1,
          testo: riga,
          errore: error.message
        });
      }
    }
    
    return { movimenti, errori };
  },
  
  /**
   * Parse singola riga movimento
   */
  parseMovimentoRiga(riga, mesiItaliani) {
    // Split su spazi multipli/tab
    const parti = riga.split(/\s{2,}|\t+/).map(p => p.trim()).filter(p => p.length > 0);
    
    if (parti.length < 4) {
      throw new Error('Formato movimento incompleto - servono almeno data, ticker e azione');
    }
    
    // ============================================
    // STEP 1: ESTRAI DATA (prima parte)
    // ============================================
    const testoPrimoToken = parti[0];
    let dataTrovata = null;
    
    // Formato "18/08/2025 h15.39" o "29 ottobre 2025 h14.40"
    const regexDataOra = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const matchSlash = testoPrimoToken.match(regexDataOra);
    if (matchSlash) {
      const g = parseInt(matchSlash[1]);
      const m = parseInt(matchSlash[2]);
      const a = parseInt(matchSlash[3]);
      dataTrovata = `${a}-${String(m).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
    }
    
    // Formato italiano "29 ottobre 2025"
    if (!dataTrovata) {
      const regexItaLunga = /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/i;
      const matchIta = parti.slice(0, 3).join(' ').match(regexItaLunga);
      if (matchIta) {
        const g = parseInt(matchIta[1]);
        const m = mesiItaliani[matchIta[2].toLowerCase()];
        const a = parseInt(matchIta[3]);
        dataTrovata = `${a}-${String(m).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
      }
    }
    
    if (!dataTrovata) {
      throw new Error('Data non riconosciuta');
    }
    
    // ============================================
    // STEP 2: ESTRAI TICKER (cerca formato NYSE:HL o NASDAQ:XXX)
    // ============================================
    let ticker = null;
    let isin = null;
    
    for (const parte of parti) {
      // Cerca ticker con exchange
      if (parte.includes(':')) {
        const split = parte.split(':');
        if (split.length === 2 && split[0].match(/NYSE|NASDAQ|LSE|XETRA/i)) {
          ticker = split[1].trim();
        }
      }
      
      // Cerca ISIN (12 caratteri alfanumerici)
      if (parte.match(/^[A-Z]{2}[A-Z0-9]{10}$/)) {
        isin = parte;
      }
    }
    
    if (!ticker) {
      throw new Error('Ticker non trovato (cerca formato NYSE:HL)');
    }
    
    // ============================================
    // STEP 3: RICONOSCI AZIONE (aumentiamo/diminuiamo)
    // ============================================
    const testoCompleto = riga.toLowerCase();
    let tipo = null;
    
    // BUY keywords
    if (testoCompleto.match(/aumentiamo|aumenta|aumento|compra|acquista|buy|appesant/i)) {
      tipo = 'BUY';
    }
    
    // SELL keywords
    if (testoCompleto.match(/diminuiamo|diminuisco|diminu|vendi|sell|allegger/i)) {
      tipo = 'SELL';
    }
    
    if (!tipo) {
      throw new Error('Azione non riconosciuta (usa "aumentiamo" o "diminuiamo")');
    }
    
    // ============================================
    // STEP 4: ESTRAI FRAZIONE (cerca "di 1/4" o "1/3" ecc)
    // ============================================
    let numeratore = null;
    let denominatore = null;
    
    const regexFrazione = /(\d+)\s*\/\s*(\d+)/;
    const matchFrazione = riga.match(regexFrazione);
    if (matchFrazione) {
      numeratore = parseInt(matchFrazione[1]);
      denominatore = parseInt(matchFrazione[2]);
    } else {
      // Default 1/4 se non specificato
      numeratore = 1;
      denominatore = 4;
    }
    
    return {
      date: dataTrovata,
      type: tipo,
      ticker: ticker,
      isin: isin || '',
      numerator: numeratore,
      denominator: denominatore,
      notes: riga
    };
  }
};

// Export per uso globale
if (typeof window !== 'undefined') {
  window.RosicatoreParser = RosicatoreParser;
}
