
const socket = io();

// ── AUTHENTICATE ───────────────────────────────────────
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  const token = localStorage.getItem('token');
  if (token) {
    socket.emit('authenticate', token);
  }
});

socket.on('connected', (data) => {
  console.log('Socket authenticated:', data.message);
  loadUnreadCount();
});

// ── LISTEN FOR NOTIFICATIONS ───────────────────────────────────────
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  showNotificationToast(notification.message);
  loadUnreadCount();
});

socket.on('disconnect', () => {
  console.log('Socket disconnected. Will reconnect automatically.');
});

// ── UNREAD COUNT ──────────────────────────────────
async function loadUnreadCount() {
  try {
    const data = await notificationAPI.getUnreadCount();
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.textContent = data.count;
      badge.style.display = data.count > 0 ? 'flex' : 'none';
    }
  } catch (err) {
    console.log('Could not load notification count.');
  }
}

socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  showToast('New Notification', notification.message, 'info');
  loadUnreadCount();
});