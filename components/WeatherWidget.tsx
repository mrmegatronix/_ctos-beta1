import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertCircle } from 'lucide-react';

interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
}

const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Try fetching from the local weather station
                const response = await fetch('http://ct-wea1/api/weather', {
                    // Short timeout since it's local
                    signal: AbortSignal.timeout(3000)
                });
                
                if (!response.ok) {
                    throw new Error('Station unavailable');
                }
                
                const data = await response.json();
                
                // Map the data - handle potentially different formats from generic weather stations
                setWeather({
                    temperature: data.temperature ?? data.temp ?? data.temp_c ?? 0,
                    humidity: data.humidity ?? data.hum ?? 0,
                    windSpeed: data.windSpeed ?? data.wind_speed ?? data.wind ?? 0,
                    condition: data.condition ?? data.weather ?? 'Clear'
                });
                setError(null);
            } catch (err) {
                console.error("Failed to fetch from ct-wea1:", err);
                setError('Station Offline');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        // Refresh every 5 minutes
        const interval = setInterval(fetchWeather, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-[120px] flex items-center justify-center">
                <span className="text-slate-400">Loading Weather...</span>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center h-[120px] text-slate-400">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                <span>{error || 'Weather Unavailable'}</span>
            </div>
        );
    }

    // Determine icon based on condition
    let WeatherIcon = Sun;
    const cond = weather.condition.toLowerCase();
    if (cond.includes('rain')) WeatherIcon = CloudRain;
    else if (cond.includes('cloud')) WeatherIcon = Cloud;
    else if (cond.includes('wind')) WeatherIcon = Wind;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-400 flex items-center">
                    <Cloud className="w-4 h-4 mr-2" />
                    Local Weather
                </h3>
                <span className="text-xs text-slate-500">ct-wea1</span>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <WeatherIcon className="w-10 h-10 text-sky-400 mr-3" />
                    <div>
                        <div className="text-3xl font-black text-white">{weather.temperature.toFixed(1)}°</div>
                        <div className="text-xs text-slate-300 capitalize">{weather.condition}</div>
                    </div>
                </div>
                
                <div className="space-y-1 text-right">
                    <div className="text-xs text-slate-400 flex items-center justify-end">
                        <Droplets className="w-3 h-3 mr-1 text-blue-400" />
                        {weather.humidity}%
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-end">
                        <Wind className="w-3 h-3 mr-1 text-teal-400" />
                        {weather.windSpeed} km/h
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
