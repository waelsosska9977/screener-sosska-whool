import { CoinTicker, InflowSignal, FeedLogItem, ScannerStats, SignalCategory } from '../types/scanner';

export type ScannerStatus = 'connecting' | 'connected_ws' | 'polling_rest' | 'paused' | 'error';

interface VolumeSnapshot {
  quoteVolume: number;
  price: number;
  timestamp: number;
}

export const EXCLUDED_SYMBOLS = new Set([
  'USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT', 'USDPUSDT', 'BUSDUSDT',
  'EURUSDT', 'DAIUSDT', 'AEURUSDT', 'EURIUSDT', 'USDDUSDT',
  'USTCUSDT', 'PAXUSDT', 'USDUSDT', 'BFDUSDUSDT', 'WBTCUSDT',
  'WBETHUSDT', 'SUSDUSDT', 'CUSDUSDT'
]);

export function isValidTradingPair(sym: string): boolean {
  if (!sym.endsWith('USDT')) return false;
  if (EXCLUDED_SYMBOLS.has(sym)) return false;
  if (
    sym.includes('UPUSDT') ||
    sym.includes('DOWNUSDT') ||
    sym.includes('BEARUSDT') ||
    sym.includes('BULLUSDT')
  ) {
    return false;
  }
  return true;
}

export class BinanceScannerService {
  private ws: WebSocket | null = null;
  private restPollTimer: number | null = null;
  private isScanning: boolean = false;
  private minSurgeUSD: number = 75000;
  private symbolsData: Map<string, CoinTicker> = new Map();
  private volumeSnapshots: Map<string, VolumeSnapshot> = new Map();
  private status: ScannerStatus = 'paused';
  
  // Callbacks
  private onSignalCallback: ((signal: InflowSignal) => void) | null = null;
  private onFeedCallback: ((log: FeedLogItem) => void) | null = null;
  private onStatsCallback: ((stats: ScannerStats) => void) | null = null;
  private onStatusCallback: ((status: ScannerStatus) => void) | null = null;
  private onTickersUpdateCallback: ((tickers: CoinTicker[]) => void) | null = null;

  private stats: ScannerStats = {
    scannedCount: 0,
    inflowAlertsCount: 0,
    lowCapBreakoutsCount: 0,
    preBreakoutCount: 0,
    totalWhaleVolumeUSD: 0,
    lastUpdated: Date.now(),
  };

  constructor() {
    this.minSurgeUSD = 75000;
  }

  public setMinSurge(minUSD: number) {
    this.minSurgeUSD = minUSD;
  }

  public setCallbacks(callbacks: {
    onSignal?: (signal: InflowSignal) => void;
    onFeed?: (log: FeedLogItem) => void;
    onStats?: (stats: ScannerStats) => void;
    onStatus?: (status: ScannerStatus) => void;
    onTickersUpdate?: (tickers: CoinTicker[]) => void;
  }) {
    if (callbacks.onSignal) this.onSignalCallback = callbacks.onSignal;
    if (callbacks.onFeed) this.onFeedCallback = callbacks.onFeed;
    if (callbacks.onStats) this.onStatsCallback = callbacks.onStats;
    if (callbacks.onStatus) this.onStatusCallback = callbacks.onStatus;
    if (callbacks.onTickersUpdate) this.onTickersUpdateCallback = callbacks.onTickersUpdate;
  }

  private updateStatus(status: ScannerStatus) {
    this.status = status;
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  public start() {
    if (this.isScanning) return;
    this.isScanning = true;
    this.updateStatus('connecting');

    // Fetch initial REST ticker to populate symbols
    this.fetchInitialTickers().then(() => {
      if (this.isScanning) {
        this.connectWebSocket();
      }
    }).catch(() => {
      // Fallback directly to websocket or rest
      if (this.isScanning) {
        this.connectWebSocket();
      }
    });
  }

  public pause() {
    this.isScanning = false;
    this.disconnectWebSocket();
    if (this.restPollTimer) {
      window.clearInterval(this.restPollTimer);
      this.restPollTimer = null;
    }
    this.updateStatus('paused');
  }

  private disconnectWebSocket() {
    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }

  private async fetchInitialTickers() {
    const endpoints = [
      'https://api.binance.com/api/v3/ticker/24hr',
      'https://data-api.binance.vision/api/v3/ticker/24hr',
      'https://api1.binance.com/api/v3/ticker/24hr',
    ];

    for (const url of endpoints) {
      try {
        const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!resp.ok) continue;
        const data = await resp.json();
        if (Array.isArray(data)) {
          this.processRawTickers(data);
          return;
        }
      } catch {
        // try next endpoint
      }
    }
  }

