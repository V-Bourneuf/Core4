import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchUsers,
  fetchApplications,
  fetchMFAPolicies,
  fetchAuthenticators,
  fetchSystemLogs,
  fetchGroups,
  checkConnection,
} from '../services/oktaApi';

/**
 * Hook to manage Okta tenant connection state.
 */
export function useOktaConnection() {
  const [connection, setConnection] = useState({ connected: false, loading: true });

  useEffect(() => {
    checkConnection()
      .then((result) => setConnection({ ...result, loading: false }))
      .catch(() => setConnection({ connected: false, loading: false, error: 'Network error' }));
  }, []);

  return connection;
}

/**
 * Generic data fetcher hook with loading/error states.
 */
function useOktaData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useUsers() {
  return useOktaData(fetchUsers);
}

export function useApplications() {
  return useOktaData(fetchApplications);
}

export function useMFAPolicies() {
  return useOktaData(fetchMFAPolicies);
}

export function useAuthenticators() {
  return useOktaData(fetchAuthenticators);
}

export function useGroups() {
  return useOktaData(fetchGroups);
}

/**
 * System logs hook with auto-refresh (polling) for live demo monitoring.
 */
export function useSystemLogs(options = {}) {
  const { autoRefresh = false, intervalMs = 10000, ...logOptions } = options;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const seenIds = useRef(new Set());

  const fetchLogs = useCallback(async () => {
    try {
      const result = await fetchSystemLogs(logOptions);
      
      // Deduplicate and merge
      const newLogs = result.filter((log) => {
        if (seenIds.current.has(log.uuid)) return false;
        seenIds.current.add(log.uuid);
        return true;
      });

      if (newLogs.length > 0) {
        setLogs((prev) => [...newLogs, ...prev].slice(0, 500)); // Keep last 500
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(logOptions)]);

  useEffect(() => {
    fetchLogs();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, intervalMs);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLogs, autoRefresh, intervalMs]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    seenIds.current.clear();
  }, []);

  return { logs, loading, error, refresh: fetchLogs, clearLogs };
}
