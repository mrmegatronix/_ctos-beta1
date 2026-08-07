import React, { useState } from 'react';
import {
  Sliders,
  Tv,
  Volume2,
  VolumeX,
  Radio,
  Cast,
  Layers,
  Power,
  RefreshCw,
  Sparkles,
  Monitor,
  CheckCircle2,
  Zap,
  Music2,
  ExternalLink,
  Smartphone,
  Compass,
  Megaphone,
  PlaySquare,
  Shield,
  Award,
  Crown,
  ChevronRight
} from 'lucide-react';

interface VideoOutput {
  id: string;
  name: string;
  location: string;
  currentInputId: string;
  status: 'online' | 'standby' | 'error';
  resolution: string;
}

interface VideoInput {
  id: string;
  name: string;
  type: 'sky' | 'hdmi' | 'stream' | 'signage';
  channel?: string;
  previewUrl?: string;
  status: 'active' | 'idle';
}

interface AudioZone {
  id: string;
  name: string;
  sourceInputId: string;
  volume: number; // 0 to 100
  isMuted: boolean;
  bassLevel: number;
}

interface PresetScene {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  routes: { [outputId: string]: string };
  audioLevels: { [zoneId: string]: number };
}

const DEFAULT_INPUTS: VideoInput[] = [
  { id: 'in-1', name: 'Sky Sport 1 HD', type: 'sky', channel: 'Sky Ch 051', status: 'active' },
  { id: 'in-2', name: 'Sky Sport 2 HD', type: 'sky', channel: 'Sky Ch 052', status: 'active' },
  { id: 'in-3', name: 'Sky Sport Select', type: 'sky', channel: 'Sky Ch 050', status: 'active' },
  { id: 'in-4', name: 'Bar Laptop HDMI 1', type: 'hdmi', channel: 'HDMI-A', status: 'active' },
  { id: 'in-5', name: 'Apple TV / AirPlay', type: 'stream', channel: 'AirPlay-CT', status: 'active' },
  { id: 'in-6', name: 'Promo Signage & Menus', type: 'signage', channel: 'CT-Digital-1', status: 'active' },
  { id: 'in-7', name: 'DJ Booth Aux Input', type: 'stream', channel: 'XLR-Stage', status: 'idle' },
];

const DEFAULT_OUTPUTS: VideoOutput[] = [
  { id: 'out-1', name: 'Main Bar Big Screen (98")', location: 'Main Sports Bar', currentInputId: 'in-1', status: 'online', resolution: '4K @ 60Hz' },
  { id: 'out-2', name: 'Bar Left High-Top TV (65")', location: 'Bar Left', currentInputId: 'in-1', status: 'online', resolution: '1080p @ 60Hz' },
  { id: 'out-3', name: 'Bar Right Booths TV (65")', location: 'Bar Right', currentInputId: 'in-2', status: 'online', resolution: '1080p @ 60Hz' },
  { id: 'out-4', name: 'Garden Bar LED Wall', location: 'Garden Courtyard', currentInputId: 'in-1', status: 'online', resolution: '1080p @ 60Hz' },
  { id: 'out-5', name: 'Garden Terrace TV 1', location: 'Outdoor Deck', currentInputId: 'in-3', status: 'online', resolution: '1080p @ 60Hz' },
  { id: 'out-6', name: 'Restaurant Dining TV', location: 'Bistro Dining', currentInputId: 'in-6', status: 'online', resolution: '1080p @ 60Hz' },
  { id: 'out-7', name: 'Upstairs Function Projector', location: 'Level 1 Function Room', currentInputId: 'in-4', status: 'standby', resolution: '4K @ 60Hz' },
  { id: 'out-8', name: 'Entryway Promo Display', location: 'Foyer / Hostess', currentInputId: 'in-6', status: 'online', resolution: '1080p @ 60Hz' },
];

const DEFAULT_AUDIO_ZONES: AudioZone[] = [
  { id: 'zone-1', name: 'Main Sports Bar', sourceInputId: 'in-1', volume: 72, isMuted: false, bassLevel: 5 },
  { id: 'zone-2', name: 'Garden Bar & Deck', sourceInputId: 'in-1', volume: 65, isMuted: false, bassLevel: 4 },
  { id: 'zone-3', name: 'Bistro Dining Area', sourceInputId: 'in-5', volume: 38, isMuted: false, bassLevel: 2 },
  { id: 'zone-4', name: 'Upstairs Function Room', sourceInputId: 'in-4', volume: 50, isMuted: false, bassLevel: 3 },
  { id: 'zone-5', name: 'Outdoor Smoking Terrace', sourceInputId: 'in-1', volume: 45, isMuted: false, bassLevel: 2 },
  { id: 'zone-6', name: 'Restrooms / Hallways', sourceInputId: 'in-5', volume: 25, isMuted: false, bassLevel: 1 },
];

