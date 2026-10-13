import React from 'react';
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  BarChart3, 
  Layers, 
  ShieldAlert,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { InflowSignal } from '../types/scanner';

interface SignalCardsProps {
  signals: InflowSignal[];
  onOpenTradingView: (symbol: string) => void;
}

export const SignalCards: React.FC<SignalCardsProps> = ({
  signals,
  onOpenTradingView,
}) => {
  const formatUSD = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${Math.round(val / 1000)}K`;
  };

  const formatPrice = (price: number) => {
    if (price < 0.0001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(3);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'الآن';
    if (seconds < 60) return `منذ ${seconds} ثانية`;
    const mins = Math.floor(seconds / 60);
    return `منذ ${mins} دقيقة`;
  };

  if (signals.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0e131c]/60 p-12 text-center my-6">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Zap className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">لا توجد إشارات سيولة مسجلة حتى الآن</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
          الماسح يعمل بالخلفية ويرصد أي تدفق يتجاوز الحد الأدنى. اضغط على وضع المحاكاة لمشاهدة بطاقات الحيتان فوراً.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
      {signals.map((sig) => {
        const isPositive = sig.priceChange24h >= 0;
        const isWhale = sig.category === 'whale' || sig.surgeAmountUSD >= 150000;
        const isPreBreakout = sig.category === 'breakout';
        
        // Border styling based on category and momentum
        const borderGlowClass = isWhale
          ? 'border-purple-500/70 shadow-purple-950/40 glow-card-cyan'
          : isPreBreakout
          ? 'border-amber-500/70 shadow-amber-950/40 glow-card-green'
          : isPositive
          ? 'border-emerald-500/70 shadow-emerald-950/40'
          : 'border-rose-500/60 shadow-rose-950/30';

        const binanceTradeUrl = `https://www.binance.com/ar/trade/${sig.baseAsset}_USDT?type=spot`;

        return (
          <div
            key={sig.id}
            className={`relative rounded-2xl bg-gradient-to-b from-[#121824] to-[#0c1017] border-2 ${borderGlowClass} p-4 sm:p-5 shadow-xl transition-all duration-300 hover:scale-[1.015] flex flex-col justify-between`}
          >
            {/* Top row: Symbol, Price, 24h Change */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center font-black text-white text-base shadow-inner">
                    {sig.baseAsset.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-white tracking-tight">
                        {sig.baseAsset}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/USDT</span>
                      {sig.isSimulated && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          تجريبي
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 font-mono-numbers">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{sig.formattedTime}</span>
                      <span className="text-slate-600">({getTimeAgo(sig.timestamp)})</span>
                    </div>
                  </div>
                </div>

                {/* Price & 24h Change */}
                <div className="text-left">
                  <div className="text-base sm:text-lg font-bold text-white font-mono-numbers">
                    ${formatPrice(sig.price)}
                  </div>
                  <div className={`text-xs font-bold flex items-center justify-end gap-1 font-mono-numbers ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isPositive ? '+' : ''}{sig.priceChange24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Inflow Volume Highlight Banner (e.g. 💰 $392K دخلت الآن - وقت الدخول بالثانية) */}
              <div className={`mt-3.5 p-3 rounded-xl border flex items-center justify-between ${
                isWhale
                  ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                  : isPreBreakout
                  ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <div>
                    <div className="text-sm sm:text-base font-black tracking-tight font-mono-numbers">
                      {formatUSD(sig.surgeAmountUSD)} دخلت الآن
                    </div>
                    <div className="text-[11px] text-slate-400">
                      وقت الدخول بالثانية: <span className="text-slate-300 font-mono-numbers">{sig.formattedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    sig.intensity === 'ultra' 
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {sig.intensity === 'ultra' ? 'تدفق فائق 🔥' : 'فوري ⚡'}
                  </span>
                </div>
              </div>

              {/* Total 24h Volume and Category Badge */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">حجم تداول 24 ساعة:</span>
                  <span className="font-bold text-slate-200 font-mono-numbers">
                    {formatUSD(sig.volume24hUSD)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-center">
                  <span className="text-slate-400 block text-[11px]">تصنيف الإشارة:</span>
                  <span className="font-bold text-emerald-400 truncate">
                    {sig.categoryBadge}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Binance Spot & TradingView Chart */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              
              {/* Binance Direct Spot Link */}
              <a
                href={binanceTradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 text-center"
              >
                <span>🚀 تداول في بينانس</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {/* TradingView Chart Modal Button */}
              <button
                type="button"
                onClick={() => onOpenTradingView(sig.symbol)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>📈 شارت TradingView</span>
              </button>

            </div>

          </div>
        );
      })}
    </div>
  );
};
