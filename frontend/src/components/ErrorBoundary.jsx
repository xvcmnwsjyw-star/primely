import { Component } from "react";

// Catches render errors in any page and shows a recoverable message instead
// of unmounting the entire app (React's default behavior for uncaught
// render errors). Without this, a bug on one page can make every other
// page — including the homepage — look broken until a hard refresh.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="px-6 py-20 max-w-md mx-auto text-center">
          <p className="text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-sm text-black/60 mb-4">
            This page hit an error. The rest of the app is unaffected.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-md bg-black text-white text-sm"
          >
            Back to home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
