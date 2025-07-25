import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Check user type from user metadata instead of profile table
  if (userType && user) {
    const userMetaType = user.user_metadata?.user_type;
    if (userMetaType !== userType) {
      // Redirect based on user type
      if (userMetaType === 'client') {
        return <Navigate to="/cliente" replace />;
      } else if (userMetaType === 'provider') {
        return <Navigate to="/fornecedor" replace />;
      } else if (userMetaType === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;