import CreatorZoneTab from '../components/CreatorZoneTab';

export default function Home() {
  return (
    <section className="container max-w-3xl mx-auto px-4 py-16 md:py-20">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Welcome to <span className="text-primary">VAANI</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            A voice-first creator and listener platform
          </p>
        </div>
        <CreatorZoneTab />
      </div>
    </section>
  );
}
