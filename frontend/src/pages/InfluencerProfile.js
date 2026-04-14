import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User, Instagram, Youtube, Twitter } from 'lucide-react';

const InfluencerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    bio: '',
    followers: 0,
    niche: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    twitter: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/influencer/profile');
        setProfile({
          bio: data.bio || '',
          followers: data.followers || 0,
          niche: data.niche || '',
          instagram: data.instagram || '',
          youtube: data.youtube || '',
          tiktok: data.tiktok || '',
          twitter: data.twitter || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/influencer/profile', profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="profile-title">Your Profile</h1>
          <p className="text-slate-600">Manage your influencer profile and showcase your work</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-950 to-violet-600 rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-sm text-slate-600">{user?.email}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium text-slate-700">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell us about yourself and your content..."
                rows={4}
                className="mt-1.5 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                data-testid="bio-input"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="followers" className="text-sm font-medium text-slate-700">Total Followers</Label>
                <Input
                  id="followers"
                  type="number"
                  value={profile.followers}
                  onChange={(e) => setProfile({...profile, followers: parseInt(e.target.value) || 0})}
                  placeholder="10000"
                  className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  data-testid="followers-input"
                />
              </div>

              <div>
                <Label htmlFor="niche" className="text-sm font-medium text-slate-700">Niche</Label>
                <Input
                  id="niche"
                  value={profile.niche}
                  onChange={(e) => setProfile({...profile, niche: e.target.value})}
                  placeholder="Fashion, Tech, Lifestyle"
                  className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  data-testid="niche-input"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>Social Media Links</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="instagram" className="text-sm font-medium text-slate-700 flex items-center">
                    <Instagram className="w-4 h-4 mr-2 text-pink-600" strokeWidth={1.5} />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                    placeholder="https://instagram.com/username"
                    className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    data-testid="instagram-input"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube" className="text-sm font-medium text-slate-700 flex items-center">
                    <Youtube className="w-4 h-4 mr-2 text-red-600" strokeWidth={1.5} />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={profile.youtube}
                    onChange={(e) => setProfile({...profile, youtube: e.target.value})}
                    placeholder="https://youtube.com/@username"
                    className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    data-testid="youtube-input"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter" className="text-sm font-medium text-slate-700 flex items-center">
                    <Twitter className="w-4 h-4 mr-2 text-blue-600" strokeWidth={1.5} />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                    placeholder="https://twitter.com/username"
                    className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    data-testid="twitter-input"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full px-8"
                data-testid="save-profile-btn"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;