import React from 'react';
import { useUsers, useApplications, useMFAPolicies, useGroups } from '../hooks/useOktaData';

function StatCard({ icon, label, value, color, sublabel, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: '20px 24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.borderColor = `${color}44`; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: `${color}08`,
      }} />
      <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</div>
      {sublabel && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

function SourceBreakdown({ users }) {
  if (!users) return null;
  
  const sources = {};
  users.forEach((u) => {
    const type = u.source.type;
    sources[type] = sources[type] || { ...u.source, count: 0 };
    sources[type].count++;
  });

  const total = users.length;
  const entries = Object.values(sources).sort((a, b) => b.count - a.count);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: 24,
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
        User Sources
      </h3>
      {/* Bar visualization */}
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 8, marginBottom: 16, background: 'rgba(255,255,255,0.05)' }}>
        {entries.map((s) => (
          <div
            key={s.type}
            style={{
              width: `${(s.count / total) * 100}%`,
              background: s.color,
              transition: 'width 0.5s ease',
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((s) => (
          <div key={s.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{s.icon} {s.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{s.count}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round((s.count / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppTypeBreakdown({ apps }) {
  if (!apps) return null;

  const types = {};
  apps.forEach((a) => {
    const t = a.integration.type;
    types[t] = types[t] || { ...a.integration, count: 0, apps: [] };
    types[t].count++;
    types[t].apps.push(a.label);
  });

  const entries = Object.values(types).sort((a, b) => b.count - a.count);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: 24,
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
        App Integration Types
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map((t) => (
          <div key={t.type}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{t.icon} {t.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.color }}>{t.count}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
              <div style={{
                height: '100%', borderRadius: 2, background: t.color,
                width: `${(t.count / apps.length) * 100}%`, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewDashboard({ onNavigate }) {
  const { data: users, loading: loadingUsers } = useUsers();
  const { data: apps, loading: loadingApps } = useApplications();
  const { data: policies, loading: loadingPolicies } = useMFAPolicies();
  const { data: groups, loading: loadingGroups } = useGroups();

  const isLoading = loadingUsers || loadingApps || loadingPolicies || loadingGroups;

  const activeUsers = users?.filter((u) => u.status === 'ACTIVE').length;
  const provisionedApps = apps?.filter((a) => a.hasProvisioning).length;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Visual overview of your Okta tenant configuration
        </p>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          Loading tenant data...
        </div>
      )}

      {!isLoading && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard
              icon="👤" label="Total Users" value={users?.length}
              color="#0F6CBD" sublabel={`${activeUsers} active`}
              onClick={() => onNavigate('users')}
            />
            <StatCard
              icon="🔑" label="Applications" value={apps?.length}
              color="#2E7D32" sublabel={`${provisionedApps} with provisioning`}
              onClick={() => onNavigate('apps')}
            />
            <StatCard
              icon="🛡️" label="Auth Policies" value={policies?.length}
              color="#9C27B0"
              onClick={() => onNavigate('policies')}
            />
            <StatCard
              icon="👥" label="Groups" value={groups?.length}
              color="#E65100"
            />
          </div>

          {/* Breakdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <SourceBreakdown users={users} />
            <AppTypeBreakdown apps={apps} />
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          }}>
            {[
              { label: 'View System Logs', desc: 'Monitor live events', icon: '📋', view: 'logs', color: '#0F6CBD' },
              { label: 'MFA Policies', desc: 'Review auth policies', icon: '🛡️', view: 'policies', color: '#9C27B0' },
              { label: 'Run Demo Flow', desc: 'Walk through UD→SSO→LCM→AMFA', icon: '▶', view: 'demo', color: '#22C55E' },
            ].map((action) => (
              <button
                key={action.view}
                onClick={() => onNavigate(action.view)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${action.color}44`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>{action.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{action.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{action.desc}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
