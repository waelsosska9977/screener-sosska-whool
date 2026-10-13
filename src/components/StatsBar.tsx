import React from 'react';
import { 
  Radar, 
  Droplet, 
  Sparkles, 
  Target, 
  Coins
} from 'lucide-react';
import { ScannerStats } from '../types/scanner';

interface StatsBarProps {
  stats: ScannerStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const formatMillions = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${Math.round(val / 1000)}K`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 my-4">
      
      {/* 1. مفحوص - Total Scanned */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111722] to-[#0c1017] border border-slate-800/80 p-3.5 sm:p-4 shadow-lg transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-400">مفحوص</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radar className="w-4 h-4 radar-sweep" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-numbers">
            {stats.scannedCount > 0 ? stats.scannedCount : '350+'}
          </span>
          <span className="text-xs font-medium text-cyan-400 font-mono-numbers">USDT Pairs</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          تغطية كاملة لجميع أزواج بينانس
        </div>
      </div>

      {/* 2. سيولة لحظية - Instant Inflow Alerts */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111722] to-[#0c1017] border border-emerald-500/30 p-3.5 sm:p-4 shadow-lg transition-all hover:border-emerald-500/60 shadow-emerald-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-emerald-300">سيولة لحظية</span>
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <Droplet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-numbers">
            {stats.inflowAlertsCount}
          </span>
          <span className="text-xs font-medium text-emerald-500/80">تنبيه مباشر</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          دخول فوري &gt; $50K بالثانية
        </div>
      </div>

      {/* 3. عملات صغيرة - Low-cap Breakouts */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111722] to-[#0c1017] border border-purple-500/30 p-3.5 sm:p-4 shadow-lg transition-all hover:border-purple-500/60 shadow-purple-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-purple-300">عملات صغيرة</span>
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono-numbers">
            {stats.lowCapBreakoutsCount}
          </span>
          <span className="text-xs font-medium text-purple-400/80">فرصة نادرة</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          سيولة استثنائية بالنسبة لحجمها
        </div>
      </div>

      {/* 4. قبل الانفجار - Pre-Breakout / Fresh Accumulation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111722] to-[#0c1017] border border-amber-500/30 p-3.5 sm:p-4 shadow-lg transition-all hover:border-amber-500/60 shadow-amber-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-amber-300">قبل الانفجار</span>
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-numbers">
            {stats.preBreakoutCount}
          </span>
          <span className="text-xs font-medium text-amber-400/80">تجميع هادئ</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          تراكم سيولة وتغير سعري متقارب
        </div>
      </div>

      {/* 5. إجمالي سيولة الحيتان - Whale Capital */}
      <div className="hidden lg:block relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111722] to-[#0c1017] border border-slate-800 p-3.5 sm:p-4 shadow-lg transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-400">إجمالي التدفق الرصدي</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono-numbers">
            {formatMillions(stats.totalWhaleVolumeUSD)}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          مجموع دفعات السيولة المرصودة
        </div>
      </div>

    </div>
  );
};
