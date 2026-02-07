import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, LogOut, User, Shield, LogIn } from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { identity, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const previousIdentityRef = useRef<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { login, logout } = useAuth();

  const isAuthenticated = !!identity;
  const currentPrincipalId = identity?.getPrincipal().toString();
  const isAdmin = userProfile?.role === 'admin';
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const wasLoggedOut = previousIdentityRef.current === null;
    const isNowLoggedIn = !!currentPrincipalId;

    if (wasLoggedOut && isNowLoggedIn) {
      queryClient.removeQueries();
      
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
    logout();
    previousIdentityRef.current = null;
  };

  const handleNavigate = (path: string) => {
    navigate({ to: path as '/' | '/studio' });
  };

  const showStudioNav = isMounted && isAuthenticated && profileFetched && !profileLoading && isAdmin;

  return (
    <header className="sticky top-10 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={() => handleNavigate('/')}
            className="hover:opacity-70 transition-opacity duration-200"
            aria-label="VAANI Home"
          >
            <img 
              src="/assets/generated/vaani-logo-header.dim_240x64.png"
              srcSet="/assets/generated/vaani-logo-header@2x.dim_480x128.png 2x"
              alt="VAANI" 
              className="h-8 w-auto object-contain"
            />
          </button>
        </div>

        <nav className="flex items-center gap-3">
          {showStudioNav && (
            <Button
              variant={currentPath === '/studio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('/studio')}
              className="gap-1.5 h-9 px-3"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">Studio</span>
            </Button>
          )}
          
          {isAuthenticated && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
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
            <div className="flex h-9 w-9 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={login} className="gap-1.5 h-9 px-4">
              <LogIn className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">Log in</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
