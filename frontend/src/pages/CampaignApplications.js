import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, User, CheckCircle, XCircle } from 'lucide-react';

const CampaignApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [campaignRes, appsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/campaigns/${id}/applications`)
      ]);
      setCampaign(campaignRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAction = async (applicationId, action) => {
    try {
      await api.patch(`/applications/${applicationId}`, { action });
      toast.success(`Application ${action}d successfully!`);
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${action} application`);
    }
  };

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
        <Button
          onClick={() => navigate('/my-campaigns')}
          variant="ghost"
          className="mb-6 rounded-full"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Back to My Campaigns
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="campaign-title">{campaign?.title}</h1>
          <p className="text-slate-600">Review and manage applications for this campaign</p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100" data-testid="no-applications">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h2>
            <p className="text-slate-600">Influencers will start applying soon</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.application_id} className="bg-white border border-slate-200 p-6" data-testid={`application-${app.application_id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-950 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{app.influencer?.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{app.influencer?.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <span>{app.influencer?.followers?.toLocaleString()} followers</span>
                        {app.influencer?.niche && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                              {app.influencer?.niche}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                <div className="mb-4 pb-4 border-b border-slate-200">
                  <div className="text-sm font-medium text-slate-700 mb-2">Proposal:</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{app.proposal}</p>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-slate-700 mb-2">Social Media:</div>
                  <div className="flex flex-wrap gap-2">
                    {app.influencer?.instagram && (
                      <a href={app.influencer.instagram} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                        Instagram
                      </a>
                    )}
                    {app.influencer?.youtube && (
                      <a href={app.influencer.youtube} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                        YouTube
                      </a>
                    )}
                    {app.influencer?.twitter && (
                      <a href={app.influencer.twitter} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                        Twitter
                      </a>
                    )}
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAction(app.application_id, 'approve')}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700 rounded-full"
                      data-testid={`approve-${app.application_id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(app.application_id, 'reject')}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-full"
                      data-testid={`reject-${app.application_id}`}
                    >
                      <XCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignApplications;