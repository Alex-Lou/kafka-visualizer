function saveOptions() {
  const apiUrl = document.getElementById('apiUrl').value;
  chrome.storage.sync.set({
    apiUrl: apiUrl
  }, () => {
    const status = document.createElement('div');
    status.textContent = 'Options saved.';
    document.body.appendChild(status);
    setTimeout(() => {
      status.textContent = '';
    }, 750);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    apiUrl: 'http://localhost:8080/api'
  }, (items) => {
    document.getElementById('apiUrl').value = items.apiUrl;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
