import { type ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Navigate, useLocation } from '@tanstack/react-router';
import FullScreenLoading from './FullScreenLoading';

interface RouteAccessGuardProps {
  children: ReactNode;
}

/**
 * Router-level guard that enforces role-based routing BEFORE rendering route content.
 * 
 * Flow:
 * 1. Auth resolved → role resolved → route chosen → page rendered
 * 2. Blocks rendering while role is unresolved for authenticated users
 * 3. Performs replace-style redirects at routing time (no useEffect)
 */
export default function RouteAccessGuard({ children }: RouteAccessGuardProps) {
  const { identity } = useInternetIdentity();
  const { data: isStudioAdmin, isResolved: adminResolved } = useIsCallerAdmin();
  const location = useLocation();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const currentPath = location.pathname;

  // UNAUTHENTICATED users
  if (!isAuthenticated) {
    // Block /studio for unauthenticated users
    if (currentPath === '/studio') {
      return <Navigate to="/" replace />;
    }
    // Allow / for unauthenticated users
    return <>{children}</>;
  }

  // AUTHENTICATED users - block rendering until role is resolved
  if (!adminResolved) {
    return <FullScreenLoading message="Loading your workspace..." />;
  }

  // AUTHENTICATED + ROLE RESOLVED
  
  // Studio/Admin users
  if (isStudioAdmin === true) {
    // Redirect Studio/Admin away from / to /studio
    if (currentPath === '/') {
      return <Navigate to="/studio" replace />;
    }
    // Allow /studio for Studio/Admin
    return <>{children}</>;
  }

  // Non-admin users
  if (isStudioAdmin === false) {
    // Redirect non-admin away from /studio to /
    if (currentPath === '/studio') {
      return <Navigate to="/" replace />;
    }
    // Allow / for non-admin
    return <>{children}</>;
  }

  // Fallback: should never reach here if adminResolved is true
  return <FullScreenLoading message="Resolving access..." />;
}
