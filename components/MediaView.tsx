import React, { useState } from 'react';
import { Share2, CloudSun, Tv, Trophy, Monitor, ExternalLink, Settings, Plus } from 'lucide-react';
import { MediaSlide } from '../types';

const MediaView: React.FC = () => {
  const [slides, setSlides] = useState<MediaSlide[]>([
    { id: 'm1', name: 'Venue Weather', url: 'https://weatherwidget.io/', type: 'weather', isActive: true, isDemo: true },
    { id: 'm2', name: 'Lunch Specials Slide', url: 'https://github.com/your-username/tv-slides', type: 'slides', isActive: true, isDemo: true },
    { id: 'm3', name: 'Chase the Ace', url: 'https://docs.google.com/spreadsheets/d/your-id', type: 'chase-the-ace', isActive: false, isDemo: true },
  ]);

  const [activeSlide, setActiveSlide] = useState<MediaSlide | null>(slides[0]);

  return (
    <div className="flex h-full flex-col p-6 space-y-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm /50 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-50 ">Adverts & Media</h2>
          <p className="text-sm text-slate-400">Control all venue screens and outdoor billboards</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg">
          <Plus className="w-4 h-4" />
          <span>New Advert / Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Device Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  p-4 rounded-xl shadow-lg border border-gray-100 ">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Device Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Outdoor LED Billboard', status: 'online', color: 'green' },
                { name: 'Main Bar TV 1', status: 'online', color: 'green' },
                { name: 'Garden TV', status: 'offline', color: 'red' },
                { name: 'Restaurant TV', status: 'online', color: 'green' },
              ].map((device, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Monitor className={`w-4 h-4 text-${device.color}-500`} />
                    <span className="text-sm font-medium text-slate-200 ">{device.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-${device.color}-100 dark:bg-${device.color}-900/30 text-${device.color}-700 dark:text-${device.color}-300`}>
                    {device.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  p-4 rounded-xl shadow-lg border border-gray-100 ">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Content Library</h3>
            <div className="space-y-2">
              {slides.map(slide => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(slide)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${activeSlide?.id === slide.id ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm dark:hover:bg-slate-700/50'}`}
                >
                  <div className="flex items-center space-x-3">
                    {slide.type === 'weather' && <CloudSun className="w-5 h-5 text-blue-500" />}
                    {slide.type === 'slides' && <Tv className="w-5 h-5 text-purple-500" />}
                    {slide.type === 'chase-the-ace' && <Trophy className="w-5 h-5 text-amber-500" />}
                    {slide.type === 'billboard' && <Monitor className="w-5 h-5 text-emerald-500" />}
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-100 ">{slide.name}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{slide.type.replace(/-/g, ' ')}</div>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${slide.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview & Configuration */}
        <div className="lg:col-span-2">
          {activeSlide ? (
            <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  rounded-xl shadow-lg border border-gray-100  overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-100  flex justify-between items-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm /80">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-slate-200 ">{activeSlide.name}</span>
                  {activeSlide.isDemo && <span className="text-[10px] bg-lime-300 text-lime-900 px-1.5 py-0.5 rounded font-black">DEMO</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <a href={activeSlide.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div className="flex-1 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  relative">
                <iframe 
                  src={activeSlide.url} 
                  className="w-full h-full border-none"
                  title={activeSlide.name}
                />
                {!activeSlide.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-[2px]">
                    <div className="text-center">
                      <Tv className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-bold">Content is currently Inactive</p>
                      <button className="mt-4 px-6 py-2 bg-indigo-600 rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors">Activate on All Screens</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border-t border-gray-100 ">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex space-x-4">
                    <span className="text-slate-400">Source: <span className="font-mono text-indigo-500">{activeSlide.url}</span></span>
                    <span className="text-slate-400">Transition: <span className="text-slate-200 ">Fade (5s)</span></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 italic">Target: All Screens</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700  rounded-xl">
              <div className="text-center text-gray-400">
                <Monitor className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Select a slide or advert to configure</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaView;
