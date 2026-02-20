import React from 'react';

export default function Sidebar({ views, activeView, onViewChange }) {
  return (
    <aside
      style={{
        width: 240,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, padding: '0 8px' }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          O
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Okta Demo</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
            PLATFORM
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(views).map(([key, view]) => {
          const isActive = activeView === key;
          return (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: isActive ? 'rgba(15, 108, 189, 0.15)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'DM Sans, sans-serif',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.target.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.target.style.background = 'transparent';
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '25%',
                    height: '50%',
                    width: 3,
                    borderRadius: 2,
                    background: '#0F6CBD',
                  }}
                />
              )}
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{view.icon}</span>
              {view.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', padding: '16px 8px' }}>
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4, letterSpacing: '0.08em' }}>
            ENVIRONMENT
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            {import.meta.env.VITE_OKTA_ORG_URL?.replace('https://', '') || 'Not configured'}
          </div>
        </div>
      </div>
    </aside>
  );
}
