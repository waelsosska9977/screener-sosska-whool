import React from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  TableProperties, 
  Target, 
  Building2, 
  Sparkles, 
  Filter
} from 'lucide-react';
import { FilterSettings } from '../types/scanner';

interface FilterBarProps {
  filters: FilterSettings;
  onChangeFilters: (newFilters: Partial<FilterSettings>) => void;
  viewMode: 'cards' | 'table';
  onToggleViewMode: (mode: 'cards' | 'table') => void;
  totalSignalsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  viewMode,
  onToggleViewMode,
  totalSignalsCount,
}) => {
  const categories = [
    { id: 'all', label: 'الكل', count: null, icon: Filter },
    { id: 'breakout', label: '🎯 قبل الانفجار', count: null, icon: Target },
    { id: 'whale', label: '🏛️ حيتان ومؤسسات', count: null, icon: Building2 },
    { id: 'lowcap', label: '💎 عملات صغيرة', count: null, icon: Sparkles },
  ];

  const surgeThresholds = [
    { label: '$25K+', val: 25000 },
    { label: '$50K+', val: 50000 },
    { label: '$75K+', val: 75000 },
    { label: '$150K+', val: 150000 },
    { label: '$300K+', val: 300000 },
  ];

  return (
    <div className="bg-[#0f141f] border border-slate-800/80 rounded-2xl p-3 sm:p-4 my-4 shadow-lg space-y-3">
      
      {/* Top row: Categories & View Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChangeFilters({ category: cat.id as FilterSettings['category'] })}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filters.category === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-slate-400 hidden sm:inline">العرض:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => onToggleViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'cards'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض البطاقات النشطة"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">بطاقات الفرص</span>
            </button>

            <button
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض الجدول المباشر لكافة العملات"
            >
              <TableProperties className="w-4 h-4" />
              <span className="hidden sm:inline">جدول السوق الكامل</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom row: Search and Surge Thresholds */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث عن عملة (BTC, SOL, PEPE, SUI...)"
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ searchQuery: e.target.value })}
            className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all"
          />
        </div>

        {/* Min Inflow Surge Threshold Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>حد التدفق:</span>
          </span>
          <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-xl border border-slate-800">
            {surgeThresholds.map((th) => (
              <button
                key={th.val}
                onClick={() => onChangeFilters({ minSurgeUSD: th.val })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all font-mono-numbers ${
                  filters.minSurgeUSD === th.val
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
