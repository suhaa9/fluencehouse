import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { FileText, Briefcase } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get('/applications/my');
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="applications-title">My Applications</h1>
          <p className="text-slate-600">Track the status of your campaign applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100" data-testid="no-applications">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h2>
            <p className="text-slate-600 mb-6">Start applying to campaigns to see them here</p>
            <Link to="/campaigns">
              <button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full px-8 py-3 font-medium transition-all" data-testid="browse-campaigns-btn">
                Browse Campaigns
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.application_id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" data-testid={`application-${app.application_id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1" style={{fontFamily: 'Outfit, sans-serif'}}>{app.campaign?.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{app.campaign?.brand_name}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500">Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-slate-500 mb-1">Budget</div>
                    <div className="text-lg font-bold text-slate-900">₹{app.campaign?.budget?.toLocaleString()}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="text-sm font-medium text-slate-700 mb-2">Your Proposal:</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{app.proposal}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;