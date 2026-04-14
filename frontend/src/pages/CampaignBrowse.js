import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Search, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CampaignBrowse = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await axios.get(`${API}/campaigns`, { withCredentials: true });
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="browse-title">Browse Campaigns</h1>
          <p className="text-slate-600">Find the perfect collaboration opportunity</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns by title, niche, or brand..."
              className="pl-12 h-14 rounded-full border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              data-testid="search-input"
            />
          </div>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-20" data-testid="no-campaigns">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No campaigns found</h2>
            <p className="text-slate-600">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Link key={campaign.campaign_id} to={`/campaigns/${campaign.campaign_id}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-violet-300 transition-all h-full" data-testid={`campaign-${campaign.campaign_id}`}>
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2" style={{fontFamily: 'Outfit, sans-serif'}}>{campaign.title}</h3>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium ml-2 flex-shrink-0">
                        {campaign.niche}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{campaign.brand_name}</p>
                    <p className="text-sm text-slate-600 line-clamp-3">{campaign.description}</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <div className="flex items-center text-sm text-slate-600">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" strokeWidth={1.5} />
                      Budget: ₹{campaign.budget?.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" strokeWidth={1.5} />
                      Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid={`view-campaign-${campaign.campaign_id}`}>
                    View Details
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignBrowse;