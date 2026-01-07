import { useEffect, useState } from 'react';

// Elegant circular loading spinner with optional message
export function LoadingSpinner({ size = 'md', message = null, showAfterMs = 0 }) {
  const [visible, setVisible] = useState(showAfterMs === 0);

  useEffect(() => {
    if (showAfterMs > 0) {
      const timer = setTimeout(() => setVisible(true), showAfterMs);
      return () => clearTimeout(timer);
    }
  }, [showAfterMs]);

  if (!visible) return null;

  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ message = 'Loading...', subMessage = null }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <div className="text-center">
          <p className="text-lg font-medium text-surface-900 dark:text-white">
            {message}
          </p>
          {subMessage && (
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline loading state for sections
export function LoadingSection({ message = 'Loading data...' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-12 h-12 border-4 border-surface-200 dark:border-surface-700 rounded-full" />
          {/* Spinning arc */}
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-500 border-r-primary-500/30 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {message}
        </p>
      </div>
    </div>
  );
}

// Skeleton loader for cards
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-surface-200 dark:bg-surface-700 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-full" />
        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-2/3" />
      </div>
    </div>
  );
}

// Toast-style loading notification
export function LoadingToast({ message = 'Loading...', visible = true }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 px-4 py-3 flex items-center gap-3">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-surface-700 dark:text-surface-300">
          {message}
        </span>
      </div>
    </div>
  );
}

export default LoadingSpinner;