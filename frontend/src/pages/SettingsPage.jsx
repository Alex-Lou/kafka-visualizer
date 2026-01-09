import { Header, Card, Button, Badge } from '@components/common';
import { useUIStore, useRetentionStore } from '@context/store/index';
import { Moon, Sun, Monitor, Bell, Database, Shield, Archive, CheckCircle2, Clock, HardDrive, Save, RotateCcw, Trash2 } from 'lucide-react';
import { LAYOUT } from '@constants/styles/layout';
import { INPUTS } from '@constants/styles/components';
import { SETTINGS } from '@constants/styles/settings';
import { useState, useEffect } from 'react';

// Visual Retention Timeline Component
const RetentionTimeline = ({ hotDays, archiveDays, autoPurge }) => {
  const totalDays = hotDays + archiveDays + (autoPurge ? 20 : 0);
  const hotPercent = totalDays > 0 ? (hotDays / totalDays) * 100 : 0;
  const archivePercent = totalDays > 0 ? (archiveDays / totalDays) * 100 : 0;

  // Dynamic styles remain inline
  const hotStyle = { width: `${hotPercent}%` };
  const archiveStyle = { width: `${archivePercent}%` };
  const hotLabelStyle = { marginLeft: `${hotPercent}%`, transform: 'translateX(-50%)' };
  const archiveLabelStyle = { marginLeft: `${archivePercent}%`, transform: 'translateX(-50%)' };

  return (
    <div className={SETTINGS.TIMELINE_CONTAINER}>
      <div className={SETTINGS.TIMELINE_LABELS}>
        <span>Now</span>
        <span style={hotLabelStyle}>{hotDays} days (Hot)</span>
        <span style={archiveLabelStyle}>{hotDays + archiveDays} days (Total)</span>
      </div>
      <div className={SETTINGS.TIMELINE_BAR}>
        <div className={SETTINGS.TIMELINE_ZONE_HOT} style={hotStyle}>
          <div className={SETTINGS.TIMELINE_ZONE_HOVER} />
        </div>
        <div className={SETTINGS.TIMELINE_ZONE_ARCHIVE} style={archiveStyle}>
          <div className={SETTINGS.TIMELINE_ZONE_HOVER} />
        </div>
        {autoPurge && (
          <div className={SETTINGS.TIMELINE_ZONE_PURGE}>
            <Trash2 className={SETTINGS.TIMELINE_PURGE_ICON} />
          </div>
        )}
      </div>
      <div className={SETTINGS.TIMELINE_LEGEND}>
        <div className={SETTINGS.TIMELINE_LEGEND_ITEM}>
          <div className={`${SETTINGS.TIMELINE_LEGEND_DOT} ${SETTINGS.TIMELINE_LEGEND_DOT_HOT}`} />
          <span className={SETTINGS.TIMELINE_LEGEND_LABEL}>Hot Storage</span>
          <span className={SETTINGS.TIMELINE_LEGEND_SUB_LABEL}>(Fast access)</span>
        </div>
        <div className={SETTINGS.TIMELINE_LEGEND_ITEM}>
          <div className={`${SETTINGS.TIMELINE_LEGEND_DOT} ${SETTINGS.TIMELINE_LEGEND_DOT_ARCHIVE}`} />
          <span className={SETTINGS.TIMELINE_LEGEND_LABEL}>Archive</span>
          <span className={SETTINGS.TIMELINE_LEGEND_SUB_LABEL}>(Compressed)</span>
        </div>
        {autoPurge && (
          <div className={SETTINGS.TIMELINE_LEGEND_ITEM}>
            <div className={`${SETTINGS.TIMELINE_LEGEND_DOT} ${SETTINGS.TIMELINE_LEGEND_DOT_PURGE}`} />
            <span className={SETTINGS.TIMELINE_LEGEND_LABEL}>Auto-Purge</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const { theme, toggleTheme, notificationSettings, updateNotificationSettings } = useUIStore();
  const { globalPolicy, fetchGlobalPolicy, updatePolicy, storageSummary, fetchStorageSummary } = useRetentionStore();

  const [localPolicy, setLocalPolicy] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    fetchGlobalPolicy();
    fetchStorageSummary();
  }, [fetchGlobalPolicy, fetchStorageSummary]);

  useEffect(() => {
    if (globalPolicy) {
      setLocalPolicy({ ...globalPolicy });
    }
  }, [globalPolicy]);

  useEffect(() => {
    if (!globalPolicy || !localPolicy) return;
    const isDifferent = JSON.stringify(globalPolicy) !== JSON.stringify(localPolicy);
    setHasChanges(isDifferent);
  }, [localPolicy, globalPolicy]);

  const handlePolicyChange = (key, value) => {
    setLocalPolicy(prev => ({ ...prev, [key]: value }));
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

  const hotRetentionDays = localPolicy ? Math.round(localPolicy.hotRetentionHours / 24) : 7;

  const sections = [
    {
      title: 'Appearance',
      icon: Monitor,
      settings: [
        { label: 'Theme', description: 'Choose your preferred color scheme', component: (
          <div className={SETTINGS.THEME_BUTTON_GROUP}>
            {['light', 'dark'].map((t) => (
              <button key={t} onClick={toggleTheme}
                className={`${SETTINGS.THEME_BUTTON} ${theme === t ? SETTINGS.THEME_BUTTON_ACTIVE : SETTINGS.THEME_BUTTON_INACTIVE}`}>
                {t === 'light' ? <Sun className={SETTINGS.THEME_ICON} /> : <Moon className={SETTINGS.THEME_ICON} />}
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
          <label className={SETTINGS.TOGGLE_WRAPPER}>
            <input type="checkbox" checked={notificationSettings.messageAlerts} onChange={(e) => updateNotificationSettings({ messageAlerts: e.target.checked })} className={SETTINGS.TOGGLE_INPUT} />
            <div className={SETTINGS.TOGGLE_BG_LARGE}></div>
          </label>
        )},
        { label: 'Connection status', description: 'Alert when connections change state', component: (
          <label className={SETTINGS.TOGGLE_WRAPPER}>
            <input type="checkbox" checked={notificationSettings.connectionStatus} onChange={(e) => updateNotificationSettings({ connectionStatus: e.target.checked })} className={SETTINGS.TOGGLE_INPUT} />
            <div className={SETTINGS.TOGGLE_BG_LARGE}></div>
          </label>
        )},
      ],
    },
  ];

  if (!localPolicy) {
    return (
      <div className={SETTINGS.LOADING_WRAPPER}>
        <div className={SETTINGS.LOADING_SPINNER}></div>
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
        <div className={SETTINGS.PAGE_CONTAINER}>
          <Card className={`${SETTINGS.CARD} ${SETTINGS.POLICY_CARD_DECORATION}`}>
            <div className={SETTINGS.CARD_HEADER}>
              <div className="flex items-center gap-3">
                <div className={SETTINGS.CARD_HEADER_ICON_WRAPPER}>
                  <Database className={SETTINGS.CARD_HEADER_ICON} />
                </div>
                <div>
                  <h3 className={SETTINGS.CARD_HEADER_TITLE}>Global Retention Policy</h3>
                  <p className={SETTINGS.CARD_HEADER_SUBTITLE}>Default rules for all topics</p>
                </div>
              </div>
              <Badge variant="neutral" size="sm"><Shield className="w-3 h-3 mr-1" />Active</Badge>
            </div>

            <div className={SETTINGS.CARD_BODY}>
              <RetentionTimeline
                hotDays={hotRetentionDays}
                archiveDays={localPolicy.archiveRetentionDays}
                autoPurge={localPolicy.autoPurgeEnabled}
              />
              <div className={SETTINGS.SECTION_GRID}>
                <div className={SETTINGS.SECTION}>
                  <div className={`${SETTINGS.SECTION_HEADER} ${SETTINGS.SECTION_TITLE_BLUE}`}>
                    <Clock className={SETTINGS.SECTION_ICON} />
                    <h4>Hot Storage (Kafka)</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={SETTINGS.LABEL}>Retention Period</label>
                      <div className={SETTINGS.SLIDER_CONTAINER}>
                        <input type="range" min="1" max="30" value={hotRetentionDays} onChange={(e) => handlePolicyChange('hotRetentionHours', Number(e.target.value) * 24)} className={`${SETTINGS.SLIDER} ${SETTINGS.SLIDER_BLUE}`} />
                        <span className={SETTINGS.SLIDER_VALUE}>{hotRetentionDays} days</span>
                      </div>
                    </div>
                    <div>
                      <label className={SETTINGS.LABEL}>Max Messages</label>
                      <input type="number" value={localPolicy.hotMaxMessages} onChange={(e) => handlePolicyChange('hotMaxMessages', Number(e.target.value))} className={INPUTS.BASE} />
                      <p className={SETTINGS.DESCRIPTION}>Oldest messages removed when limit reached</p>
                    </div>
                  </div>
                </div>
                <div className={SETTINGS.SECTION}>
                  <div className={`${SETTINGS.SECTION_HEADER} ${SETTINGS.SECTION_TITLE_PURPLE}`}>
                    <Archive className={SETTINGS.SECTION_ICON} />
                    <h4>Archive Storage (Database)</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className={SETTINGS.LABEL}>Enable Archiving</label>
                      <label className={SETTINGS.TOGGLE_WRAPPER}>
                        <input type="checkbox" checked={localPolicy.archiveEnabled} onChange={(e) => handlePolicyChange('archiveEnabled', e.target.checked)} className={SETTINGS.TOGGLE_INPUT} />
                        <div className={`${SETTINGS.TOGGLE_BG} ${SETTINGS.TOGGLE_PURPLE}`}></div>
                      </label>
                    </div>
                    <div className={!localPolicy.archiveEnabled ? SETTINGS.SECTION_DISABLED : ''}>
                      <label className={SETTINGS.LABEL}>Retention Period</label>
                      <select value={localPolicy.archiveRetentionDays} onChange={(e) => handlePolicyChange('archiveRetentionDays', Number(e.target.value))} className={INPUTS.BASE}>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                      </select>
                    </div>
                    <div className={`flex items-center justify-between ${!localPolicy.archiveEnabled ? SETTINGS.SECTION_DISABLED : ''}`}>
                      <div>
                        <label className={SETTINGS.LABEL}>Compression</label>
                        <p className={SETTINGS.DESCRIPTION}>Save ~70% storage space</p>
                      </div>
                      <label className={SETTINGS.TOGGLE_WRAPPER}>
                        <input type="checkbox" checked={localPolicy.archiveCompress} onChange={(e) => handlePolicyChange('archiveCompress', e.target.checked)} className={SETTINGS.TOGGLE_INPUT} />
                        <div className={`${SETTINGS.TOGGLE_BG} ${SETTINGS.TOGGLE_PURPLE}`}></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className={SETTINGS.PURGE_SECTION_WRAPPER}>
                <div className={SETTINGS.PURGE_SECTION}>
                  <div className={SETTINGS.PURGE_LABEL_GROUP}>
                    <Trash2 className={SETTINGS.PURGE_ICON} />
                    <div>
                      <span className={SETTINGS.LABEL}>Auto-Purge Expired Archives</span>
                      <p className={SETTINGS.DESCRIPTION}>Permanently delete archives older than retention period</p>
                    </div>
                  </div>
                  <label className={SETTINGS.TOGGLE_WRAPPER}>
                    <input type="checkbox" checked={localPolicy.autoPurgeEnabled} onChange={(e) => handlePolicyChange('autoPurgeEnabled', e.target.checked)} className={SETTINGS.TOGGLE_INPUT} />
                    <div className={`${SETTINGS.TOGGLE_BG} ${SETTINGS.TOGGLE_RED}`}></div>
                  </label>
                </div>
              </div>
            </div>
            <div className={SETTINGS.CARD_FOOTER}>
              <div className={SETTINGS.FOOTER_META}>
                Last updated: {localPolicy.updatedAt ? new Date(localPolicy.updatedAt).toLocaleString() : 'Never'}
              </div>
              <div className={SETTINGS.FOOTER_ACTIONS}>
                <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={!hasChanges || saveStatus === 'saving'} className={saveStatus === 'error' ? SETTINGS.SAVE_BUTTON_ERROR : ''}>
                  {saveStatus === 'saving' ? <span className={SETTINGS.SAVING_ICON}>⟳</span> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>

          {storageSummary && (
            <div className={SETTINGS.SUMMARY_GRID}>
              <Card className={SETTINGS.SUMMARY_CARD}>
                <div>
                  <p className={SETTINGS.SUMMARY_LABEL}>Total Hot Storage</p>
                  <div className={SETTINGS.SUMMARY_VALUE_WRAPPER}>
                    <span className={SETTINGS.SUMMARY_VALUE_HOT}>{storageSummary.totalHotSizeFormatted}</span>
                    <span className={SETTINGS.SUMMARY_META}>({storageSummary.totalHotMessages.toLocaleString()} msgs)</span>
                  </div>
                </div>
                <HardDrive className={SETTINGS.SUMMARY_ICON_HOT} />
              </Card>
              <Card className={SETTINGS.SUMMARY_CARD}>
                <div>
                  <p className={SETTINGS.SUMMARY_LABEL}>Total Archive Storage</p>
                  <div className={SETTINGS.SUMMARY_VALUE_WRAPPER}>
                    <span className={SETTINGS.SUMMARY_VALUE_ARCHIVE}>{storageSummary.totalArchiveSizeFormatted}</span>
                    <span className={SETTINGS.SUMMARY_META}>({storageSummary.totalArchiveMessages.toLocaleString()} msgs)</span>
                  </div>
                </div>
                <Archive className={SETTINGS.SUMMARY_ICON_ARCHIVE} />
              </Card>
            </div>
          )}

          {sections.map((section) => (
            <Card key={section.title} className={SETTINGS.OTHER_SETTINGS_CARD}>
              <div className={SETTINGS.OTHER_SETTINGS_HEADER}>
                <div className={SETTINGS.OTHER_SETTINGS_ICON_WRAPPER}>
                  <section.icon className={SETTINGS.OTHER_SETTINGS_ICON} />
                </div>
                <h3 className={SETTINGS.OTHER_SETTINGS_TITLE}>{section.title}</h3>
              </div>
              <div className={SETTINGS.OTHER_SETTINGS_BODY}>
                {section.settings.map((setting, i) => (
                  <div key={i} className={SETTINGS.OTHER_SETTINGS_ROW}>
                    <div>
                      <p className={SETTINGS.OTHER_SETTINGS_LABEL}>{setting.label}</p>
                      <p className={SETTINGS.OTHER_SETTINGS_DESCRIPTION}>{setting.description}</p>
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
