import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useUIStore } from '@context/store';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconStyles = {
  success: 'text-success-500',
  error: 'text-error-500',
  warning: 'text-warning-500',
  info: 'text-primary-500',
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, removeNotification } = useUIStore();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-lg shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden animate-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-surface-500" />
          <h3 className="font-semibold text-sm text-surface-900 dark:text-white">Notifications</h3>
          {notifications.length > 0 && (
            <span className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-500 dark:text-surface-400">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {notifications.map((notification) => {
              const Icon = icons[notification.type] || Info;
              const iconStyle = iconStyles[notification.type] || iconStyles.info;

              return (
                <div
                  key={notification.id}
                  className="px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-750 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyle}`} />
                    <div className="flex-1 min-w-0">
                      {notification.title && (
                        <p className="font-medium text-sm text-surface-900 dark:text-white mb-1">
                          {notification.title}
                        </p>
                      )}
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {notification.message}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-surface-400 hover:text-error-500 dark:hover:text-error-400 transition-all"
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
