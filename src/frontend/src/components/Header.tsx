import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, LogOut, User, Shield } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Requires AuthProvider above

export default function Header() {
  // Call ALL hooks unconditionally at the top level (required by React rules)
  const { identity, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const previousIdentityRef = useRef<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { logout } = useAuth(); // Requires AuthProvider

  const isAuthenticated = !!identity;
  const currentPrincipalId = identity?.getPrincipal().toString();
  const isAdmin = userProfile?.role === 'admin';
  const currentPath = routerState.location.pathname;

  // Set mounted flag after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect login transition: identity becomes available after being absent
  useEffect(() => {
    const wasLoggedOut = previousIdentityRef.current === null;
    const isNowLoggedIn = !!currentPrincipalId;

    if (wasLoggedOut && isNowLoggedIn) {
      // Clear all cached queries to force fresh fetch
      queryClient.removeQueries();
      
      // Immediately refetch identity-scoped queries for the new principal
      queryClient.invalidateQueries({ 
        queryKey: ['currentUserProfile', currentPrincipalId],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['currentUserRole', currentPrincipalId],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['isCallerAdmin', currentPrincipalId],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['whoAmI', currentPrincipalId],
        refetchType: 'active'
      });
    }

    previousIdentityRef.current = currentPrincipalId || null;
  }, [currentPrincipalId, queryClient]);

  const handleLogout = () => {
    // Only trigger logout action - AuthContext watcher handles navigation
    logout();
    previousIdentityRef.current = null;
  };

  const handleNavigate = (path: string) => {
    navigate({ to: path as '/' | '/studio' });
  };

  // Hide Studio nav until mounted AND profile is fetched AND user is confirmed admin
  // This prevents Studio UI from showing during any transient/unresolved state
  const showStudioNav = isMounted && isAuthenticated && profileFetched && !profileLoading && isAdmin;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('/')}
            className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-primary">VAANI</span>
          </button>
        </div>

        <nav className="flex items-center gap-4">
          {showStudioNav && (
            <Button
              variant={currentPath === '/studio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('/studio')}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Studio
            </Button>
          )}
          
          {isAuthenticated && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userProfile.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {userProfile.role === 'admin' ? 'Admin' : userProfile.subscription ? 'Subscribed' : 'Free'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => handleNavigate('/studio')} className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>VAANI Studio</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isLoggingIn ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : null}
        </nav>
      </div>
    </header>
  );
}
