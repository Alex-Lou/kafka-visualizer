import { useState } from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useUIStore } from '@context/store/index';
import { LAYOUT } from '@constants/styles/layout';
import { BUTTONS, INPUTS } from '@constants/styles/components';
import NotificationPanel from './NotificationPanel';

export default function Header({ title, subtitle, actions }) {
  const { theme, toggleTheme, unreadCount } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className={LAYOUT.HEADER}>
      <div className={LAYOUT.HEADER_INNER}>
        <div>
          <h1 className="text-xl font-semibold text-surface-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search..."
              className={`${INPUTS.BASE} ${INPUTS.SIZE_SM} pl-9 w-64`}
            />
          </div>

          {actions}

          <button
            onClick={toggleTheme}
            className={`${BUTTONS.BASE} ${BUTTONS.GHOST} ${BUTTONS.ICON_ONLY_SM}`}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`${BUTTONS.BASE} ${BUTTONS.GHOST} ${BUTTONS.ICON_ONLY_SM} relative`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-error-500 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}