import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cozy-cream flex flex-col items-center justify-center text-cozy-charcoal">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-cozy-sage" size={40} />
          <span className="text-sm font-semibold tracking-wide">Validating session...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
