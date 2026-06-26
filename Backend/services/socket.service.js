const jwt = require('jsonwebtoken');

// ── STORE CONNECTED USERS ───────────────────────────────────
const connectedUsers = {};

function initializeSocket(io) {

  io.on('connection', (socket) => {
    console.log('New socket connection: ' + socket.id);

    socket.on('authenticate', (token) => {
      try {

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        const userId = decoded.id;

        connectedUsers[userId] = socket.id;

        console.log(
          'User authenticated on socket: ' + userId
        );

        socket.join('user_' + userId);

        socket.emit('connected', {
          message: 'Connected to real-time notifications.'
        });

      } catch (err) {

        console.log(
          'Socket auth failed:',
          err.message
        );

        socket.emit('auth_error', {
          error: 'Invalid token.'
        });
      }
    });

    socket.on('disconnect', () => {

      for (const userId in connectedUsers) {

        if (connectedUsers[userId] === socket.id) {

          delete connectedUsers[userId];

          console.log(
            'User disconnected: ' + userId
          );

          break;
        }
      }
    });

  });

}

// ── SEND NOTIFICATION ───────────────────────────────────
function sendNotification(
  io,
  userId,
  notification
) {

  io.to('user_' + userId)
    .emit('notification', notification);

  console.log(
    'Notification sent to user: ' + userId
  );
}

// ── BROADCAST NOTIFICATION ───────────────────────────────────
function broadcastNotification(
  io,
  notification
) {

  io.emit('notification', notification);

}

module.exports = {
  initializeSocket,
  sendNotification,
  broadcastNotification,
  connectedUsers,
};