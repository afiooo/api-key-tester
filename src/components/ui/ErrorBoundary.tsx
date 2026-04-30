import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleRefresh = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="flex flex-col items-center gap-6 p-8 rounded-card border border-border bg-card max-w-md mx-4">
            <div className="w-12 h-12 rounded-full bg-error-soft flex items-center justify-center">
              <span className="text-error text-xl font-bold">!</span>
            </div>
            <div className="text-center">
              <h2 className="text-h2 font-bold text-fg mb-2">应用出现错误</h2>
              <p className="text-body text-fg-muted">
                发生了意外错误，请尝试刷新页面。
              </p>
            </div>
            <button
              onClick={this.handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-card bg-primary text-white font-bold text-btn hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw size={16} strokeWidth={2} />
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
