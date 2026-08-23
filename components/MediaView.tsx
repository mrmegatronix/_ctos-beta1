import React, { useState } from 'react';
import { Share2, CloudSun, Tv, Trophy, Monitor, ExternalLink, Settings, Plus, PlayCircle } from 'lucide-react';
import { MediaSlide } from '../types';

const MediaView: React.FC = () => {
  const [slides, setSlides] = useState<MediaSlide[]>([
    { id: 'm1', name: 'Venue Weather', url: 'https://weatherwidget.io/', type: 'weather', isActive: true, isDemo: true },
    { id: 'm2', name: 'Lunch Specials Slide', url: 'https://github.com/your-username/tv-slides', type: 'slides', isActive: true, isDemo: true },
    { id: 'm3', name: 'Chase the Ace', url: 'https://docs.google.com/spreadsheets/d/your-id', type: 'chase-the-ace', isActive: false, isDemo: true },
  ]);

  const [activeSlide, setActiveSlide] = useState<MediaSlide | null>(slides[0]);

  return (
    <div className="flex h-full flex-col p-6 space-y-6 bg-slate-950 overflow-y-auto relative custom-scrollbar">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-center bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
             <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Adverts & Media</h2>
            <p className="text-sm text-indigo-200/70 mt-1 font-medium">Control all venue screens and outdoor billboards</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 font-bold">
          <Plus className="w-4 h-4" />
          <span>New Advert / Slide</span>
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Device Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/10">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              Device Status
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Outdoor LED Billboard', status: 'online', color: 'emerald' },
                { name: 'Main Bar TV 1', status: 'online', color: 'emerald' },
                { name: 'Garden TV', status: 'offline', color: 'rose' },
                { name: 'Restaurant TV', status: 'online', color: 'emerald' },
              ].map((device, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                  <div className="flex items-center space-x-3">
                    <Monitor className={`w-4 h-4 text-${device.color}-400 group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-semibold text-slate-200">{device.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-${device.color}-500/20 text-${device.color}-300 border border-${device.color}-500/30 shadow-inner`}>
                    {device.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/10 flex-1">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
              <PlayCircle className="w-4 h-4 mr-2" />
              Content Library
            </h3>
            <div className="space-y-2">
              {slides.map(slide => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(slide)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeSlide?.id === slide.id 
                      ? 'bg-gradient-to-r from-indigo-600/40 to-purple-600/40 ring-1 ring-indigo-400/50 shadow-lg' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${activeSlide?.id === slide.id ? 'bg-white/10' : 'bg-slate-800'}`}>
                      {slide.type === 'weather' && <CloudSun className="w-5 h-5 text-sky-400" />}
                      {slide.type === 'slides' && <Tv className="w-5 h-5 text-purple-400" />}
                      {slide.type === 'chase-the-ace' && <Trophy className="w-5 h-5 text-amber-400" />}
                      {slide.type === 'billboard' && <Monitor className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-bold ${activeSlide?.id === slide.id ? 'text-white' : 'text-slate-300'}`}>
                        {slide.name}
                      </div>
                      <div className="text-[10px] font-medium text-slate-400/80 uppercase tracking-wider mt-0.5">
                        {slide.type.replace(/-/g, ' ')}
                      </div>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full shadow-inner border border-white/20 ${slide.isActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-600'}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview & Configuration */}
        <div className="lg:col-span-2">
          {activeSlide ? (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px] relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-md relative z-10">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-white tracking-tight">{activeSlide.name}</span>
                  {activeSlide.isDemo && <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-black tracking-widest">DEMO</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95">
                    <Settings className="w-5 h-5" />
                  </button>
                  <a href={activeSlide.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div className="flex-1 bg-black relative z-10">
                <iframe 
                  src={activeSlide.url} 
                  className="w-full h-full border-none opacity-90 group-hover:opacity-100 transition-opacity"
                  title={activeSlide.name}
                />
                {!activeSlide.isActive && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-white backdrop-blur-md">
                    <div className="text-center">
                      <Tv className="w-16 h-16 mx-auto mb-4 opacity-30 text-rose-400" />
                      <p className="font-bold text-xl tracking-tight mb-2">Content is currently Inactive</p>
                      <p className="text-slate-400 text-sm mb-6">This media is not being broadcasted to any screens.</p>
                      <button className="px-8 py-3 bg-indigo-600 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 hover:scale-105">
                        Activate on All Screens
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 bg-black/40 border-t border-white/10 backdrop-blur-md relative z-10">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex space-x-6">
                    <span className="text-slate-400">Source: <span className="font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-md border border-indigo-400/20">{activeSlide.url}</span></span>
                    <span className="text-slate-400">Transition: <span className="text-white bg-white/10 px-2 py-1 rounded-md border border-white/10">Fade (5s)</span></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20 shadow-inner flex items-center">
                      <Monitor className="w-3 h-3 mr-1.5" /> Target: All Screens
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[650px] flex items-center justify-center border-2 border-dashed border-white/10 bg-white/5 rounded-3xl backdrop-blur-sm">
              <div className="text-center text-slate-500">
                <Monitor className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium tracking-wide">Select a slide or advert to configure</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaView;
