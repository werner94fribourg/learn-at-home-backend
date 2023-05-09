const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { shutDownAll: shutDownWithoutBind } = require('./utils/utils');
const { Server } = require('socket.io');
const { SOCKET_CONNECTIONS, ROOMS } = require('./utils/globals');

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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
  'close timeout': 0,
  'heartbeat timeout': 0,
});

io.on('connection', socket => {
  const userId = socket?.handshake?.query?.userId;

  const index = SOCKET_CONNECTIONS.indexOf(id => id === userId);
  SOCKET_CONNECTIONS.push({ userId, socket });
  console.log(`User Connected: ${userId}`);

  socket.on('conversation', ({ connectedId, activeUserId }) => {
    if (!connectedId || !activeUserId) return;

    const connectedUser = SOCKET_CONNECTIONS.find(
      conn => conn.userId === activeUserId
    );
    if (!connectedUser) return;

    const room = ROOMS.find(
      room =>
        room.participants.includes(connectedId) &&
        room.participants.includes(connectedUser.userId)
    );
    if (!room) {
      const name = `${connectedId}_${connectedUser.userId}`;
      ROOMS.push({ participants: [connectedId, connectedUser.userId], name });
      socket.join(name);
    } else socket.join(room.name);
    console.log(
      `Room opened between users ${connectedId} and ${connectedUser.userId}`
    );
  });

  socket.on('send_message', message => {
    const {
      sender: { _id: connectedId },
      receiver: { _id: activeUserId },
    } = message;

    const room = ROOMS.find(
      room =>
        room.participants.includes(connectedId) &&
        room.participants.includes(activeUserId)
    );

    if (!room) return;
    const { name } = room;

    socket.to(name).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    for (let i = index; i < SOCKET_CONNECTIONS.length - 1; i++) {
      SOCKET_CONNECTIONS[i] = SOCKET_CONNECTIONS[i + 1];
    }
    SOCKET_CONNECTIONS.pop();
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
