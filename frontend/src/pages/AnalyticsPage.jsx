import { useEffect, useState } from 'react';
import { Header, Card, Badge } from '@components/common';
import { useMessageStore, useTopicStore } from '@context/store';
import { LAYOUT } from '@constants/styles/layout';
import { TrendingUp, TrendingDown, Activity, AlertCircle, BarChart3, LineChart, Clock, HardDrive, Zap } from 'lucide-react';

// Simple Chart Components (SVG-based)
function ThroughputChart({ data = [] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 400;
  const height = 200;
  const barWidth = width / data.length;
  
  return (
    <svg className="w-full h-40 border border-border rounded-lg bg-muted/30 p-4" viewBox={`0 0 ${width} ${height}`}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={`grid-${ratio}`}
          x1="0"
          y1={height * (1 - ratio)}
          x2={width}
          y2={height * (1 - ratio)}
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
      ))}
      
      {/* Bars */}
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * height * 0.85;
        const x = i * barWidth + barWidth * 0.1;
        const y = height - barHeight;
        
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth * 0.8}
              height={barHeight}
              fill="hsl(var(--primary))"
              fillOpacity="0.7"
              rx="4"
            />
            <text
              x={x + barWidth * 0.4}
              y={height + 15}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              opacity="0.6"
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
    <svg className="w-full h-40 border border-border rounded-lg bg-muted/30 p-4" viewBox="0 0 400 200">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={`grid-${ratio}`}
          x1="0"
          y1={200 * (1 - ratio)}
          x2="400"
          y2={200 * (1 - ratio)}
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
      ))}
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="hsl(0, 84%, 60%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Area under line */}
      <polygon
        points={`10,160 ${points} 390,160`}
        fill="hsl(0, 84%, 60%)"
        fillOpacity="0.1"
      />
      
      {/* Data points */}
      {data.map((item, i) => {
        const x = (i / (data.length - 1 || 1)) * 380 + 10;
        const y = 160 - (item.value / maxValue) * 160;
        return (
          <circle key={i} cx={x} cy={y} r="4" fill="hsl(0, 84%, 60%)" />
        );
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
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Hot Storage</span>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{hotSize} GB ({hotPercent.toFixed(0)}%)</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${hotPercent}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Archive Storage</span>
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{archiveSize} GB ({archivePercent.toFixed(0)}%)</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full"
            style={{ width: `${archivePercent}%` }}
          />
        </div>
      </div>
      
      <div className="pt-2 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Total Storage</span>
          <span className="text-sm font-bold text-foreground">{total.toFixed(1)} GB</span>
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

  // Sample data for charts
  const throughputData = [
    { label: '00:00', value: 120 },
    { label: '04:00', value: 95 },
    { label: '08:00', value: 340 },
    { label: '12:00', value: 280 },
    { label: '16:00', value: 200 },
    { label: '20:00', value: 150 },
  ];

  const errorTrendData = [
    { label: '0h', value: 5 },
    { label: '4h', value: 12 },
    { label: '8h', value: 8 },
    { label: '12h', value: 15 },
    { label: '16h', value: 6 },
    { label: '20h', value: 3 },
  ];

  const topicStats = [
    { name: 'payments', messages: 245320, errors: 12, size: 1.2, trend: 'up' },
    { name: 'orders', messages: 156890, errors: 8, size: 0.8, trend: 'down' },
    { name: 'notifications', messages: 98234, errors: 2, size: 0.4, trend: 'up' },
    { name: 'logs', messages: 523441, errors: 142, size: 3.1, trend: 'up' },
  ];

  const statCards = [
    {
      title: 'Total Messages (24h)',
      value: stats.totalMessages?.toLocaleString() || '0',
      change: '+12.5%',
      icon: Activity,
      color: 'blue',
    },
    {
      title: 'Error Rate',
      value: `${stats.errorCount || 0} errors`,
      change: '-2.3%',
      icon: AlertCircle,
      color: 'red',
    },
    {
      title: 'Avg Throughput',
      value: `${stats.throughput || 0}/min`,
      change: '+5.2%',
      icon: Zap,
      color: 'green',
    },
    {
      title: 'Total Storage',
      value: stats.totalSize || '0 B',
      change: '+8.1%',
      icon: HardDrive,
      color: 'purple',
    },
  ];

  return (
    <>
      <Header 
        title="Analytics" 
        subtitle="Monitor message flow and system performance"
        actions={
          <div className="flex gap-2">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      <main className={LAYOUT.PAGE_CONTENT}>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                red: 'bg-red-500/10 text-red-600 dark:text-red-400',
                green: 'bg-green-500/10 text-green-600 dark:text-green-400',
                purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
              };

              return (
                <Card key={i} className="p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground">{stat.title}</h4>
                    <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <Badge 
                      variant={stat.change.startsWith('+') ? 'success' : 'neutral'} 
                      size="sm"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Throughput Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Message Throughput
                </h3>
                <span className="text-xs text-muted-foreground">Messages per hour</span>
              </div>
              <ThroughputChart data={throughputData} />
            </Card>

            {/* Error Trend Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-red-500" />
                  Error Trend
                </h3>
                <span className="text-xs text-muted-foreground">Last 24 hours</span>
              </div>
              <ErrorTrendChart data={errorTrendData} />
            </Card>
          </div>

          {/* Storage & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Breakdown */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-500" />
                  Storage Breakdown
                </h3>
              </div>
              <StorageBreakdownChart />
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                System Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">CPU Usage</span>
                    <span className="text-sm font-semibold text-foreground">45%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Memory Usage</span>
                    <span className="text-sm font-semibold text-foreground">62%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Disk I/O</span>
                    <span className="text-sm font-semibold text-foreground">28%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div className="pt-3 border-t border-border mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Response Time (avg)</span>
                    <span className="font-semibold text-foreground">142ms</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Topics by Message Count */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Top Topics by Activity</h3>
              <select
                value={selectedTopic || ''}
                onChange={(e) => setSelectedTopic(e.target.value || null)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Topic Name</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Messages</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Errors</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Size</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topicStats.map((topic, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{topic.name}</td>
                      <td className="py-3 px-4 text-right text-foreground">{topic.messages.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={topic.errors > 10 ? 'error' : 'neutral'} size="sm">
                          {topic.errors}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{topic.size} GB</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {topic.trend === 'up' ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 dark:text-green-400 text-xs font-medium">+8%</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 dark:text-red-400 text-xs font-medium">-3%</span>
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

          {/* Info Box */}
          <Card className="p-4 border border-blue-500/30 bg-blue-500/5">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Data updated every 5 minutes</p>
                <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                  Analytics reflect messages in hot storage. Archive data is available for historical analysis up to {`${30}`} days.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}