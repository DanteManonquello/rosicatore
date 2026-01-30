/**
 * 🚀 ROSICATORE v2.0.0 - PORTFOLIO ENGINE (Browser Version)
 * 
 * Motore di calcolo portafoglio azionario con:
 * - Tracking transazioni complete (buy/sell/dividend)
 * - PMC dinamico ponderato
 * - Dividendi reinvestiti automatici
 * - Cash disponibile tracking
 * - TUTTI i ROI possibili (16+ metriche)
 */

class Position {
  constructor(config) {
    this.ticker = config.ticker;
    this.isin = config.isin;
    this.name = config.name;
    this.market = config.market;
    this.type = config.type;
    this.baseCapital = config.baseCapital;
    this.cashAvailable = config.baseCapital; // Inizialmente tutto cash
    this.dateStart = config.dateStart;
    this.dateEnd = config.dateEnd;
    
    this.transactions = [];
    this.dividends = [];
    this.priceHistory = [];
  }
  
  // ==========================================================================
  // LOAD PRICE HISTORY FROM CSV
  // ==========================================================================
  
  loadPriceHistory(csvData) {
    this.priceHistory = csvData.map(point => ({
      date: this.parseDate(point.date),
      price: parseFloat(point.price.toString().replace('$', '')),
      open: point.open ? parseFloat(point.open.toString().replace('$', '')) : undefined,
      high: point.high ? parseFloat(point.high.toString().replace('$', '')) : undefined,
      low: point.low ? parseFloat(point.low.toString().replace('$', '')) : undefined,
      volume: point.volume
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  // Parse date da vari formati → ISO (YYYY-MM-DD)
  parseDate(dateStr) {
    // MM/DD/YYYY → YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr; // Assume già ISO
  }
  
  // Ottieni prezzo a una data specifica
  getPriceAtDate(date) {
    const isoDate = this.parseDate(date);
    const point = this.priceHistory.find(p => p.date === isoDate);
    
    if (point) return point.price;
    
    // Fallback: trova prezzo più vicino
    const targetTime = new Date(isoDate).getTime();
    let closest = this.priceHistory[0];
    let minDiff = Math.abs(new Date(closest.date).getTime() - targetTime);
    
    for (const point of this.priceHistory) {
      const diff = Math.abs(new Date(point.date).getTime() - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }
    
    return closest.price;
  }
  
  // ==========================================================================
  // TRANSACTIONS - BUY/SELL/DIVIDEND
  // ==========================================================================
  
  buyFraction(date, numerator, denominator, notes) {
    const fraction = numerator / denominator;
    const amount = this.baseCapital * fraction;
    
    if (amount > this.cashAvailable) {
      throw new Error(`Insufficient cash: need $${amount}, have $${this.cashAvailable}`);
    }
    
    const price = this.getPriceAtDate(date);
    const shares = amount / price;
    
    this.transactions.push({
      date: this.parseDate(date),
      type: 'BUY',
      shares: shares,
      price: price,
      amount: amount,
      notes: notes || `Acquisto ${numerator}/${denominator}`
    });
    
    this.cashAvailable -= amount;
    
    console.log(`[BUY] ${date} | ${shares.toFixed(2)} shares @ $${price.toFixed(2)} | Total: $${amount.toFixed(2)} | Cash left: $${this.cashAvailable.toFixed(2)}`);
  }
  
  sellFraction(date, numerator, denominator, notes) {
    const fraction = numerator / denominator;
    const currentShares = this.getCurrentShares(date);
    const sharesToSell = currentShares * fraction;
    
    if (sharesToSell > currentShares) {
      throw new Error(`Cannot sell ${sharesToSell} shares, only have ${currentShares}`);
    }
    
    const price = this.getPriceAtDate(date);
    const amount = sharesToSell * price;
    
    this.transactions.push({
      date: this.parseDate(date),
      type: 'SELL',
      shares: -sharesToSell, // Negativo per vendita
      price: price,
      amount: amount,
      notes: notes || `Vendita ${numerator}/${denominator}`
    });
    
    this.cashAvailable += amount;
    
    console.log(`[SELL] ${date} | ${sharesToSell.toFixed(2)} shares @ $${price.toFixed(2)} | Cash: +$${amount.toFixed(2)} | Total cash: $${this.cashAvailable.toFixed(2)}`);
  }
  
  addDividend(paymentDate, amountPerShare, notes) {
    const isoDate = this.parseDate(paymentDate);
    const sharesAtPayment = this.getCurrentShares(paymentDate);
    const totalDividend = sharesAtPayment * amountPerShare;
    
    // Reinvesti automaticamente
    const priceAtDividend = this.getPriceAtDate(paymentDate);
    const sharesReinvested = totalDividend / priceAtDividend;
    
    this.dividends.push({
      paymentDate: isoDate,
      amountPerShare: amountPerShare,
      totalAmount: totalDividend,
      sharesAtPayment: sharesAtPayment,
      reinvested: true,
      sharesReinvested: sharesReinvested
    });
    
    // Aggiungi transazione DIVIDEND_REINVEST
    this.transactions.push({
      date: isoDate,
      type: 'DIVIDEND_REINVEST',
      shares: sharesReinvested,
      price: priceAtDividend,
      amount: totalDividend,
      notes: notes || `Dividendo $${amountPerShare}/share reinvestito`
    });
    
    console.log(`[DIVIDEND] ${paymentDate} | $${totalDividend.toFixed(2)} ($${amountPerShare}/share × ${sharesAtPayment.toFixed(2)}) | Reinvested: ${sharesReinvested.toFixed(4)} shares @ $${priceAtDividend.toFixed(2)}`);
  }
  
  // ==========================================================================
  // CALCULATIONS - PMC, SHARES, VALUES
  // ==========================================================================
  
  getAverageCostBasis(upToDate) {
    const buyTransactions = this.transactions.filter(t => 
      (t.type === 'BUY' || t.type === 'DIVIDEND_REINVEST') &&
      (!upToDate || t.date <= this.parseDate(upToDate))
    );
    
    if (buyTransactions.length === 0) return 0;
    
    const totalCost = buyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalShares = buyTransactions.reduce((sum, t) => sum + t.shares, 0);
    
    return totalCost / totalShares;
  }
  
  getCurrentShares(upToDate) {
    const relevantTransactions = this.transactions.filter(t =>
      !upToDate || t.date <= this.parseDate(upToDate)
    );
    
    return relevantTransactions.reduce((sum, t) => {
      if (t.type === 'BUY' || t.type === 'DIVIDEND_REINVEST') {
        return sum + t.shares;
      } else if (t.type === 'SELL') {
        return sum + t.shares; // shares è già negativo
      }
      return sum;
    }, 0);
  }
  
  getCapitalInvested(upToDate) {
    const shares = this.getCurrentShares(upToDate);
    const avgCost = this.getAverageCostBasis(upToDate);
    return shares * avgCost;
  }
  
  getCurrentValue(atDate) {
    const date = atDate || this.dateEnd;
    const shares = this.getCurrentShares(date);
    const price = this.getPriceAtDate(date);
    return shares * price;
  }
  
  getUnrealizedPL(atDate) {
    const currentValue = this.getCurrentValue(atDate);
    const costBasis = this.getCapitalInvested(atDate);
    return currentValue - costBasis;
  }
  
  getRealizedPL(upToDate) {
    const sellTransactions = this.transactions.filter(t =>
      t.type === 'SELL' &&
      (!upToDate || t.date <= this.parseDate(upToDate))
    );
    
    if (sellTransactions.length === 0) return 0;
    
    let totalRealizedPL = 0;
    
    for (const sell of sellTransactions) {
      const avgCostAtSell = this.getAverageCostBasis(sell.date);
      const costBasis = Math.abs(sell.shares) * avgCostAtSell;
      const proceeds = sell.amount;
      totalRealizedPL += (proceeds - costBasis);
    }
    
    return totalRealizedPL;
  }
  
  getTotalDividends(upToDate) {
    return this.dividends
      .filter(d => !upToDate || d.paymentDate <= this.parseDate(upToDate))
      .reduce((sum, d) => sum + d.totalAmount, 0);
  }
  
  // ==========================================================================
  // ROI CALCULATIONS - IL TUO SOGNO 💎💎💎
  // ==========================================================================
  
  calculateROI() {
    const startDate = new Date(this.dateStart);
    const endDate = new Date(this.dateEnd);
    const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const initialCost = this.getCapitalInvested(this.dateStart);
    const finalValue = this.getCurrentValue(this.dateEnd);
    const totalDividends = this.getTotalDividends(this.dateEnd);
    const realizedPL = this.getRealizedPL(this.dateEnd);
    const unrealizedPL = this.getUnrealizedPL(this.dateEnd);
    
    // 1. ROI SEMPLICE
    const roiSimple = ((finalValue + realizedPL + totalDividends - initialCost) / initialCost) * 100;
    
    // 2. ROI ANNUALIZZATO
    const years = days / 365;
    const roiAnnualized = (Math.pow((finalValue + totalDividends) / initialCost, 1 / years) - 1) * 100;
    
    // 3. TIME-WEIGHTED RETURN (TWR)
    const dailyReturns = this.calculateDailyReturns();
    const twr = dailyReturns.reduce((product, r) => product * (1 + r / 100), 1) - 1;
    const twrPercent = twr * 100;
    
    // 4. MONEY-WEIGHTED RETURN (MWR/IRR)
    const mwr = roiSimple; // Approssimazione
    
    // 5. SHARPE RATIO
    const riskFreeRate = 4.0; // 4% annuale
    const avgReturn = this.calculateAverageReturn();
    const stdDev = this.calculateStdDev(dailyReturns);
    const annualizedReturn = avgReturn * 252;
    const annualizedStdDev = stdDev * Math.sqrt(252);
    const sharpeRatio = annualizedStdDev > 0 ? (annualizedReturn - riskFreeRate) / annualizedStdDev : 0;
    const sharpeInterpretation = 
      sharpeRatio > 2 ? 'Eccellente' :
      sharpeRatio > 1 ? 'Molto Buono' :
      sharpeRatio > 0.5 ? 'Buono' :
      sharpeRatio > 0 ? 'Accettabile' : 'Scarso';
    
    // 6. SORTINO RATIO
    const downsideReturns = dailyReturns.filter(r => r < 0);
    const downsideStdDev = this.calculateStdDev(downsideReturns) * Math.sqrt(252);
    const sortinoRatio = downsideStdDev > 0 ? (annualizedReturn - riskFreeRate) / downsideStdDev : 0;
    const sortinoInterpretation =
      sortinoRatio > 2 ? 'Eccellente' :
      sortinoRatio > 1 ? 'Molto Buono' :
      sortinoRatio > 0.5 ? 'Buono' : 'Accettabile';
    
    // 7. MAX DRAWDOWN
    const { maxDrawdown, maxDrawdownPeriod } = this.calculateMaxDrawdown();
    
    // 8. CALMAR RATIO
    const calmarRatio = maxDrawdown !== 0 ? roiAnnualized / Math.abs(maxDrawdown) : 0;
    const calmarInterpretation =
      calmarRatio > 3 ? 'Eccellente' :
      calmarRatio > 1 ? 'Buono' :
      calmarRatio > 0.5 ? 'Accettabile' : 'Scarso';
    
    // 9. VOLATILITY
    const dailyVolatility = stdDev;
    const annualizedVolatility = annualizedStdDev;
    
    // 10. WIN RATE & PROFIT FACTOR
    const positiveReturns = dailyReturns.filter(r => r > 0);
    const negativeReturns = dailyReturns.filter(r => r < 0);
    const winRate = (positiveReturns.length / dailyReturns.length) * 100;
    const totalGains = positiveReturns.reduce((sum, r) => sum + r, 0);
    const totalLosses = Math.abs(negativeReturns.reduce((sum, r) => sum + r, 0));
    const profitFactor = totalLosses > 0 ? totalGains / totalLosses : 0;
    const averageWin = positiveReturns.length > 0 ? totalGains / positiveReturns.length : 0;
    const averageLoss = negativeReturns.length > 0 ? totalLosses / negativeReturns.length : 0;
    
    // 11. DIVIDEND YIELD
    const dividendYield = initialCost > 0 ? (totalDividends / initialCost / years) * 100 : 0;
    
    // 12. CAPITAL UTILIZATION
    const capitalUtilization = (initialCost / this.baseCapital) * 100;
    const cashDragImpact = ((this.baseCapital - initialCost) / this.baseCapital) * 100;
    
    return {
      roiSimple,
      roiSimplePercent: `${roiSimple >= 0 ? '+' : ''}${roiSimple.toFixed(2)}%`,
      
      roiAnnualized,
      roiAnnualizedPercent: `${roiAnnualized >= 0 ? '+' : ''}${roiAnnualized.toFixed(2)}%`,
      
      twr: twrPercent,
      twrPercent: `${twrPercent >= 0 ? '+' : ''}${twrPercent.toFixed(2)}%`,
      
      mwr,
      mwrPercent: `${mwr >= 0 ? '+' : ''}${mwr.toFixed(2)}%`,
      
      sharpeRatio,
      sharpeInterpretation,
      
      sortinoRatio,
      sortinoInterpretation,
      
      maxDrawdown,
      maxDrawdownPercent: `${maxDrawdown.toFixed(2)}%`,
      maxDrawdownPeriod,
      
      calmarRatio,
      calmarInterpretation,
      
      totalGainLoss: unrealizedPL + realizedPL + totalDividends,
      totalGainLossPercent: `${roiSimple >= 0 ? '+' : ''}${roiSimple.toFixed(2)}%`,
      unrealizedGainLoss: unrealizedPL,
      realizedGainLoss: realizedPL,
      
      totalDividends,
      dividendYield,
      dividendsReinvested: totalDividends,
      
      dailyVolatility,
      annualizedVolatility,
      
      winRate,
      profitFactor,
      averageWin,
      averageLoss,
      
      capitalUtilization,
      cashDragImpact
    };
  }
  
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  calculateDailyReturns() {
    const returns = [];
    
    for (let i = 1; i < this.priceHistory.length; i++) {
      const prevPrice = this.priceHistory[i - 1].price;
      const currPrice = this.priceHistory[i].price;
      const dailyReturn = ((currPrice - prevPrice) / prevPrice) * 100;
      returns.push(dailyReturn);
    }
    
    return returns;
  }
  
  calculateAverageReturn() {
    const returns = this.calculateDailyReturns();
    if (returns.length === 0) return 0;
    return returns.reduce((sum, r) => sum + r, 0) / returns.length;
  }
  
  calculateStdDev(values) {
    if (values.length === 0) return 0;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
  }
  
  calculateMaxDrawdown() {
    let peak = -Infinity;
    let maxDD = 0;
    let maxDDStart = '';
    let maxDDEnd = '';
    let peakDate = '';
    
    for (const point of this.priceHistory) {
      if (point.price > peak) {
        peak = point.price;
        peakDate = point.date;
      }
      
      const drawdown = ((point.price - peak) / peak) * 100;
      
      if (drawdown < maxDD) {
        maxDD = drawdown;
        maxDDStart = peakDate;
        maxDDEnd = point.date;
      }
    }
    
    return {
      maxDrawdown: maxDD,
      maxDrawdownPeriod: `${maxDDStart} → ${maxDDEnd}`
    };
  }
  
  // ==========================================================================
  // SNAPSHOT
  // ==========================================================================
  
  getSnapshot(atDate) {
    const date = atDate || this.dateEnd;
    return {
      date,
      shares: this.getCurrentShares(date),
      price: this.getPriceAtDate(date),
      marketValue: this.getCurrentValue(date),
      costBasis: this.getCapitalInvested(date),
      unrealizedPL: this.getUnrealizedPL(date),
      realizedPL: this.getRealizedPL(date),
      dividends: this.getTotalDividends(date),
      cashAvailable: this.cashAvailable
    };
  }
}

// Export per uso globale
window.Position = Position;
