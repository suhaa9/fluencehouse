import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Header from '@/components/Header';
import { Briefcase, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          axios.get(`${API}/dashboard/stats`, { withCredentials: true }),
          axios.get(`${API}/applications/my`, { withCredentials: true })
        ]);
        setStats(statsRes.data);
        setApplications(appsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="dashboard-title">Welcome back, {user?.name}!</h1>
          <p className="text-slate-600">Here's your influencer overview</p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow" data-testid="stat-applications">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-violet-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.total_applications || 0}</div>
            <div className="text-sm text-slate-600">Total Applications</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow" data-testid="stat-collaborations">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.approved_collaborations || 0}</div>
            <div className="text-sm text-slate-600">Collaborations</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow" data-testid="stat-earnings">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-indigo-950" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats?.total_earnings?.toLocaleString() || 0}</div>
            <div className="text-sm text-slate-600">Total Earnings</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow" data-testid="stat-pending">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats?.pending_earnings?.toLocaleString() || 0}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-950 to-violet-600 rounded-2xl p-8 mb-8 text-white" data-testid="quick-actions">
          <h2 className="text-xl font-bold mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/campaigns">
              <Button className="bg-white text-indigo-950 hover:bg-slate-100 rounded-full" data-testid="browse-campaigns-btn">
                <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Browse Campaigns
              </Button>
            </Link>
            <Link to="/profile">
              <Button className="bg-white/20 text-white hover:bg-white/30 rounded-full border border-white/30" data-testid="update-profile-btn">
                Update Profile
              </Button>
            </Link>
            <Link to="/my-applications">
              <Button className="bg-white/20 text-white hover:bg-white/30 rounded-full border border-white/30" data-testid="view-applications-btn">
                View Applications
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900" style={{fontFamily: 'Outfit, sans-serif'}}>Recent Applications</h2>
            <Link to="/my-applications">
              <Button variant="ghost" className="text-violet-600 hover:text-violet-700" data-testid="view-all-applications">View All</Button>
            </Link>
          </div>
          
          {applications.length === 0 ? (
            <div className="text-center py-12" data-testid="no-applications">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-600 mb-4">No applications yet</p>
              <Link to="/campaigns">
                <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid="browse-campaigns-empty">Browse Campaigns</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.application_id} className="border border-slate-200 rounded-lg p-4 hover:border-violet-300 transition-colors" data-testid={`application-${app.application_id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{app.campaign?.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{app.campaign?.brand_name}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
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

export default InfluencerDashboard;