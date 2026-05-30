import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Boundary:", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-lg font-bold text-fin-text-primary">
          {this.props.title || "Something went wrong"}
        </h3>
        <p className="text-sm text-fin-text-secondary max-w-sm font-mono">
          {this.state.error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={this.reset}
          className="fin-btn-primary mt-2"
        >
          Try Again
        </button>
      </div>
    );
  }
}