import { Header, Card, Button, Badge } from '@components/common';
import { useUIStore, useRetentionStore } from '@context/store';
import { Moon, Sun, Monitor, Bell, Database, Shield, Archive, AlertCircle, CheckCircle2, Clock, HardDrive, Save, RotateCcw, Trash2 } from 'lucide-react';
import { LAYOUT } from '@constants/styles/layout';
import { INPUTS } from '@constants/styles/components';
import { useState, useEffect } from 'react';

// Visual Retention Timeline Component
const RetentionTimeline = ({ hotDays, archiveDays, autoPurge }) => {
  const totalDays = hotDays + archiveDays + (autoPurge ? 20 : 0); // +20 for visual buffer
  const hotPercent = (hotDays / totalDays) * 100;
  const archivePercent = (archiveDays / totalDays) * 100;

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Now</span>
        <span style={{ marginLeft: `${hotPercent}%`, transform: 'translateX(-50%)' }}>{hotDays} days (Hot)</span>
        <span style={{ marginLeft: `${archivePercent}%`, transform: 'translateX(-50%)' }}>{hotDays + archiveDays} days (Total)</span>
      </div>
      <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex relative">
        {/* Hot Zone */}
        <div
          className="h-full bg-blue-500 transition-all duration-500 relative group"
          style={{ width: `${hotPercent}%` }}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Archive Zone */}
        <div
          className="h-full bg-purple-500 transition-all duration-500 relative group"
          style={{ width: `${archivePercent}%` }}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Purge Zone */}
        {autoPurge && (
          <div className="flex-1 bg-red-500/20 h-full flex items-center justify-center">
            <Trash2 className="w-3 h-3 text-red-500 opacity-50" />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-medium text-foreground">Hot Storage</span>
          <span className="text-muted-foreground">(Fast access)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="font-medium text-foreground">Archive</span>
          <span className="text-muted-foreground">(Compressed)</span>
        </div>
        {autoPurge && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <span className="font-medium text-foreground">Auto-Purge</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const { theme, toggleTheme, notificationSettings, updateNotificationSettings } = useUIStore();
  const { globalPolicy, fetchGlobalPolicy, updatePolicy, storageSummary, fetchStorageSummary, isLoading } = useRetentionStore();

  const [localPolicy, setLocalPolicy] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  // Load initial data
  useEffect(() => {
    fetchGlobalPolicy();
    fetchStorageSummary();
  }, []);

  // Sync local state when global policy loads
  useEffect(() => {
    if (globalPolicy) {
      setLocalPolicy({ ...globalPolicy });
    }
  }, [globalPolicy]);

  // Check for changes
  useEffect(() => {
    if (!globalPolicy || !localPolicy) return;

    const isDifferent = JSON.stringify(globalPolicy) !== JSON.stringify(localPolicy);
    setHasChanges(isDifferent);
  }, [localPolicy, globalPolicy]);

  const handlePolicyChange = (key, value) => {
    setLocalPolicy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!localPolicy) return;

    setSaveStatus('saving');
    try {
      await updatePolicy(localPolicy.id, localPolicy);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save policy:', error);
      setSaveStatus('error');
    }
  };

  const handleReset = () => {
    if (globalPolicy) {
      setLocalPolicy({ ...globalPolicy });
    }
  };

  // Convert hours to days for UI (approx)
  const hotRetentionDays = localPolicy ? Math.round(localPolicy.hotRetentionHours / 24) : 7;

  const sections = [
    {
      title: 'Appearance',
      icon: Monitor,
      settings: [
        { label: 'Theme', description: 'Choose your preferred color scheme', component: (
          <div className="flex gap-2">
            {['light', 'dark'].map((t) => (
              <button key={t} onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === t ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
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
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        )},
      ],
    },
  ];

  if (!localPolicy) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Settings" 
        subtitle="Configure your experience and retention policies"
        actions={
          saveStatus === 'success' && (
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Saved Successfully
            </Badge>
          )
        }
      />
      <main className={LAYOUT.PAGE_CONTENT}>
        <div className="max-w-4xl space-y-6 mx-auto">

          {/* Global Retention Policy Card */}
          <Card className="p-0 overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Global Retention Policy</h3>
                  <p className="text-sm text-muted-foreground">Default rules for all topics</p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">
                <Shield className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="p-6 space-y-8">
              {/* Visual Timeline */}
              <RetentionTimeline
                hotDays={hotRetentionDays}
                archiveDays={localPolicy.archiveRetentionDays}
                autoPurge={localPolicy.autoPurgeEnabled}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hot Storage Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-500 font-medium border-b border-border pb-2">
                    <Clock className="w-4 h-4" />
                    <h4>Hot Storage (Kafka)</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Retention Period</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={hotRetentionDays}
                          onChange={(e) => handlePolicyChange('hotRetentionHours', Number(e.target.value) * 24)}
                          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="w-16 text-right font-mono text-sm">{hotRetentionDays} days</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Max Messages</label>
                      <input
                        type="number"
                        value={localPolicy.hotMaxMessages}
                        onChange={(e) => handlePolicyChange('hotMaxMessages', Number(e.target.value))}
                        className={INPUTS.BASE}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Oldest messages removed when limit reached</p>
                    </div>
                  </div>
                </div>

                {/* Archive Storage Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-500 font-medium border-b border-border pb-2">
                    <Archive className="w-4 h-4" />
                    <h4>Archive Storage (Database)</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Enable Archiving</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPolicy.archiveEnabled}
                          onChange={(e) => handlePolicyChange('archiveEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>

                    <div className={!localPolicy.archiveEnabled ? 'opacity-50 pointer-events-none' : ''}>
                      <label className="text-sm font-medium text-foreground mb-1 block">Retention Period</label>
                      <select
                        value={localPolicy.archiveRetentionDays}
                        onChange={(e) => handlePolicyChange('archiveRetentionDays', Number(e.target.value))}
                        className={INPUTS.BASE}
                      >
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                      </select>
                    </div>

                    <div className={`flex items-center justify-between ${!localPolicy.archiveEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div>
                        <label className="text-sm font-medium text-foreground block">Compression</label>
                        <p className="text-xs text-muted-foreground">Save ~70% storage space</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPolicy.archiveCompress}
                          onChange={(e) => handlePolicyChange('archiveCompress', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto Purge Section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <div>
                      <span className="text-sm font-medium text-foreground">Auto-Purge Expired Archives</span>
                      <p className="text-xs text-muted-foreground">Permanently delete archives older than retention period</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPolicy.autoPurgeEnabled}
                      onChange={(e) => handlePolicyChange('autoPurgeEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Last updated: {localPolicy.updatedAt ? new Date(localPolicy.updatedAt).toLocaleString() : 'Never'}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || saveStatus === 'saving'}
                  className={saveStatus === 'error' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  {saveStatus === 'saving' ? (
                    <span className="animate-spin mr-2">⟳</span>
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Storage Stats Summary */}
          {storageSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4 flex items-center justify-between bg-card border-border/50">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Hot Storage</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-500">{storageSummary.totalHotSizeFormatted}</span>
                    <span className="text-xs text-muted-foreground">({storageSummary.totalHotMessages.toLocaleString()} msgs)</span>
                  </div>
                </div>
                <HardDrive className="w-8 h-8 text-blue-500/20" />
              </Card>
              <Card className="p-4 flex items-center justify-between bg-card border-border/50">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Archive Storage</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-purple-500">{storageSummary.totalArchiveSizeFormatted}</span>
                    <span className="text-xs text-muted-foreground">({storageSummary.totalArchiveMessages.toLocaleString()} msgs)</span>
                  </div>
                </div>
                <Archive className="w-8 h-8 text-purple-500/20" />
              </Card>
            </div>
          )}

          {/* Other Settings Sections */}
          {sections.map((section) => (
            <Card key={section.title} className="p-0">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-muted/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <section.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
              </div>
              <div className="divide-y divide-border">
                {section.settings.map((setting, i) => (
                  <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
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