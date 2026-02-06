import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state while initializing or fetching profile
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading VAANI...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if authenticated but no profile exists
  const showProfileSetup = isAuthenticated && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <WelcomeScreen />
        ) : showProfileSetup ? (
          <ProfileSetup />
        ) : userProfile ? (
          <Dashboard userProfile={userProfile} />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function WelcomeScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <section className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">VAANI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A voice-first creator and listener platform where people can listen, speak, and earn using their voice.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <button
            onClick={login}
            disabled={isLoggingIn}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting...
              </span>
            ) : (
              'Get Started'
            )}
          </button>
          <p className="text-sm text-muted-foreground">
            Sign in securely with Internet Identity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-12 max-w-3xl mx-auto">
          <FeatureCard
            title="🟢 VAANI Studio"
            description="Premium, high-quality audio content. Coming soon."
            badge="Premium"
          />
          <FeatureCard
            title="🔵 Creator Zone"
            description="Record your voice and earn. Coming soon."
            badge="Public"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, badge }: { title: string; description: string; badge: string }) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
          {badge}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
