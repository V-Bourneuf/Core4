import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSystemLogs } from '../hooks/useOktaData';

const PHASE_COLORS = {
  UD: '#0F6CBD',
  SSO: '#2E7D32',
  LCM: '#E65100',
  AMFA: '#9C27B0',
  unknown: '#78909C',
};

const SEVERITY_STYLES = {
  DEBUG: { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' },
  INFO: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
  WARN: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  ERROR: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
};

function LogEntry({ log, isNew }) {
  const [expanded, setExpanded] = useState(false);
  const severity = SEVERITY_STYLES[log.severity] || SEVERITY_STYLES.INFO;
  const phaseColor = PHASE_COLORS[log.category.phase] || PHASE_COLORS.unknown;

  return (
    <div
      style={{
        background: isNew ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isNew ? `${phaseColor}33` : 'rgba(255,255,255,0.04)'}`,
        borderLeft: `3px solid ${phaseColor}`,
        borderRadius: '0 8px 8px 0',
        padding: '10px 14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        animation: isNew ? 'slideIn 0.3s ease forwards' : 'none',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row: time + phase + severity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.35)',
            }}>
              {new Date(log.published).toLocaleTimeString()}
            </span>
            <span style={{
              padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
              background: `${phaseColor}22`, color: phaseColor,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {log.category.phase}
            </span>
            <span style={{
              padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600,
              background: severity.bg, color: severity.color,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {log.severity}
            </span>
            {log.outcome?.result && (
              <span style={{
                padding: '1px 6px', borderRadius: 4, fontSize: 9,
                background: log.outcome.result === 'SUCCESS' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: log.outcome.result === 'SUCCESS' ? '#22C55E' : '#EF4444',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {log.outcome.result}
              </span>
            )}
          </div>

          {/* Event type */}
          <div style={{
            fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.5)', marginBottom: 3,
          }}>
            {log.eventType}
          </div>

          {/* Display message */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
            {log.displayMessage}
          </div>

          {/* Actor + Target */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {log.actor && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                Actor: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{log.actor.displayName || log.actor.alternateId}</strong>
              </span>
            )}
            {log.target?.[0] && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                Target: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{log.target[0].displayName || log.target[0].alternateId}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)' }} className="animate-fadeIn">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {log.client && (
              <>
                {log.client.ipAddress && (
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>IP ADDRESS</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{log.client.ipAddress}</div>
                  </div>
                )}
                {log.client.geographicalContext?.city && (
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>LOCATION</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      {[log.client.geographicalContext.city, log.client.geographicalContext.state, log.client.geographicalContext.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}
                {log.client.userAgent?.rawUserAgent && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>USER AGENT</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
                      {log.client.userAgent.rawUserAgent}
                    </div>
                  </div>
                )}
              </>
            )}
            {log.authenticationContext?.authenticationStep && (
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>AUTH STEP</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{log.authenticationContext.authenticationStep}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseTimeline({ logs }) {
  const phaseCounts = useMemo(() => {
    const counts = { UD: 0, SSO: 0, LCM: 0, AMFA: 0 };
    logs.forEach((l) => {
      if (counts[l.category.phase] !== undefined) counts[l.category.phase]++;
    });
    return counts;
  }, [logs]);

  const total = Object.values(phaseCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: 16, marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
          DEMO PHASE ACTIVITY
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
          {logs.length} events
        </span>
      </div>
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 10 }}>
        {Object.entries(phaseCounts).map(([phase, count]) => (
          <div key={phase} style={{
            width: `${(count / total) * 100}%`, background: PHASE_COLORS[phase],
            transition: 'width 0.5s ease',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {Object.entries(phaseCounts).map(([phase, count]) => (
          <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_COLORS[phase] }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{phase}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: PHASE_COLORS[phase] }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SystemLogsView() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [phaseFilter, setPhaseFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('1h');

  const timeRangeMs = { '15m': 900000, '1h': 3600000, '6h': 21600000, '24h': 86400000 };

  const { logs, loading, error, refresh, clearLogs } = useSystemLogs({
    autoRefresh,
    intervalMs: 10000,
    since: new Date(Date.now() - (timeRangeMs[timeRange] || 3600000)).toISOString(),
  });

  const newLogIds = useRef(new Set());
  useEffect(() => {
    if (logs.length > 0) {
      const latest = logs.slice(0, 5).map((l) => l.uuid);
      newLogIds.current = new Set(latest);
      const timer = setTimeout(() => { newLogIds.current.clear(); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [logs.length]);

  const filtered = useMemo(() => {
    if (phaseFilter === 'ALL') return logs;
    return logs.filter((l) => l.category.phase === phaseFilter);
  }, [logs, phaseFilter]);

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>System Logs</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Real-time event stream — mapped to demo phases
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: `1px solid ${autoRefresh ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
              background: autoRefresh ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
              color: autoRefresh ? '#22C55E' : '#fff',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: autoRefresh ? '#22C55E' : '#9E9E9E',
              animation: autoRefresh ? 'pulse-glow 1.5s infinite' : 'none',
            }} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button onClick={clearLogs} style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>
            Clear
          </button>
          <button onClick={refresh} style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>
            ↻
          </button>
        </div>
      </div>

      {/* Time range + Phase filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['15m', '1h', '6h', '24h'].map((t) => (
            <button key={t} onClick={() => setTimeRange(t)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none',
              background: timeRange === t ? 'rgba(15,108,189,0.2)' : 'rgba(255,255,255,0.04)',
              color: timeRange === t ? '#0F6CBD' : 'rgba(255,255,255,0.4)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
            }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['ALL', 'UD', 'SSO', 'LCM', 'AMFA'].map((p) => (
            <button key={p} onClick={() => setPhaseFilter(p)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none',
              background: phaseFilter === p ? `${PHASE_COLORS[p] || 'rgba(255,255,255,0.2)'}33` : 'rgba(255,255,255,0.04)',
              color: phaseFilter === p ? (PHASE_COLORS[p] || '#fff') : 'rgba(255,255,255,0.4)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Phase activity bar */}
      <PhaseTimeline logs={logs} />

      {/* Log list */}
      {loading && logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading system logs...</div>
      )}
      {error && (
        <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((log) => (
          <LogEntry
            key={log.uuid}
            log={log}
            isNew={newLogIds.current.has(log.uuid)}
          />
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            No log events in this time range. Start your demo to see events appear here in real-time.
          </div>
        )}
      </div>
    </div>
  );
}
