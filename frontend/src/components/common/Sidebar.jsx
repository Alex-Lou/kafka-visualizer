import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  MessageSquare,
  FileText,
  GitBranch,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useUIStore, useConnectionStore } from '@context/store';
import { SIDEBAR } from '@constants/styles/sidebar';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/connections', icon: Server, label: 'Connections' },
  { path: '/topics', icon: MessageSquare, label: 'Topics' },
  { path: '/messages', icon: FileText, label: 'Messages' },
  { path: '/flow', icon: GitBranch, label: 'Flow View' },
];

const bottomNavItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { connections } = useConnectionStore();
  
  const activeConnections = connections.filter((c) => c.status === 'CONNECTED').length;

  const containerClasses = `${SIDEBAR.CONTAINER} ${
    sidebarCollapsed ? SIDEBAR.CONTAINER_COLLAPSED : SIDEBAR.CONTAINER_EXPANDED
  }`;

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <NavLink
        to={item.path}
        className={`${SIDEBAR.NAV_ITEM} ${
          sidebarCollapsed ? SIDEBAR.NAV_ITEM_COLLAPSED : SIDEBAR.NAV_ITEM_EXPANDED
        } ${isActive ? SIDEBAR.NAV_ITEM_ACTIVE : SIDEBAR.NAV_ITEM_DEFAULT}`}
        title={sidebarCollapsed ? item.label : undefined}
      >
        <Icon className={SIDEBAR.NAV_ITEM_ICON} />
        {!sidebarCollapsed && <span className={SIDEBAR.NAV_ITEM_TEXT}>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <aside className={containerClasses}>
      {/* Header */}
      <div className={`${SIDEBAR.HEADER} ${sidebarCollapsed ? SIDEBAR.HEADER_COLLAPSED : SIDEBAR.HEADER_EXPANDED}`}>
        <div className={SIDEBAR.LOGO}>
          <div className={SIDEBAR.LOGO_ICON}>
            <Zap className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className={SIDEBAR.LOGO_TEXT}>KafkaFlow</span>}
        </div>
        {!sidebarCollapsed && (
          <button onClick={toggleSidebar} className={SIDEBAR.TOGGLE_BTN}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={SIDEBAR.NAV_CONTAINER}>
        {!sidebarCollapsed && (
          <div className={SIDEBAR.NAV_SECTION}>
            <p className={SIDEBAR.NAV_SECTION_TITLE}>Main</p>
          </div>
        )}
        <ul className={`${SIDEBAR.NAV_LIST} ${sidebarCollapsed ? SIDEBAR.NAV_LIST_COLLAPSED : SIDEBAR.NAV_LIST_EXPANDED}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        <div className="flex-1" />

        <ul className={`${SIDEBAR.NAV_LIST} ${sidebarCollapsed ? SIDEBAR.NAV_LIST_COLLAPSED : SIDEBAR.NAV_LIST_EXPANDED}`}>
          {bottomNavItems.map((item) => (
            <li key={item.path}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - Connection Status */}
      <div className={sidebarCollapsed ? SIDEBAR.FOOTER_COLLAPSED : SIDEBAR.FOOTER}>
        <div className={sidebarCollapsed ? SIDEBAR.CONNECTION_STATUS_COLLAPSED : SIDEBAR.CONNECTION_STATUS}>
          <div className={`${SIDEBAR.CONNECTION_DOT} ${
            activeConnections > 0 ? SIDEBAR.CONNECTION_DOT_CONNECTED : SIDEBAR.CONNECTION_DOT_DISCONNECTED
          }`} />
          {!sidebarCollapsed && (
            <span className={SIDEBAR.CONNECTION_TEXT}>
              {activeConnections > 0 ? `${activeConnections} active` : 'No connections'}
            </span>
          )}
        </div>
      </div>

      {/* Collapsed toggle */}
      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full flex items-center justify-center text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}