  private processRawTickers(data: Array<{
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
  }>) {
    const now = Date.now();
    let count = 0;

    data.forEach(item => {
      const sym = item.symbol;
      if (isValidTradingPair(sym)) {
        const quoteVol = parseFloat(item.quoteVolume) || 0;
        const price = parseFloat(item.lastPrice) || 0;
        const change = parseFloat(item.priceChangePercent) || 0;
        const high = parseFloat(item.highPrice) || 0;
        const low = parseFloat(item.lowPrice) || 0;
        const baseVol = parseFloat(item.volume) || 0;
        const baseAsset = sym.replace('USDT', '');

        const ticker: CoinTicker = {
          symbol: sym,
          baseAsset,
          price,
          priceChange24h: change,
          high24h: high,
          low24h: low,
          volumeBase24h: baseVol,
          volumeQuote24h: quoteVol,
          lastUpdated: now,
        };

        this.symbolsData.set(sym, ticker);

        if (!this.volumeSnapshots.has(sym)) {
          this.volumeSnapshots.set(sym, {
            quoteVolume: quoteVol,
            price,
            timestamp: now,
          });
        }

        count++;
      }
    });

    this.stats.scannedCount = count;
    this.stats.lastUpdated = now;
    if (this.onStatsCallback) this.onStatsCallback({ ...this.stats });
    if (this.onTickersUpdateCallback) {
      this.onTickersUpdateCallback(Array.from(this.symbolsData.values()));
    }
  }

