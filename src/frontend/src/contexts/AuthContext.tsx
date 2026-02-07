import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { InternetIdentityProvider, useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { router } from '../router';
import { useIsCallerAdmin } from '../hooks/useQueries';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  autoLogoutReason: 'idle' | null;
  dismissIdleNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Internal provider that consumes InternetIdentity context
function AuthProviderInternal({ children }: { children: ReactNode }) {
  const { identity, login: iiLogin, clear: iiClear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [autoLogoutReason, setAutoLogoutReason] = useState<'idle' | null>(null);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevIdentityRef = useRef<string | null>(null);
  const hasRedirectedRef = useRef<boolean>(false);
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const currentPrincipalId = identity?.getPrincipal().toString() || null;
  
  // Query admin status
  const { data: isAdmin } = useIsCallerAdmin();

  // Single auth-state watcher: controls ALL auth-driven navigation
  useEffect(() => {
    const wasLoggedOut = prevIdentityRef.current === null;
    const isNowLoggedIn = currentPrincipalId !== null;
    const wasLoggedIn = prevIdentityRef.current !== null;
    const isNowLoggedOut = currentPrincipalId === null;

    // LOGIN transition: identity becomes non-null
    if (wasLoggedOut && isNowLoggedIn) {
      // Reset redirect flag for new login
      hasRedirectedRef.current = false;
    }

    // Admin redirect (only once per login, when admin status resolves)
    if (isNowLoggedIn && isAdmin === true && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.navigate({ to: '/studio', replace: true });
    }

    // LOGOUT transition: identity becomes null
    if (wasLoggedIn && isNowLoggedOut) {
      // Clear session state
      queryClient.clear();
      // Navigate to home
      router.navigate({ to: '/', replace: true });
      // Reset redirect flag
      hasRedirectedRef.current = false;
    }

    // Update ref for next comparison
    prevIdentityRef.current = currentPrincipalId;
  }, [identity, isAuthenticated, isAdmin, currentPrincipalId, queryClient]);

  // Reset idle timer on activity
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (isAuthenticated) {
      idleTimerRef.current = setTimeout(() => {
        // Trigger auto-logout: only clear identity, watcher handles navigation
        setAutoLogoutReason('idle');
        iiClear();
      }, IDLE_TIMEOUT_MS);
    }
  }, [isAuthenticated, iiClear]);

  // Attach activity listeners when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    // Start idle timer
    resetIdleTimer();

    // Activity events
    const events = ['mousemove', 'keydown', 'click', 'pointerdown', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isAuthenticated, resetIdleTimer]);

  const login = useCallback(() => {
    setAutoLogoutReason(null);
    iiLogin();
  }, [iiLogin]);

  const logout = useCallback(() => {
    setAutoLogoutReason(null);
    iiClear();
    // Do NOT navigate here - watcher handles it
  }, [iiClear]);

  const dismissIdleNotice = useCallback(() => {
    setAutoLogoutReason(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    login,
    logout,
    autoLogoutReason,
    dismissIdleNotice,
  }), [isAuthenticated, login, logout, autoLogoutReason, dismissIdleNotice]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Exported AuthProvider that wraps InternetIdentityProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <InternetIdentityProvider>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </InternetIdentityProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
