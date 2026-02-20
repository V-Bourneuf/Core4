import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import UsersView from './components/UsersView';
import ApplicationsView from './components/ApplicationsView';
import PoliciesView from './components/PoliciesView';
import SystemLogsView from './components/SystemLogsView';
import DemoFlowView from './components/DemoFlowView';
import OverviewDashboard from './components/OverviewDashboard';
import ConnectionBanner from './components/ConnectionBanner';

const VIEWS = {
  overview: { label: 'Overview', icon: '◆' },
  users: { label: 'Users', icon: '👤' },
  apps: { label: 'Applications', icon: '🔑' },
  policies: { label: 'MFA Policies', icon: '🛡️' },
  logs: { label: 'System Logs', icon: '📋' },
  demo: { label: 'Demo Flow', icon: '▶' },
};

export default function App() {
  const [activeView, setActiveView] = useState('overview');

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <OverviewDashboard onNavigate={setActiveView} />;
      case 'users': return <UsersView />;
      case 'apps': return <ApplicationsView />;
      case 'policies': return <PoliciesView />;
      case 'logs': return <SystemLogsView />;
      case 'demo': return <DemoFlowView />;
      default: return <OverviewDashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#12121F' }}>
      <Sidebar
        views={VIEWS}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <main style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        <ConnectionBanner />
        {renderView()}
      </main>
    </div>
  );
}
