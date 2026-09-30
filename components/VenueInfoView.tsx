import React, { useState } from 'react';
import { Globe, MapPin, Clock, Phone, Mail, Star, Info } from 'lucide-react';

const VenueInfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'contact' | 'website' | 'reviews' | 'hours'>('about');

  const tabs = [
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
    { id: 'website', label: 'Website', icon: <Globe className="w-4 h-4" /> },
    { id: 'reviews', label: 'Google Reviews', icon: <Star className="w-4 h-4" /> },
    { id: 'hours', label: 'Hours', icon: <Clock className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header and Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 pb-0 flex-shrink-0">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center">
          <Globe className="w-8 h-8 mr-3 text-indigo-500" />
          Venue Info
        </h1>
        
        <div className="flex space-x-1 overflow-x-auto custom-scrollbar pb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              } rounded-t-lg`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto h-full">
          {activeTab === 'about' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About Coasters Tavern</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Coasters Tavern is a local staple in Redwood, offering a welcoming environment for friends, family, and the community to gather.
                We feature live entertainment, a wide range of beverages, and a food menu that caters to all tastes.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you're here to catch the latest sports game, enjoy a relaxing afternoon, or join our community events, our friendly staff are here to ensure you have a great time.
              </p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Us</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl">
                    <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Address</h3>
                    <p className="text-slate-600 dark:text-slate-400">123 Redwood Avenue<br/>Redwood, Christchurch 8051<br/>New Zealand</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl">
                    <Phone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Phone</h3>
                    <p className="text-slate-600 dark:text-slate-400">(03) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl">
                    <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Email</h3>
                    <p className="text-slate-600 dark:text-slate-400">info@coasterstavern.co.nz</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-600 dark:text-slate-300">coasterstavern.co.nz</span>
                 <a href="https://coasterstavern.co.nz" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">Open in New Tab</a>
              </div>
              <iframe 
                src="https://coasterstavern.co.nz" 
                title="Coasters Tavern Website"
                className="w-full flex-1 border-none bg-white"
              />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Star className="w-16 h-16 text-yellow-400 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Google Reviews Integration</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                This module will display live Google Reviews. Connect your Google Business Profile API to show real-time customer feedback.
              </p>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">
                Connect Google API
              </button>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                 <Clock className="w-6 h-6 mr-3 text-indigo-500" /> Hours of Operation
              </h2>
              
              <div className="max-w-sm space-y-3">
                {[
                  { day: 'Monday', hours: '10:00 AM - Late' },
                  { day: 'Tuesday', hours: '10:00 AM - Late' },
                  { day: 'Wednesday', hours: '10:00 AM - Late' },
                  { day: 'Thursday', hours: '10:00 AM - Late' },
                  { day: 'Friday', hours: '10:00 AM - Late' },
                  { day: 'Saturday', hours: '10:00 AM - Late' },
                  { day: 'Sunday', hours: '10:00 AM - Late' }
                ].map((schedule) => (
                  <div key={schedule.day} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{schedule.day}</span>
                    <span className="text-slate-600 dark:text-slate-400">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueInfoView;