  private connectWebSocket() {
    this.disconnectWebSocket();

    try {
      // Binance mini-ticker array stream provides all active pairs updated every second
      const wsUrl = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (!this.isScanning) return;
        this.updateStatus('connected_ws');
      };

      this.ws.onmessage = (event) => {
        if (!this.isScanning) return;
        try {
          const raw = JSON.parse(event.data);
          if (Array.isArray(raw)) {
            this.handleMiniTickerBatch(raw);
          }
        } catch {}
      };

      this.ws.onerror = () => {
        if (this.isScanning) {
          this.startRestPolling();
        }
      };

      this.ws.onclose = () => {
        if (this.isScanning) {
          // Attempt fallback or retry after 3 seconds
          window.setTimeout(() => {
            if (this.isScanning) {
              this.startRestPolling();
            }
          }, 3000);
        }
      };
    } catch {
      this.startRestPolling();
    }
  }

  private startRestPolling() {
    if (!this.isScanning) return;
    this.updateStatus('polling_rest');
    if (this.restPollTimer) return;

    this.restPollTimer = window.setInterval(async () => {
      if (!this.isScanning) return;
      try {
        await this.fetchInitialTickers();
        this.evaluateTickersForInflows();
      } catch {}
    }, 6000);
  }

  private evaluateTickersForInflows() {
    const now = Date.now();
    this.symbolsData.forEach((ticker, sym) => {
      const snap = this.volumeSnapshots.get(sym);
      if (!snap) {
        this.volumeSnapshots.set(sym, {
          quoteVolume: ticker.volumeQuote24h,
          price: ticker.price,
          timestamp: now,
        });
        return;
      }

      const deltaQuote = ticker.volumeQuote24h - snap.quoteVolume;
      const timeDiff = (now - snap.timestamp) / 1000;

      // Update snapshot periodically or when delta is detected
      if (deltaQuote > 0) {
        if (deltaQuote >= this.minSurgeUSD && timeDiff <= 30) {
          this.triggerSignal(ticker, deltaQuote, now);
        }
        snap.quoteVolume = ticker.volumeQuote24h;
        snap.price = ticker.price;
        snap.timestamp = now;
      }
    });
  }

  private handleMiniTickerBatch(
    items: Array<{
      s: string; // symbol
      c: string; // close
      o: string; // open
      h: string; // high
      l: string; // low
      v: string; // base vol
      q: string; // quote vol
    }>
  ) {
    const now = Date.now();
    let newSignalsTriggered = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const sym = item.s;
      if (!isValidTradingPair(sym)) continue;

      const currentQuoteVol = parseFloat(item.q) || 0;
      const currentPrice = parseFloat(item.c) || 0;
      const openPrice = parseFloat(item.o) || currentPrice;
      const priceChange24h = openPrice > 0 ? ((currentPrice - openPrice) / openPrice) * 100 : 0;
      const baseAsset = sym.replace('USDT', '');

      let ticker = this.symbolsData.get(sym);
      if (!ticker) {
        ticker = {
          symbol: sym,
          baseAsset,
          price: currentPrice,
          priceChange24h,
          high24h: parseFloat(item.h) || currentPrice,
          low24h: parseFloat(item.l) || currentPrice,
          volumeBase24h: parseFloat(item.v) || 0,
          volumeQuote24h: currentQuoteVol,
          lastUpdated: now,
        };
        this.symbolsData.set(sym, ticker);
      } else {
        ticker.price = currentPrice;
        ticker.priceChange24h = priceChange24h;
        ticker.volumeQuote24h = currentQuoteVol;
        ticker.volumeBase24h = parseFloat(item.v) || ticker.volumeBase24h;
        ticker.lastUpdated = now;
      }

      const snap = this.volumeSnapshots.get(sym);
      if (!snap) {
        this.volumeSnapshots.set(sym, {
          quoteVolume: currentQuoteVol,
          price: currentPrice,
          timestamp: now,
        });
        continue;
      }

      const deltaQuote = currentQuoteVol - snap.quoteVolume;
      const timeDiff = (now - snap.timestamp) / 1000;

      // Inflow Detection Logic:
      // Delta quote volume in USDT since last snapshot
      if (deltaQuote >= this.minSurgeUSD && timeDiff >= 1 && timeDiff <= 25) {
        this.triggerSignal(ticker, deltaQuote, now);
        newSignalsTriggered++;

        // Reset baseline after trigger
        snap.quoteVolume = currentQuoteVol;
        snap.price = currentPrice;
        snap.timestamp = now;
      } else if (timeDiff > 15 || deltaQuote > 0) {
        // Keep moving baseline
        snap.quoteVolume = currentQuoteVol;
        snap.price = currentPrice;
        snap.timestamp = now;
      }
    }

    this.stats.scannedCount = this.symbolsData.size;
    this.stats.lastUpdated = now;

    if (newSignalsTriggered > 0 && this.onStatsCallback) {
      this.onStatsCallback({ ...this.stats });
    }
  }

  private triggerSignal(
    ticker: CoinTicker,
    surgeAmountUSD: number,
    timestamp: number,
    isSimulated: boolean = false
  ) {
    const formattedTime = this.formatArabicTime(new Date(timestamp));
    
    // Classify signal category
    let category: SignalCategory = 'surge';
    let categoryBadge = '⚡ اختراق سيولة لحظي';
    let intensity: 'normal' | 'high' | 'ultra' = 'normal';

    const isPreBreakout = ticker.priceChange24h >= -3.5 && ticker.priceChange24h <= 4.8;
    const isWhale = surgeAmountUSD >= 150000;
    const isLowCap = ticker.volumeQuote24h < 30000000; // < $30M 24h volume

    if (isWhale) {
      category = 'whale';
      categoryBadge = '🏛️ دخول مؤسسات/حيتان';
      intensity = surgeAmountUSD >= 350000 ? 'ultra' : 'high';
    } else if (isPreBreakout) {
      category = 'breakout';
      categoryBadge = '🎯 فرصة قبل الانفجار';
      intensity = 'high';
    } else if (isLowCap) {
      category = 'lowcap';
      categoryBadge = '💎 انفجار عملة صغيرة';
      intensity = 'normal';
    }

    const signal: InflowSignal = {
      id: `${ticker.symbol}-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
      symbol: ticker.symbol,
      baseAsset: ticker.baseAsset,
      price: ticker.price,
      priceChange24h: ticker.priceChange24h,
      surgeAmountUSD,
      volume24hUSD: ticker.volumeQuote24h,
      timestamp,
      formattedTime,
      category,
      categoryBadge,
      intensity,
      isSimulated,
    };

    // Update stats
    this.stats.inflowAlertsCount++;
    this.stats.totalWhaleVolumeUSD += surgeAmountUSD;
    if (category === 'breakout') this.stats.preBreakoutCount++;
    if (category === 'lowcap') this.stats.lowCapBreakoutsCount++;
    this.stats.lastUpdated = timestamp;

    // Create Feed item matching exact required format:
    // e.g. "2:39:34 ص - 💧 لحظية BTC $168K الآن - قبل الانفجار"
    const surgeK = Math.round(surgeAmountUSD / 1000);
    const tagEmoji = isWhale ? '🐋 حوت' : isPreBreakout ? '💧 لحظية' : '⚡ تدفق';
    const tagText = `${tagEmoji} ${ticker.baseAsset} $${surgeK}K الآن - ${category === 'breakout' ? 'قبل الانفجار' : category === 'whale' ? 'دخول مؤسسات' : 'سيولة صاعدة'}`;

    const feedItem: FeedLogItem = {
      id: `feed-${signal.id}`,
      symbol: ticker.symbol,
      baseAsset: ticker.baseAsset,
      amountUSD: surgeAmountUSD,
      formattedTime,
      tag: `${formattedTime} - ${tagText}`,
      categoryBadge,
      price: ticker.price,
      priceChange24h: ticker.priceChange24h,
      isWhale,
      isSimulated,
    };

    if (this.onSignalCallback) this.onSignalCallback(signal);
    if (this.onFeedCallback) this.onFeedCallback(feedItem);
    if (this.onStatsCallback) this.onStatsCallback({ ...this.stats });
  }

  // Inject Simulated Test Whale
  public injectSimulatedWhale(customSymbol?: string, customAmount?: number) {
    const popularSymbols = [
      'SOLUSDT', 'PEPEUSDT', 'SUIUSDT', 'BTCUSDT', 'ETHUSDT',
      'DOGEUSDT', 'NEARUSDT', 'AVAXUSDT', 'RENDERUSDT', 'LINKUSDT',
      'APTUSDT', 'INJUSDT', 'FETUSDT', 'SEIUSDT', 'WIFUSDT'
    ];

    const targetSymbol = customSymbol || popularSymbols[Math.floor(Math.random() * popularSymbols.length)];
    let ticker = this.symbolsData.get(targetSymbol);

    // If ticker data is not yet in cache, create realistic placeholder
    if (!ticker) {
      const defaultPrices: Record<string, number> = {
        BTCUSDT: 68450,
        ETHUSDT: 2620,
        SOLUSDT: 154.2,
        PEPEUSDT: 0.0000098,
        SUIUSDT: 2.15,
        DOGEUSDT: 0.125,
        NEARUSDT: 4.85,
        AVAXUSDT: 28.4,
        RENDERUSDT: 5.62,
        LINKUSDT: 11.8,
      };
      const price = defaultPrices[targetSymbol] || 1.25;
      const baseAsset = targetSymbol.replace('USDT', '');

      ticker = {
        symbol: targetSymbol,
        baseAsset,
        price,
        priceChange24h: +(Math.random() * 6 - 2.5).toFixed(2), // between -2.5% and +3.5% (sweet pre-breakout spot)
        high24h: +(price * 1.04).toFixed(4),
        low24h: +(price * 0.96).toFixed(4),
        volumeBase24h: 1500000,
        volumeQuote24h: 45000000 + Math.random() * 200000000,
        lastUpdated: Date.now(),
      };
      this.symbolsData.set(targetSymbol, ticker);
    }

    const surgeAmount = customAmount || (Math.floor(Math.random() * 8) + 1) * 75000 + Math.floor(Math.random() * 45000); // $75K - $650K
    const now = Date.now();

    this.triggerSignal(ticker, surgeAmount, now, true);
  }

  private formatArabicTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  }

  public getStats(): ScannerStats {
    return { ...this.stats };
  }

  public getTickers(): CoinTicker[] {
    return Array.from(this.symbolsData.values());
  }

  public getStatus(): ScannerStatus {
    return this.status;
  }
}

export const binanceScanner = new BinanceScannerService();
