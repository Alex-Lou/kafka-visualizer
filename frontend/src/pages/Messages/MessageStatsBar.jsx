import { Card } from '@components/common';
import { Database, AlertCircle, Activity, HardDrive, Clock, Zap, TrendingUp, Radio } from 'lucide-react';

export default function MessageStatsBar({ stats, selectedTopic }) {
  if (!selectedTopic) return null;

  // Formater le temps depuis le dernier message
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const lastMsg = new Date(timestamp);
    const diffMs = now - lastMsg;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return lastMsg.toLocaleDateString();
  };

  // Déterminer la couleur du throughput
  const getThroughputColor = (tps) => {
    if (tps > 10) return 'text-green-500';
    if (tps > 1) return 'text-blue-500';
    if (tps > 0) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  // Indicateur de status du consumer
  const ConsumerStatus = () => (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${stats?.consumerActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      <span className="text-xs text-muted-foreground">
        {stats?.consumerActive ? 'Live' : 'Idle'}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-6 mt-6 mb-6">

      {/* Total Messages */}
      <Card className="p-4 flex items-center justify-between bg-card border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Messages</p>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalMessages?.toLocaleString() ?? '0'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.messagesLast24h?.toLocaleString() ?? '0'} last 24h
          </p>
        </div>
        <Database className="w-8 h-8 text-primary/50" />
      </Card>

      {/* Throughput Real-time */}
      <Card className="p-4 flex items-center justify-between bg-card border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-muted-foreground">Throughput</p>
            <ConsumerStatus />
          </div>
          <p className={`text-2xl font-bold ${getThroughputColor(stats?.throughputPerSecond)}`}>
            {stats?.throughputPerSecond?.toFixed(1) ?? '0'}/s
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ~{stats?.throughputPerMinute?.toFixed(0) ?? '0'}/min
          </p>
        </div>
        <Activity className={`w-8 h-8 ${stats?.consumerActive ? 'text-green-500/50 animate-pulse' : 'text-gray-400/50'}`} />
      </Card>

      {/* Errors */}
      <Card className="p-4 flex items-center justify-between bg-card border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Errors (24h)</p>
          <p className={`text-2xl font-bold ${stats?.errorCount > 0 ? 'text-red-500' : 'text-foreground'}`}>
            {stats?.errorCount ?? 0}
          </p>
          {stats?.warningCount > 0 && (
            <p className="text-xs text-yellow-500 mt-1">
              +{stats.warningCount} warnings
            </p>
          )}
        </div>
        <AlertCircle className={`w-8 h-8 ${stats?.errorCount > 0 ? 'text-red-500/50' : 'text-muted-foreground/30'}`} />
      </Card>

      {/* Last Message */}
      <Card className="p-4 flex items-center justify-between bg-card border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Last Message</p>
          <p className="text-2xl font-bold text-foreground">
            {formatLastMessageTime(stats?.lastMessageAt)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.messagesLastHour?.toLocaleString() ?? '0'} last hour
          </p>
        </div>
        <Clock className="w-8 h-8 text-blue-500/50" />
      </Card>

      {/* Storage Size */}
      <Card className="p-4 flex items-center justify-between bg-card border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Storage</p>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalSizeFormatted ?? '0 B'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Hot storage
          </p>
        </div>
        <HardDrive className="w-8 h-8 text-purple-500/50" />
      </Card>

      {/* Topic Status */}
      <Card className="p-4 flex items-center justify-between bg-card border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${stats?.isMonitored ? 'bg-green-500' : 'bg-gray-400'}`} />
            <p className="text-lg font-semibold text-foreground">
              {stats?.isMonitored ? 'Monitored' : 'Not Monitored'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedTopic?.name}
          </p>
        </div>
        <Radio className={`w-8 h-8 ${stats?.isMonitored ? 'text-green-500/50' : 'text-gray-400/50'}`} />
      </Card>
    </div>
  );
}