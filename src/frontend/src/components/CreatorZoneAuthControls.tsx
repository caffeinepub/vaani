import { Button } from './ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Requires AuthProvider above

export default function CreatorZoneAuthControls() {
  const { isAuthenticated, login, logout } = useAuth(); // Requires AuthProvider

  if (isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={logout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={login} className="gap-2">
      <LogIn className="h-4 w-4" />
      Log in
    </Button>
  );
}
