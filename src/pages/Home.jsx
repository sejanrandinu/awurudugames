import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_DETAILS, addRegistration, getHints, getOfficialResults, getRegistrationsByPhone, getRegistrations, getEventStatuses } from '../store';
import { Settings, X, CheckCircle, HelpCircle, Trophy, Search, ChevronRight, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

const DICE_SYMBOLS = ['🐘 අලියා', '🐎 අශ්වයා', '🐟 මාළුවා', '🐓 කුකුළා', '🦁 සිංහයා', '🐯 කොටියා'];

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', guess: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicHints, setDynamicHints] = useState({});
  const [showResultCheck, setShowResultCheck] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [myResults, setMyResults] = useState(null);
  const [officialResults, setOfficialResults] = useState({});
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [eventStatuses, setEventStatuses] = useState({});

  React.useEffect(() => {
    getHints().then(res => {
      const hintMap = {};
      res.forEach(r => hintMap[r.eventId] = r.hintText);
      setDynamicHints(hintMap);
    });
    getEventStatuses().then(res => {
      const statusMap = {};
      res.forEach(r => statusMap[r.eventId] = r.isDisabled === 1);
      setEventStatuses(statusMap);
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

  const handleCheckResults = async () => {
    if (!searchPhone) return;
    setIsSearching(true);
    try {
      const [regs, res, allRegs] = await Promise.all([
        getRegistrationsByPhone(searchPhone),
        getOfficialResults(),
        getRegistrations()
      ]);
      
      const resultMap = {};
      res.forEach(r => resultMap[r.eventId] = r.resultText);
      setOfficialResults(resultMap);
      setAllRegistrations(allRegs);
      setMyResults(regs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const getMinDiff = (eventId, officialResult) => {
    const eventRegs = allRegistrations.filter(r => r.eventId === eventId);
    const resultNum = Number(officialResult);
    if (isNaN(resultNum)) return Infinity;
    
    let min = Infinity;
    eventRegs.forEach(r => {
      const guessNum = Number(r.guess);
      if (!isNaN(guessNum)) {
        const diff = Math.abs(guessNum - resultNum);
        if (diff < min) min = diff;
      }
    });
    return min;
  };

  const checkWinner = (reg, officialResult) => {
    if (!officialResult) return null;
    if (reg.isManualWinner) return true;

    const event = EVENT_DETAILS.find(e => e.id === reg.eventId);
    if (!event) return null;

    if (event.playMode === 'number') {
      const minDiff = getMinDiff(reg.eventId, officialResult);
      const guessNum = Number(reg.guess);
      const resultNum = Number(officialResult);
      if (isNaN(guessNum) || isNaN(resultNum)) return false;
      return Math.abs(guessNum - resultNum) === minDiff;
    } else {
      return reg.guess && reg.guess.toLowerCase().includes(officialResult.toLowerCase());
    }
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
          placeholder={`Enter ${selectedEvent.guessLabel.toLowerCase()}...`}
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
        <div className="flex gap-2">
          <button 
            onClick={() => setShowResultCheck(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 transition-all text-sm font-semibold border border-orange-500/30"
          >
            <Trophy size={18} />
            <span>Results</span>
          </button>
          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/20 transition-all text-sm font-semibold">
            <Settings size={18} />
          </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mt-12 mb-20 px-4"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
            The Digital Village Festival
          </div>
          <h2 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
            Celebrate <span className="relative inline-block">
              <span className="absolute inset-0 bg-orange-500 blur-[40px] opacity-20"></span>
              <span className="relative bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 text-transparent bg-clip-text">Awurudu</span>
            </span>
            <br />
            <span className="text-slate-400">Like Never Before</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 font-medium leading-relaxed max-w-2xl mx-auto">
            Experience the joy of traditional Sri Lankan games in a stunning digital arena. Join the village, place your bets, and win grand prizes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
             <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Events
             </div>
             <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold">
                <span className="text-orange-400">Rs. 20</span> entry fee
             </div>
          </div>
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
                onClick={() => !eventStatuses[event.id] && handleOpenModal(event)}
                disabled={eventStatuses[event.id]}
                className={`relative z-10 w-full py-4 mt-auto rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 ${eventStatuses[event.id] ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]'}`}
              >
                {eventStatuses[event.id] ? (
                  <>
                    <X size={20} />
                    Disabled
                  </>
                ) : (
                  'Play Now'
                )}
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

      {/* Result Check Modal */}
      <AnimatePresence>
        {showResultCheck && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-orange-400" />
                  Check Your Results
                </h3>
                <button 
                  onClick={() => {
                    setShowResultCheck(false);
                    setMyResults(null);
                    setSearchPhone('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {!myResults ? (
                  <div className="space-y-6 py-4">
                    <p className="text-slate-400 text-center">Enter your phone number to see your lucky guesses and winning status.</p>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder="07X XXX XXXX"
                        className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500 rounded-2xl px-6 py-4 text-white outline-none transition-all text-lg font-mono text-center"
                      />
                    </div>
                    <button 
                      onClick={handleCheckResults}
                      disabled={isSearching || !searchPhone}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSearching ? 'Searching...' : 'Find My Luck 🔍'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myResults.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                          <Search size={32} />
                        </div>
                        <p className="text-slate-300 font-bold text-lg">No records found</p>
                        <p className="text-slate-500 text-sm">Make sure you used this phone number to play.</p>
                        <button 
                          onClick={() => setMyResults(null)}
                          className="mt-6 text-orange-400 font-bold hover:underline"
                        >
                          Try another number
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 pb-4">
                        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                               <Hash size={20} />
                             </div>
                             <div>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Phone Number</p>
                               <p className="text-white font-mono font-bold">{searchPhone}</p>
                             </div>
                           </div>
                           <button 
                            onClick={() => setMyResults(null)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-slate-300 transition-colors"
                           >Change</button>
                        </div>

                        <div className="space-y-3">
                          {myResults.map(reg => {
                            const event = EVENT_DETAILS.find(e => e.id === reg.eventId);
                            const officialRes = officialResults[reg.eventId];
                            const isPaid = reg.isPaid;
                            const isWinner = isPaid ? checkWinner(reg, officialRes) : false;

                            return (
                              <div key={reg.id} className={`p-5 rounded-2xl border transition-all ${!isPaid ? 'bg-amber-500/5 border-amber-500/20' : isWinner ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'bg-slate-800/50 border-slate-700'}`}>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{event?.icon || '🎮'}</span>
                                    <div>
                                      <h4 className="text-sm font-black text-white">{reg.eventName}</h4>
                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {new Date(reg.timestamp).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  {!isPaid ? (
                                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-1 rounded-full border border-amber-500/30">Payment Pending ⏳</span>
                                  ) : officialRes ? (
                                    isWinner ? (
                                      <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">WINNER 🎉</span>
                                    ) : (
                                      <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-1 rounded-full border border-red-500/30">Better Luck Next Time</span>
                                    )
                                  ) : (
                                    <span className="bg-slate-700 text-slate-400 text-[10px] font-black px-2 py-1 rounded-full">Coming Soon</span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                  <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Your Guess</p>
                                    <p className={`text-sm font-bold ${isPaid ? (isWinner ? 'text-green-400' : 'text-orange-300') : 'text-slate-400'}`}>{reg.guess}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Actual Result</p>
                                    <p className="text-sm font-bold text-white">
                                      {!isPaid ? (
                                        <span className="flex items-center gap-1 text-slate-500">
                                          Locked 🔒
                                        </span>
                                      ) : (officialRes || '???')}
                                    </p>
                                  </div>
                                </div>

                                {isPaid && isWinner && (
                                  <div className="mt-4 pt-4 border-t border-green-500/20 text-center">
                                    <p className="text-green-400 text-xs font-bold mb-2">Congratulations! 🎉</p>
                                    <p className="text-white text-[10px] mb-3 opacity-80 text-balance">Take a screenshot of this page and contact the organizer to claim your prize.</p>
                                    <div className="flex flex-col gap-2">
                                      <a 
                                        href="https://wa.me/94702838364" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black px-4 py-3 rounded-xl transition-all"
                                      >
                                        Contact 0702838364
                                      </a>
                                      <button 
                                        onClick={() => {
                                          const text = encodeURIComponent(`🎉 මම ${reg.eventName} ක්‍රීඩාවෙන් දිනුවා! 🏆\n\nමගේ Guess එක: ${reg.guess}\n\nඔයත් සෙල්ලම් කරලා දිනන්න: ${window.location.origin}`);
                                          window.open(`https://wa.me/?text=${text}`, '_blank');
                                        }}
                                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-4 py-3 rounded-xl transition-all border border-white/10"
                                      >
                                        Share My Win 🚀
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {!isPaid && (
                                  <div className="mt-4 pt-4 border-t border-amber-500/20 text-center">
                                    <p className="text-amber-400/80 text-[10px] font-medium leading-relaxed">
                                      Your entry is pending confirmation. Results will be unlocked once payment is verified by the organizer.
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
