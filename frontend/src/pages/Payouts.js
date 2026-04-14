import { useState, useEffect } from 'react';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DollarSign, Plus } from 'lucide-react';

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  const [amount, setAmount] = useState('');

  const fetchData = async () => {
    try {
      const [payoutsRes, campaignsRes] = await Promise.all([
        api.get('/payouts/my'),
        api.get('/campaigns/my')
      ]);
      setPayouts(payoutsRes.data);
      
      const allApps = [];
      for (const campaign of campaignsRes.data) {
        const appsRes = await api.get(`/campaigns/${campaign.campaign_id}/applications`);
        const approvedApps = appsRes.data.filter(app => app.status === 'approved');
        allApps.push(...approvedApps.map(app => ({ ...app, campaign })));
      }
      setApplications(allApps);
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
      await api.post('/payouts', {
        application_id: selectedApp,
        amount: parseFloat(amount)
      });
      toast.success('Payout created successfully!');
      setDialogOpen(false);
      setSelectedApp('');
      setAmount('');
      fetchData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail || 'Failed to create payout');
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="payouts-title">Payouts</h1>
            <p className="text-slate-600">Manage payments to influencers</p>
          </div>
          
          {applications.length > 0 && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid="create-payout-btn">
                  <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Create Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Payout</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label>Select Approved Application</Label>
                    <Select value={selectedApp} onValueChange={setSelectedApp} required>
                      <SelectTrigger data-testid="application-select">
                        <SelectValue placeholder="Choose an application" />
                      </SelectTrigger>
                      <SelectContent>
                        {applications.map((app) => (
                          <SelectItem key={app.application_id} value={app.application_id}>
                            {app.campaign?.title} - {app.influencer?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10000"
                      required
                      data-testid="amount-input"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-950 text-white hover:bg-indigo-900 rounded-full" data-testid="submit-payout-btn">
                    Create Payout
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6" style={{fontFamily: 'Outfit, sans-serif'}}>Payout History</h2>
          
          {payouts.length === 0 ? (
            <div className="text-center py-12" data-testid="no-payouts">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-600">No payouts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div key={payout.payout_id} className="border border-slate-200 p-4 flex items-center justify-between" data-testid={`payout-${payout.payout_id}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{payout.campaign?.title}</h3>
                    <p className="text-sm text-slate-600">To: Influencer</p>
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

export default Payouts;