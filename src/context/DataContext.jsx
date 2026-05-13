import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';
const REFRESH_INTERVAL_MS = 30_000;

const DataContext = createContext(null);

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${path} failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.error || `${path} returned success=false`);
  return json.data;
}

export function DataProvider({ children }) {
  const [snapshot, setSnapshot] = useState({
    nationalKpis: null,
    entities: null,
    objectives: null,
    finance: null,
    procurement: null,
    operational: null,
    rmnch: null,
    milestones: null,
    meta: null,
    loading: true,
    error: null,
    lastFetched: null,
  });

  const fetchAll = useCallback(async () => {
    try {
      const [
        nationalKpis,
        entities,
        objectives,
        finance,
        procurement,
        rmnch,
      ] = await Promise.all([
        fetchJson('/api/kpis/national'),
        fetchJson('/api/entities'),
        fetchJson('/api/objectives'),
        fetchJson('/api/finance'),
        fetchJson('/api/procurement'),
        fetchJson('/api/rmnch'),
      ]);

      setSnapshot({
        nationalKpis,
        entities,
        objectives,
        finance,
        procurement,
        rmnch,
        operational: null,
        milestones: null,
        meta: null,
        loading: false,
        error: null,
        lastFetched: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[DataContext] Fetch error:', err);
      setSnapshot((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return (
    <DataContext.Provider value={{ ...snapshot, refresh: fetchAll }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}

// Convenience hook: fetch a single entity's deep-dive (objectives, KPIs, activities)
export function useEntityDetail(entityId) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!entityId || entityId === 'all') {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetchJson(`/api/entities/${entityId}`)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: err.message }); });
    return () => { cancelled = true; };
  }, [entityId]);

  return state;
}

// Convenience hook: fetch a single objective's deep-dive
export function useObjectiveDetail(objectiveId) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!objectiveId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetchJson(`/api/objectives/${objectiveId}`)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: err.message }); });
    return () => { cancelled = true; };
  }, [objectiveId]);

  return state;
}
