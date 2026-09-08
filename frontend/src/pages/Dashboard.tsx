import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Receipt, History, ArrowRight, ArrowLeft } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchAnalytics();
  }, [user, navigate, token]);

  if (!user) return null;

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans">
      <header className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-text-secondary">Insights into your splitting history</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-brand-primary text-white px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
        >
          Split a New Bill
        </button>
      </header>
      
      {!data ? (
        <div className="glass-panel p-12 text-center animate-pulse">Loading analytics...</div>
      ) : data.total_spent === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <Receipt size={48} className="text-text-secondary/50 mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No data yet</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            You haven't split any bills yet. Click the button above to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Total Spent Summary */}
          <div className="glass-panel p-6 md:col-span-2 flex flex-col items-center justify-center bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Total Split History</h2>
            <div className="text-4xl md:text-5xl font-black text-brand-primary">
              ₹{data.total_spent.toFixed(2)}
            </div>
          </div>

          {/* Spend by Category (Bar Chart) */}
          <div className="glass-panel p-6 min-h-[300px]">
            <h2 className="text-lg font-bold mb-6">Spend by Category</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_category} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Total']} 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-panel)' }}
                  />
                  <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spend by Person (Pie Chart) */}
          <div className="glass-panel p-6 min-h-[300px]">
            <h2 className="text-lg font-bold mb-6">Who You Spend With</h2>
            <div className="w-full h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.by_person}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="person_name"
                  >
                    {data.by_person.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Total']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-panel)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
