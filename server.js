const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { shutDownAll: shutDownWithoutBind } = require('./utils/utils');
const { Server } = require('socket.io');
const {
  SOCKET_CONNECTIONS,
  CHAT_ROOM,
  FRONT_END_URL,
} = require('./utils/globals');

dotenv.config({ path: './config.env' });

const {
  env: { USERNAME1, USERNAME2, PASSWORD, HOST, DATABASE, CONNECTION_STRING },
} = process;
const USERNAME = [USERNAME1, USERNAME2].join('');

const DB_CONNECTION = CONNECTION_STRING.replace('<USERNAME>', USERNAME)
  .replace('<PASSWORD>', PASSWORD)
  .replace('<HOST>', HOST)
  .replace('<DATABASE>', DATABASE);

const port = process.env.PORT || 3001;

mongoose.connect(DB_CONNECTION, {}).then(() => {
  console.log('DB connection successful.');
});

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const io = new Server(server, {
  cors: {
    origin: FRONT_END_URL,
    methods: ['GET', 'POST'],
  },
  'close timeout': 0,
  'heartbeat timeout': 0,
});

io.on('connection', socket => {
  const userId = socket?.handshake?.query?.userId;

  console.log(`User Connected: ${userId}`);
  socket.join(CHAT_ROOM);

  if (!SOCKET_CONNECTIONS.find(id => id === userId))
    SOCKET_CONNECTIONS.push(userId);

  socket.on('send_message', message => {
    socket.to(CHAT_ROOM).emit('receive_message', message);
  });

  socket.on('send_invitation', invitation => {
    socket.to(CHAT_ROOM).emit('receive_invitation', invitation);
  });

  socket.on('accept_invitation', invitation => {
    socket.to(CHAT_ROOM).emit('invitation_accepted', invitation);
  });

  socket.on('remove_contact', data => {
    socket.to(CHAT_ROOM).emit('contact_removed', data);
  });

  socket.to(CHAT_ROOM).emit('notify_connection', { userId, connected: true });
  socket.on('disconnect', () => {
    socket
      .to(CHAT_ROOM)
      .emit('notify_connection', { userId, connected: false });

    const index = SOCKET_CONNECTIONS.indexOf(id => id === userId);
    if (index !== -1) {
      for (let i = index; i < SOCKET_CONNECTIONS.length - 1; i++) {
        SOCKET_CONNECTIONS[i] = SOCKET_CONNECTIONS[i + 1];
      }
      SOCKET_CONNECTIONS.pop();
    }
    console.log('Socket Disconnected:', socket.id);
  });
});

const shutDownAll = shutDownWithoutBind.bind(null, server, mongoose.connection);

process.on('uncaughtException', err => {
  shutDownAll('UNCAUGHT EXCEPTION ! Shutting down...', err);
});

process.on('unhandledRejection', err => {
  console.error(err);
  shutDownAll('UNHANDLED REJECTION ! Shutting down...', err);
});

process.on('SIGTERM', () => {
  shutDownAll('SIGTERM RECEIVED. Shutting down gracefully...', err);
});
