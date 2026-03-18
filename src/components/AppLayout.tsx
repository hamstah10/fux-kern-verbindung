import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TelemetryBar } from './TelemetryBar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 pb-12 min-h-screen">
        <Outlet />
      </main>
      <TelemetryBar />
    </div>
  );
}
