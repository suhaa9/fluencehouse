import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AuthCallback from '@/pages/AuthCallback';
import InfluencerDashboard from '@/pages/InfluencerDashboard';
import BrandDashboard from '@/pages/BrandDashboard';
import InfluencerProfile from '@/pages/InfluencerProfile';
import CampaignBrowse from '@/pages/CampaignBrowse';
import CampaignDetail from '@/pages/CampaignDetail';
import MyApplications from '@/pages/MyApplications';
import MyCampaigns from '@/pages/MyCampaigns';
import CampaignApplications from '@/pages/CampaignApplications';
import Earnings from '@/pages/Earnings';
import Payouts from '@/pages/Payouts';
import ProtectedRoute from '@/components/ProtectedRoute';

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><InfluencerProfile /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute><CampaignBrowse /></ProtectedRoute>} />
      <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
      <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
      <Route path="/my-campaigns" element={<ProtectedRoute><MyCampaigns /></ProtectedRoute>} />
      <Route path="/my-campaigns/:id/applications" element={<ProtectedRoute><CampaignApplications /></ProtectedRoute>} />
      <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
      <Route path="/payouts" element={<ProtectedRoute><Payouts /></ProtectedRoute>} />
    </Routes>
  );
}

function DashboardRouter() {
  const { user } = require('@/context/AuthContext').useAuth();
  
  if (!user) return null;
  
  return user.role === 'influencer' ? <InfluencerDashboard /> : <BrandDashboard />;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}

export default App;