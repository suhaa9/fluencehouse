import { Link } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8" data-testid="hero-badge">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              <span>The Future of Influencer Marketing</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-black text-slate-900 mb-6" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="hero-title">
              Connect Brands with
              <span className="block mt-2 bg-gradient-to-r from-indigo-950 via-violet-600 to-indigo-950 bg-clip-text text-transparent">
                Authentic Influencers
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto" data-testid="hero-description">
              Fluence House is the premium marketplace where brands discover credible influencers and creators find meaningful collaborations. Streamlined. Transparent. Profitable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full px-8 py-6 text-lg font-medium transition-all shadow-sm hover:shadow-md" data-testid="hero-cta-primary">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-full px-8 py-6 text-lg font-medium transition-all" data-testid="hero-cta-secondary">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>Why Choose Fluence House?</h2>
            <p className="text-base text-slate-600">A trust-based ecosystem built for modern influencer marketing</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-md transition-shadow" data-testid="feature-card-influencers">
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-violet-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{fontFamily: 'Outfit, sans-serif'}}>For Influencers</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">Showcase your audience, apply to premium campaigns, track earnings, and build your creator portfolio in one place.</p>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Profile & Portfolio Management
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Campaign Discovery
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Earnings Tracking
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-md transition-shadow" data-testid="feature-card-brands">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-indigo-950" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{fontFamily: 'Outfit, sans-serif'}}>For Brands</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">Post campaigns, discover authentic creators, review applications, and manage collaborations with full transparency.</p>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Campaign Management
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Influencer Discovery
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Payout Processing
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-md transition-shadow" data-testid="feature-card-transparency">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-green-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{fontFamily: 'Outfit, sans-serif'}}>Full Transparency</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">Every collaboration is tracked, every payment is secure, and every metric is visible for complete peace of mind.</p>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Secure Payments
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Performance Tracking
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  Collaboration History
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold text-slate-900 mb-6" style={{fontFamily: 'Outfit, sans-serif'}}>Ready to Transform Your Marketing?</h2>
          <p className="text-base text-slate-600 mb-10">Join hundreds of brands and influencers building authentic partnerships</p>
          <Link to="/register">
            <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full px-8 py-6 text-lg font-medium transition-all shadow-sm hover:shadow-md" data-testid="cta-bottom">
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">© 2026 Fluence House. Building the future of influencer marketing.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;