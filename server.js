const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { shutDownAll: shutDownWithoutBind } = require('./utils/utils');
const { upload } = require('azure-blobv2');

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