const SCENE_PRESETS: PresetScene[] = [
  {
    id: 'preset-rugby',
    name: 'Big Match Broadcast',
    description: 'Sky Sport 1 to all big screens, full sports audio in Bar & Garden',
    icon: '🏉',
    color: 'from-rose-600 to-red-700',
    routes: { 'out-1': 'in-1', 'out-2': 'in-1', 'out-3': 'in-1', 'out-4': 'in-1', 'out-5': 'in-1', 'out-6': 'in-6', 'out-7': 'in-1', 'out-8': 'in-6' },
    audioLevels: { 'zone-1': 78, 'zone-2': 75, 'zone-3': 30, 'zone-4': 50, 'zone-5': 55, 'zone-6': 25 }
  },
  {
    id: 'preset-dinner',
    name: 'Bistro & Dinner Chill',
    description: 'Ambient signage on screens, background Spotify acoustics across all zones',
    icon: '🍽️',
    color: 'from-amber-600 to-orange-700',
    routes: { 'out-1': 'in-6', 'out-2': 'in-6', 'out-3': 'in-6', 'out-4': 'in-6', 'out-5': 'in-6', 'out-6': 'in-6', 'out-7': 'in-6', 'out-8': 'in-6' },
    audioLevels: { 'zone-1': 35, 'zone-2': 40, 'zone-3': 45, 'zone-4': 25, 'zone-5': 30, 'zone-6': 20 }
  },
  {
    id: 'preset-quiz',
    name: 'Trivia / Quiz Night',
    description: 'HDMI Host Laptop to Main Screen and Upstairs, Mic audio priority',
    icon: '🧠',
    color: 'from-indigo-600 to-purple-700',
    routes: { 'out-1': 'in-4', 'out-2': 'in-4', 'out-3': 'in-4', 'out-4': 'in-4', 'out-5': 'in-4', 'out-6': 'in-6', 'out-7': 'in-4', 'out-8': 'in-6' },
    audioLevels: { 'zone-1': 70, 'zone-2': 60, 'zone-3': 30, 'zone-4': 75, 'zone-5': 35, 'zone-6': 20 }
  },
  {
    id: 'preset-party',
    name: 'Friday DJ / Party Night',
    description: 'DJ Booth audio stream & dynamic visuals across Main Bar and Garden',
    icon: '🎉',
    color: 'from-purple-600 to-pink-600',
    routes: { 'out-1': 'in-5', 'out-2': 'in-5', 'out-3': 'in-5', 'out-4': 'in-5', 'out-5': 'in-5', 'out-6': 'in-6', 'out-7': 'in-7', 'out-8': 'in-6' },
    audioLevels: { 'zone-1': 85, 'zone-2': 82, 'zone-3': 40, 'zone-4': 80, 'zone-5': 65, 'zone-6': 30 }
  }
];

const MATRIX_MODULES = [
  { id: 'masteradmin', name: 'Master TV Admin Control', file: '/ct-matrix/masteradmin.html', category: 'Admin Control', icon: Crown, badge: 'Main TV Advertising Hub', color: 'from-amber-500 to-red-600', description: 'Primary master control center for TV advertising slides, promotions, overlay tickers, countdowns, and live sports ads.' },
  { id: 'matrix-live', name: 'CT-Matrix Live Signage', file: '/ct-matrix/index.html', category: 'Display Player', icon: Tv, badge: 'Live Screen Feed', color: 'from-blue-600 to-indigo-600', description: 'Automated fullscreen digital signage player with live CSV schedules, band ads, daily specials, and smooth transitions.' },
  { id: 'billboard', name: 'Billboard Display Engine', file: '/ct-matrix/billboard.html', category: 'Display Player', icon: Monitor, badge: 'High-Impact Signage', color: 'from-emerald-600 to-teal-600', description: 'Large format portrait & landscape display engine for venue entrance, big screens, and promo boards.' },
  { id: 'remote', name: 'Mobile TV Remote Control', file: '/ct-matrix/remote.html', category: 'Remote Pages', icon: Smartphone, badge: 'Staff Mobile Controller', color: 'from-purple-600 to-indigo-600', description: 'Fast mobile-friendly touch remote for duty managers and bartenders to switch TV feeds, mute, and trigger instant ads.' },
  { id: 'live-commander', name: 'Live Sports Commander', file: '/ct-matrix/live-commander.html', category: 'Admin Control', icon: Zap, badge: 'Real-Time Tickers', color: 'from-rose-600 to-amber-600', description: 'Instant lower-third overlays, breaking match score updates, emergency tickers, and live crowd announcements.' },
  { id: 'loyalty-slide', name: 'Loyalty & Jackpot Display', file: '/ct-matrix/loyalty-slide.html', category: 'Display Player', icon: Award, badge: 'CTSC Membership', color: 'from-amber-600 to-yellow-500', description: 'Social club member loyalty perks, membership QR sign-up codes, and active gaming jackpot displays.' },
  { id: 'navi', name: 'Matrix Navigation Hub', file: '/ct-matrix/navi.html', category: 'Admin Control', icon: Compass, badge: 'Screen Routing Map', color: 'from-cyan-600 to-blue-600', description: 'Visual map and routing matrix connecting all physical displays, TV outputs, and digital signage zones.' }
];

