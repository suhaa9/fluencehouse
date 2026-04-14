import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        toast.error('Invalid session');
        navigate('/login');
        return;
      }

      try {
        const { data } = await api.post('/auth/google-session', { session_id: sessionId });
        
        setUser(data);
        toast.success('Welcome to Fluence House!');
        navigate('/dashboard', { state: { user: data }, replace: true });
      } catch (error) {
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    processSession();
  }, [location, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;