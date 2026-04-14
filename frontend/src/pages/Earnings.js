import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Earnings = () => {
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const { data } = await axios.get(`${API}/payouts/my`, { withCredentials: true });
        setPayouts(data);
        
        const total = data.reduce((sum, p) => sum + p.amount, 0);
        const pending = data.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
        const completed = data.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
        
        setStats({ total, pending, completed });
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-950 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="earnings-title">My Earnings</h1>
          <p className="text-slate-600">Track your earnings from collaborations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" data-testid="total-earnings">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-indigo-950" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats.total.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Earnings</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" data-testid="pending-earnings">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats.pending.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" data-testid="completed-earnings">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats.completed.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6" style={{fontFamily: 'Outfit, sans-serif'}}>Transaction History</h2>
          
          {payouts.length === 0 ? (
            <div className="text-center py-12" data-testid="no-earnings">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-600">No earnings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div key={payout.payout_id} className="border border-slate-200 p-4 flex items-center justify-between" data-testid={`payout-${payout.payout_id}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{payout.campaign?.title}</h3>
                    <p className="text-sm text-slate-600">{payout.campaign?.brand_name}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(payout.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900 mb-1">₹{payout.amount.toLocaleString()}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payout.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;