import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_DETAILS, addRegistration, getHints } from '../store';
import { Settings, X, CheckCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DICE_SYMBOLS = ['🐘 අලියා', '🐎 අශ්වයා', '🐟 මාළුවා', '🐓 කුකුළා', '🦁 සිංහයා', '🐯 කොටියා'];

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', guess: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicHints, setDynamicHints] = useState({});

  React.useEffect(() => {
    getHints().then(res => {
      const hintMap = {};
      res.forEach(r => hintMap[r.eventId] = r.hintText);
      setDynamicHints(hintMap);
    });
  }, []);

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setFormData({ name: '', phone: '', guess: '' });
    setIsSuccess(false);
    setIsSubmitting(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedEvent(null);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.guess) {
      alert("Please complete all required fields and make your selection/guess.");
      return;
    }
    
    setIsSubmitting(true);
    await addRegistration({
      eventId: selectedEvent.id,
      eventName: selectedEvent.title,
      price: selectedEvent.price,
      ...formData
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      handleCloseModal();
    }, 3000);
  };

  const renderGameUI = () => {
    if (!selectedEvent) return null;

    if (selectedEvent.playMode === 'dice') {
      return (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">Select your lucky symbol:</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DICE_SYMBOLS.map(symbol => (
              <button
                key={symbol}
                type="button"
                onClick={() => setFormData({...formData, guess: symbol})}
                className={`py-3 px-2 rounded-xl border-2 transition-all font-bold text-center ${formData.guess === symbol ? 'border-orange-500 bg-orange-500/20 text-orange-400 scale-105' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (selectedEvent.playMode === 'grid') {
      return (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">Pick your lucky plot on the map (1-15):</label>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({length: 15}).map((_, i) => {
              const box = `Plot ${i + 1}`;
              return (
                <button
                  key={box}
                  type="button"
                  onClick={() => setFormData({...formData, guess: box})}
                  className={`aspect-square rounded-xl flex items-center justify-center font-bold font-mono transition-all border-2 ${formData.guess === box ? 'border-orange-500 bg-orange-500 text-white scale-110 shadow-[0_0_15px_rgba(249,115,22,0.5)] z-10' : 'border-slate-700 bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      );
    }

    if (selectedEvent.playMode === 'number') {
      return (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-1">{selectedEvent.guessLabel}</label>
          <input 
            type="number" 
            required
            className="w-full bg-slate-800 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.1)] focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none transition-colors text-xl font-bold font-mono"
            placeholder="e.g. 450"
            value={formData.guess}
            onChange={(e) => setFormData({...formData, guess: e.target.value})}
          />
        </div>
      );
    }

    // Default text input
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-1">{selectedEvent.guessLabel}</label>
        <input 
          type="text" 
          required
          className="w-full bg-slate-800 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.1)] focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
          placeholder="Enter name..."
          value={formData.guess}
          onChange={(e) => setFormData({...formData, guess: e.target.value})}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0f1c] selection:bg-orange-500/50">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-amber-500/20 rounded-full blur-[150px] pointer-events-none" />

      <header className="relative z-10 w-full py-6 px-8 flex justify-between items-center glass-dark rounded-b-[2rem]">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-yellow-300 text-transparent bg-clip-text drop-shadow-md">
          Awurudu Games
        </h1>
        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/20 transition-all text-sm font-semibold">
          <Settings size={18} />
          <span>Admin</span>
        </Link>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mt-8 mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight text-white">
            Play <span className="bg-gradient-to-r from-orange-500 to-amber-300 text-transparent bg-clip-text">Awurudu Games</span> Online
          </h2>
          <p className="text-lg text-slate-300 mb-8 font-medium">
            Join the digital village games! Place your bets, guess the hidden secrets, and win amazing prizes! Only Rs. 20 per play.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-5xl">
          {EVENT_DETAILS.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group border-white/10 hover:border-orange-500/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 text-7xl group-hover:scale-110 group-hover:opacity-30 transition-all duration-500">
                {event.icon}
              </div>
              
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-500/30">
                  Rs. {event.price} / Play
                </span>
                <h3 className="text-3xl font-bold mb-3 text-white">{event.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {event.description}
                </p>
              </div>

              <button 
                onClick={() => handleOpenModal(event)}
                className="relative z-10 w-full py-4 mt-auto rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all flex justify-center items-center gap-2"
              >
                Play Now
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-24 pb-12"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative my-auto"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle size={64} className="text-green-500 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">Played Successfully!</h3>
                  <p className="text-slate-400">Your selection was saved. Good luck!</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 text-transparent bg-clip-text pr-8 mb-2">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">Enter details and play. Entry fee: Rs. {selectedEvent.price}</p>
                  
                  {(dynamicHints[selectedEvent.id] || selectedEvent.hint) && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-sm text-amber-200 text-left">
                      <HelpCircle size={16} className="inline mr-2 -mt-0.5 text-amber-400" />
                      {dynamicHints[selectedEvent.id] || selectedEvent.hint}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Your Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                          placeholder="Kamal"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                          placeholder="07X XXX XXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="w-full h-px bg-slate-800 my-4" />

                    {/* Interactive Virtual Game UI rendering */}
                    {renderGameUI()}

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-lg flex justify-center items-center ${isSubmitting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-orange-100'}`}
                      >
                        {isSubmitting ? 'Processing...' : `Pay & Play (Rs. ${selectedEvent.price})`}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
