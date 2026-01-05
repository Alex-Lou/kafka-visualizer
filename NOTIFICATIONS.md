# Notification System

## Overview
The notification system provides real-time user feedback for important events and actions within the Kafka Visualizer application.

## Components

### 1. NotificationToast
- **Location**: `frontend/src/components/common/NotificationToast.jsx`
- **Purpose**: Displays temporary toast notifications in the top-right corner
- **Features**:
  - Auto-dismisses after 5 seconds
  - Manual dismiss with X button
  - 4 notification types: success, error, warning, info
  - Animated slide-in from right
  - Color-coded by type

### 2. NotificationPanel
- **Location**: `frontend/src/components/common/NotificationPanel.jsx`
- **Purpose**: Dropdown panel accessible from the header bell icon
- **Features**:
  - Shows all active notifications
  - Click outside to close
  - Individual notification dismissal
  - Empty state when no notifications
  - Notification count badge

### 3. Header Bell Button
- **Location**: `frontend/src/components/common/Header.jsx`
- **Purpose**: Access point for notification panel
- **Features**:
  - Red dot indicator when notifications exist
  - Toggles NotificationPanel on click
  - Shows count of active notifications

## Store Integration

### UI Store (context/store.js)
The notification system uses Zustand state management with the following:

```javascript
{
  notifications: [],              // Array of active notifications
  notificationSettings: {         // User preferences
    messageAlerts: true,          // Enable/disable message notifications
    connectionStatus: true,       // Enable/disable connection notifications
  },

  // Methods
  addNotification(notification),  // Add new notification
  removeNotification(id),         // Remove specific notification
  updateNotificationSettings(settings), // Update user preferences
}
```

## Notification Format

```javascript
{
  id: 1234567890,                 // Auto-generated timestamp
  type: 'success',                // success | error | warning | info
  title: 'Connection Test',       // Optional title
  message: 'Successfully connected', // Main message
}
```

## Usage Examples

### Adding a Notification
```javascript
import { useUIStore } from '@context/store';

const { addNotification } = useUIStore();

// Success notification
addNotification({
  type: 'success',
  title: 'Connection Test',
  message: 'Successfully connected to Production Kafka',
});

// Error notification
addNotification({
  type: 'error',
  title: 'Connection Failed',
  message: 'Unable to connect to server',
});
```

### Checking Settings Before Notifying
```javascript
const { addNotification, notificationSettings } = useUIStore();

if (notificationSettings.connectionStatus) {
  addNotification({
    type: 'success',
    message: 'Connection restored',
  });
}
```

## Settings Integration

Users can control notifications from the Settings page:

1. **Message alerts**: Enable/disable notifications for new messages
2. **Connection status**: Enable/disable notifications for connection events

These settings are stored in the UI store and persist during the session.

## Current Implementations

### ConnectionsPage
- **Test Connection**: Shows success/error when testing a connection
- **Delete Connection**: Confirms deletion with notification
- Respects `connectionStatus` setting

### Future Implementations (Suggested)

1. **TopicsPage**
   - Topic creation success/error
   - Topic sync completion
   - Topic update confirmations

2. **MessagesPage**
   - New message received (if `messageAlerts` enabled)
   - Message send confirmation
   - Message filtering results

3. **WebSocket Integration**
   - Real-time Kafka events
   - Connection status changes
   - Message arrivals

## Styling

Notifications use the application's design system:

- **Success**: Green colors (`success-*`)
- **Error**: Red colors (`error-*`)
- **Warning**: Orange/yellow colors (`warning-*`)
- **Info**: Blue colors (`primary-*`)

All notifications support dark mode automatically.

## Accessibility

- Notifications are keyboard accessible
- Close buttons have proper aria labels
- Color is not the only indicator (icons included)
- Proper contrast ratios for text

## Performance

- Notifications auto-remove after 5 seconds to prevent memory leaks
- Maximum recommended: 5 simultaneous notifications
- Smooth animations use CSS transforms for optimal performance

## Testing

To test the notification system:

1. Start the application
2. Go to Connections page
3. Test a connection (Play button)
4. Observe success/error notification
5. Click bell icon in header to see notification panel
6. Toggle settings in Settings page
7. Test again to verify settings are respected

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design
