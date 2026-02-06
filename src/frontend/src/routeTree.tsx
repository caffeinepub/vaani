import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import App from './App';
import Studio from './pages/Studio';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
});

const studioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/studio',
  component: Studio,
});

export const routeTree = rootRoute.addChildren([indexRoute, studioRoute]);
