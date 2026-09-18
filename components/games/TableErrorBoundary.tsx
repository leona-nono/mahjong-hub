'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  error: Error | null;
}

/** Surfaces table mount crashes instead of leaving the daily-hand placeholder blank. */
export default class TableErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // #region agent log
    const payload = {
      sessionId: '3bd6ce',
      runId: 'pre-fix',
      hypothesisId: 'B',
      location: 'TableErrorBoundary.tsx:didCatch',
      message: 'MahjongTable crashed',
      data: {
        error: error.message,
        stack: error.stack?.slice(0, 500) ?? null,
        componentStack: info.componentStack?.slice(0, 500) ?? null
      },
      timestamp: Date.now()
    };
    fetch('/api/debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
    fetch('http://127.0.0.1:7640/ingest/f4459068-bdc8-426b-bae7-bfb610af1d22', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3bd6ce' },
      body: JSON.stringify(payload)
    }).catch(() => {});
    // #endregion
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="rounded-2xl border border-rose-400/40 bg-portal-panel p-4 text-sm text-portal-text"
          data-debug-daily="error"
          role="alert"
        >
          <p className="font-semibold">{this.props.fallbackLabel ?? 'Table failed to load'}</p>
          <p className="mt-1 text-portal-muted">{this.state.error.message}</p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-portal-accent px-3 py-2 text-sm font-semibold text-portal-on-accent"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
