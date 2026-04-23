
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';

const Profile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Firestore Queries
  const soilQuery = user ? query(
    collection(db, 'soil_records'),
    where('userId', '==', user.uid),
    orderBy('date', 'desc')
  ) : null;

  const [soilHistory, loadingSoil] = useCollectionData(soilQuery);
  const [userProfile, loadingProfile] = useDocumentData(
    user ? doc(db, 'users', user.uid) : null
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const [isAddingSoil, setIsAddingSoil] = useState(false);
  const [formData, setFormData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    moisture: ''
  });

  const handleAddSoilRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'soil_records'), {
        userId: user.uid,
        ph: Number(formData.ph),
        nitrogen: formData.nitrogen,
        phosphorus: formData.phosphorus,
        potassium: formData.potassium,
        moisture: formData.moisture,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2026' })
      });
      setIsAddingSoil(false);
      setFormData({ ph: '', nitrogen: '', phosphorus: '', potassium: '', moisture: '' });
    } catch (err) {
      console.error("Error adding soil record:", err);
    }
  };

  const handleAddTag = async () => {
    if (!user || !newTag.trim()) return;
    const currentTags = userProfile?.tags || [];
    if (currentTags.includes(newTag.trim())) return;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        tags: [...currentTags, newTag.trim()],
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setNewTag('');
      setIsAddingTag(false);
    } catch (err) {
      console.error("Error adding tag:", err);
    }
  };

  const removeTag = async (tagToRemove: string) => {
    if (!user) return;
    const currentTags = userProfile?.tags || [];
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        tags: currentTags.filter((t: string) => t !== tagToRemove),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error removing tag:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Login Required</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Please sign in to view your soil health history and manage your farm profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 transition-colors duration-300">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Profile Card */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all duration-300">
            <div className="relative">
              <img src={user.photoURL || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=200"} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-50 dark:border-slate-800 shadow-xl" />
              <div className="absolute -bottom-1 -right-1 bg-green-600 dark:bg-green-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{user.displayName || 'Gurpreet Singh'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{userProfile?.farmName || 'Kisan Sathi Member'}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full tracking-wider uppercase">TRUST VERIFIED</span>
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm transition-all duration-300 relative group">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-tighter">Land</p>
              <div className="flex items-center justify-center gap-1">
                <input 
                  type="number"
                  value={userProfile?.landSize || ''}
                  onChange={async (e) => {
                    if (!user) return;
                    await setDoc(doc(db, 'users', user.uid), { landSize: e.target.value }, { merge: true });
                  }}
                  placeholder="0"
                  className="w-12 bg-transparent text-lg font-black text-slate-800 dark:text-slate-100 text-center outline-none"
                />
                <span className="text-[10px] opacity-50 font-bold">Ac</span>
              </div>
              <div className="absolute inset-0 border-2 border-green-500/0 group-focus-within:border-green-500/20 rounded-2xl pointer-events-none transition-all"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm transition-all duration-300">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-tighter">Soil Tests</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{soilHistory?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm transition-all duration-300">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-tighter">Rank</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">#42</p>
            </div>
          </div>

          {/* Settings Tags Section */}
          <section>
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-black text-slate-800 dark:text-slate-100">Farm Tags</h3>
              <button 
                 onClick={() => setIsAddingTag(true)}
                 className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full"
              >
                ADD TAG
              </button>
            </div>
            <div className="flex flex-wrap gap-2 px-2">
              {userProfile?.tags ? (
                 userProfile.tags.map((tag: string) => (
                    <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 group">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                 ))
              ) : (
                <p className="text-xs text-slate-400 italic">No tags added yet.</p>
              )}

              {isAddingTag && (
                <div className="flex items-center gap-2">
                  <input 
                    autoFocus
                    className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-xs outline-none border border-green-200 dark:border-green-900"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    onBlur={() => !newTag && setIsAddingTag(false)}
                    placeholder="Tag name..."
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Soil Health History */}
        <section>
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-black text-slate-800 dark:text-slate-100">Soil Health History</h3>
            <button 
              onClick={() => setIsAddingSoil(true)}
              className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full"
            >
              ADD RECORD
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {loadingSoil && (
              <div className="col-span-full animate-pulse flex flex-col gap-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
              </div>
            )}

            {!loadingSoil && soilHistory?.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                <p className="text-xs text-slate-400 font-medium">No records found. Visit a testing lab to update your soil health data.</p>
              </div>
            )}

            {soilHistory?.map((record: any) => (
              <div 
                key={record.id || record.date} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300"
              >
                <div 
                  className="w-full text-left"
                >
                  <button 
                    onClick={() => record.id && toggleExpand(record.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{record.date}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded border border-orange-100 dark:border-orange-900/30">pH: {record.ph}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900/30">N: {record.nitrogen}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded border border-green-100 dark:border-green-900/30">M: {record.moisture}</span>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 transition-transform duration-300 ${expandedId === record.id ? 'rotate-180 text-green-600 dark:text-green-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {expandedId === record.id && (
                    <div className="p-4 pt-0 border-t border-slate-50 dark:border-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phosphorus (P)</p>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{record.phosphorus || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Potassium (K)</p>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{record.potassium || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {record.aiPrediction && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                               <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.953V8.411l3.905 1.302a1 1 0 01.624 1.258l-2 6a1 1 0 01-1.32.581l-4.414-1.472a1 1 0 01-.624-1.258l2-6a1 1 0 011.32-.581l3.3 1.1V10a1 1 0 11-2 0V11l-2.073-.691a3 3 0 00-3.66 3.662l.691 2.073a1 1 0 11-1.897.633l-.691-2.074a5 5 0 016.101-6.102L11 8.412V2a1 1 0 011-1z" clipRule="evenodd" />
                               </svg>
                             </div>
                             <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">AI Consultant Advice</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                            {record.aiPrediction}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {isAddingSoil && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Soil Record</h3>
              <button onClick={() => setIsAddingSoil(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSoilRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">pH Level</label>
                  <input type="number" step="0.1" value={formData.ph} onChange={e => setFormData({...formData, ph: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Moisture (%)</label>
                  <input type="text" value={formData.moisture} onChange={e => setFormData({...formData, moisture: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nitrogen</label>
                  <input type="text" value={formData.nitrogen} onChange={e => setFormData({...formData, nitrogen: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phos.</label>
                  <input type="text" value={formData.phosphorus} onChange={e => setFormData({...formData, phosphorus: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Potass.</label>
                  <input type="text" value={formData.potassium} onChange={e => setFormData({...formData, potassium: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-green-500 border dark:border-slate-700 dark:text-white" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg mt-4 shadow-green-100 dark:shadow-green-900/20 active:scale-95 transition-all">
                Save Soil Record
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="text-center pt-4 opacity-50">
        <p className="text-[10px] text-slate-300 dark:text-slate-600 uppercase font-bold tracking-[0.2em]">Kisan Sathi v1.1.0 Cloud Powered</p>
      </div>
    </div>
  );
};

export default Profile;

