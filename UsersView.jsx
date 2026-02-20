import React, { useState, useMemo } from 'react';
import { useUsers } from '../hooks/useOktaData';

const SOURCE_FILTERS = ['ALL', 'AD', 'OKTA', 'HR', 'CSV', 'LDAP', 'FEDERATION'];
const STATUS_COLORS = {
  ACTIVE: '#22C55E',
  STAGED: '#F59E0B',
  PROVISIONED: '#3B82F6',
  DEPROVISIONED: '#EF4444',
  SUSPENDED: '#EF4444',
  RECOVERY: '#F59E0B',
  PASSWORD_EXPIRED: '#EF4444',
  LOCKED_OUT: '#EF4444',
};

function UserCard({ user }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${user.source.color}44`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `${user.source.color}22`,
            border: `1.5px solid ${user.source.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {user.source.icon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{user.displayName}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
              {user.email}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Source badge */}
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: `${user.source.color}22`, color: user.source.color,
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
          }}>
            {user.source.type}
          </span>
          {/* Status */}
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: `${STATUS_COLORS[user.status] || '#9E9E9E'}22`,
            color: STATUS_COLORS[user.status] || '#9E9E9E',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {user.status}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }} className="animate-fadeIn">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Source', value: `${user.source.label} — ${user.source.detail}` },
              { label: 'Created', value: new Date(user.created).toLocaleDateString() },
              { label: 'Last Login', value: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never' },
              { label: 'Last Updated', value: new Date(user.lastUpdated).toLocaleString() },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 2, letterSpacing: '0.08em' }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersView() {
  const { data: users, loading, error, refresh } = useUsers();
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchesSource = sourceFilter === 'ALL' || u.source.type === sourceFilter;
      const matchesSearch = !search || 
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchesSource && matchesSearch;
    });
  }, [users, sourceFilter, search]);

  // Source stats
  const sourceStats = useMemo(() => {
    if (!users) return {};
    const stats = {};
    users.forEach((u) => {
      stats[u.source.type] = (stats[u.source.type] || 0) + 1;
    });
    return stats;
  }, [users]);

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Users</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Universal Directory — user sources and profiles
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Source filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {SOURCE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setSourceFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: sourceFilter === f ? 'rgba(15,108,189,0.2)' : 'rgba(255,255,255,0.04)',
              color: sourceFilter === f ? '#0F6CBD' : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {f} {f !== 'ALL' && sourceStats[f] ? `(${sourceStats[f]})` : f === 'ALL' ? `(${users?.length || 0})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
          color: '#fff', fontSize: 13, marginBottom: 16, outline: 'none',
          fontFamily: 'DM Sans, sans-serif',
        }}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading users...</div>
      )}
      {error && (
        <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            No users found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
