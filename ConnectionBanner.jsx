import React from 'react';
import { useOktaConnection } from '../hooks/useOktaData';

export default function ConnectionBanner() {
  const { connected, loading, orgName, error } = useOktaConnection();

  if (loading) {
    return (
      <div style={{
        padding: '10px 16px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', animation: 'pulse-glow 1.5s infinite' }} />
        Connecting to Okta tenant...
      </div>
    );
  }

  if (!connected) {
    return (
      <div style={{
        padding: '14px 20px',
        borderRadius: 12,
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>Not Connected</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
          Configure your Okta tenant in <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>.env</code>:
        </p>
        <pre style={{
          marginTop: 8,
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.3)',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.6)',
          overflow: 'auto',
        }}>
{`VITE_OKTA_ORG_URL=https://your-tenant.okta.com
VITE_OKTA_API_TOKEN=your-api-token`}
        </pre>
        {error && <p style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{
      padding: '8px 16px',
      borderRadius: 10,
      background: 'rgba(34, 197, 94, 0.06)',
      border: '1px solid rgba(34, 197, 94, 0.15)',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Connected to</span>
      <span style={{ fontWeight: 600, color: '#fff' }}>{orgName}</span>
    </div>
  );
}
