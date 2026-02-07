import { useGetCallerUserProfile } from '../hooks/useQueries';
import AdminPanel from '../components/AdminPanel';
import FullScreenLoading from '../components/FullScreenLoading';

export default function Studio() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  // Show loading while profile resolves
  if (profileLoading) {
    return <FullScreenLoading message="Loading Studio..." />;
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
        </div>
        <AdminPanel />
      </div>
    </section>
  );
}
