import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  Trash2, 
  TrendingUp, 
  Sparkles,
  Zap
} from 'lucide-react';
import { FeedLogItem } from '../types/scanner';

interface LiveFeedProps {
  logs: FeedLogItem[];
  onClearLogs: () => void;
  onSelectCoin: (symbol: string) => void;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({
  logs,
  onClearLogs,
  onSelectCoin,
}) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep internal container at top when new items arrive if autoScroll is enabled
  // NEVER call scrollIntoView because that scrolls the main window viewport!
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      log.symbol.toLowerCase().includes(q) ||
      log.baseAsset.toLowerCase().includes(q) ||
      log.tag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-2xl bg-[#0e131c] border border-slate-800/90 shadow-xl overflow-hidden flex flex-col h-[280px] lg:h-[320px]">
      
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-[#121926]/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h2 className="font-bold text-slate-200 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>سجل التدفق المباشر (الأحدث في الأعلى)</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono-numbers text-[11px]">
            {filteredLogs.length} تدفق
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick filter inside log */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="تصفية السجل (BTC, PEPE...)"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 w-36"
            />
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
              autoScroll 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="تثبيت العرض على الأحدث في الأعلى"
          >
            تثبيت الأحدث {autoScroll ? '✓' : '✕'}
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
            title="مسح السجل"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Streaming Terminal Content - Newest at the Top */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 bg-[#090d14]/80"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 py-6">
            <div className="w-8 h-8 rounded-full border border-dashed border-slate-700 animate-spin flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs">في انتظار التقاط أول دفعة سيولة حية...</p>
            <p className="text-[11px] text-slate-600">
              يمكنك الضغط على زر <span className="text-purple-400">🧪 وضع التجربة / محاكاة</span> لاختبار التدفق فوراً
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isWhale = log.isWhale || log.amountUSD >= 150000;
            const isBreakout = log.tag.includes('قبل الانفجار');
            const isLatest = index === 0;

            return (
              <div
                key={log.id}
                onClick={() => onSelectCoin(log.symbol)}
                className={`group flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLatest
                    ? 'ring-1 ring-emerald-400/50 bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                    : isWhale
                    ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-950/30'
                    : isBreakout
                    ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-950/25'
                    : 'bg-[#111722]/60 border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-800/50'
                }`}
              >
                {/* Streaming Tag matching user example: "2:39:34 ص - 💧 لحظية BTC $168K الآن - قبل الانفجار" */}
                <div className="flex items-center gap-2 overflow-x-hidden">
                  {isLatest && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-slate-950 font-black animate-pulse">
                      الآن
                    </span>
                  )}
                  <span className="text-slate-400 text-[11px] whitespace-nowrap font-mono-numbers">
                    {log.formattedTime}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className={`font-semibold tracking-wide ${
                    isWhale 
                      ? 'text-purple-300' 
                      : isBreakout 
                      ? 'text-amber-300' 
                      : 'text-emerald-300'
                  }`}>
                    {log.tag.split(' - ')[1] || log.tag}
                  </span>
                  {log.isSimulated && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-900/40 text-purple-300 border border-purple-700/40">
                      محاكاة
                    </span>
                  )}
                </div>

                {/* Right side stats & quick action */}
                <div className="flex items-center gap-3 shrink-0 mr-2 text-[11px]">
                  <span className="text-slate-300 font-mono-numbers">
                    ${log.price < 1 ? log.price.toFixed(6) : log.price.toFixed(3)}
                  </span>
                  <span className={`font-mono-numbers font-bold ${
                    log.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {log.priceChange24h >= 0 ? '+' : ''}{log.priceChange24h.toFixed(2)}%
                  </span>
                  <span className="text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
