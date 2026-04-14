import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Instagram, Youtube, Twitter, ExternalLink, Briefcase, Star } from 'lucide-react';

const InfluencerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        const { data } = await api.get(`/influencers/${id}`);
        setInfluencer(data);
      } catch (error) {
        console.error('Error fetching influencer:', error);
        navigate('/influencers');
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencer();
  }, [id, navigate]);

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
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

  if (!influencer) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button onClick={() => navigate('/influencers')} variant="ghost" className="mb-6 rounded-full" data-testid="back-button">
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Back to Discovery
        </Button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 pb-6 border-b border-slate-200">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-950 to-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-4xl font-bold">{influencer.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="influencer-name">
                {influencer.name}
              </h1>
              <p className="text-slate-600 mb-3">{influencer.email}</p>
              <div className="flex flex-wrap items-center gap-3">
                {influencer.niche && (
                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 rounded-full">{influencer.niche}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatFollowers(influencer.followers)}</div>
              <div className="text-xs text-slate-500">Followers</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Briefcase className="w-5 h-5 text-green-600" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{influencer.collaborations_count || 0}</div>
              <div className="text-xs text-slate-500">Collaborations</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold text-slate-900">-</div>
              <div className="text-xs text-slate-500">Rating</div>
            </div>
          </div>

          {/* Bio */}
          {influencer.bio && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>About</h2>
              <p className="text-slate-600 leading-relaxed">{influencer.bio}</p>
            </div>
          )}

          {/* Social Links */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Social Profiles</h2>
            <div className="flex flex-wrap gap-3">
              {influencer.instagram && (
                <a href={influencer.instagram} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 rounded-full hover:shadow-sm transition-all text-sm font-medium"
                  data-testid="social-instagram"
                >
                  <Instagram className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Instagram
                  <ExternalLink className="w-3 h-3 ml-2" strokeWidth={1.5} />
                </a>
              )}
              {influencer.youtube && (
                <a href={influencer.youtube} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-full hover:shadow-sm transition-all text-sm font-medium"
                  data-testid="social-youtube"
                >
                  <Youtube className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  YouTube
                  <ExternalLink className="w-3 h-3 ml-2" strokeWidth={1.5} />
                </a>
              )}
              {influencer.twitter && (
                <a href={influencer.twitter} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:shadow-sm transition-all text-sm font-medium"
                  data-testid="social-twitter"
                >
                  <Twitter className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Twitter / X
                  <ExternalLink className="w-3 h-3 ml-2" strokeWidth={1.5} />
                </a>
              )}
              {!influencer.instagram && !influencer.youtube && !influencer.twitter && (
                <p className="text-sm text-slate-500">No social profiles linked yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerDetail;
