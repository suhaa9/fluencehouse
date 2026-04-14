import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, DollarSign, Briefcase, ArrowLeft } from 'lucide-react';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data } = await api.get(`/campaigns/${id}`);
        setCampaign(data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error('Campaign not found');
        navigate('/campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id, navigate]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await api.post('/applications', {
        campaign_id: id,
        proposal
      });
      toast.success('Application submitted successfully!');
      navigate('/my-applications');
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail || 'Failed to submit application');
    } finally {
      setApplying(false);
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
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          onClick={() => navigate('/campaigns')}
          variant="ghost"
          className="mb-6 rounded-full"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Back to Campaigns
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="campaign-title">{campaign?.title}</h1>
                <p className="text-lg text-slate-600">{campaign?.brand_name}</p>
              </div>
              <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                {campaign?.niche}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3 bg-slate-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Budget</div>
                  <div className="font-semibold text-slate-900">₹{campaign?.budget?.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Deadline</div>
                  <div className="font-semibold text-slate-900">{new Date(campaign?.deadline).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="font-semibold text-slate-900 capitalize">{campaign?.status}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-3" style={{fontFamily: 'Outfit, sans-serif'}}>Description</h2>
            <p className="text-slate-600 leading-relaxed">{campaign?.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3" style={{fontFamily: 'Outfit, sans-serif'}}>Requirements</h2>
            <p className="text-slate-600 leading-relaxed">{campaign?.requirements}</p>
          </div>

          {!showApplyForm ? (
            <Button
              onClick={() => setShowApplyForm(true)}
              className="w-full bg-indigo-950 text-white hover:bg-indigo-900 rounded-full py-6 text-lg"
              data-testid="apply-button"
            >
              Apply to This Campaign
            </Button>
          ) : (
            <form onSubmit={handleApply} className="space-y-4 pt-6 border-t border-slate-200">
              <div>
                <Label htmlFor="proposal" className="text-sm font-medium text-slate-700">Your Proposal</Label>
                <Textarea
                  id="proposal"
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Explain why you're a great fit for this campaign..."
                  required
                  rows={6}
                  className="mt-1.5 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  data-testid="proposal-input"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  variant="outline"
                  className="flex-1 rounded-full border-2"
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-indigo-950 text-white hover:bg-indigo-900 rounded-full"
                  data-testid="submit-application-button"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;