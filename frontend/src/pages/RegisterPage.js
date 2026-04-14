import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Chrome, Users, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('influencer');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(email, password, name, role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : 
                     Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : 
                     'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}} data-testid="register-title">Create Account</h1>
              <p className="text-sm text-slate-600">Join Fluence House today</p>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full py-6 mb-6 transition-all"
              data-testid="google-signup-button"
            >
              <Chrome className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-slate-500">Or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  data-testid="name-input"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  data-testid="email-input"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1.5 h-12 rounded-lg border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  data-testid="password-input"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">I am a</Label>
                <RadioGroup value={role} onValueChange={setRole} className="space-y-3">
                  <div className="flex items-center space-x-3 border-2 border-slate-200 rounded-lg p-4 cursor-pointer hover:border-violet-500 transition-colors" data-testid="role-influencer">
                    <RadioGroupItem value="influencer" id="influencer" />
                    <Label htmlFor="influencer" className="flex items-center cursor-pointer flex-1">
                      <Users className="w-5 h-5 text-violet-600 mr-3" strokeWidth={1.5} />
                      <div>
                        <div className="font-medium text-slate-900">Influencer</div>
                        <div className="text-xs text-slate-500">Showcase skills and get hired</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 border-2 border-slate-200 rounded-lg p-4 cursor-pointer hover:border-violet-500 transition-colors" data-testid="role-brand">
                    <RadioGroupItem value="brand" id="brand" />
                    <Label htmlFor="brand" className="flex items-center cursor-pointer flex-1">
                      <Briefcase className="w-5 h-5 text-indigo-950 mr-3" strokeWidth={1.5} />
                      <div>
                        <div className="font-medium text-slate-900">Brand</div>
                        <div className="text-xs text-slate-500">Find and hire influencers</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-950 text-white hover:bg-indigo-900 rounded-full py-6 font-medium transition-all shadow-sm hover:shadow-md"
                data-testid="register-submit-button"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-600 hover:text-violet-700 font-medium" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;