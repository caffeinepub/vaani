import { Button } from './ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function CreatorZoneAuthControls() {
  const { isAuthenticated, login, logout } = useAuth();
  const { isLoggingIn } = useInternetIdentity();

  if (isLoggingIn) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Logging in...
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={logout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    );
  }

  return (
    <Button onClick={login} className="gap-2">
      <LogIn className="h-4 w-4" />
      Log in
    </Button>
  );
}
