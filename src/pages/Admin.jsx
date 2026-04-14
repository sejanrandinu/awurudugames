import React, { useEffect, useState } from 'react';
import { getRegistrations, EVENT_DETAILS, clearRegistrations, getHints, updateHint, getOfficialResults, updateOfficialResult, updatePaymentStatus, updateManualWinnerStatus, getEventStatuses, updateEventStatus } from '../store';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Users, Banknote, Power, PowerOff } from 'lucide-react';

export default function Admin() {
  const [registrations, setRegistrations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [hints, setHints] = useState({});
  const [results, setResults] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [eventStatuses, setEventStatuses] = useState({});

  const refreshRegistrations = () => {
    getRegistrations().then(setRegistrations);
  };

  const fetchData = () => {
    refreshRegistrations();
    getHints().then(res => {
      const hintMap = {};
      res.forEach(r => hintMap[r.eventId] = r.hintText);
      setHints(hintMap);
    });
    getOfficialResults().then(res => {
      const resultMap = {};
      res.forEach(r => resultMap[r.eventId] = r.resultText);
      setResults(resultMap);
    });
    getEventStatuses().then(res => {
      const statusMap = {};
      res.forEach(r => statusMap[r.eventId] = r.isDisabled === 1);
      setEventStatuses(statusMap);
    });
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('isAdminAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      fetchData();
      const interval = setInterval(refreshRegistrations, 5000); 
      return () => clearInterval(interval);
    } else {
      localStorage.removeItem('isAdminAuthenticated');
    }
  }, [isAuthenticated]);

  const handleUpdateHint = async (eventId, hintText) => {
    const res = await updateHint(eventId, hintText);
    if (res.success) alert('Hint updated successfully everywhere!');
    else alert('Failed to update hint');
  };

  const handleUpdateResult = async (eventId, resultText) => {
    const res = await updateOfficialResult(eventId, resultText);
    if (res.success) alert('Result updated successfully!');
    else alert('Failed to update result');
  };

  const handleTogglePayment = (reg) => {
    if (!reg.isPaid) {
      setShowConfirmModal(reg);
    } else {
      executePaymentUpdate(reg.id, false);
    }
  };

  const executePaymentUpdate = async (id, newStatus) => {
    const res = await updatePaymentStatus(id, newStatus);
    if (res.success) {
      setRegistrations(registrations.map(r => r.id === id ? { ...r, isPaid: newStatus } : r));
      setShowConfirmModal(null);
    } else {
      alert('Failed to update payment status');
    }
  };

  const handleToggleWinner = async (reg) => {
    const newStatus = !reg.isManualWinner;
    const res = await updateManualWinnerStatus(reg.id, newStatus);
    if (res.success) {
      setRegistrations(registrations.map(r => r.id === reg.id ? { ...r, isManualWinner: newStatus } : r));
    } else {
      alert('Failed to update winner status');
    }
  };

  const handleToggleEventStatus = async (eventId) => {
    const currentStatus = !!eventStatuses[eventId];
    const newStatus = !currentStatus;
    const res = await updateEventStatus(eventId, newStatus);
    if (res.success) {
      setEventStatuses({ ...eventStatuses, [eventId]: newStatus });
    } else {
      alert('Failed to update event status');
    }
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      await clearRegistrations();
      setRegistrations([]);
    }
  };

  const totalCollected = registrations.reduce((sum, r) => sum + r.price, 0);

  // Group by event
  const grouped = EVENT_DETAILS.map(event => {
    let regs = registrations.filter(r => r.eventId === event.id);
    const officialResult = results[event.id];
    
    if (officialResult) {
      if (event.playMode === 'number') {
        const resultNum = Number(officialResult);
        if (!isNaN(resultNum)) {
          // Find minimum difference
          let minDiff = Infinity;
          regs.forEach(r => {
            const guessNum = Number(r.guess);
            if (!isNaN(guessNum)) {
              const diff = Math.abs(guessNum - resultNum);
              if (diff < minDiff) minDiff = diff;
            }
          });
          // Mark winners
          regs = regs.map(r => {
            const guessNum = Number(r.guess);
            const isAutoWinner = !isNaN(guessNum) && Math.abs(guessNum - resultNum) === minDiff;
            const isWinner = r.isManualWinner || isAutoWinner;
            return { ...r, isWinner, isLoser: !isWinner };
          });
        }
      } else {
        // Text mode
        regs = regs.map(r => {
          const isAutoWinner = r.guess && r.guess.toLowerCase().includes(officialResult.toLowerCase());
          const isWinner = r.isManualWinner || isAutoWinner;
          return { ...r, isWinner, isLoser: !isWinner };
        });
      }
    } else {
      // No official result, but still check manual winners
      regs = regs.map(r => ({ ...r, isWinner: !!r.isManualWinner }));
    }
    
    return {
      ...event,
      registrations: regs
    };
  });


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 w-full max-w-sm text-center shadow-2xl relative z-10">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-5 rounded-3xl text-white shadow-lg shadow-orange-500/20">
              <Users size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Gateway</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">Verify your identity to manage events</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            // Using the user's provided number: 0702838364
            if (adminPhone === '0702838364' || adminPhone === 'admin123') setIsAuthenticated(true);
            else {
              alert('Unauthorized access attempt.');
              setAdminPhone('');
            }
          }}>
            <div className="space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">Admin Identification</label>
                <input 
                  type="text" 
                  required
                  value={adminPhone}
                  onChange={e => setAdminPhone(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:border-orange-500 outline-none text-center font-mono text-lg transition-all focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Enter admin number..."
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] text-white font-black py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95">
                Access Dashboard
              </button>
            </div>
            <Link to="/" className="inline-block mt-8 text-sm font-bold text-slate-500 hover:text-orange-400 transition-colors">
              ← Return to Games
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm">Manage Awurudu event registrations</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold text-slate-300 transition-colors"
            >
              Logout
            </button>
            <button 
              onClick={handleClear}
              className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors font-semibold text-sm border border-red-500/20"
            >
              <Trash2 size={16} />
              Reset All Data
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1 font-medium">Total Players</p>
              <p className="text-4xl font-black text-white">{registrations.length}</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-full text-blue-400">
              <Users size={32} />
            </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1 font-medium">Collected (Rs)</p>
              <p className="text-4xl font-black text-green-400">{registrations.filter(r => r.isPaid).reduce((sum, r) => sum + r.price, 0)}.00</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-full text-green-400">
              <Banknote size={32} />
            </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1 font-medium">Pending (Rs)</p>
              <p className="text-4xl font-black text-amber-500">{registrations.filter(r => !r.isPaid).reduce((sum, r) => sum + r.price, 0)}.00</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-full text-amber-500">
              <Banknote size={32} />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-700/50 p-6 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span> 
                    {group.title}
                  </h3>
                  {eventStatuses[group.id] && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-tighter">Disabled</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleEventStatus(group.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${eventStatuses[group.id] ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'}`}
                  >
                    {eventStatuses[group.id] ? <PowerOff size={14} /> : <Power size={14} />}
                    {eventStatuses[group.id] ? 'Enable Event' : 'Disable Event'}
                  </button>
                  <div className="text-sm font-semibold bg-slate-700 px-3 py-1 rounded-full text-orange-300">
                    {group.registrations.length} Players
                  </div>
                </div>
              </div>
              
              {/* Hint editor */}
              <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex flex-col md:flex-row gap-2 items-center">
                <div className="text-slate-400 text-sm font-medium w-full md:w-auto shrink-0">Current Hint:</div>
                <input 
                  className="flex-1 w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-amber-200 outline-none" 
                  value={hints[group.id] !== undefined ? hints[group.id] : group.hint || ''}
                  onChange={(e) => setHints({...hints, [group.id]: e.target.value})}
                  placeholder="Enter a hint to show to players..."
                />
                <button 
                  onClick={() => handleUpdateHint(group.id, hints[group.id] !== undefined ? hints[group.id] : group.hint)}
                  className="w-full md:w-auto bg-slate-700 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >Update Hint</button>
              </div>

              {/* Result editor */}
              <div className="p-4 bg-orange-900/10 border-b border-slate-700 flex flex-col md:flex-row gap-2 items-center">
                <div className="text-orange-400 text-sm font-bold w-full md:w-auto shrink-0">Official Result:</div>
                <input 
                  className="flex-1 w-full bg-slate-900 border border-orange-700/50 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-white outline-none" 
                  value={results[group.id] !== undefined ? results[group.id] : ''}
                  onChange={(e) => setResults({...results, [group.id]: e.target.value})}
                  placeholder={group.playMode === 'number' ? "Enter winning number..." : "Enter winning answer..."}
                  type={group.playMode === 'number' ? "number" : "text"}
                />
                <button 
                  onClick={() => handleUpdateResult(group.id, results[group.id])}
                  className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg"
                >Save Result</button>
              </div>
              
              <div className="h-[300px] overflow-y-auto custom-scrollbar">
                {group.registrations.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 font-medium">
                    No registrations yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-800 z-10 border-b border-slate-700 shadow-sm">
                      <tr>
                        <th className="p-4 font-semibold text-slate-300">Date/Time</th>
                        <th className="p-4 font-semibold text-slate-300">Name</th>
                        <th className="p-4 font-semibold text-slate-300">Phone</th>
                        {group.guessLabel && <th className="p-4 font-semibold text-orange-400">{group.guessLabel}</th>}
                        <th className="p-4 font-semibold text-slate-300 text-center">Payment</th>
                        <th className="p-4 font-semibold text-slate-300 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {group.registrations.map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 text-slate-400 text-sm">
                            {new Date(reg.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-white">{reg.name}</div>
                            <div className="flex gap-2 mt-1">
                              <a href={`tel:${reg.phone}`} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold">Call</a>
                              <span className="text-slate-700 text-[10px]">|</span>
                              <a href={`https://wa.me/94${reg.phone.startsWith('0') ? reg.phone.substring(1) : reg.phone}`} target="_blank" rel="noreferrer" className="text-[10px] text-green-400 hover:text-green-300 font-bold text-nowrap">Message</a>
                            </div>
                          </td>
                          <td className="p-4">
                            <code className="text-slate-400 text-xs bg-slate-900 px-2 py-1 rounded">{reg.phone}</code>
                          </td>
                          {group.guessLabel && (
                            <td className="p-4 text-orange-300 font-bold bg-orange-500/5">
                              {reg.guess}
                            </td>
                          )}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleTogglePayment(reg)}
                              className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${reg.isPaid ? 'bg-blue-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                            >
                              {reg.isPaid ? 'Paid ✔' : 'Mark as Paid'}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              {reg.isWinner !== undefined ? (
                                reg.isWinner ? (
                                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">🎉 WINNER</span>
                                ) : (
                                  <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">Lost</span>
                                )
                              ) : (
                                <span className="text-slate-500 text-xs font-medium">Waiting...</span>
                              )}
                              <button
                                onClick={() => handleToggleWinner(reg)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${reg.isManualWinner ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'}`}
                              >
                                {reg.isManualWinner ? 'Manual Winner ✔' : 'Set as Winner'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-500/10 p-4 rounded-full text-green-400 mb-6">
                <Banknote size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Confirm Payment</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Confirm that <span className="text-white font-semibold">{showConfirmModal.name}</span> has paid <span className="text-emerald-400 font-bold">Rs.{showConfirmModal.price}.00</span> for this event?
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => executePaymentUpdate(showConfirmModal.id, true)}
                  className="flex-1 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors shadow-lg shadow-green-500/20"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
