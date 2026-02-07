import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Requires AuthProvider above

export default function CreatorZoneAuthControls() {
  const { isAuthenticated, logout } = useAuth(); // Requires AuthProvider

  if (isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={logout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    );
  }

  return null;
}
