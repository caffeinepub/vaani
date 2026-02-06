import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, Headphones, Shield } from 'lucide-react';
import type { Profile } from '../backend';
import { useIsCallerAdmin } from '../hooks/useQueries';
import AdminPanel from './AdminPanel';
import StudioTab from './StudioTab';
import CreatorZoneTab from './CreatorZoneTab';

interface DashboardProps {
  userProfile: Profile;
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const { data: isAdmin } = useIsCallerAdmin();

  return (
    <section className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Hello, {userProfile.displayName}
            </h2>
            <p className="text-muted-foreground mt-1">
              Welcome to your VAANI dashboard
            </p>
          </div>
          <div className="flex gap-2">
            {userProfile.role === 'admin' && (
              <Badge variant="default" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
            {userProfile.subscription && (
              <Badge variant="secondary">Subscribed</Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="studio" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
            <TabsTrigger value="studio" className="gap-2">
              <Headphones className="h-4 w-4" />
              Studio
            </TabsTrigger>
            <TabsTrigger value="creator" className="gap-2">
              <Mic className="h-4 w-4" />
              Creator Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studio" className="space-y-4 mt-6">
            <StudioTab />
          </TabsContent>

          <TabsContent value="creator" className="space-y-4 mt-6">
            <CreatorZoneTab />
          </TabsContent>
        </Tabs>

        {isAdmin && <AdminPanel />}
      </div>
    </section>
  );
}
