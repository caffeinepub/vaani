import CreatorZoneTab from './components/CreatorZoneTab';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <section className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome to <span className="text-primary">VAANI</span>
            </h1>
            <p className="text-muted-foreground">
              A voice-first creator and listener platform
            </p>
          </div>
          <CreatorZoneTab />
        </div>
      </section>
    </AuthProvider>
  );
}
