// client/src/pages/Leaderboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [heroes, setHeroes] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await await api.get('/api/leaderboard');
      setHeroes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to assign badges based on score
  const getBadge = (score) => {
    if (score > 500) return { rank: "🛡️ Guardian", color: "bg-purple-100 text-purple-700" };
    if (score > 200) return { rank: "🌲 Ranger", color: "bg-green-100 text-green-700" };
    return { rank: "🌱 Scout", color: "bg-blue-100 text-blue-700" };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">🏆 City Heroes</h1>
          <p className="text-gray-500">
            Top citizens making a real impact. Report waste, earn points, and climb the ranks!
          </p>
        </div>

        {/* --- POINTS EXPLANATION CARD --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row justify-around items-center text-center gap-4">
          <div>
            <span className="block text-3xl font-bold text-blue-600 mb-1">+10 Pts</span>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Per Report</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-200"></div>
          <div>
            <span className="block text-3xl font-bold text-green-600 mb-1">+50 Pts</span>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Verified Clean</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-200"></div>
          <div>
            <span className="block text-3xl font-bold text-purple-600 mb-1">Rank Up</span>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Unlock Badges</span>
          </div>
        </div>

        {/* --- THE LEADERBOARD --- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-green-600 p-4 text-white font-bold grid grid-cols-12 gap-4 uppercase text-xs tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Citizen Name</div>
            <div className="col-span-3 text-center">Reports</div>
            <div className="col-span-3 text-right">Total Score</div>
          </div>

          {heroes.map((hero, index) => {
            const badge = getBadge(hero.score);
            const isTop3 = index < 3;
            
            return (
              <div 
                key={hero._id} 
                className={`grid grid-cols-12 gap-4 p-5 items-center border-b border-gray-50 hover:bg-green-50 transition ${isTop3 ? 'bg-yellow-50/30' : ''}`}
              >
                {/* Rank Number */}
                <div className="col-span-1 text-center font-bold text-gray-500">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </div>

                {/* Name & Badge */}
                <div className="col-span-5">
                  <p className="font-bold text-gray-800 text-lg">{hero._id}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide ${badge.color}`}>
                    {badge.rank}
                  </span>
                </div>

                {/* Stats */}
                <div className="col-span-3 text-center text-gray-500 text-sm">
                  <span className="font-bold text-gray-800">{hero.totalReports}</span> Reports
                  <br/>
                  <span className="text-green-600 text-xs">({hero.resolvedReports} Solved)</span>
                </div>

                {/* Score */}
                <div className="col-span-3 text-right">
                  <span className="text-xl font-black text-green-700">{hero.score}</span>
                  <span className="text-xs text-gray-400 ml-1">pts</span>
                </div>
              </div>
            );
          })}

          {heroes.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No heroes yet. Be the first to report!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Leaderboard;