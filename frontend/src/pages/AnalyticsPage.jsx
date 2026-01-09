import { useState } from 'react';
import { Header, Card, Badge } from '@components/common';
import { useMessageStore, useTopicStore } from '@context/store/index';
import { LAYOUT } from '@constants/styles/layout';
import { ANALYTICS as STYLES } from '@constants/styles/analytics';
import { TrendingUp, TrendingDown, Activity, AlertCircle, BarChart3, LineChart, Clock, HardDrive, Zap } from 'lucide-react';

// Simple Chart Components (SVG-based)
function ThroughputChart({ data = [] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 400;
  const height = 200;
  const barWidth = width / data.length;
  
  return (
    <svg className={STYLES.SVG_CHART_CONTAINER} viewBox={`0 0 ${width} ${height}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={`grid-${ratio}`}
          x1="0" y1={height * (1 - ratio)}
          x2={width} y2={height * (1 - ratio)}
          className={STYLES.SVG_GRID_LINE}
        />
      ))}
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * height * 0.85;
        const x = i * barWidth + barWidth * 0.1;
        const y = height - barHeight;
        return (
          <g key={i}>
            <rect
              x={x} y={y}
              width={barWidth * 0.8} height={barHeight}
              className={STYLES.THROUGHPUT_BAR}
              rx="4"
            />
            <text
              x={x + barWidth * 0.4} y={height + 15}
              textAnchor="middle"
              className={STYLES.CHART_AXIS_LABEL}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ErrorTrendChart({ data = [] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data
    .map((item, i) => {
      const x = (i / (data.length - 1 || 1)) * 380 + 10;
      const y = 160 - (item.value / maxValue) * 160;
      return `${x},${y}`;
    })
    .join(' ');
  
  return (
    <svg className={STYLES.SVG_CHART_CONTAINER} viewBox="0 0 400 200">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={`grid-${ratio}`}
          x1="0" y1={200 * (1 - ratio)}
          x2="400" y2={200 * (1 - ratio)}
          className={STYLES.SVG_GRID_LINE}
        />
      ))}
      <polyline points={points} className={STYLES.ERROR_TREND_LINE} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`10,160 ${points} 390,160`} className={STYLES.ERROR_TREND_AREA} />
      {data.map((item, i) => {
        const x = (i / (data.length - 1 || 1)) * 380 + 10;
        const y = 160 - (item.value / maxValue) * 160;
        return <circle key={i} cx={x} cy={y} r="4" className={STYLES.ERROR_TREND_DOT} />;
      })}
    </svg>
  );
}

function StorageBreakdownChart() {
  const hotSize = 2.4;
  const archiveSize = 12.1;
  const total = hotSize + archiveSize;
  const hotPercent = (hotSize / total) * 100;
  const archivePercent = (archiveSize / total) * 100;
  
  return (
    <div className="space-y-4">
      <div className={STYLES.STORAGE_ITEM}>
        <div className={STYLES.STORAGE_LABEL_ROW}>
          <span className={STYLES.STORAGE_LABEL}>Hot Storage</span>
          <span className={STYLES.STORAGE_VALUE_HOT}>{hotSize} GB ({hotPercent.toFixed(0)}%)</span>
        </div>
        <div className={STYLES.PROGRESS_BAR_CONTAINER}>
          <div className={STYLES.PROGRESS_BAR_HOT} style={{ width: `${hotPercent}%` }} />
        </div>
      </div>
      
      <div className={STYLES.STORAGE_ITEM}>
        <div className={STYLES.STORAGE_LABEL_ROW}>
          <span className={STYLES.STORAGE_LABEL}>Archive Storage</span>
          <span className={STYLES.STORAGE_VALUE_ARCHIVE}>{archiveSize} GB ({archivePercent.toFixed(0)}%)</span>
        </div>
        <div className={STYLES.PROGRESS_BAR_CONTAINER}>
          <div className={STYLES.PROGRESS_BAR_ARCHIVE} style={{ width: `${archivePercent}%` }} />
        </div>
      </div>
      
      <div className={STYLES.STORAGE_TOTAL_ROW}>
        <div className={STYLES.STORAGE_LABEL_ROW}>
          <span className={STYLES.STORAGE_LABEL}>Total Storage</span>
          <span className={STYLES.STORAGE_TOTAL_VALUE}>{total.toFixed(1)} GB</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { stats } = useMessageStore();
  const { topics } = useTopicStore();
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const throughputData = [
    { label: '00:00', value: 120 }, { label: '04:00', value: 95 },
    { label: '08:00', value: 340 }, { label: '12:00', value: 280 },
    { label: '16:00', value: 200 }, { label: '20:00', value: 150 },
  ];

  const errorTrendData = [
    { label: '0h', value: 5 }, { label: '4h', value: 12 },
    { label: '8h', value: 8 }, { label: '12h', value: 15 },
    { label: '16h', value: 6 }, { label: '20h', value: 3 },
  ];

  const topicStats = [
    { name: 'payments', messages: 245320, errors: 12, size: 1.2, trend: 'up' },
    { name: 'orders', messages: 156890, errors: 8, size: 0.8, trend: 'down' },
    { name: 'notifications', messages: 98234, errors: 2, size: 0.4, trend: 'up' },
    { name: 'logs', messages: 523441, errors: 142, size: 3.1, trend: 'up' },
  ];

  const statCards = [
    { title: 'Total Messages (24h)', value: stats.totalMessages?.toLocaleString() || '0', change: '+12.5%', icon: Activity, color: 'blue' },
    { title: 'Error Rate', value: `${stats.errorCount || 0} errors`, change: '-2.3%', icon: AlertCircle, color: 'red' },
    { title: 'Avg Throughput', value: `${stats.throughput || 0}/min`, change: '+5.2%', icon: Zap, color: 'green' },
    { title: 'Total Storage', value: stats.totalSize || '0 B', change: '+8.1%', icon: HardDrive, color: 'purple' },
  ];

  const colorClasses = {
    blue: STYLES.STAT_COLOR_BLUE,
    red: STYLES.STAT_COLOR_RED,
    green: STYLES.STAT_COLOR_GREEN,
    purple: STYLES.STAT_COLOR_PURPLE,
  };

  return (
    <>
      <Header 
        title="Analytics" 
        subtitle="Monitor message flow and system performance"
        actions={
          <div className={STYLES.TIME_RANGE_BUTTON_GROUP}>
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`${STYLES.TIME_RANGE_BUTTON} ${timeRange === range ? STYLES.TIME_RANGE_BUTTON_ACTIVE : STYLES.TIME_RANGE_BUTTON_INACTIVE}`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={STYLES.PAGE_CONTAINER}>
          <div className={STYLES.STATS_GRID}>
            {statCards.map((stat, i) => (
              <Card key={i} className={STYLES.STAT_CARD}>
                <div className={STYLES.STAT_CARD_HEADER}>
                  <h4 className={STYLES.STAT_CARD_TITLE}>{stat.title}</h4>
                  <div className={`${STYLES.STAT_CARD_ICON_WRAPPER} ${colorClasses[stat.color]}`}>
                    <stat.icon className={STYLES.STAT_CARD_ICON} />
                  </div>
                </div>
                <div className={STYLES.STAT_CARD_BODY}>
                  <p className={STYLES.STAT_CARD_VALUE}>{stat.value}</p>
                  <Badge variant={stat.change.startsWith('+') ? 'success' : 'neutral'} size="sm">
                    {stat.change}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className={STYLES.CHART_GRID}>
            <Card className={STYLES.CHART_CARD}>
              <div className={STYLES.CHART_HEADER}>
                <h3 className={STYLES.CHART_TITLE}>
                  <BarChart3 className={`${STYLES.CHART_ICON} ${STYLES.ICON_PRIMARY}`} />
                  Message Throughput
                </h3>
                <span className={STYLES.CHART_SUBTITLE}>Messages per hour</span>
              </div>
              <ThroughputChart data={throughputData} />
            </Card>

            <Card className={STYLES.CHART_CARD}>
              <div className={STYLES.CHART_HEADER}>
                <h3 className={STYLES.CHART_TITLE}>
                  <LineChart className={`${STYLES.CHART_ICON} ${STYLES.ICON_RED}`} />
                  Error Trend
                </h3>
                <span className={STYLES.CHART_SUBTITLE}>Last 24 hours</span>
              </div>
              <ErrorTrendChart data={errorTrendData} />
            </Card>
          </div>

          <div className={STYLES.PERFORMANCE_GRID}>
            <Card className={STYLES.CHART_CARD}>
              <div className={STYLES.CHART_HEADER}>
                <h3 className={STYLES.CHART_TITLE}>
                  <HardDrive className={`${STYLES.CHART_ICON} ${STYLES.ICON_BLUE}`} />
                  Storage Breakdown
                </h3>
              </div>
              <StorageBreakdownChart />
            </Card>

            <Card className={STYLES.CHART_CARD}>
              <h3 className={`${STYLES.CHART_TITLE} mb-4`}>
                <Zap className={`${STYLES.CHART_ICON} ${STYLES.ICON_YELLOW}`} />
                System Performance
              </h3>
              <div className={STYLES.PERFORMANCE_ITEM}>
                <div>
                  <div className={STYLES.PERFORMANCE_LABEL_ROW}>
                    <span className={STYLES.PERFORMANCE_LABEL}>CPU Usage</span>
                    <span className={STYLES.PERFORMANCE_VALUE}>45%</span>
                  </div>
                  <div className={STYLES.PROGRESS_BAR_CONTAINER}>
                    <div className={STYLES.PROGRESS_BAR_CPU} style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className={STYLES.PERFORMANCE_LABEL_ROW}>
                    <span className={STYLES.PERFORMANCE_LABEL}>Memory Usage</span>
                    <span className={STYLES.PERFORMANCE_VALUE}>62%</span>
                  </div>
                  <div className={STYLES.PROGRESS_BAR_CONTAINER}>
                    <div className={STYLES.PROGRESS_BAR_MEMORY} style={{ width: '62%' }} />
                  </div>
                </div>
                <div>
                  <div className={STYLES.PERFORMANCE_LABEL_ROW}>
                    <span className={STYLES.PERFORMANCE_LABEL}>Disk I/O</span>
                    <span className={STYLES.PERFORMANCE_VALUE}>28%</span>
                  </div>
                  <div className={STYLES.PROGRESS_BAR_CONTAINER}>
                    <div className={STYLES.PROGRESS_BAR_DISK} style={{ width: '28%' }} />
                  </div>
                </div>
                <div className={STYLES.PERFORMANCE_FOOTER}>
                  <div className={STYLES.PERFORMANCE_FOOTER_ROW}>
                    <span className={STYLES.PERFORMANCE_LABEL}>Response Time (avg)</span>
                    <span className={STYLES.PERFORMANCE_VALUE}>142ms</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className={STYLES.TOPICS_CARD}>
            <div className={STYLES.TOPICS_HEADER}>
              <h3 className={STYLES.TOPICS_TITLE}>Top Topics by Activity</h3>
              <select
                value={selectedTopic || ''}
                onChange={(e) => setSelectedTopic(e.target.value || null)}
                className={STYLES.TOPICS_SELECT}
              >
                <option value="">All Topics</option>
                {topics.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>

            <div className={STYLES.TOPICS_TABLE_WRAPPER}>
              <table className={STYLES.TOPICS_TABLE}>
                <thead>
                  <tr className={STYLES.TOPICS_THEAD}>
                    <th className={STYLES.TOPICS_TH}>Topic Name</th>
                    <th className={STYLES.TOPICS_TH_RIGHT}>Messages</th>
                    <th className={STYLES.TOPICS_TH_RIGHT}>Errors</th>
                    <th className={STYLES.TOPICS_TH_RIGHT}>Size</th>
                    <th className={STYLES.TOPICS_TH_RIGHT}>Trend</th>
                  </tr>
                </thead>
                <tbody className={STYLES.TOPICS_TBODY}>
                  {topicStats.map((topic, i) => (
                    <tr key={i} className={STYLES.TOPICS_TR}>
                      <td className={`${STYLES.TOPICS_TD} ${STYLES.TOPICS_TD_NAME}`}>{topic.name}</td>
                      <td className={`${STYLES.TOPICS_TD} ${STYLES.TOPICS_TD_RIGHT}`}>{topic.messages.toLocaleString()}</td>
                      <td className={`${STYLES.TOPICS_TD} ${STYLES.TOPICS_TD_RIGHT}`}>
                        <Badge variant={topic.errors > 10 ? 'error' : 'neutral'} size="sm">{topic.errors}</Badge>
                      </td>
                      <td className={`${STYLES.TOPICS_TD} ${STYLES.TOPICS_TD_RIGHT} text-muted-foreground`}>{topic.size} GB</td>
                      <td className={`${STYLES.TOPICS_TD} ${STYLES.TOPICS_TD_RIGHT}`}>
                        <div className={STYLES.TOPICS_TD_TREND}>
                          {topic.trend === 'up' ? (
                            <>
                              <TrendingUp className={STYLES.TREND_UP_ICON} />
                              <span className={STYLES.TREND_UP_TEXT}>+8%</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className={STYLES.TREND_DOWN_ICON} />
                              <span className={STYLES.TREND_DOWN_TEXT}>-3%</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className={STYLES.INFO_BOX}>
            <div className={STYLES.INFO_BOX_CONTENT}>
              <Clock className={STYLES.INFO_BOX_ICON} />
              <div>
                <p className={STYLES.INFO_BOX_TITLE}>Data updated every 5 minutes</p>
                <p className={STYLES.INFO_BOX_TEXT}>
                  Analytics reflect messages in hot storage. Archive data is available for historical analysis up to 30 days.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
