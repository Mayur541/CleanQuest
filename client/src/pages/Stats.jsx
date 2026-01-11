// FILE: client/src/pages/Stats.jsx
import { useEffect, useState } from 'react';
import { api } from '../api';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

const Stats = () => {
  const [counts, setCounts] = useState({ totalReports: 0, resolvedReports: 0, totalUsers: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching for speed
        const [statsRes, leaderRes] = await Promise.all([
          api.get('/api/stats'),
          api.get('/api/leaderboard')
        ]);
        
        setCounts(statsRes.data);
        setLeaderboard(leaderRes.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare Data for Pie Chart
  const pieData = [
    { name: 'Resolved', value: counts.resolvedReports },
    { name: 'Pending', value: counts.totalReports - counts.resolvedReports },
  ];
  const COLORS = ['#10B981', '#F59E0B']; // Green for Resolved, Yellow for Pending

  // Prepare Data for Bar Chart (Top 5 Heroes)
  const barData = leaderboard.slice(0, 5).map(user => ({
    name: user._id, // User Name
    reports: user.totalReports
  }));

  if (loading) return <div className="text-center p-20 text-xl">Loading Charts... 📊</div>;

  return (
   <div className="min-h-screen bg-transparent p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">CleanQuest Analytics 📈</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Visualizing our community impact.</p>
        </div>

        {/* --- KPI CARDS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Reports</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2">{counts.totalReports}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Resolved Issues</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2">{counts.resolvedReports}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Active Citizens</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2">{counts.totalUsers}</p>
          </div>
        </div>

        {/* --- CHARTS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. PIE CHART: Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 text-center">Resolution Status</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. BAR CHART: Top Contributors */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 text-center">Top 5 Contributors</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#333', color: '#fff' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="reports" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Stats;