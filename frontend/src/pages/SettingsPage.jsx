import { Header, Card, Button } from '@components/common';
import { useUIStore } from '@context/store';
import { Moon, Sun, Monitor, Bell, Database, Shield } from 'lucide-react';
import { LAYOUT } from '@constants/styles/layout';
import { INPUTS } from '@constants/styles/components';

export default function SettingsPage() {
  const { theme, toggleTheme, notificationSettings, updateNotificationSettings } = useUIStore();

  const sections = [
    {
      title: 'Appearance',
      icon: Monitor,
      settings: [
        { label: 'Theme', description: 'Choose your preferred color scheme', component: (
          <div className="flex gap-2">
            {['light', 'dark'].map((t) => (
              <button key={t} onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === t ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
                {t === 'light' ? <Sun className="w-4 h-4 inline mr-2" /> : <Moon className="w-4 h-4 inline mr-2" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )},
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        { label: 'Message alerts', description: 'Get notified when new messages arrive', component: (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.messageAlerts}
              onChange={(e) => updateNotificationSettings({ messageAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-600 peer-checked:bg-primary-600"></div>
          </label>
        )},
        { label: 'Connection status', description: 'Alert when connections change state', component: (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.connectionStatus}
              onChange={(e) => updateNotificationSettings({ connectionStatus: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-600 peer-checked:bg-primary-600"></div>
          </label>
        )},
      ],
    },
    {
      title: 'Data',
      icon: Database,
      settings: [
        { label: 'Message retention', description: 'How long to keep messages in local storage', component: (
          <select className={`${INPUTS.BASE} w-40`}>
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
            <option value="168">1 week</option>
            <option value="720">30 days</option>
          </select>
        )},
        { label: 'Max messages per topic', description: 'Limit stored messages per topic', component: (
          <input type="number" defaultValue={10000} className={`${INPUTS.BASE} w-40`} />
        )},
      ],
    },
  ];

  return (
    <>
      <Header title="Settings" subtitle="Customize your experience" />
      <main className={LAYOUT.PAGE_CONTENT}>
        <div className="max-w-3xl space-y-6">
          {sections.map((section) => (
            <Card key={section.title} padding="none">
              <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <section.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white">{section.title}</h3>
              </div>
              <div className="divide-y divide-surface-100 dark:divide-surface-800">
                {section.settings.map((setting, i) => (
                  <div key={i} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{setting.label}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{setting.description}</p>
                    </div>
                    {setting.component}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
