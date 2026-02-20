import React, { useState, useMemo } from 'react';
import { useApplications } from '../hooks/useOktaData';

const TYPE_FILTERS = ['ALL', 'SAML', 'OIDC', 'SWA', 'WS-FED', 'BOOKMARK', 'OTHER'];

function AppCard({ app }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${app.integration.color}44`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* App logo or fallback */}
          {app.logo ? (
            <img src={app.logo} alt="" style={{ width: 36, height: 36, borderRadius: 8, background: '#fff' }} />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `${app.integration.color}22`, border: `1.5px solid ${app.integration.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>
              {app.integration.icon}
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{app.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
              {app.name}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Integration type badge */}
          <span style={{
            padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: `${app.integration.color}22`, color: app.integration.color,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {app.integration.type}
          </span>
          {/* Provisioning indicator */}
          {app.hasProvisioning && (
            <span style={{
              padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
              background: 'rgba(34,197,94,0.15)', color: '#22C55E',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              SCIM
            </span>
          )}
          {/* Status */}
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: app.status === 'ACTIVE' ? '#22C55E' : '#EF4444',
          }} />
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }} className="animate-fadeIn">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Protocol', value: app.integration.protocol },
              { label: 'Sign-On Mode', value: app.signOnMode },
              { label: 'Status', value: app.status },
              { label: 'Provisioning', value: app.hasProvisioning ? 'Enabled (SCIM)' : 'Disabled' },
              { label: 'Created', value: new Date(app.created).toLocaleDateString() },
              { label: 'Features', value: app.features.join(', ') || 'None' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 2, letterSpacing: '0.08em' }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', wordBreak: 'break-word' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsView() {
  const { data: apps, loading, error, refresh } = useApplications();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!apps) return [];
    return apps.filter((a) => {
      const matchesType = typeFilter === 'ALL' || a.integration.type === typeFilter;
      const matchesSearch = !search || a.label.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [apps, typeFilter, search]);

  const typeStats = useMemo(() => {
    if (!apps) return {};
    const s = {};
    apps.forEach((a) => { s[a.integration.type] = (s[a.integration.type] || 0) + 1; });
    return s;
  }, [apps]);

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Applications</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Integration catalog — SSO protocols and provisioning
          </p>
        </div>
        <button onClick={refresh} style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}>
          ↻ Refresh
        </button>
      </div>

      {/* Integration type summary */}
      {apps && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(typeStats).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const sample = apps.find((a) => a.integration.type === type);
            return (
              <div key={type} style={{
                padding: '10px 16px', borderRadius: 10,
                background: `${sample.integration.color}08`,
                border: `1px solid ${sample.integration.color}22`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>{sample.integration.icon}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: sample.integration.color }}>{count}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{type}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TYPE_FILTERS.map((f) => (
          <button key={f} onClick={() => setTypeFilter(f)} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: typeFilter === f ? 'rgba(46,125,50,0.2)' : 'rgba(255,255,255,0.04)',
            color: typeFilter === f ? '#2E7D32' : 'rgba(255,255,255,0.5)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
          }}>
            {f} {f !== 'ALL' && typeStats[f] ? `(${typeStats[f]})` : f === 'ALL' ? `(${apps?.length || 0})` : ''}
          </button>
        ))}
      </div>

      <input
        type="text" placeholder="Search applications..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
          color: '#fff', fontSize: 13, marginBottom: 16, outline: 'none',
        }}
      />

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading applications...</div>}
      {error && <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((app) => <AppCard key={app.id} app={app} />)}
      </div>
    </div>
  );
}
