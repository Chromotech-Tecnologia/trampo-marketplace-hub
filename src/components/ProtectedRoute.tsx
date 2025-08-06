import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'client' | 'provider' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  userType 
}) => {
  // Add error boundary for auth context
  let user = null;
  let authLoading = true;
  
  try {
    const auth = useAuth();
    user = auth.user;
    authLoading = auth.loading;
  } catch (error) {
    console.error('Auth context not available in ProtectedRoute:', error);
    authLoading = false;
  }

  // Get user profile to check actual user type
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Check user type from profile table
  if (userType && user && profile) {
    const actualUserType = profile.user_type;
    console.log('ProtectedRoute - Expected:', userType, 'Actual:', actualUserType);
    
    if (actualUserType !== userType) {
      // Redirect based on actual user type
      if (actualUserType === 'client') {
        return <Navigate to="/cliente" replace />;
      } else if (actualUserType === 'provider') {
        return <Navigate to="/fornecedor" replace />;
      } else if (actualUserType === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;