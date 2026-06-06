// Connect to the backend Socket.io server
    const socket = io('http://localhost:5000');

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

    // ── TOAST NOTIFICATION POPUP ──────────────────────
    // Shows a small popup at the top right of the screen
    function showNotificationToast(message) {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a1a2e;
        color: white;
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        font-size: 14px;
        max-width: 320px;
        animation: slideIn 0.3s ease;
      `;
      toast.textContent = '🔔 ' + message;
      document.body.appendChild(toast);

      // Remove after 4 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }