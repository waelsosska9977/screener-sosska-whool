import React, { useState } from 'react';
import { X, ExternalLink, ArrowUpRight, BarChart2 } from 'lucide-react';

interface TradingViewModalProps {
  symbol: string | null;
  onClose: () => void;
}

export const TradingViewModal: React.FC<TradingViewModalProps> = ({
  symbol,
  onClose,
}) => {
  const [interval, setInterval] = useState<string>('15');

  if (!symbol) return null;

  const baseAsset = symbol.replace('USDT', '');
  const binanceSymbol = `BINANCE:${baseAsset}USDT`;
  const binanceTradeUrl = `https://www.binance.com/ar/trade/${baseAsset}_USDT?type=spot`;

  const intervals = [
    { label: '1د', value: '1' },
    { label: '5د', value: '5' },
    { label: '15د', value: '15' },
    { label: '1س', value: '60' },
    { label: '4س', value: '240' },
    { label: '1يوم', value: 'D' },
  ];

  const embedUrl = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    binanceSymbol
  )}&interval=${interval}&theme=dark&style=1&timezone=Etc%2FUTC&studies=[]&hide_side_toolbar=0&allow_symbol_change=1&save_image=1&details=1&calendar=0&hotlist=0`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[85vh] rounded-2xl bg-[#0d121c] border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#121824] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{baseAsset}/USDT</h3>
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Binance Spot
                </span>
              </div>
              <p className="text-xs text-slate-400">شارت مباشر تفاعلي مع مؤشرات السيولة والفوليوم</p>
            </div>
          </div>

          {/* Timeframes & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              {intervals.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setInterval(item.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    interval === item.value
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <a
              href={binanceTradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-amber-400 transition-all"
            >
              <span>تداول في بينانس</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded TradingView Chart Widget */}
        <div className="flex-1 w-full bg-[#0a0d14] relative">
          <iframe
            title={`TradingView-${symbol}`}
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[#101520] border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>مصدر البيانات: بينانس عبر TradingView Interactive Feed</span>
          <span className="font-mono-numbers">Symbol: {binanceSymbol}</span>
        </div>
      </div>
    </div>
  );
};
