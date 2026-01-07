const API_URL = 'http://localhost:8080/api';

class PopupApp {
  constructor() {
    this.isConnected = false;
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadSettings();
    await this.checkConnection();
    await this.loadData();
  }

  bindEvents() {
    document.getElementById('connect-btn').addEventListener('click', () => this.toggleConnection());
    document.getElementById('open-app-link').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3000' });
    });
    document.getElementById('settings-link').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }

  async loadSettings() {
    const result = await chrome.storage.sync.get(['apiUrl', 'connectionId']);
    if (result.apiUrl) this.apiUrl = result.apiUrl;
    if (result.connectionId) this.connectionId = result.connectionId;
  }

  async checkConnection() {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      if (response.ok) {
        this.setConnected(true);
      } else {
        this.setConnected(false);
      }
    } catch (error) {
      this.setConnected(false);
    }
  }

  setConnected(connected) {
    this.isConnected = connected;
    const statusDot = document.getElementById('connection-status');
    const connectBtn = document.getElementById('connect-btn');
    const connectionName = document.getElementById('connection-name');
    const connectionUrl = document.getElementById('connection-url');

    if (connected) {
      statusDot.classList.remove('disconnected');
      statusDot.classList.add('connected');
      connectBtn.textContent = 'Disconnect';
      connectionName.textContent = 'Local Server';
      connectionUrl.textContent = API_URL;
    } else {
      statusDot.classList.remove('connected');
      statusDot.classList.add('disconnected');
      connectBtn.textContent = 'Connect';
      connectionName.textContent = 'Not connected';
      connectionUrl.textContent = '-';
    }
  }

  async toggleConnection() {
    if (this.isConnected) {
      this.setConnected(false);
    } else {
      await this.checkConnection();
    }
  }

  async loadData() {
    if (!this.isConnected) return;

    try {
      const statsResponse = await fetch(`${API_URL}/dashboard/stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        this.updateStats(stats.data);
      }

      const connectionsResponse = await fetch(`${API_URL}/connections`);
      if (connectionsResponse.ok) {
        const connections = await connectionsResponse.json();
        if (connections.data && connections.data.length > 0) {
          const activeConnection = connections.data.find(c => c.status === 'CONNECTED') || connections.data[0];
          await this.loadTopics(activeConnection.id);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  updateStats(stats) {
    document.getElementById('stat-topics').textContent = stats?.monitoredTopics || 0;
    document.getElementById('stat-messages').textContent = Math.round((stats?.messagesLast24h || 0) / 1440);
  }

  async loadTopics(connectionId) {
    try {
      const response = await fetch(`${API_URL}/topics/connection/${connectionId}`);
      if (response.ok) {
        const topics = await response.json();
        this.renderTopics(topics.data || []);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  }

  renderTopics(topics) {
    const list = document.getElementById('topic-list');
    const monitoredTopics = topics.filter(t => t.monitored);

    if (monitoredTopics.length === 0) {
      list.innerHTML = '<li class="topic-item empty">No topics monitored</li>';
      return;
    }

    list.innerHTML = monitoredTopics.slice(0, 5).map(topic => `
      <li class="topic-item">
        <div class="topic-color" style="background-color: ${topic.color || '#3374ff'}"></div>
        <div class="topic-info">
          <span class="topic-name">${topic.name}</span>
          <span class="topic-count">${topic.messageCount?.toLocaleString() || 0} msgs</span>
        </div>
      </li>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => new PopupApp());
