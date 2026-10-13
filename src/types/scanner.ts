export interface CoinTicker {
  symbol: string;
  baseAsset: string;
  price: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  volumeBase24h: number;
  volumeQuote24h: number; // in USDT
  lastUpdated: number;
}

export type SignalCategory = 'breakout' | 'whale' | 'lowcap' | 'surge';

export interface InflowSignal {
  id: string;
  symbol: string;
  baseAsset: string;
  price: number;
  priceChange24h: number;
  surgeAmountUSD: number;
  volume24hUSD: number;
  timestamp: number;
  formattedTime: string;
  category: SignalCategory;
  categoryBadge: string;
  intensity: 'normal' | 'high' | 'ultra';
  isSimulated?: boolean;
}

export interface FeedLogItem {
  id: string;
  symbol: string;
  baseAsset: string;
  amountUSD: number;
  formattedTime: string;
  tag: string;
  categoryBadge: string;
  price: number;
  priceChange24h: number;
  isWhale: boolean;
  isSimulated?: boolean;
}

export interface ScannerStats {
  scannedCount: number;
  inflowAlertsCount: number;
  lowCapBreakoutsCount: number;
  preBreakoutCount: number;
  totalWhaleVolumeUSD: number;
  lastUpdated: number;
}

export interface FilterSettings {
  minSurgeUSD: number;
  category: 'all' | 'breakout' | 'whale' | 'lowcap';
  searchQuery: string;
  sortBy: 'time' | 'surge' | 'change' | 'volume';
}

export type SoundType = 'sonar' | 'ping' | 'cyber' | 'chime';