const CTMatrixControlView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tv-advertising' | 'embedded-hub' | 'video' | 'audio' | 'presets'>('tv-advertising');
  const [selectedEmbedUrl, setSelectedEmbedUrl] = useState<string>('/ct-matrix/masteradmin.html');
  const [inputs] = useState<VideoInput[]>(DEFAULT_INPUTS);
  const [outputs, setOutputs] = useState<VideoOutput[]>(DEFAULT_OUTPUTS);
  const [audioZones, setAudioZones] = useState<AudioZone[]>(DEFAULT_AUDIO_ZONES);
  const [selectedOutputId, setSelectedOutputId] = useState<string>('out-1');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [masterMute, setMasterMute] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setLastActionMessage(msg);
    setTimeout(() => setLastActionMessage(null), 3000);
  };

  const handleRouteVideo = (outputId: string, inputId: string) => {
    setOutputs(prev => prev.map(out => (out.id === outputId ? { ...out, currentInputId: inputId } : out)));
    const targetOut = outputs.find(o => o.id === outputId);
    const targetIn = inputs.find(i => i.id === inputId);
    triggerToast(`Routed [${targetIn?.name}] ➔ [${targetOut?.name}]`);
  };

  const handleRouteAllVideo = (inputId: string) => {
    setOutputs(prev => prev.map(out => ({ ...out, currentInputId: inputId })));
    const targetIn = inputs.find(i => i.id === inputId);
    triggerToast(`Routed [${targetIn?.name}] to ALL ${outputs.length} displays!`);
  };

  const handleVolumeChange = (zoneId: string, newVol: number) => {
    setAudioZones(prev => prev.map(z => (z.id === zoneId ? { ...z, volume: newVol } : z)));
  };

  const handleToggleMute = (zoneId: string) => {
    setAudioZones(prev => prev.map(z => (z.id === zoneId ? { ...z, isMuted: !z.isMuted } : z)));
  };

  const handleToggleMasterMute = () => {
    const nextMute = !masterMute;
    setMasterMute(nextMute);
    setAudioZones(prev => prev.map(z => ({ ...z, isMuted: nextMute })));
    triggerToast(nextMute ? 'Venue Master Audio MUTED' : 'Venue Master Audio UNMUTED');
  };

  const handleAudioSourceChange = (zoneId: string, inputId: string) => {
    setAudioZones(prev => prev.map(z => (z.id === zoneId ? { ...z, sourceInputId: inputId } : z)));
    triggerToast(`Audio source updated for zone.`);
  };

  const handleApplyPreset = (preset: PresetScene) => {
    setOutputs(prev => prev.map(out => ({ ...out, currentInputId: preset.routes[out.id] || out.currentInputId })));
    setAudioZones(prev => prev.map(z => ({ ...z, volume: preset.audioLevels[z.id] !== undefined ? preset.audioLevels[z.id] : z.volume })));
    triggerToast(`Applied Preset Scene: ${preset.name}`);
  };

  const selectedOutput = outputs.find(o => o.id === selectedOutputId);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-6">
      {/* Toast Notification */}
      {lastActionMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center space-x-2 z-50 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{lastActionMessage}</span>
        </div>
      )}

      {/* Header Banner with Main TV Advertising Links */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">CT-MATRIX</h1>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black rounded-md uppercase tracking-wider">
                  TV Advertising Hub
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Matrix AV Router
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Master Advertising Controls, TV Signage Displays, Remote Switchers & 8x8 AV Routing
              </p>
            </div>
          </div>
        </div>

        {/* Primary Main Controls Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/ct-matrix/masteradmin.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            title="Launch CT-Matrix Master Admin in New Window"
          >
            <Crown className="w-4 h-4" />
            <span>Master Admin (TV Ads)</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>

          <a
            href="/ct-matrix/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold rounded-2xl text-xs transition-colors"
            title="Open CT-Matrix Live Display Feed"
          >
            <Tv className="w-4 h-4" />
            <span>CT-Matrix Live Feed</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </a>

          <a
            href="/ct-matrix/remote.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 font-bold rounded-2xl text-xs transition-colors"
            title="Open Mobile Touch Remote"
          >
            <Smartphone className="w-4 h-4" />
            <span>TV Remote</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('tv-advertising')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'tv-advertising'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>TV Advertising Controls & Modules</span>
        </button>

        <button
          onClick={() => setActiveTab('embedded-hub')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'embedded-hub'
              ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Live Embedded Console</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'video'
              ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>8x8 Video Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'audio'
              ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Audio Zones</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'presets'
              ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Scene Presets</span>
        </button>
      </div>

      {/* TAB 1: TV ADVERTISING CONTROLS & SUBLINKS */}
      {activeTab === 'tv-advertising' && (
        <div className="space-y-6">
          {/* Main Controls Section */}
          <div className="bg-gradient-to-br from-amber-950/30 to-red-950/20 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black text-white">Main TV Advertising Controls</h2>
                </div>
                <p className="text-xs text-amber-200/70 mt-0.5">
                  Launch the dedicated control center for venue advertising playlists, live sports banners, and emergency tickers.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href="/ct-matrix/masteradmin.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
                >
                  <span>Launch masteradmin.html</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    setSelectedEmbedUrl('/ct-matrix/masteradmin.html');
                    setActiveTab('embedded-hub');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5"
                >
                  <span>Open Inside CTOS</span>
                </button>
              </div>
            </div>

            {/* Quick Links Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MATRIX_MODULES.map(mod => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-r ${mod.color} text-white shadow-md`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 bg-white/10 text-slate-300 text-[10px] font-bold rounded-md">
                          {mod.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                        {mod.name}
                      </h4>
                      <div className="text-[11px] font-semibold text-amber-400/90 mb-1">{mod.badge}</div>
                      <p className="text-xs text-slate-400 line-clamp-2">{mod.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedEmbedUrl(mod.file);
                          setActiveTab('embedded-hub');
                        }}
                        className="text-xs font-bold text-slate-300 hover:text-white"
                      >
                        Embed View
                      </button>
                      <a
                        href={mod.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                      >
                        <span>Open Standalone</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categorized Sublinks breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Pages */}
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm mb-4">
                <Crown className="w-4 h-4" />
                <span>Admin Pages</span>
              </div>
              <ul className="space-y-3 text-xs">
                <li>
                  <a
                    href="/ct-matrix/masteradmin.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors"
                  >
                    <span>masteradmin.html (Master Control)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="/ct-matrix/live-commander.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors"
                  >
                    <span>live-commander.html (Sports Ticker)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="/ct-matrix/navi.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors"
                  >
                    <span>navi.html (Screen Navigation Hub)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Display & Player Modules */}
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm mb-4">
                <Tv className="w-4 h-4" />
                <span>Display & Signage Players</span>
              </div>
              <ul className="space-y-3 text-xs">
                <li>
                  <a
                    href="/ct-matrix/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors"
                  >
                    <span>index.html (Matrix Live Display)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="/ct-matrix/billboard.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors"
                  >
                    <span>billboard.html (Billboard Signage)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="/ct-matrix/loyalty-slide.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors"
                  >
                    <span>loyalty-slide.html (Loyalty & Jackpot)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Remote Pages */}
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm mb-4">
                <Smartphone className="w-4 h-4" />
                <span>Remote & Mobile Controllers</span>
              </div>
              <ul className="space-y-3 text-xs">
                <li>
                  <a
                    href="/ct-matrix/remote.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors"
                  >
                    <span>remote.html (Mobile TV Remote)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('video')}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors text-left"
                  >
                    <span>8x8 AV Matrix Switcher (Live)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('audio')}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-white font-semibold transition-colors text-left"
                  >
                    <span>Multi-Zone Audio Console (Live)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE EMBEDDED CONSOLE */}
      {activeTab === 'embedded-hub' && (
        <div className="flex-1 flex flex-col h-[700px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-3.5 bg-slate-800/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">Console Feed:</span>
              <select
                value={selectedEmbedUrl}
                onChange={e => setSelectedEmbedUrl(e.target.value)}
                className="bg-slate-900 text-amber-300 font-bold border border-white/10 px-3 py-1 rounded-xl outline-none"
              >
                <option value="/ct-matrix/masteradmin.html">masteradmin.html (Master TV Ads)</option>
                <option value="/ct-matrix/index.html">index.html (Matrix Live Display)</option>
                <option value="/ct-matrix/remote.html">remote.html (Mobile TV Remote)</option>
                <option value="/ct-matrix/billboard.html">billboard.html (Billboard)</option>
                <option value="/ct-matrix/live-commander.html">live-commander.html (Sports Commander)</option>
                <option value="/ct-matrix/loyalty-slide.html">loyalty-slide.html (Loyalty Slide)</option>
                <option value="/ct-matrix/navi.html">navi.html (Matrix Navigation)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={selectedEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg transition-colors"
              >
                <span>Open in Window</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <iframe
            src={selectedEmbedUrl}
            title="CT-Matrix Console"
            className="w-full flex-1 border-0 bg-black"
          />
        </div>
      )}

      {/* TAB 3: VIDEO MATRIX ROUTING */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          {/* Quick Broadcast Bar */}
          <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white">Broadcast Input to ALL 8 Displays:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {inputs.map(input => (
                <button
                  key={input.id}
                  onClick={() => handleRouteAllVideo(input.id)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold rounded-xl text-slate-200 transition-colors"
                >
                  {input.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {outputs.map(output => {
              const currentInput = inputs.find(i => i.id === output.currentInputId);
              const isSelected = selectedOutputId === output.id;

              return (
                <div
                  key={output.id}
                  onClick={() => setSelectedOutputId(output.id)}
                  className={`cursor-pointer rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {output.location}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black rounded-md uppercase">
                        {output.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{output.name}</h4>
                    <div className="text-xs text-slate-400 mb-3">{output.resolution}</div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Active Video Feed
                    </label>
                    <select
                      value={output.currentInputId}
                      onChange={e => handleRouteVideo(output.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-bold text-emerald-400 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {inputs.map(input => (
                        <option key={input.id} value={input.id}>
                          {input.name} ({input.channel || input.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIO ZONES */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/60 border border-white/10 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Zone Audio Console</h3>
              <p className="text-xs text-slate-400">Independent zone volume and audio feed assignment</p>
            </div>
            <button
              onClick={handleToggleMasterMute}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                masterMute ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'
              }`}
            >
              {masterMute ? 'Unmute Master' : 'Emergency Mute All'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audioZones.map(zone => {
              const currentInput = inputs.find(i => i.id === zone.sourceInputId);

              return (
                <div
                  key={zone.id}
                  className={`bg-slate-900/60 border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                    zone.isMuted || masterMute ? 'border-rose-500/30 opacity-60' : 'border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-white">{zone.name}</h4>
                        <span className="text-xs text-slate-400">Zone Output</span>
                      </div>
                      <button
                        onClick={() => handleToggleMute(zone.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          zone.isMuted
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                        title={zone.isMuted ? 'Unmute' : 'Mute'}
                      >
                        {zone.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Audio Source Picker */}
                    <div className="mb-5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                        Audio Source Feed
                      </label>
                      <select
                        value={zone.sourceInputId}
                        onChange={e => handleAudioSourceChange(zone.id, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-bold text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {inputs.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Volume Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Volume</span>
                        <span className="text-white">{zone.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={zone.volume}
                        onChange={e => handleVolumeChange(zone.id, parseInt(e.target.value))}
                        disabled={masterMute || zone.isMuted}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center">
                      <Music2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {currentInput?.name}
                    </span>
                    <span className={`font-bold ${zone.isMuted || masterMute ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {zone.isMuted || masterMute ? 'Muted' : 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: SCENE PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-6">
          <div className="mb-2">
            <h3 className="text-base font-bold text-white">One-Touch Venue Scene Presets</h3>
            <p className="text-xs text-slate-400">
              Instantly configure matrix video routing and audio zones for special events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCENE_PRESETS.map(preset => (
              <div
                key={preset.id}
                className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">{preset.icon}</span>
                    <div>
                      <h4 className="text-lg font-black text-white">{preset.name}</h4>
                      <span className="text-xs font-semibold text-slate-400">{preset.id}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-6">{preset.description}</p>
                </div>

                <button
                  onClick={() => handleApplyPreset(preset)}
                  className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r ${preset.color} hover:opacity-95 transition-opacity shadow-lg flex items-center justify-center space-x-2`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Activate Scene Preset</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CTMatrixControlView;
