// Connect to the backend Socket.io server
    const socket = io();//(`${window.location.protocol}//${window.location.hostname}:5000`);

    // Authenticate the socket with our JWT token
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      const token = localStorage.getItem('token');
      if (token) {
        socket.emit('authenticate', token);
      }
    });

    // Confirm authentication worked
    socket.on('connected', (data) => {
      console.log('Socket authenticated:', data.message);
      // Load any unread notifications on connect
      loadUnreadCount();
    });

    // Listen for incoming notifications
    socket.on('notification', (notification) => {
      console.log('New notification:', notification);
      showNotificationToast(notification.message);
      loadUnreadCount(); // update the badge count
    });

    // Handle disconnection
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
  showToast('New Notification', notification.message, 'info'); // uses auth.js showToast
  loadUnreadCount();
});