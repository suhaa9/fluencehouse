import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Briefcase, FileText, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const BrandDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    requirements: '',
    niche: '',
    deadline: ''
  });

  const fetchData = async () => {
    try {
      const [statsRes, campaignsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/campaigns/my')
      ]);
      setStats(statsRes.data);
      setCampaigns(campaignsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', {
        ...formData,
        budget: parseFloat(formData.budget)
      });
      toast.success('Campaign created successfully!');
      setDialogOpen(false);
      setFormData({ title: '', description: '', budget: '', requirements: '', niche: '', deadline: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create campaign');
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="dashboard-title">Welcome back, {user?.name}!</h1>
            <p className="text-slate-600">Manage your campaigns and collaborations</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid="create-campaign-btn">
                <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Campaign Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Summer Fashion Campaign"
                    required
                    data-testid="campaign-title-input"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your campaign..."
                    required
                    rows={3}
                    data-testid="campaign-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget (₹)</Label>
                    <Input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      placeholder="50000"
                      required
                      data-testid="campaign-budget-input"
                    />
                  </div>
                  <div>
                    <Label>Niche</Label>
                    <Input
                      value={formData.niche}
                      onChange={(e) => setFormData({...formData, niche: e.target.value})}
                      placeholder="Fashion, Tech, Lifestyle"
                      required
                      data-testid="campaign-niche-input"
                    />
                  </div>
                </div>
                <div>
                  <Label>Requirements</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    placeholder="Minimum 10k followers, Instagram focused..."
                    required
                    rows={2}
                    data-testid="campaign-requirements-input"
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    required
                    data-testid="campaign-deadline-input"
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid="submit-campaign-btn">
                  Create Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid - Control Room Style */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-6" data-testid="stat-campaigns">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-6 h-6 text-indigo-950" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.total_campaigns || 0}</div>
            <div className="text-sm text-slate-600">Total Campaigns</div>
          </div>

          <div className="bg-white border border-slate-200 p-6" data-testid="stat-applications">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-6 h-6 text-violet-600" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.total_applications || 0}</div>
            <div className="text-sm text-slate-600">Applications Received</div>
          </div>

          <div className="bg-white border border-slate-200 p-6" data-testid="stat-active">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.active_collaborations || 0}</div>
            <div className="text-sm text-slate-600">Active</div>
          </div>

          <div className="bg-white border border-slate-200 p-6" data-testid="stat-spent">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-6 h-6 text-indigo-950" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats?.total_spent?.toLocaleString() || 0}</div>
            <div className="text-sm text-slate-600">Total Spent</div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900" style={{fontFamily: 'Outfit, sans-serif'}}>Your Campaigns</h2>
            <Link to="/my-campaigns">
              <Button variant="ghost" className="text-violet-600 hover:text-violet-700" data-testid="view-all-campaigns">View All</Button>
            </Link>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="text-center py-12" data-testid="no-campaigns">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-600 mb-4">No campaigns yet</p>
              <Button onClick={() => setDialogOpen(true)} className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid="create-first-campaign">
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Link key={campaign.campaign_id} to={`/my-campaigns/${campaign.campaign_id}/applications`}>
                  <div className="border border-slate-200 p-4 hover:border-violet-300 transition-colors" data-testid={`campaign-${campaign.campaign_id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{campaign.title}</h3>
                        <p className="text-sm text-slate-600 mb-2 line-clamp-1">{campaign.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>Budget: ₹{campaign.budget?.toLocaleString()}</span>
                          <span>•</span>
                          <span>{campaign.niche}</span>
                          <span>•</span>
                          <span>{campaign.applications_count || 0} applications</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;