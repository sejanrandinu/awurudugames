import React, { useEffect, useState } from 'react';
import { getRegistrations, EVENT_DETAILS, clearRegistrations, getHints, updateHint, getOfficialResults, updateOfficialResult, updatePaymentStatus } from '../store';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Users, Banknote } from 'lucide-react';

export default function Admin() {
  const [registrations, setRegistrations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [hints, setHints] = useState({});
  const [results, setResults] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      getRegistrations().then(setRegistrations);
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

  const handleTogglePayment = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const res = await updatePaymentStatus(id, newStatus);
    if (res.success) {
      setRegistrations(registrations.map(r => r.id === id ? { ...r, isPaid: newStatus } : r));
    } else {
      alert('Failed to update payment status');
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
            const isWinner = !isNaN(guessNum) && Math.abs(guessNum - resultNum) === minDiff;
            return { ...r, isWinner, isLoser: !isWinner };
          });
        }
      } else {
        // Text mode
        regs = regs.map(r => {
          const isWinner = r.guess && r.guess.toLowerCase().includes(officialResult.toLowerCase());
          return { ...r, isWinner, isLoser: !isWinner };
        });
      }
    }
    
    return {
      ...event,
      registrations: regs
    };
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-sm text-center shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-700/50 p-4 rounded-full text-orange-400">
              <Users size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
          <p className="text-slate-400 text-sm mb-6">Secured Area</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'admin123') setIsAuthenticated(true);
            else {
              alert('Incorrect password');
              setPassword('');
            }
          }}>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 mb-4 text-white focus:border-orange-500 outline-none text-center tracking-widest"
              placeholder="Enter password..."
            />
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
              Login to Dashboard
            </button>
            <Link to="/" className="inline-block mt-4 text-sm text-slate-400 hover:text-white transition-colors">
              Back to Home
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
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors font-semibold text-sm border border-red-500/20"
          >
            <Trash2 size={16} />
            Reset All Data
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1 font-medium">Total Registrations</p>
              <p className="text-4xl font-black text-white">{registrations.length}</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-full text-blue-400">
              <Users size={32} />
            </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1 font-medium">Total Revenue (Rs)</p>
              <p className="text-4xl font-black text-green-400">{totalCollected}.00</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-full text-green-400">
              <Banknote size={32} />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-700/50 p-6 flex justify-between items-center border-b border-slate-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span> 
                  {group.title}
                </h3>
                <div className="text-sm font-semibold bg-slate-700 px-3 py-1 rounded-full text-orange-300">
                  {group.registrations.length} Players
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
                        <th className="p-4 font-semibold text-slate-300 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {group.registrations.map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 text-slate-400 text-sm">
                            {new Date(reg.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
                          </td>
                          <td className="p-4 font-medium text-white">{reg.name}</td>
                          <td className="p-4 text-slate-300 font-mono text-sm">{reg.phone}</td>
                          {group.guessLabel && (
                            <td className="p-4 text-orange-300 font-bold bg-orange-500/5">
                              {reg.guess}
                            </td>
                          )}
                          <td className="p-4 text-center">
                            {reg.isWinner !== undefined ? (
                              reg.isWinner ? (
                                <div className="flex flex-col items-center gap-2">
                                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">🎉 WINNER</span>
                                  <button
                                    onClick={() => handleTogglePayment(reg.id, reg.isPaid)}
                                    className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${reg.isPaid ? 'bg-blue-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                  >
                                    {reg.isPaid ? 'Paid ✔' : 'Mark as Paid'}
                                  </button>
                                </div>
                              ) : (
                                <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">Lost</span>
                              )
                            ) : (
                              <span className="text-slate-500 text-xs">Waiting</span>
                            )}
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
    </div>
  );
}
