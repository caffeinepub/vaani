import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import RouteAccessGuard from './components/RouteAccessGuard';
import TestingModeBanner from './components/TestingModeBanner';
import Home from './pages/Home';
import Studio from './pages/Studio';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <TestingModeBanner />
      <Header />
      <main className="flex-1">
        <RouteAccessGuard>
          <Outlet />
        </RouteAccessGuard>
      </main>
      <Footer />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const studioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/studio',
  component: Studio,
});

export const routeTree = rootRoute.addChildren([indexRoute, studioRoute]);
