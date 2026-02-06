import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login: iiLogin, clear: iiClear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [autoLogoutReason, setAutoLogoutReason] = useState<'idle' | null>(null);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevIdentityRef = useRef<string | null>(null);
  
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
      // Admin redirect (only if admin status is resolved and true)
      if (isAdmin === true) {
        router.navigate({ to: '/studio', replace: true });
      }
      // Non-admins stay on current page (no navigation)
    }

    // LOGOUT transition: identity becomes null
    if (wasLoggedIn && isNowLoggedOut) {
      // Clear session state
      queryClient.clear();
      // Navigate to home
      router.navigate({ to: '/', replace: true });
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

  const value: AuthContextValue = {
    isAuthenticated,
    login,
    logout,
    autoLogoutReason,
    dismissIdleNotice,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
