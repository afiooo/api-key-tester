import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

function ErrorFallback({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-6 p-8 rounded-card border border-border bg-card max-w-md mx-4">
        <div className="w-12 h-12 rounded-full bg-error-soft flex items-center justify-center">
          <span className="text-error text-xl font-bold">!</span>
        </div>
        <div className="text-center">
          <h2 className="text-h2 font-bold text-fg mb-2">{t('errorBoundary.title')}</h2>
          <p className="text-body text-fg-muted">
            {t('errorBoundary.description')}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-card bg-primary text-white font-bold text-btn hover:opacity-90 transition-opacity cursor-pointer"
        >
          <RefreshCw size={16} strokeWidth={2} />
          {t('errorBoundary.refreshButton')}
        </button>
      </div>
    </div>
  );
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
      return <ErrorFallback onRefresh={this.handleRefresh} />;
    }

    return this.props.children;
  }
}
