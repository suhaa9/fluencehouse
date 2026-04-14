import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MyCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await axios.get(`${API}/campaigns/my`, { withCredentials: true });
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="campaigns-title">My Campaigns</h1>
            <p className="text-slate-600">Manage your campaigns and review applications</p>
          </div>
          <Link to="/dashboard">
            <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid="create-new-campaign">
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Create Campaign
            </Button>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100" data-testid="no-campaigns">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h2>
            <p className="text-slate-600 mb-6">Create your first campaign to get started</p>
            <Link to="/dashboard">
              <button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full px-8 py-3 font-medium transition-all" data-testid="create-first-campaign-btn">
                Create Campaign
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <Link key={campaign.campaign_id} to={`/my-campaigns/${campaign.campaign_id}/applications`}>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-violet-300 transition-all" data-testid={`campaign-${campaign.campaign_id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>{campaign.title}</h3>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{campaign.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Budget</div>
                      <div className="font-semibold text-slate-900">₹{campaign.budget?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Applications</div>
                      <div className="font-semibold text-slate-900">{campaign.applications_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Approved</div>
                      <div className="font-semibold text-green-600">{campaign.approved_count || 0}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-slate-500 mb-1">Niche</div>
                    <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                      {campaign.niche}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;