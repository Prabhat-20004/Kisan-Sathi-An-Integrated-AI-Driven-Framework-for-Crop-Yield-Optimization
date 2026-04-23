
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import FarmerMascot from './FarmerMascot';
import { getCropRecommendation } from '../services/geminiService';

const mandiData = [
  { day: 'Mon', price: 2100 },
  { day: 'Tue', price: 2150 },
  { day: 'Wed', price: 2080 },
  { day: 'Thu', price: 2250 },
  { day: 'Fri', price: 2300 },
  { day: 'Sat', price: 2350 },
];

const Dashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const [location, setLocation] = useState('Ludhiana, Punjab');
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  
  const [weather, setWeather] = useState({
    temp: 32,
    humidity: 64,
    wind: 12,
    precip: 2.4,
    condition: 'Light Rain'
  });

  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [soilInput, setSoilInput] = useState({ n: '', p: '', k: '', ph: '', moisture: '' });
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Simulate fetching weather when location changes
  useEffect(() => {
    const fetchWeather = () => {
      // In a real app, you'd call a weather API here
      // We simulate variability based on location string length just for effect
      const factor = location.length;
      setWeather({
        temp: 20 + (factor % 15),
        humidity: 40 + (factor % 40),
        wind: 5 + (factor % 15),
        precip: (factor % 10) / 2,
        condition: factor % 3 === 0 ? 'Cloudy' : factor % 3 === 1 ? 'Sunny' : 'Light Rain'
      });
    };
    fetchWeather();
  }, [location]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    try {
      const result = await getCropRecommendation(soilInput, location);
      setPrediction(result);

      // Save to Database
      if (user) {
        await addDoc(collection(db, 'soil_records'), {
          userId: user.uid,
          ph: Number(soilInput.ph),
          nitrogen: soilInput.n,
          phosphorus: soilInput.p,
          potassium: soilInput.k,
          moisture: `${soilInput.moisture}%`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2026' }),
          aiPrediction: result // Storing the AI's advice with the record
        });
      }
    } catch (err) {
      console.error(err);
      setPrediction("Sorry, I couldn't generate a prediction right now.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Section */}
      <section className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight md:text-3xl lg:text-4xl">
            नमस्ते, <br />
            {user ? user.displayName?.split(' ')[0] : 'Kisan'}!
          </h1>
          <button 
            onClick={() => setIsChangingLocation(true)}
            className="flex items-center gap-1 mt-2 text-[10px] font-black text-green-600 dark:text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full group transition-all"
          >
            <svg className="w-3 h-3 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </button>
        </div>
        <FarmerMascot size={120} className="md:size-40" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weather Card */}
      <section className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none transition-all duration-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">{location}</p>
            <h2 className="text-4xl font-bold mt-1">{weather.temp}°C</h2>
            <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">{weather.condition} • Tomorrow</p>
          </div>
          <div className="w-16 h-16 flex items-center justify-center">
             <svg className="w-12 h-12 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
             </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-blue-200 text-[10px] uppercase font-bold">Humidity</p>
            <p className="text-lg font-bold">{weather.humidity}%</p>
          </div>
          <div className="text-center">
            <p className="text-blue-200 text-[10px] uppercase font-bold">Wind</p>
            <p className="text-lg font-bold">{weather.wind}km/h</p>
          </div>
          <div className="text-center">
            <p className="text-blue-200 text-[10px] uppercase font-bold">Precip</p>
            <p className="text-lg font-bold">{weather.precip}mm</p>
          </div>
        </div>
      </section>

        {/* Market Trends */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Wheat (Kanak) Trends</h3>
          <span className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+12% this week</span>
        </div>
        <div className="h-48 w-full" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <AreaChart data={mandiData} key={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                  color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b'
                }}
              />
              <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-4">
           <div className="text-slate-400 dark:text-slate-500 text-xs">Mandi: Khanna Market</div>
           <div className="font-bold text-slate-700 dark:text-slate-300">₹2,350 / Quintal</div>
        </div>
      </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Soil Health Quick View + Prediction */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Soil Health Card</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/30">
            <div className="text-green-600 dark:text-green-400 font-bold text-sm mb-1">Nitrogen (N)</div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">Optimal</div>
            <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 uppercase font-bold">Maintaining Healthy</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">pH Level</div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">6.8</div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 uppercase font-bold">Optimal</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPredictionModal(true)}
          className="w-full mt-4 py-4 text-sm font-black text-white bg-green-600 rounded-2xl shadow-lg shadow-green-100 dark:shadow-green-900/20 active:scale-[0.98] transition-all"
        >
          Predict Best Crop for Season
        </button>
      </section>

      {/* Location Modal */}
      {isChangingLocation && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Update Location</h3>
              <button onClick={() => setIsChangingLocation(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="City, State"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-green-500 transition-all font-bold"
              />
              <button 
                onClick={() => {
                  if (newLocation) {
                    setLocation(newLocation);
                    setIsChangingLocation(false);
                    setNewLocation('');
                  }
                }}
                className="w-full bg-green-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg"
              >
                Set Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Modal */}
      {showPredictionModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 transition-colors duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">AI Crop Predictor</h3>
              <button onClick={() => setShowPredictionModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!prediction ? (
              <form onSubmit={handlePredict} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nitrogen (mg/kg)</label>
                    <input type="number" value={soilInput.n} onChange={e => setSoilInput({...soilInput, n: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phosphorus (mg/kg)</label>
                    <input type="number" value={soilInput.p} onChange={e => setSoilInput({...soilInput, p: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Potassium</label>
                    <input type="number" value={soilInput.k} onChange={e => setSoilInput({...soilInput, k: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">pH</label>
                    <input type="number" step="0.1" value={soilInput.ph} onChange={e => setSoilInput({...soilInput, ph: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Moist (%)</label>
                    <input type="number" value={soilInput.moisture} onChange={e => setSoilInput({...soilInput, moisture: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white outline-none" required />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isPredicting}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg mt-4 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isPredicting ? 'AI is Analyzing...' : 'Get Recommendation'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30 text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {prediction}
                </div>
                <button 
                  onClick={() => {
                    setPrediction(null);
                    setSoilInput({ n: '', p: '', k: '', ph: '', moisture: '' });
                  }}
                  className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-green-600 transition-colors"
                >
                  Try Different Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}

        {/* Wheat Specific Section */}
        <section className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 text-white shadow-xl border border-white/5 h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-lg">Wheat (Kanak) Care</h3>
            <p className="text-slate-400 text-xs font-medium">Stage: CRI (Crown Root Initiation)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white/10 dark:bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Irrigation</p>
              <p className="text-sm font-bold">Planned: 25 Apr (In 3 days)</p>
            </div>
            <button className="text-xs font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all">OK</button>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Dashboard;
