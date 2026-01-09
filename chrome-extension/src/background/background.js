const API_URL = 'http://localhost:8080/api';
let ws = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Yucast extension installed');
  chrome.alarms.create('checkConnection', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkConnection') {
    await checkServerConnection();
  }
});

async function checkServerConnection() {
  try {
    const response = await fetch(`${API_URL}/dashboard/stats`);
    if (response.ok) {
      chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
      chrome.action.setBadgeText({ text: '●' });
    } else {
      setDisconnected();
    }
  } catch (error) {
    setDisconnected();
  }
}

function setDisconnected() {
  chrome.action.setBadgeBackgroundColor({ color: '#71717a' });
  chrome.action.setBadgeText({ text: '○' });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    fetch(`${API_URL}/dashboard/stats`)
      .then(r => r.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
  
  if (request.action === 'getConnections') {
    fetch(`${API_URL}/connections`)
      .then(r => r.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }

  if (request.action === 'notify') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: request.title || 'Kafka Flow',
      message: request.message,
    });
    sendResponse({ success: true });
  }
});

checkServerConnection();
