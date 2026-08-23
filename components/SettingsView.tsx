import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Shield,
  Radio,
  Sliders,
  Database,
  Check,
  RefreshCw,
  Download,
  AlertTriangle,
  Server,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Users,
  FolderSync,
  FolderOpen,
  Clock,
  UploadCloud,
  Compass,
  ExternalLink,
  Tv,
  Globe
} from 'lucide-react';
import { db } from '../services/database';
import { getPublicSyncMeta, scanAndImportPublicFolder, PublicSyncMeta } from '../services/publicSync';
import { PublicFolderUploadModal } from './PublicFolderUploadModal';

interface SettingsViewProps {
  onShowNotification?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onShowNotification }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'security' | 'data'>('general');
  const [saving, setSaving] = useState(false);

  // General Settings State
  const [venueName, setVenueName] = useState('Coopers Tavern');
  const [venueAddress, setVenueAddress] = useState('149 Queens Wharf, Auckland CBD, NZ');
  const [venuePhone, setVenuePhone] = useState('+64 9 377 1234');
  const [taxNumber, setTaxNumber] = useState('GST-112-993-401');
  const [operatingHours, setOperatingHours] = useState('11:00 AM - 12:00 AM Daily');

  // Integrations State
  const [tevalisSiteId, setTevalisSiteId] = useState('CT-AKL-001');
  const [tevalisApiKey, setTevalisApiKey] = useState('tvk_live_998348123891');
  const [nowBookItVenueId, setNowBookItVenueId] = useState('VN-NBI-9921');
  const [autoSyncInterval, setAutoSyncInterval] = useState('5');

  // Security & Kiosk State
  const [kioskTimeout, setKioskTimeout] = useState('15');
  const [requirePinOnVoid, setRequirePinOnVoid] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [managerOverridePin, setManagerOverridePin] = useState('4409');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Public Folder Sync State
  const [syncMeta, setSyncMeta] = useState<PublicSyncMeta>(getPublicSyncMeta());
  const [isScanning, setIsScanning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const updateMeta = () => setSyncMeta(getPublicSyncMeta());
    const handleStarted = () => {
      setIsScanning(true);
      updateMeta();
    };
    const handleFinished = () => {
      setIsScanning(false);
      updateMeta();
    };

    window.addEventListener('ctos:public-sync-started', handleStarted);
    window.addEventListener('ctos:public-sync-completed', handleFinished);
    window.addEventListener('ctos:public-sync-failed', handleFinished);

    const interval = setInterval(updateMeta, 10000);
    return () => {
      window.removeEventListener('ctos:public-sync-started', handleStarted);
      window.removeEventListener('ctos:public-sync-completed', handleFinished);
      window.removeEventListener('ctos:public-sync-failed', handleFinished);
      clearInterval(interval);
    };
  }, []);

  const handleManualPublicScan = async () => {
    setIsScanning(true);
    try {
      const res = await scanAndImportPublicFolder();
      setSyncMeta(getPublicSyncMeta());
      if (res.success) {
        if (onShowNotification) {
          onShowNotification(`Public Scan Complete: ${res.importedItems} items synced/imported`, 'success');
        }
      } else {
        if (onShowNotification) {
          onShowNotification(`Public Scan Warning: ${res.error || 'Check details'}`, 'warning');
        }
      }
    } catch (err: any) {
      if (onShowNotification) {
        onShowNotification(`Public Scan Failed: ${err.message}`, 'error');
      }
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // Load persisted settings from localStorage if available
    const local = localStorage.getItem('ctos_venue_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.venueName) setVenueName(parsed.venueName);
        if (parsed.venueAddress) setVenueAddress(parsed.venueAddress);
        if (parsed.venuePhone) setVenuePhone(parsed.venuePhone);
        if (parsed.taxNumber) setTaxNumber(parsed.taxNumber);
        if (parsed.operatingHours) setOperatingHours(parsed.operatingHours);
        if (parsed.tevalisSiteId) setTevalisSiteId(parsed.tevalisSiteId);
        if (parsed.nowBookItVenueId) setNowBookItVenueId(parsed.nowBookItVenueId);
        if (parsed.kioskTimeout) setKioskTimeout(parsed.kioskTimeout);
        if (parsed.managerOverridePin) setManagerOverridePin(parsed.managerOverridePin);
      } catch (e) {
        console.error('Failed to parse venue settings', e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    setSaving(true);
    const settingsPayload = {
      venueName,
      venueAddress,
      venuePhone,
      taxNumber,
      operatingHours,
      tevalisSiteId,
      nowBookItVenueId,
      kioskTimeout,
      managerOverridePin,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('ctos_venue_settings', JSON.stringify(settingsPayload));

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      if (onShowNotification) {
        onShowNotification('Venue system settings successfully saved', 'success');
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  const handleExportBackup = async () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        staff: await db.getStaff(),
        stock: await db.getStock(),
        recipes: await db.getRecipes(),
        entertainment: await db.getEntertainment(),
        suppliers: await db.getSuppliers(),
        tvSchedule: await db.getTVSchedule(),
        maintenance: await db.getMaintenance(),
        incidents: await db.getIncidents(),
        lostFound: await db.getLostFound(),
        bookings: await db.getBookings(),
        functions: await db.getFunctions(),
        finance: await db.getFinance()
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ctos-venue-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (onShowNotification) {
        onShowNotification('Database backup downloaded successfully', 'success');
      }
    } catch (err) {
      console.error(err);
      if (onShowNotification) {
        onShowNotification('Failed to generate database export', 'error');
      }
    }
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6 bg-slate-950 text-white overflow-y-auto relative custom-scrollbar">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Settings className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
              Venue & CTOS Master Settings
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Core Online</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure venue operating profiles, POS API bridge, security access rules, and system database backups.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving Changes...' : savedSuccess ? 'Saved!' : 'Save System Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 space-x-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Venue Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'integrations'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>POS & Integrations</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Kiosk</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'data'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Database</span>
        </button>
      </div>

      {/* Tab Content: Venue Profile */}
      {activeTab === 'general' && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-indigo-600" />
              Venue Identity & Legal Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Trading Name
                </label>
                <input
                  type="text"
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  GST / Tax Number
                </label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={e => setTaxNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Physical Venue Address
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={e => setVenueAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Front Desk Contact Phone
                </label>
                <input
                  type="text"
                  value={venuePhone}
                  onChange={e => setVenuePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Published Trading Hours
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={e => setOperatingHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Integrations */}
      {activeTab === 'integrations' && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Server className="w-5 h-5 mr-2 text-indigo-600" />
              Tevalis POS Cloud Bridge
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Tevalis Site ID
                </label>
                <input
                  type="text"
                  value={tevalisSiteId}
                  onChange={e => setTevalisSiteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  API Key / Secret Token
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={tevalisApiKey}
                    onChange={e => setTevalisApiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Radio className="w-5 h-5 mr-2 text-indigo-600" />
              NowBookIt & Reservations Hub
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  NowBookIt Venue ID
                </label>
                <input
                  type="text"
                  value={nowBookItVenueId}
                  onChange={e => setNowBookItVenueId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Auto-Sync Interval (Minutes)
                </label>
                <select
                  value={autoSyncInterval}
                  onChange={e => setAutoSyncInterval(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1">1 Minute (Live)</option>
                  <option value="5">5 Minutes (Recommended)</option>
                  <option value="15">15 Minutes</option>
                </select>
              </div>
            </div>
          </div>



          {/* Ecosystem & Hub Links */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center">
                <Compass className="w-5 h-5 mr-2 text-cyan-500" />
                Connected CT Ecosystem & Hubs
              </h3>
              <a
                href="https://mrmegatronix.github.io/_ct-LAND/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <span>Launch CT-LAND Hub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <a
                href="https://mrmegatronix.github.io/_ct-LAND/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">CT-LAND</h4>
                    <p className="text-[10px] text-slate-500">Central Hub & Repos</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-500 opacity-60 group-hover:opacity-100" />
              </a>

              <a
                href="https://mrmegatronix.github.io/_ct-MATRIX/masteradmin.html"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">CT-Matrix Master</h4>
                    <p className="text-[10px] text-slate-500">TV Advertising Engine</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100" />
              </a>

              <a
                href="https://ctsc-app.web.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">CTSC App</h4>
                    <p className="text-[10px] text-slate-500">Social Club Portal</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500 opacity-60 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Security & Kiosk */}
      {activeTab === 'security' && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-indigo-600" />
              Terminal & Manager Overrides
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Manager Master Override PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={managerOverridePin}
                  onChange={e => setManagerOverridePin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Terminal Auto-Lock Timeout
                </label>
                <select
                  value={kioskTimeout}
                  onChange={e => setKioskTimeout(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="5">5 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="0">Never (Stay unlocked)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requirePinOnVoid}
                  onChange={e => setRequirePinOnVoid(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Require Duty Manager PIN for item voids and cash drawer emergency kick
                </span>
              </label>
            </div>
          </div>

          {/* Role Hierarchy Matrix */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-indigo-600" />
              Role-Based Access Hierarchy (RBAC)
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              System privilege tiers governing permissions across CTOS and ct-clock terminals.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-600 dark:text-amber-400">Master Admin (The Creator)</h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full">Permanent Root</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Unrestricted root access to all modules, system configuration, database backup & wipe, API secrets, and appointment/revocation of Duty Manager admin rights.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start space-x-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400">Admin (Duty Managers)</h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full">Operations Admin</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Management of Front of House and Back of House, roster publishing and editing, data importing, viewing financials (Cashup, EOD Sales, Budgets) and confidential staff records.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30 flex items-start space-x-3">
                <div className="p-2 bg-slate-600 text-white rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">Standard Users (FOH & BOH Staff)</h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-500/20 text-slate-300 rounded-full">Operational Staff</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Daily workflow access: Timeclock clock-in/out, personal roster, POS service, recipes, menus, maintenance log, incident report submission, TV guide, and weather.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Backup & Data */}
      {activeTab === 'data' && (
        <div className="max-w-4xl space-y-6">
          {/* Public Folder Auto-Scanner & Importer */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <FolderSync className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center">
                    Public Folder Auto-Scanner & Importer
                  </h3>
                  <p className="text-xs text-slate-400">
                    Continuously scans <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded font-mono text-[11px]">/public</code> every hour on the hour for menus, rosters, cash rec sheets, and ct-clock staff logs.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-full flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active (Hourly :00)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-950 text-white/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Schedule</span>
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Every hour on the hour</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 text-white/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Last Scan</span>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {syncMeta.lastRun ? new Date(syncMeta.lastRun).toLocaleTimeString() : 'Never'}
                  {syncMeta.lastResult && (
                    <span className="ml-1 text-[11px] font-normal text-slate-500">
                      ({syncMeta.lastResult.importedItems} items)
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-950 text-white/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block mb-1">Next Auto-Scan</span>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {syncMeta.nextRun ? new Date(syncMeta.nextRun).toLocaleTimeString() : 'Top of next hour'}
                </div>
              </div>
            </div>

            {syncMeta.lastResult && syncMeta.lastResult.details && syncMeta.lastResult.details.length > 0 && (
              <div className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-2">
                  Recent Scan Summary
                </span>
                <ul className="text-xs text-slate-300 space-y-1 max-h-32 overflow-y-auto">
                  {syncMeta.lastResult.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleManualPublicScan}
                disabled={isScanning}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md shadow-indigo-600/20"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderOpen className="w-4 h-4" />
                )}
                <span>{isScanning ? 'Scanning Public Folder...' : 'Initiate Manual Scan & Import Now'}</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shadow-md shadow-amber-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Files to Public Folder (Master Admin)</span>
              </button>
            </div>
          </div>

          {/* Master Admin Dedicated Public Upload Hub */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-amber-500 text-slate-950 font-black rounded-2xl shadow-md shadow-amber-500/30">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-amber-500 dark:text-amber-400">
                      Public Storage & File Manager
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black rounded-md uppercase">
                      Master Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Directly write spreadsheets, PDFs, images, and slides into the live <code className="font-mono text-amber-600 dark:text-amber-300">/public/dropbox</code>, <code className="font-mono text-amber-600 dark:text-amber-300">/public/ct-matrix</code>, or <code className="font-mono text-amber-600 dark:text-amber-300">/public/ct-clock</code> directories with automated database ingestion.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Open File Uploader</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-2 flex items-center">
              <Database className="w-5 h-5 mr-2 text-indigo-600" />
              Venue Database Snapshot
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Export an encrypted full JSON snapshot of all modules (Staff, Stock, Recipes, Incidents, Entertainment,
              Lost & Found, Finances, Maintenance).
            </p>

            <button
              onClick={handleExportBackup}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Database Backup (.JSON)</span>
            </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Local Cache Reset</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 mb-3">
                  Clears local storage caches and reloads live documents from Cloud Firestore.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Clear local offline cache and re-sync from cloud?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Purge Local Storage & Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Admin Public Folder Upload Modal */}
      <PublicFolderUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onShowNotification={onShowNotification}
      />
    </div>
  );
};

export default SettingsView;
