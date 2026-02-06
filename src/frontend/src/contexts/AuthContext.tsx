import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';

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
  const { identity, login: iiLogin, clear: iiClear, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [autoLogoutReason, setAutoLogoutReason] = useState<'idle' | null>(null);
  const [appInitiatedLogin, setAppInitiatedLogin] = useState(false);
  const prevLoginStatusRef = useRef(loginStatus);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Reset idle timer on activity
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (isAuthenticated) {
      idleTimerRef.current = setTimeout(() => {
        // Trigger auto-logout
        setAutoLogoutReason('idle');
        iiClear();
        queryClient.clear();
        navigate({ to: '/', replace: true });
      }, IDLE_TIMEOUT_MS);
    }
  }, [isAuthenticated, iiClear, queryClient, navigate]);

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

  // Post-login admin redirect (only after app-initiated login success)
  useEffect(() => {
    const prevStatus = prevLoginStatusRef.current;
    prevLoginStatusRef.current = loginStatus;

    // Only proceed if this was an app-initiated login that just succeeded
    if (!appInitiatedLogin || loginStatus !== 'success' || prevStatus === 'success') {
      return;
    }

    // Login just succeeded - check admin status and redirect if admin
    const checkAdminAndRedirect = async () => {
      if (!actor || !identity) return;

      try {
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) {
          navigate({ to: '/studio', replace: true });
        }
        // If not admin, stay on current page (no navigation)
      } catch (error) {
        console.error('Failed to check admin status after login:', error);
      } finally {
        // Reset the flag after handling
        setAppInitiatedLogin(false);
      }
    };

    checkAdminAndRedirect();
  }, [loginStatus, appInitiatedLogin, actor, identity, navigate]);

  const login = useCallback(() => {
    setAutoLogoutReason(null);
    setAppInitiatedLogin(true);
    iiLogin();
  }, [iiLogin]);

  const logout = useCallback(() => {
    setAutoLogoutReason(null);
    iiClear();
    queryClient.clear();
    navigate({ to: '/', replace: true });
  }, [iiClear, queryClient, navigate]);

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
