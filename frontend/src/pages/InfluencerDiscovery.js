import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Search, Users, Instagram, Youtube, Twitter, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const NICHES = ['All', 'Fashion', 'Tech', 'Lifestyle', 'Food', 'Travel', 'Fitness', 'Beauty', 'Gaming', 'Music', 'Education'];

const InfluencerDiscovery = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [nicheFilter, setNicheFilter] = useState('All');
  const [sortBy, setSortBy] = useState('followers');

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const params = {};
        if (nicheFilter && nicheFilter !== 'All') params.niche = nicheFilter;
        const { data } = await api.get('/influencers', { params });
        setInfluencers(data);
      } catch (error) {
        console.error('Error fetching influencers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, [nicheFilter]);

  const filtered = influencers
    .filter(inf =>
      inf.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'followers') return (b.followers || 0) - (a.followers || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="discovery-title">
            Discover Influencers
          </h1>
          <p className="text-slate-600">Find the perfect creator for your next campaign</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, niche, or bio..."
              className="pl-12 h-12 rounded-full border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              data-testid="search-influencers-input"
            />
          </div>

          <Select value={nicheFilter} onValueChange={setNicheFilter}>
            <SelectTrigger className="w-full sm:w-44 h-12 rounded-full" data-testid="niche-filter">
              <SelectValue placeholder="Niche" />
            </SelectTrigger>
            <SelectContent>
              {NICHES.map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44 h-12 rounded-full" data-testid="sort-filter">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="followers">Most Followers</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100" data-testid="no-influencers">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No influencers found</h2>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((inf) => (
              <Link key={inf.user_id} to={`/influencers/${inf.user_id}`}>
                <div
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-violet-300 transition-all h-full flex flex-col"
                  data-testid={`influencer-card-${inf.user_id}`}
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-950 to-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl font-bold">{inf.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>{inf.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{inf.email}</p>
                    </div>
                  </div>

                  {/* Niche + Followers */}
                  <div className="flex items-center gap-3 mb-4">
                    {inf.niche && (
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 rounded-full text-xs font-medium">{inf.niche}</Badge>
                    )}
                    <span className="text-sm font-semibold text-slate-900">{formatFollowers(inf.followers)} followers</span>
                  </div>

                  {/* Bio */}
                  {inf.bio && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{inf.bio}</p>
                  )}
                  {!inf.bio && <div className="flex-1" />}

                  {/* Social Links */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                    {inf.instagram && (
                      <span className="inline-flex items-center text-xs px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full">
                        <Instagram className="w-3 h-3 mr-1" strokeWidth={1.5} /> Instagram
                      </span>
                    )}
                    {inf.youtube && (
                      <span className="inline-flex items-center text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
                        <Youtube className="w-3 h-3 mr-1" strokeWidth={1.5} /> YouTube
                      </span>
                    )}
                    {inf.twitter && (
                      <span className="inline-flex items-center text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                        <Twitter className="w-3 h-3 mr-1" strokeWidth={1.5} /> Twitter
                      </span>
                    )}
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

export default InfluencerDiscovery;
