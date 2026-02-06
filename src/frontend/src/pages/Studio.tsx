import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import AdminPanel from '../components/AdminPanel';
import FullScreenLoading from '../components/FullScreenLoading';

export default function Studio() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isAdmin = userProfile?.role === 'admin';

  // Show loading while profile resolves
  if (profileLoading) {
    return <FullScreenLoading message="Loading Studio..." />;
  }

  // Show loading if unauthorized (watcher will redirect)
  if (!isAuthenticated || !isAdmin) {
    return <FullScreenLoading message="Redirecting..." />;
  }

  return (
    <section className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-primary">VAANI</span> Studio
          </h1>
          <p className="text-muted-foreground">
            Admin dashboard for managing submissions and users
          </p>
          {identity && (
            <p className="text-xs text-muted-foreground font-mono">
              Principal: {identity.getPrincipal().toString()}
            </p>
          )}
        </div>
        <AdminPanel />
      </div>
    </section>
  );
}
