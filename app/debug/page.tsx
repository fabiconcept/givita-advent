'use client';

import { useEffect, useState, useCallback } from 'react';

interface LogEntry {
  level: string;
  tag: string;
  message: string;
  args: string;
  timestamp: string;
}

const LEVEL_COLORS: Record<string, string> = {
  error: '#ef4444',
  warn: '#f59e0b',
  info: '#22c55e',
  debug: '#06b6d4',
};

export default function DebugPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (filterLevel) params.set('level', filterLevel);
      if (filterTag) params.set('tag', filterTag);
      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filterLevel, filterTag]);

  useEffect(() => {
    fetchLogs();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [fetchLogs, autoRefresh]);

  return (
    <div className="min-h-screen bg-black text-white font-mono text-sm">
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-700 p-3 flex items-center gap-3 flex-wrap">
        <h1 className="font-bold text-lg mr-2">Server Logs</h1>
        <span className="text-zinc-400 text-xs">{total} total in buffer</span>
        <select
          className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">All levels</option>
          <option value="error">error</option>
          <option value="warn">warn</option>
          <option value="info">info</option>
          <option value="debug">debug</option>
        </select>
        <input
          className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs w-28"
          placeholder="Filter tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        />
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh
        </label>
        <button
          className="ml-auto bg-zinc-700 hover:bg-zinc-600 rounded px-3 py-1 text-xs"
          onClick={fetchLogs}
        >
          Refresh
        </button>
      </div>
      <div className="p-2 space-y-0.5">
        {loading && <p className="text-zinc-500 p-2">Loading...</p>}
        {!loading && logs.length === 0 && (
          <p className="text-zinc-500 p-2">No logs captured yet. Make some requests to the server.</p>
        )}
        {logs.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 px-2 py-0.5 hover:bg-zinc-900 rounded">
            <span className="text-zinc-500 shrink-0 w-16 text-right text-[10px] leading-5">
              {entry.timestamp.slice(11, 23)}
            </span>
            <span
              className="shrink-0 w-10 text-center rounded text-[10px] font-bold leading-5"
              style={{ color: LEVEL_COLORS[entry.level] ?? '#fff' }}
            >
              {entry.level}
            </span>
            <span className="text-purple-400 shrink-0 leading-5 text-xs w-20 truncate" title={entry.tag}>
              {entry.tag}
            </span>
            <span className="leading-5 break-all flex-1 min-w-0">
              {entry.message}
              {entry.args && <span className="text-zinc-400"> {entry.args}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
