import React from 'react';

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // Log to console for now; could be sent to a remote logging service
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
            <div className="font-semibold">Something went wrong.</div>
            <div className="text-sm">Part of this page failed to load. Please refresh or contact support if the problem persists.</div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
