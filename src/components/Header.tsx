import React, { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  Play, 
  Pause, 
  FlaskConical, 
  Volume2, 
  Radio, 
  Flame,
  ChevronDown
} from 'lucide-react';
import { ScannerStatus } from '../services/binanceScanner';
import { SoundType } from '../types/scanner';
import { soundSynth } from '../utils/audioSynthesizer';

interface HeaderProps {
  status: ScannerStatus;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onStart: () => void;
  onPause: () => void;
  onInjectTestWhale: (symbol?: string, amount?: number) => void;
  soundType: SoundType;
  onSelectSoundType: (type: SoundType) => void;
  audioVolume: number;
  onChangeVolume: (vol: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isAudioEnabled,
  onToggleAudio,
  onStart,
  onPause,
  onInjectTestWhale,
  soundType,
  onSelectSoundType,
  audioVolume,
  onChangeVolume,
}) => {
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case 'connected_ws':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>بث مباشر لحظي (WebSocket)</span>
          </span>
        );
      case 'polling_rest':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>فحص تتابعي (REST 5s)</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>جاري الاتصال بالسيرفر...</span>
          </span>
        );
      case 'paused':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/40 text-slate-400 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>الفحص متوقف مؤقتاً</span>
          </span>
        );
    }
  };

  const handleTestSound = () => {
    soundSynth.unlock();
    soundSynth.play(soundType);
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0c1017]/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-transparent border border-emerald-500/40 shadow-lg shadow-emerald-950/40">
                <span className="text-2xl select-none animate-pulse">⚡</span>
                <div className="absolute -inset-0.5 rounded-xl bg-emerald-500/20 blur opacity-40"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    <span>⚡ V8 ماسح السيولة اللحظية الكامل</span>
                    <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono-numbers">
                      350+ Coins
                    </span>
                  </h1>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span>Binance Public Live Inflow Engine</span>
                  <span className="text-slate-600">•</span>
                  {getStatusBadge()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            
            {/* Audio Alert Button */}
            <div className="relative">
              <button
                onClick={onToggleAudio}
                type="button"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  isAudioEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 shadow-amber-950/30'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={isAudioEnabled ? 'تنبيهات الصوت مفعلة' : 'الصوت مكتوم'}
              >
                {isAudioEnabled ? (
                  <>
                    <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span>🔔 التنبيه مفعّل</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 text-slate-500" />
                    <span>🔕 تفعيل التنبيه</span>
                  </>
                )}
              </button>

              {/* Sound Options Toggle */}
              {isAudioEnabled && (
                <button
                  onClick={() => setShowSoundMenu(!showSoundMenu)}
                  type="button"
                  className="absolute -bottom-2 -left-1 p-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                  title="خيارات الصوت والنغمة"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              )}

              {/* Sound Menu Dropdown */}
              {showSoundMenu && isAudioEnabled && (
                <div className="absolute left-0 mt-2 w-64 p-3 rounded-xl bg-[#111722] border border-slate-700 shadow-2xl z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-200">إعدادات الصوت</span>
                    <button
                      onClick={handleTestSound}
                      className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      تجربة الصوت
                    </button>
                  </div>
                  
                  <div className="mt-2.5">
                    <span className="text-slate-400 block mb-1">نوع الرنين:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'sonar', label: 'سونار حوت 🌊' },
                        { id: 'ping', label: 'رادار حاد 📡' },
                        { id: 'cyber', label: 'سايبر بلب ⚡' },
                        { id: 'chime', label: 'كاش شاين 💰' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectSoundType(item.id as SoundType);
                            soundSynth.play(item.id as SoundType);
                          }}
                          className={`px-2 py-1 rounded text-center transition-all ${
                            soundType === item.id
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>مستوى الصوت:</span>
                      <span className="font-mono-numbers">{Math.round(audioVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={audioVolume}
                      onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Test Simulation Whales Button */}
            <div className="relative">
              <button
                onClick={() => onInjectTestWhale()}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600/25 to-pink-600/25 text-purple-300 border border-purple-500/40 hover:from-purple-600/35 hover:to-pink-600/35 hover:border-purple-400 shadow-md shadow-purple-950/20 active:scale-95 transition-all cursor-pointer"
                title="حقن حوت تجريبي لاختبار الصوت والإشعارات"
              >
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span>🧪 وضع التجربة / محاكاة</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSimulateMenu(!showSimulateMenu);
                  }}
                  className="mr-1 px-1 py-0.5 rounded hover:bg-purple-500/30 text-purple-300 cursor-pointer"
                  title="قائمة المحاكاة السريعة"
                >
                  <ChevronDown className="w-3.5 h-3.5 inline" />
                </span>
              </button>

              {/* Simulation presets menu */}
              {showSimulateMenu && (
                <div className="absolute left-0 mt-2 w-56 p-2 rounded-xl bg-[#111722] border border-purple-500/40 shadow-2xl z-50 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 px-2 py-1 block border-b border-slate-800">
                    حقن حوت فوري محدد:
                  </span>
                  <div className="flex flex-col gap-1 mt-1.5">
                    {[
                      { sym: 'PEPEUSDT', name: 'PEPE', amt: 350000, label: '$350K - ميمي قبل الانفجار' },
                      { sym: 'SOLUSDT', name: 'SOL', amt: 1200000, label: '$1.2M - حوت سولانا مؤسسي' },
                      { sym: 'SUIUSDT', name: 'SUI', amt: 480000, label: '$480K - تدفق سيولة ضخم' },
                      { sym: 'DOGEUSDT', name: 'DOGE', amt: 650000, label: '$650K - حوت دوج كوين' },
                      { sym: 'BTCUSDT', name: 'BTC', amt: 2500000, label: '$2.5M - حوت البيتكوين' },
                    ].map((sim) => (
                      <button
                        key={sim.sym}
                        onClick={() => {
                          onInjectTestWhale(sim.sym, sim.amt);
                          setShowSimulateMenu(false);
                        }}
                        className="text-right px-2.5 py-1.5 rounded hover:bg-purple-600/20 text-slate-200 hover:text-purple-300 flex items-center justify-between transition-all"
                      >
                        <span className="font-bold text-emerald-400 font-mono-numbers">{sim.name}</span>
                        <span className="text-slate-400">{sim.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Start Scanning Button */}
            <button
              onClick={onStart}
              type="button"
              disabled={status === 'connected_ws' || status === 'polling_rest'}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                status === 'connected_ws' || status === 'polling_rest'
                  ? 'bg-emerald-950/30 text-emerald-600 border border-emerald-900/40 cursor-not-allowed opacity-60'
                  : 'bg-emerald-500 text-slate-950 font-black border border-emerald-400 hover:bg-emerald-400 shadow-emerald-950/40'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶️ بدء الفحص</span>
            </button>

            {/* Pause Scanning Button */}
            <button
              onClick={onPause}
              type="button"
              disabled={status === 'paused'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 cursor-pointer ${
                status === 'paused'
                  ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 hover:border-rose-400 shadow-md shadow-rose-950/20'
              }`}
            >
              <Pause className="w-4 h-4" />
              <span>⏸️ إيقاف</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
