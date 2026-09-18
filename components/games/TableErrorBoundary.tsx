'use client';

import { Component, type ReactNode } from 'react';

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

  render() {
    if (this.state.error) {
      return (
        <div
          className="rounded-2xl border border-rose-400/40 bg-portal-panel p-4 text-sm text-portal-text"
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
