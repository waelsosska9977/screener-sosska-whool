import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ExternalLink, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight 
} from 'lucide-react';
import { CoinTicker } from '../types/scanner';

interface MarketTableProps {
  tickers: CoinTicker[];
  searchQuery: string;
  onOpenTradingView: (symbol: string) => void;
}

type SortField = 'symbol' | 'price' | 'change' | 'volume';

export const MarketTable: React.FC<MarketTableProps> = ({
  tickers,
  searchQuery,
  onOpenTradingView,
}) => {
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredTickers = tickers.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.symbol.toLowerCase().includes(q) || t.baseAsset.toLowerCase().includes(q);
  });

  const sortedTickers = [...filteredTickers].sort((a, b) => {
    let diff = 0;
    if (sortField === 'symbol') diff = a.baseAsset.localeCompare(b.baseAsset);
    if (sortField === 'price') diff = a.price - b.price;
    if (sortField === 'change') diff = a.priceChange24h - b.priceChange24h;
    if (sortField === 'volume') diff = a.volumeQuote24h - b.volumeQuote24h;
    return sortDirection === 'asc' ? diff : -diff;
  });

  const totalPages = Math.ceil(sortedTickers.length / itemsPerPage);
  const paginatedTickers = sortedTickers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (price: number) => {
    if (price < 0.0001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(3);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${Math.round(val / 1000)}K`;
  };

  return (
    <div className="rounded-2xl bg-[#0f141f] border border-slate-800/80 shadow-xl overflow-hidden my-4">
      <div className="p-4 bg-[#121824] border-b border-slate-800 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">قائمة أزواج بينانس النشطة (350+ عملة)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono-numbers text-xs">
            {filteredTickers.length} زوج
          </span>
        </div>
        <div className="text-slate-400 text-xs">
          الصفحة {currentPage} من {Math.max(1, totalPages)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs sm:text-sm">
          <thead className="bg-[#0b0e14] text-slate-400 border-b border-slate-800 text-[11px] sm:text-xs">
            <tr>
              <th className="py-3 px-4 font-bold cursor-pointer" onClick={() => handleSort('symbol')}>
                <div className="flex items-center gap-1">
                  <span>العملة / الزوج</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold cursor-pointer text-left" onClick={() => handleSort('price')}>
                <div className="flex items-center justify-end gap-1">
                  <span>السعر اللحظي</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold cursor-pointer text-left" onClick={() => handleSort('change')}>
                <div className="flex items-center justify-end gap-1">
                  <span>التغير (24h)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold cursor-pointer text-left hidden sm:table-cell" onClick={() => handleSort('volume')}>
                <div className="flex items-center justify-end gap-1">
                  <span>حجم التداول (24h)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
            {paginatedTickers.map((ticker) => {
              const isPos = ticker.priceChange24h >= 0;
              const binanceTradeUrl = `https://www.binance.com/ar/trade/${ticker.baseAsset}_USDT?type=spot`;

              return (
                <tr 
                  key={ticker.symbol}
                  className="hover:bg-slate-850/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                        {ticker.baseAsset.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-white font-sans">{ticker.baseAsset}</div>
                        <div className="text-[11px] text-slate-400">USDT</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-left font-bold text-white">
                    ${formatPrice(ticker.price)}
                  </td>

                  <td className="py-3 px-4 text-left">
                    <span className={`inline-flex items-center gap-1 font-bold ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{isPos ? '+' : ''}{ticker.priceChange24h.toFixed(2)}%</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-left hidden sm:table-cell text-slate-300">
                    {formatVolume(ticker.volumeQuote24h)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={binanceTradeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 font-sans"
                        title="شراء وبيع في بينانس"
                      >
                        <span>بينانس</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => onOpenTradingView(ticker.symbol)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1 font-sans"
                        title="فتح شارت TradingView"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>شارت</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="p-3 bg-[#0c1017] border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            السابق
          </button>
          <div className="flex items-center gap-1 font-mono-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${
                    currentPage === p
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};
