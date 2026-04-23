
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';

const Marketplace: React.FC = () => {
  const [user] = useAuthState(auth);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [messageText, setMessageText] = useState('');

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedItem || !bidAmount) return;

    const amount = Number(bidAmount);
    if (amount <= (selectedItem.highestBid || selectedItem.price)) {
      alert("Bid must be higher than the current price");
      return;
    }

    setLoading(true);
    try {
      const bidRef = collection(db, 'grains', selectedItem.id, 'bids');
      await addDoc(bidRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        amount: amount,
        createdAt: serverTimestamp()
      });

      // Update the main grain document with reference to highest bid
      const grainRef = doc(db, 'grains', selectedItem.id);
      await updateDoc(grainRef, {
        highestBid: amount,
        highestBidderName: user.displayName || 'Anonymous',
        highestBidderId: user.uid
      });

      setShowBidModal(false);
      setBidAmount('');
      setSelectedItem(null);
    } catch (err) {
      console.error("Error placing bid:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedItem || !messageText) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        receiverId: selectedItem.userId,
        listingId: selectedItem.id,
        listingType: selectedItem.type,
        text: messageText,
        createdAt: serverTimestamp(),
        read: false
      });
      setShowContactModal(false);
      setMessageText('');
      setSelectedItem(null);
      alert("Message sent to " + selectedItem.farmerName);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const [listingsSnapshot, loadingListings] = useCollection(
    query(collection(db, 'grains'), orderBy('createdAt', 'desc'))
  );

  const dynamicListings = listingsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const handleSellCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!cropName || !quantity || !price) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'grains'), {
        userId: user.uid,
        farmerName: user.displayName || 'Anonymous Farmer',
        type: cropName,
        variety: variety || 'Standard',
        quantity: quantity,
        price: Number(price),
        grade: 'A', // Default or AI graded in future
        status: 'Available',
        createdAt: serverTimestamp(),
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'
      });
      
      // Reset form
      setCropName('');
      setVariety('');
      setQuantity('');
      setPrice('');
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding grain:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Local Listings</h2>
        {user ? (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-100 dark:shadow-green-900/20 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Sell Crop
          </button>
        ) : (
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">Sign in to Sell</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loadingListings && (
          <div className="animate-pulse space-y-4 col-span-full grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
            ))}
          </div>
        )}

        {!loadingListings && dynamicListings?.map((item: any, idx) => (
          <div key={item.id || idx} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group active:scale-[0.98] transition-all duration-300">
            <div className="relative h-44">
              <img src={item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'} alt={item.type} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 border border-white/20 dark:border-white/10">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quality</span>
                <span className="text-sm font-black text-green-600 dark:text-green-500">{item.grade}</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none">Price</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                    ₹{item.highestBid || item.price}
                    <span className="text-[10px] text-slate-400">/quintal</span>
                  </p>
                  {item.highestBid && (
                    <p className="text-[8px] font-bold text-green-600 uppercase tracking-tighter -mt-0.5">Highest Bid</p>
                  )}
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-xs shadow-lg">
                  {item.quantity} Qt
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">{item.type}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{item.variety}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Listed by</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.farmerName}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => {
                    setSelectedItem(item);
                    setShowContactModal(true);
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Contact
                </button>
                <button 
                  onClick={() => {
                    setSelectedItem(item);
                    setShowBidModal(true);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-green-100 dark:shadow-green-900/20"
                >
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {!loadingListings && dynamicListings?.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p className="text-slate-500">No active listings in your area.</p>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">List New Crop</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSellCrop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Crop Name</label>
                <input 
                  type="text" 
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Tomato, Wheat" 
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none border" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Variety</label>
                <input 
                  type="text" 
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Basmati, Hybrid" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none border" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Quantity (Qt)</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0" 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none border" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Price (₹/Qt)</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0" 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none border" 
                  />
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center group hover:border-green-300 dark:hover:border-green-800 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/50">
                <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Upload Produce Photo</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">AI will automatically grade quality</p>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-green-100 dark:shadow-green-900/20 mt-4 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'List on Marketplace'}
              </button>
            </form>
          </div>
        </div>
      )}
      {showBidModal && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 text-slate-100 transition-colors duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Place Your Bid</h3>
              <button 
                onClick={() => {
                  setShowBidModal(false);
                  setSelectedItem(null);
                  setBidAmount('');
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Current Price</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">₹{selectedItem.highestBid || selectedItem.price}</p>
            </div>
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Bid (₹/Qt)</label>
                <input 
                  type="number" 
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min ₹${(selectedItem.highestBid || selectedItem.price) + 1}`}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-4 text-lg font-bold focus:ring-green-500 outline-none border" 
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-green-100 dark:shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Confirm Bid'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showContactModal && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 transition-colors duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Contact Seller</h3>
              <button 
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedItem(null);
                  setMessageText('');
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-black text-slate-400 tracking-tighter">KS</div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedItem.farmerName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verified Kisan Member</p>
              </div>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="I am interested in buying your crop..."
                  required
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-green-500 outline-none border resize-none" 
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-green-100 dark:shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
