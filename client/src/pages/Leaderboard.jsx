import { useEffect, useState } from 'react';
import { api } from '../api'; 

function Leaderboard() {
  const [heroes, setHeroes] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/leaderboard');
      setHeroes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to assign badges
  const getBadge = (score) => {
    if (score > 500) return { rank: "🛡️ Guardian", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" };
    if (score > 200) return { rank: "🌲 Ranger", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
    return { rank: "🌱 Scout", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
  };

  return (
    // DARK MODE: Main Wrapper
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">🏆 City Heroes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Top citizens making a real impact. Report waste, earn points, and climb the ranks!
          </p>
        </div>

        {/* --- POINTS EXPLANATION CARD --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10 flex flex-col md:flex-row justify-around items-center text-center gap-6 md:gap-4 transition-colors duration-300">
          <div>
            <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">+10 Pts</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Per Report</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <span className="block text-3xl font-bold text-green-600 dark:text-green-400 mb-1">+50 Pts</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Verified Clean</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <span className="block text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">Rank Up</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Unlock Badges</span>
          </div>
        </div>

        {/* --- THE LEADERBOARD TABLE --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              
              {/* Table Header */}
              <div className="bg-green-600 dark:bg-green-700 p-4 text-white font-bold grid grid-cols-12 gap-4 uppercase text-xs tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Citizen Name</div>
                <div className="col-span-3 text-center">Reports</div>
                <div className="col-span-3 text-right">Total Score</div>
              </div>

              {/* Table Rows */}
              {heroes.map((hero, index) => {
                const badge = getBadge(hero.score);
                const isTop3 = index < 3;
                
                return (
                  <div 
                    key={hero._id} 
                    className={`grid grid-cols-12 gap-4 p-5 items-center border-b border-gray-50 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition ${isTop3 ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}
                  >
                    {/* Rank Number */}
                    <div className="col-span-1 text-center font-bold text-gray-500 dark:text-gray-400">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </div>

                    {/* Name & Badge */}
                    <div className="col-span-5">
                      <p className="font-bold text-gray-800 dark:text-white text-lg truncate">{hero._id}</p>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide ${badge.color}`}>
                        {badge.rank}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                      <span className="font-bold text-gray-800 dark:text-white">{hero.totalReports}</span> Reports
                      <br/>
                      <span className="text-green-600 dark:text-green-400 text-xs">({hero.resolvedReports} Solved)</span>
                    </div>

                    {/* Score */}
                    <div className="col-span-3 text-right">
                      <span className="text-xl font-black text-green-700 dark:text-green-400">{hero.score}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">pts</span>
                    </div>
                  </div>
                );
              })}

              {heroes.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No heroes yet. Be the first to report!
                </div>
              )}
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Leaderboard;