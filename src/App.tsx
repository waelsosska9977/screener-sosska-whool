import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { LiveFeed } from './components/LiveFeed';
import { SignalCards } from './components/SignalCards';
import { FilterBar } from './components/FilterBar';
import { MarketTable } from './components/MarketTable';
import { TradingViewModal } from './components/TradingViewModal';
import { 
  binanceScanner, 
  ScannerStatus 
} from './services/binanceScanner';
import { 
  InflowSignal, 
  FeedLogItem, 
  ScannerStats, 
  FilterSettings, 
  SoundType, 
  CoinTicker 
} from './types/scanner';
import { soundSynth } from './utils/audioSynthesizer';
import { 
  HelpCircle, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Layers
} from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ScannerStatus>('connecting');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [soundType, setSoundType] = useState<SoundType>('sonar');
  const [audioVolume, setAudioVolume] = useState<number>(0.65);
  
  const [signals, setSignals] = useState<InflowSignal[]>([]);
  const [logs, setLogs] = useState<FeedLogItem[]>([]);
  const [stats, setStats] = useState<ScannerStats>({
    scannedCount: 350,
    inflowAlertsCount: 0,
    lowCapBreakoutsCount: 0,
    preBreakoutCount: 0,
    totalWhaleVolumeUSD: 0,
    lastUpdated: Date.now(),
  });
  const [allTickers, setAllTickers] = useState<CoinTicker[]>([]);
  
  const [filters, setFilters] = useState<FilterSettings>({
    minSurgeUSD: 75000,
    category: 'all',
    searchQuery: '',
    sortBy: 'time',
  });
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Initialize Scanner and callbacks
  useEffect(() => {
    soundSynth.setVolume(audioVolume);
    soundSynth.setMuted(!isAudioEnabled);

    binanceScanner.setMinSurge(filters.minSurgeUSD);

    binanceScanner.setCallbacks({
      onSignal: (newSignal) => {
        setSignals((prev) => {
          // Remove previous signal of the same coin so it updates and moves to the top
          const filtered = prev.filter((s) => s.symbol !== newSignal.symbol);
          return [newSignal, ...filtered].slice(0, 60);
        });

        // Trigger Audio Alert
        soundSynth.play(soundType);
      },

      onFeed: (newLog) => {
        // Always place the newest live feed item at the top
        setLogs((prev) => [newLog, ...prev].slice(0, 80));
      },

      onStats: (newStats) => {
        setStats(newStats);
      },

      onStatus: (newStatus) => {
        setStatus(newStatus);
      },

      onTickersUpdate: (tickers) => {
        setAllTickers(tickers);
      },
    });

    // Start scanner automatically on mount
    binanceScanner.start();

    // Seed 2 initial sample test signals so interface is immediately responsive
    const seedTimer = window.setTimeout(() => {
      binanceScanner.injectSimulatedWhale('SOLUSDT', 392000);
      binanceScanner.injectSimulatedWhale('PEPEUSDT', 168000);
    }, 1200);

    return () => {
      window.clearTimeout(seedTimer);
      binanceScanner.pause();
    };
  }, []);

  // Update threshold in scanner service when changed
  useEffect(() => {
    binanceScanner.setMinSurge(filters.minSurgeUSD);
  }, [filters.minSurgeUSD]);

  // Audio settings handlers
  const handleToggleAudio = () => {
    const nextVal = !isAudioEnabled;
    setIsAudioEnabled(nextVal);
    soundSynth.setMuted(!nextVal);
    if (nextVal) {
      soundSynth.unlock();
      soundSynth.play(soundType);
    }
  };

  const handleSelectSoundType = (type: SoundType) => {
    setSoundType(type);
    soundSynth.unlock();
    soundSynth.play(type);
  };

  const handleChangeVolume = (vol: number) => {
    setAudioVolume(vol);
    soundSynth.setVolume(vol);
  };

  // Scanner controls
  const handleStartScanning = () => {
    binanceScanner.start();
  };

  const handlePauseScanning = () => {
    binanceScanner.pause();
  };

  const handleInjectTestWhale = (symbol?: string, amount?: number) => {
    soundSynth.unlock();
    binanceScanner.injectSimulatedWhale(symbol, amount);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleFilterChange = (newFilters: Partial<FilterSettings>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Filter signals based on current user filter settings
  const filteredSignals = useMemo(() => {
    return signals.filter((sig) => {
      // Filter by min surge
      if (sig.surgeAmountUSD < filters.minSurgeUSD) return false;

      // Filter by category
      if (filters.category === 'breakout' && sig.category !== 'breakout') return false;
      if (filters.category === 'whale' && sig.category !== 'whale') return false;
      if (filters.category === 'lowcap' && sig.category !== 'lowcap') return false;

      // Filter by search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!sig.symbol.toLowerCase().includes(q) && !sig.baseAsset.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [signals, filters]);

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navigation & Controls */}
      <Header
        status={status}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        onStart={handleStartScanning}
        onPause={handlePauseScanning}
        onInjectTestWhale={handleInjectTestWhale}
        soundType={soundType}
        onSelectSoundType={handleSelectSoundType}
        audioVolume={audioVolume}
        onChangeVolume={handleChangeVolume}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Metric Counters Row */}
        <StatsBar stats={stats} />

        {/* Live Feed Log Section */}
        <div className="my-4">
          <LiveFeed
            logs={logs}
            onClearLogs={handleClearLogs}
            onSelectCoin={(symbol) => setSelectedChartSymbol(symbol)}
          />
        </div>

        {/* Filter and View Control Bar */}
        <FilterBar
          filters={filters}
          onChangeFilters={handleFilterChange}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          totalSignalsCount={filteredSignals.length}
        />

        {/* Active Content: Signal Cards or Market Table */}
        {viewMode === 'cards' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>بطاقات الفرص النشطة (Active Signal Cards)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono-numbers text-xs border border-emerald-500/30">
                  {filteredSignals.length} فرصة
                </span>
              </div>
              <button
                onClick={() => setShowGuideModal(true)}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>دليل قراءة إشارات الانفجار</span>
              </button>
            </div>

            <SignalCards
              signals={filteredSignals}
              onOpenTradingView={(sym) => setSelectedChartSymbol(sym)}
            />
          </div>
        ) : (
          <MarketTable
            tickers={allTickers}
            searchQuery={filters.searchQuery}
            onOpenTradingView={(sym) => setSelectedChartSymbol(sym)}
          />
        )}

        {/* Quantitative Quantitative Architecture Footer Note */}
        <div className="mt-10 mb-6 p-4 rounded-2xl bg-[#0f141f] border border-slate-800/80 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">
                محرك السيولة التفاضلية اللحظي V8 (Differential Quote Volume Engine)
              </span>
              <span>
                يقوم الماسح بحساب التغير اللحظي في السيولة (Delta Quote Volume) بالثانية لأكثر من 350 زوج مع احتساب العمولات (0.06%) والانزلاق السعري المحتمل.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono-numbers">
              Latency: &lt;100ms
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
              Binance v3 Realtime
            </span>
          </div>
        </div>

      </main>

      {/* TradingView Interactive Chart Modal */}
      <TradingViewModal
        symbol={selectedChartSymbol}
        onClose={() => setSelectedChartSymbol(null)}
      />

      {/* Guide / Educational Modal */}
      {showGuideModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowGuideModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-[#101622] border border-slate-700 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🎯 كيف تستفيد من إشارات ماسح V8 اللحظي؟</span>
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <span className="font-bold text-amber-300 block mb-1">1. إشارات "قبل الانفجار" (Pre-Breakout):</span>
                <span>
                  تظهر عندما تدخل سيولة ضخمة (&gt;$75K) بينما حركة السعر خلال 24 ساعة لا تزال هادئة ومتقاربة (-3% إلى +4%). هذا مؤشر كلاسيكي على التجميع المؤسسي الهادئ قبل اندفاع المضاربين.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25">
                <span className="font-bold text-purple-300 block mb-1">2. صفقات الحيتان والمؤسسات (&gt;$150K):</span>
                <span>
                  دفعات فورية تفوق 150 ألف إلى مليون دولار في ثوانٍ معدودة. انقر على "تداول في بينانس" أو "شارت TradingView" لتأكيد اختراق مستويات الدعم والمقاومة.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="font-bold text-emerald-300 block mb-1">3. التنبيهات الصوتية المباشرة:</span>
                <span>
                  تستخدم تقنية Web Audio API التخليقية لضمان سرعة استجابة فورية دون الحاجة لتحميل ملفات صوتية ثقيلة من الإنترنت.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all text-xs"
            >
              فهمت، العودة للماسح
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
