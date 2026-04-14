import React, { useEffect, useState } from 'react';
import { getRegistrations, EVENT_DETAILS, clearRegistrations, getHints, updateHint } from '../store';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Users, Banknote } from 'lucide-react';

export default function Admin() {
  const [registrations, setRegistrations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [hints, setHints] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      getRegistrations().then(setRegistrations);
      getHints().then(res => {
        const hintMap = {};
        res.forEach(r => hintMap[r.eventId] = r.hintText);
        setHints(hintMap);
      });
    }
  }, [isAuthenticated]);

  const handleUpdateHint = async (eventId, hintText) => {
    const res = await updateHint(eventId, hintText);
    if (res.success) alert('Hint updated successfully everywhere!');
    else alert('Failed to update hint');
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
    return {
      ...event,
      registrations: registrations.filter(r => r.eventId === event.id)
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
